// src/lib/audioProcessing.ts

// Converts an AudioBuffer into a browser-standard WAV blob
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    let result = new Float32Array(buffer.length * numChannels);
    
    // Interleave channels
    if (numChannels === 2) {
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);
        for (let i = 0; i < buffer.length; i++) {
            result[i * 2] = left[i];
            result[i * 2 + 1] = right[i];
        }
    } else {
        result = new Float32Array(buffer.getChannelData(0)); // if mono, duplicate into pristine buffer
    }
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = result.length * bytesPerSample;
    
    const bufferArray = new ArrayBuffer(44 + dataSize);
    const view = new DataView(bufferArray);
    
    // Write string helper
    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };
    
    // 1. RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    
    // 2. fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    
    // 3. data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // 4. Write actual PCM audio data
    let offset = 44;
    for (let i = 0; i < result.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, result[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    return new Blob([view], { type: 'audio/wav' });
}

// Processes the Blob with Auto-trim (Silence Deletion) and Native Noise Removal
export async function enhanceAudioBlob(blob: Blob, applyTrim: boolean, applyNoiseRemoval: boolean): Promise<Blob> {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
            console.warn('Web Audio API not supported in this browser. Skipping audio enhancement.');
            return blob;
        }

        const audioContext = new AudioContextClass();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        let startOffset = 0;
        let endOffset = audioBuffer.length;

        // Auto Trim Silence Processor
        if (applyTrim) {
            const threshold = 0.015; // Amplitude threshold representing 'silence'
            let startFound = false;
            
            // Scan for audio start
            for (let i = 0; i < audioBuffer.length; i++) {
                let maxMagnitude = 0;
                for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                    maxMagnitude = Math.max(maxMagnitude, Math.abs(audioBuffer.getChannelData(channel)[i]));
                }
                if (maxMagnitude > threshold) {
                    // Keep 100ms cushion before audio peaks
                    startOffset = Math.max(0, i - (audioBuffer.sampleRate * 0.1)); 
                    startFound = true;
                    break;
                }
            }
            
            // Scan for audio end
            if (startFound) {
                for (let i = audioBuffer.length - 1; i >= startOffset; i--) {
                    let maxMagnitude = 0;
                    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                        maxMagnitude = Math.max(maxMagnitude, Math.abs(audioBuffer.getChannelData(channel)[i]));
                    }
                    if (maxMagnitude > threshold) {
                        // Keep 200ms cushion after audio ends
                        endOffset = Math.min(audioBuffer.length, i + (audioBuffer.sampleRate * 0.2)); 
                        break;
                    }
                }
            }
        }

        const duration = (endOffset - startOffset) / audioBuffer.sampleRate;
        
        // If the trim cut off everything (complete silence), just return original to prevent crashing
        if (duration <= 0.1) return blob; 

        // Offline computation context to render processed audio invisibly rather than playing aloud
        const offlineCtx = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            Math.ceil(duration * audioBuffer.sampleRate),
            audioBuffer.sampleRate
        );

        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;

        let currentNode: AudioNode = source;

        // Apply hardware-accelerated BiquadFilters for Noise Reduction / EQ
        if (applyNoiseRemoval) {
            // Highpass filter cuts off low hums, fan rumbling, distant traffic (below 85 Hz)
            const highpass = offlineCtx.createBiquadFilter();
            highpass.type = 'highpass';
            highpass.frequency.value = 85; 
            
            // Lowpass filter drops intense background static / high hiss (above 8kHz)
            const lowpass = offlineCtx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.value = 8000;

            // Compress dynamic range to vocalise peaks cleanly
            const compressor = offlineCtx.createDynamicsCompressor();
            compressor.threshold.value = -25;
            compressor.knee.value = 10;
            compressor.ratio.value = 4;
            compressor.attack.value = 0.01;
            compressor.release.value = 0.2;

            currentNode.connect(highpass);
            highpass.connect(lowpass);
            lowpass.connect(compressor);
            currentNode = compressor;
        }

        currentNode.connect(offlineCtx.destination);
        
        // Schedule start based on trimmed offset limits
        source.start(0, startOffset / audioBuffer.sampleRate, duration);
        
        // Trigger fast synchronous digital rendering pipeline
        const renderedBuffer = await offlineCtx.startRendering();
        
        // Output fresh encoded blob containing pristine trimmed/filtered data
        return audioBufferToWavBlob(renderedBuffer);
        
    } catch (err) {
        console.error('Audio Enhancement Error: ', err);
        return blob; // Graceful degradation — fall back to original blob on fail
    }
}
