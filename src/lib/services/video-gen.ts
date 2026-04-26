import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { InworldService } from '../inworld';

const LOG_FILE = path.join(process.cwd(), 'debug_log.txt');

function logToFile(message: string) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

export interface VoiceControls {
    speed?: number;    // 0.5 – 2.0
    pitch?: number;    // -10 – 10
    emotion?: string;  // happy | sad | excited | calm | angry | fearful
    style?: string;    // narration | conversational | newscast | documentary
    model?: string;    // inworld-tts-1.5-max | inworld-tts-1.5 | inworld-tts-1
}

export async function generateVideo(
    script: string,
    avatarId: string,
    voiceId: string,
    apiKey?: string,
    voiceControls: VoiceControls = {}
) {
    const HEYGEN_API_KEY = apiKey || process.env.HEYGEN_API_KEY;

    // 1. Check for API Keys OR Mock IDs
    if (!HEYGEN_API_KEY || avatarId.startsWith('mock-')) {
        console.log("Using Mock Data for Video Generation (Missing Key or Mock ID)");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return {
            videoId: `mock-video-id-${Date.now()}`,
            status: 'completed',
            url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        };
    }

    // 1b. Reject streaming avatar IDs immediately with a clear error
    if (avatarId.startsWith('sk_')) {
        throw new Error(
            `Invalid avatar ID: IDs starting with "sk_" are HeyGen Streaming Avatars and cannot be used for video generation. ` +
            `Please go to Avatar & Voice → enter a Talking Avatar ID (e.g. Tyler-insuit-20220721) → Save.`
        );
    }

    // Strip metadata labels like [HOOK], etc before passing to TTS and generation
    const stripMetadataLabels = (text: string) => {
        return text
            .replace(/\[.*?\]/g, '') // remove brackets
            .replace(/^(?:\*\*)?(Hook|Body|CTA|Intro|Outro|Title)(?:\*\*)?:?/gmi, '') // remove labels
            .replace(/\n{2,}/g, '\n') // compress newlines
            .trim();
    };

    const cleanScript = stripMetadataLabels(script);
    
    // Check if script is too short (HeyGen often fails for very short audio < 2s)
    if (cleanScript.length < 5) {
        throw new Error("Script is too short. Please provide at least a few words.");
    }

    // 2. Generate Audio with Inworld & Upload to HeyGen
    let audioAssetId: string | null = null;

    // Check if voiceId is likely an Inworld voice (e.g. not our mock and not HeyGen's default)
    if (voiceId && voiceId !== 'mock-voice' && voiceId !== '1bd001e7e50f421d891986aad5158bc8') {
        try {
            logToFile(`Generating audio with Inworld for voiceId: ${voiceId}`);
            console.log(`Generating audio with Inworld for voiceId: ${voiceId}`);

            // 2a. Generate Audio from Inworld with full voice controls
            const audioBase64 = await InworldService.synthesizeSpeech({
                text: cleanScript,
                voiceId: voiceId,
                modelId: voiceControls.model || 'inworld-tts-1.5-max',
                speed: voiceControls.speed,
                pitch: voiceControls.pitch,
                emotion: voiceControls.emotion,
                style: voiceControls.style,
            });

            // Convert base64 to Buffer
            const audioBuffer = Buffer.from(audioBase64, 'base64');

            logToFile(`Audio generated from Inworld, buffer size: ${audioBuffer.byteLength} bytes. Uploading to HeyGen...`);

            // 2b. Upload to HeyGen Asset API 
            // We use 'fetch' with explicit Content-Length for the most reliable binary asset upload
            logToFile(`Uploading ${audioBuffer.length} bytes to HeyGen Asset API...`);
            
            const assetRes = await fetch('https://upload.heygen.com/v1/asset', {
                method: 'POST',
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY,
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioBuffer.length.toString(),
                },
                body: audioBuffer
            });

            if (!assetRes.ok) {
                const errText = await assetRes.text();
                throw new Error(`HeyGen Asset Upload Failed (${assetRes.status}): ${errText}`);
            }

            const parsedData = await assetRes.json();
            if (parsedData?.data?.id) {
                audioAssetId = parsedData.data.id;
                logToFile(`HeyGen Asset Upload Success. Asset ID: ${audioAssetId}`);
                console.log(`HeyGen Asset Upload Success. Asset ID: ${audioAssetId}`);
            } else {
                throw new Error(`Upload Failed - No ID in response: ${JSON.stringify(parsedData)}`);
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logToFile(`Inworld generation or HeyGen upload failed: ${errorMessage}`);
            console.warn("Inworld generation or HeyGen upload failed (continuing with HeyGen default voice):", errorMessage);
        }
    }

    try {
        logToFile("Generating video with HeyGen...");
        logToFile(`Using Avatar ID: ${avatarId}`);

        // Construct the voice/audio payload based on whether we successfully uploaded audio
        const voiceOrAudioPayload = audioAssetId
            ? {
                type: 'audio',
                audio_asset_id: audioAssetId
            }
            : {
                type: 'text',
                input_text: cleanScript,
                // Use provided voiceId (if it's a native HeyGen ID somehow) or a default public HeyGen voice
                voice_id: (voiceId && voiceId !== 'mock-voice' && typeof voiceId === 'string' && voiceId.length === 32) ? voiceId : '1bd001e7e50f421d891986aad5158bc8',
            };

        const heyGenPayload = {
            video_inputs: [
                {
                    character: {
                        type: 'avatar',
                        avatar_id: avatarId,
                        avatar_style: 'normal',
                    },
                    voice: voiceOrAudioPayload,
                    background: {
                        type: 'color',
                        value: '#000000',
                    },
                },
            ],
            dimension: {
                width: 720,
                height: 1280,
            },
        };

        logToFile(`HeyGen Payload: ${JSON.stringify(heyGenPayload, null, 2)}`);

        const videoResponse = await axios.post(
            'https://api.heygen.com/v2/video/generate',
            heyGenPayload,
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        logToFile(`HeyGen Response: ${JSON.stringify(videoResponse.data)}`);

        return {
            videoId: videoResponse.data.data.video_id,
            status: 'processing',
            url: null,
        };

    } catch (error: unknown) {
        let errorMessage = 'Failed to generate video';
        
        if (axios.isAxiosError(error)) {
            const errorData = (error.response?.data || {}) as { 
                error?: { message?: string; code?: string }; 
                message?: string;
                code?: string | number;
            };
            errorMessage = errorData.error?.message || errorData.message || error.message;

            logToFile(`HeyGen Generation Error: ${JSON.stringify(errorData, null, 2)}`);
            console.error("HeyGen Generation Error:", JSON.stringify(errorData, null, 2));

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('HeyGen API key is invalid or expired. Please check your HEYGEN_API_KEY.');
            }

            if (error.response?.status === 404 ||
                (errorData.error?.code === 'internal_error' && errorMessage.includes('not found'))) {
                throw new Error(
                    `Avatar not found in your HeyGen account: "${avatarId}". ` +
                    `Go to Avatar & Voice → use a Talking Avatar ID from your HeyGen library.`
                );
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        throw new Error(`HeyGen Failed: ${errorMessage}`);
    }
}

export async function checkVideoStatus(videoId: string, apiKey?: string) {
    const HEYGEN_API_KEY = apiKey || process.env.HEYGEN_API_KEY;

    if (videoId.startsWith('mock-video-id')) {
        return {
            status: 'completed',
            progress: 100,
            url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        };
    }

    if (!HEYGEN_API_KEY) {
        throw new Error("Missing API Key for status check.");
    }

    try {
        // Log the check
        logToFile(`Checking status for ${videoId}, Custom Key: ${!!apiKey}`);

        // ✅ Try V2 Status API first
        const statusUrl = `https://api.heygen.com/v2/video/${videoId}`;
        const response = await axios.get(statusUrl, {
            headers: { 'X-Api-Key': HEYGEN_API_KEY },
            validateStatus: () => true, // Don't throw on 404
        });

        let video = response.data?.data?.video || response.data?.data || {};
        
        // 🚨 Fallback to V1 Status API if V2 fails or is 404
        if (response.status === 404 || !video.status) {
            logToFile(`V2 check 404'd or no status, trying V1 fallback for ${videoId}`);
            const v1Url = `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`;
            const v1Response = await axios.get(v1Url, {
                headers: { 'X-Api-Key': HEYGEN_API_KEY }
            });
            video = v1Response.data?.data || {};
        }

        const status = video.status;
        const url = video.video_url || video.url || null;
        const error = video.error || video.message;

        logToFile(`[HeyGen v2 Status] ID: ${videoId} -> status: ${status}, url: ${url ? 'yes' : 'none'}`);

        // Map all HeyGen in-progress states
        if (status === 'failed' || status === 'error' || status === 'fail') {
            logToFile(`[HeyGen v2 Status] FAILED for ${videoId}: ${JSON.stringify(video)}`);
            return { 
                status: 'failed', 
                progress: 0, 
                url: null, 
                error: error || video.message || 'Video generation failed in HeyGen system' 
            };
        }

        if (status === 'completed' || status === 'success') {
            return { status: 'completed', progress: 100, url };
        }

        // Map all HeyGen in-progress states
        if (status === 'pending')    return { status: 'processing', progress: 10, url: null };
        if (status === 'waiting')    return { status: 'processing', progress: 20, url: null };
        if (status === 'processing') return { status: 'processing', progress: 55, url: null };

        return { status: 'processing', progress: 30, url: null };

    } catch (error: unknown) {
        let statusCode: number | undefined;
        let errorMessage = 'Failed to check video status';

        if (axios.isAxiosError(error)) {
            statusCode = error.response?.status;
            const errData = (error.response?.data || {}) as { 
                message?: string; 
                code?: string | number;
            };
            errorMessage = errData?.message || error.message;

            logToFile(`Status Check Error [${statusCode}]: ${JSON.stringify(errData || error.message)}`);

            if (statusCode === 404 ||
                errData?.code === 400569 ||
                (typeof errData?.message === 'string' && errData.message.includes('not found'))) {
                return {
                    status: 'not_found',
                    progress: 0,
                    url: null,
                    error: 'Video not found — may belong to a previous API key or has expired'
                };
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error("Status Check Error:", errorMessage);
        return { status: 'error', progress: 0, url: null, error: errorMessage };
    }
}

