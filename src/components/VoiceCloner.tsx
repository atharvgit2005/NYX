'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Mic, MicOff, Upload, Play, Pause, Loader2, CheckCircle,
    Trash2, RefreshCw, Volume2, Sparkles, AlertCircle, Square
} from 'lucide-react';

interface ClonedVoice {
    voiceId: string;
    displayName: string;
    langCode?: string;
    createdAt?: string;
}

type Step = 'record' | 'upload' | 'clone' | 'done';

export default function VoiceCloner() {
    const [step, setStep] = useState<Step>('record');
    const [voiceName, setVoiceName] = useState('');

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    // Upload state
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    // Cloning state
    const [cloning, setCloning] = useState(false);
    const [cloneError, setCloneError] = useState<string | null>(null);
    const [clonedVoice, setClonedVoice] = useState<ClonedVoice | null>(null);

    // Test voice state
    const [testText, setTestText] = useState('Hey, this is my cloned voice. Pretty cool right?');
    const [synthesizing, setSynthesizing] = useState(false);
    const [testAudioSrc, setTestAudioSrc] = useState<string | null>(null);

    // My Cloned Voices
    const [savedVoices, setSavedVoices] = useState<ClonedVoice[]>([]);

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const previewAudioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load saved voices from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('cloned_voices');
        if (saved) {
            try { setSavedVoices(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    const saveVoice = (voice: ClonedVoice) => {
        const updated = [voice, ...savedVoices.filter(v => v.voiceId !== voice.voiceId)];
        setSavedVoices(updated);
        localStorage.setItem('cloned_voices', JSON.stringify(updated));
    };

    const removeVoice = (voiceId: string) => {
        const updated = savedVoices.filter(v => v.voiceId !== voiceId);
        setSavedVoices(updated);
        localStorage.setItem('cloned_voices', JSON.stringify(updated));
    };

    // ─── Recording ─────────────────────────────────────────────────────
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.start(100);
            setIsRecording(true);
            setRecordingTime(0);
            setAudioBlob(null);
            setAudioUrl(null);

            timerRef.current = setInterval(() => {
                setRecordingTime(t => t + 1);
            }, 1000);
        } catch (err) {
            setCloneError('Microphone access denied. Please allow microphone permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    // Timer cleanup
    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const togglePreview = () => {
        if (!audioUrl) return;
        if (!previewAudioRef.current) {
            previewAudioRef.current = new Audio(audioUrl);
            previewAudioRef.current.onended = () => setIsPlayingPreview(false);
        }
        if (isPlayingPreview) {
            previewAudioRef.current.pause();
            setIsPlayingPreview(false);
        } else {
            previewAudioRef.current.play();
            setIsPlayingPreview(true);
        }
    };

    // ─── File Upload ────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('audio/')) {
            setCloneError('Please upload an audio file (MP3, WAV, M4A, etc.)');
            return;
        }
        if (file.size > 25 * 1024 * 1024) {
            setCloneError('File is too large. Maximum size is 25MB.');
            return;
        }
        setUploadFile(file);
        setAudioUrl(URL.createObjectURL(file));
        setAudioBlob(null);
        setCloneError(null);
    };

    // ─── Clone Voice ─────────────────────────────────────────────────
    const handleClone = async () => {
        const sourceBlob = audioBlob || uploadFile;
        if (!sourceBlob) return;
        if (!voiceName.trim()) {
            setCloneError('Please give your voice a name first.');
            return;
        }

        setCloning(true);
        setCloneError(null);

        const formData = new FormData();
        const fileName = audioBlob ? 'recording.webm' : (uploadFile?.name || 'audio.mp3');
        formData.append('file', sourceBlob, fileName);
        formData.append('name', voiceName.trim());

        try {
            const res = await fetch('/api/voice/clone', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || data.details?.message || 'Failed to clone voice');
            }

            const voice: ClonedVoice = {
                voiceId: data.voiceId,
                displayName: voiceName.trim(),
                langCode: 'EN_US',
                createdAt: new Date().toISOString(),
            };

            setClonedVoice(voice);
            saveVoice(voice);
            setStep('done');
        } catch (err: any) {
            setCloneError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setCloning(false);
        }
    };

    // ─── Test Cloned Voice ───────────────────────────────────────────
    const handleTestVoice = async (voiceId: string) => {
        if (!testText.trim()) return;
        setSynthesizing(true);
        setTestAudioSrc(null);

        try {
            const res = await fetch('/api/tts/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: testText,
                    voiceId,
                    modelId: 'inworld-tts-1.5-max',
                }),
            });
            const data = await res.json();
            if (data.audioContent) {
                setTestAudioSrc(`data:audio/wav;base64,${data.audioContent}`);
            } else {
                setCloneError('No audio returned. Check your Inworld API key.');
            }
        } catch (err: any) {
            setCloneError('Failed to synthesize test audio.');
        } finally {
            setSynthesizing(false);
        }
    };

    const reset = () => {
        setStep('record');
        setAudioBlob(null);
        setAudioUrl(null);
        setUploadFile(null);
        setVoiceName('');
        setCloneError(null);
        setClonedVoice(null);
        setTestAudioSrc(null);
        setRecordingTime(0);
    };

    const hasAudio = !!(audioBlob || uploadFile || audioUrl);

    // ─── Waveform bars (visual only) ───────────────────────────────────
    const WaveformBars = ({ active }: { active: boolean }) => (
        <div className="flex items-center gap-0.5 h-8">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${active ? 'bg-purple-400' : 'bg-purple-400/30'}`}
                    style={{
                        height: active ? `${20 + Math.sin((i + Date.now() / 200) * 0.8) * 15}px` : '4px',
                        animation: active ? `bounce 0.${(i % 5) + 3}s ease-in-out infinite alternate` : 'none',
                        animationDelay: `${i * 0.05}s`,
                    }}
                />
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-10">
                <h2 className="text-4xl font-bold text-theme-primary tracking-tight">Voice Cloner</h2>
                <p className="text-theme-secondary mt-2 text-lg">
                    Clone your voice and use it in AI-generated videos.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ─── Main Cloning Flow ─── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mb-2">
                        {(['record', 'clone', 'done'] as Step[]).map((s, idx) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    step === s ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' :
                                    ['done'].includes(step) && idx < ['record','clone','done'].indexOf(step)
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-card-hover text-theme-secondary border border-theme'
                                }`}>
                                    {idx + 1}
                                </div>
                                <span className={`text-sm font-medium capitalize ${step === s ? 'text-purple-400' : 'text-theme-secondary'}`}>
                                    {s === 'record' ? 'Record / Upload' : s === 'clone' ? 'Clone' : 'Done'}
                                </span>
                                {idx < 2 && <div className="w-8 h-px bg-theme" />}
                            </div>
                        ))}
                    </div>

                    {/* Error Banner */}
                    {cloneError && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-red-300">{cloneError}</p>
                                <button onClick={() => setCloneError(null)} className="text-xs text-red-400/70 hover:text-red-400 mt-1">Dismiss</button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 1: Record or Upload ── */}
                    {(step === 'record' || step === 'upload') && (
                        <div className="bg-card-theme rounded-3xl border border-theme overflow-hidden">
                            {/* Tab switcher */}
                            <div className="flex border-b border-theme">
                                <button
                                    onClick={() => { setStep('record'); setUploadFile(null); setAudioBlob(null); setAudioUrl(null); }}
                                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${step === 'record' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-theme-secondary hover:text-theme-primary'}`}
                                >
                                    <Mic className="w-4 h-4" /> Record Voice
                                </button>
                                <button
                                    onClick={() => { setStep('upload'); setAudioBlob(null); }}
                                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${step === 'upload' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-theme-secondary hover:text-theme-primary'}`}
                                >
                                    <Upload className="w-4 h-4" /> Upload File
                                </button>
                            </div>

                            <div className="p-8">
                                {step === 'record' && (
                                    <div className="space-y-8">
                                        <div className="text-center text-theme-secondary text-sm">
                                            <p>Record at least <span className="text-purple-400 font-bold">30 seconds</span> of clear speech in a quiet environment.</p>
                                            <p className="text-xs mt-1 text-theme-secondary/60">Read a passage naturally — avoid background noise for best results.</p>
                                        </div>

                                        {/* Recording visualizer */}
                                        <div className="flex flex-col items-center gap-6">
                                            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                isRecording
                                                    ? 'bg-gradient-to-br from-red-500/20 to-pink-500/10 ring-4 ring-red-500/30 ring-offset-4 ring-offset-transparent'
                                                    : audioBlob
                                                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 ring-2 ring-green-500/30'
                                                    : 'bg-card-hover ring-2 ring-theme'
                                            }`}>
                                                {isRecording && (
                                                    <>
                                                        <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
                                                        <div className="absolute inset-[-8px] rounded-full border border-red-500/20 animate-pulse" />
                                                    </>
                                                )}
                                                <button
                                                    onClick={isRecording ? stopRecording : startRecording}
                                                    className={`relative z-10 transition-transform hover:scale-110 ${isRecording ? 'text-red-400' : audioBlob ? 'text-green-400' : 'text-purple-400'}`}
                                                >
                                                    {isRecording ? <Square className="w-10 h-10 fill-current" /> : audioBlob ? <CheckCircle className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                                                </button>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-2xl font-mono font-bold text-theme-primary">{formatTime(recordingTime)}</p>
                                                <p className="text-xs text-theme-secondary mt-1">
                                                    {isRecording ? '🔴 Recording...' : audioBlob ? '✅ Recording captured' : 'Click to start recording'}
                                                </p>
                                            </div>

                                            <WaveformBars active={isRecording} />
                                        </div>

                                        {/* Playback */}
                                        {audioBlob && !isRecording && (
                                            <div className="flex items-center justify-between p-4 bg-card-hover rounded-2xl border border-theme animate-fade-in">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={togglePreview}
                                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:opacity-90 transition"
                                                    >
                                                        {isPlayingPreview ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                                    </button>
                                                    <div>
                                                        <p className="text-sm font-medium text-theme-primary">Recording Preview</p>
                                                        <p className="text-xs text-theme-secondary">{formatTime(recordingTime)} · webm</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setAudioBlob(null); setAudioUrl(null); setRecordingTime(0); }}
                                                    className="p-2 rounded-xl hover:bg-red-500/10 text-theme-secondary hover:text-red-400 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {step === 'upload' && (
                                    <div className="space-y-6">
                                        <div className="text-center text-theme-secondary text-sm">
                                            <p>Upload an audio file of your voice. MP3, WAV, M4A supported.</p>
                                            <p className="text-xs mt-1 text-theme-secondary/60">Best results: 30s–5min of clear speech. Max 25MB.</p>
                                        </div>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
                                        >
                                            <Upload className="w-10 h-10 text-purple-400/50 group-hover:text-purple-400 mx-auto mb-4 transition-colors" />
                                            <p className="text-theme-secondary group-hover:text-theme-primary transition-colors">Drop your audio file here or <span className="text-purple-400">browse</span></p>
                                            <p className="text-xs text-theme-secondary/50 mt-2">MP3, WAV, M4A, WEBM · Max 25MB</p>
                                            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                                        </div>
                                        {uploadFile && (
                                            <div className="flex items-center justify-between p-4 bg-card-hover rounded-2xl border border-theme animate-fade-in">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                        <Volume2 className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-theme-primary truncate max-w-[200px]">{uploadFile.name}</p>
                                                        <p className="text-xs text-theme-secondary">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setUploadFile(null); setAudioUrl(null); }} className="p-2 rounded-xl hover:bg-red-500/10 text-theme-secondary hover:text-red-400 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Voice Name + Clone ── */}
                    {(step === 'record' || step === 'upload') && hasAudio && (
                        <div className="bg-card-theme rounded-3xl border border-theme p-6 space-y-4 animate-fade-in">
                            <h3 className="text-base font-bold text-theme-primary">Name Your Voice</h3>
                            <input
                                type="text"
                                value={voiceName}
                                onChange={(e) => setVoiceName(e.target.value)}
                                placeholder="e.g. Atharv's Voice, My Deep Voice..."
                                maxLength={50}
                                className="w-full bg-card-hover border border-theme rounded-xl px-4 py-3 text-theme-primary placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm"
                            />
                            <button
                                onClick={handleClone}
                                disabled={cloning || !voiceName.trim()}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-purple-500/30"
                            >
                                {cloning ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Cloning your voice...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Clone My Voice</>
                                )}
                            </button>
                            <p className="text-xs text-center text-theme-secondary/60">
                                Processing takes ~30 seconds. Your voice stays private and secure.
                            </p>
                        </div>
                    )}

                    {/* ── Done State ── */}
                    {step === 'done' && clonedVoice && (
                        <div className="bg-card-theme rounded-3xl border border-green-500/20 p-8 space-y-6 animate-fade-in">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                                    <CheckCircle className="w-7 h-7 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-theme-primary">Voice Cloned! 🎉</h3>
                                    <p className="text-sm text-theme-secondary">
                                        <span className="text-green-400 font-medium">{clonedVoice.displayName}</span> is ready to use
                                    </p>
                                </div>
                            </div>

                            {/* Test the voice */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-theme-secondary uppercase tracking-wide">Test Your Voice</label>
                                <textarea
                                    value={testText}
                                    onChange={(e) => setTestText(e.target.value)}
                                    rows={2}
                                    className="w-full bg-card-hover border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                                    placeholder="Enter text to speak..."
                                />
                                <button
                                    onClick={() => handleTestVoice(clonedVoice.voiceId)}
                                    disabled={synthesizing}
                                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    {synthesizing ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Volume2 className="w-4 h-4" /> Hear My Clone</>}
                                </button>
                                {testAudioSrc && (
                                    <audio controls src={testAudioSrc} className="w-full mt-3 rounded-xl" autoPlay />
                                )}
                            </div>

                            <div className="pt-2 border-t border-theme flex gap-3">
                                <button onClick={reset} className="flex-1 py-2.5 bg-card-hover hover:bg-theme-secondary/20 text-theme-secondary rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" /> Clone Another
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Saved Voices Sidebar ─── */}
                <div className="space-y-4">
                    <div className="bg-card-theme rounded-3xl border border-theme overflow-hidden">
                        <div className="px-6 py-5 border-b border-theme">
                            <h3 className="text-sm font-bold text-theme-primary">My Cloned Voices</h3>
                            <p className="text-xs text-theme-secondary mt-0.5">{savedVoices.length} voice{savedVoices.length !== 1 ? 's' : ''} saved</p>
                        </div>

                        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                            {savedVoices.length === 0 ? (
                                <div className="text-center py-8">
                                    <Mic className="w-8 h-8 text-theme-secondary/30 mx-auto mb-3" />
                                    <p className="text-xs text-theme-secondary/60">No voices cloned yet.<br />Record or upload audio to start.</p>
                                </div>
                            ) : (
                                savedVoices.map((voice) => (
                                    <div key={voice.voiceId} className="p-4 bg-card-hover rounded-2xl border border-theme group">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                    <Mic className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-theme-primary truncate">{voice.displayName}</p>
                                                    <p className="text-[10px] text-theme-secondary truncate font-mono">{voice.voiceId.slice(0, 16)}...</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeVoice(voice.voiceId)}
                                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-theme-secondary hover:text-red-400 transition flex-shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => { setClonedVoice(voice); setStep('done'); setTestAudioSrc(null); }}
                                            className="mt-3 w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 text-xs font-bold rounded-xl transition"
                                        >
                                            Test this voice
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-gradient-to-br from-purple-900/10 to-pink-900/5 rounded-3xl border border-purple-500/10 p-5 space-y-3">
                        <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Tips for Best Results
                        </h3>
                        <ul className="space-y-2 text-xs text-theme-secondary">
                            {[
                                'Record in a quiet room with no background noise',
                                'Speak clearly and at a natural pace',
                                '30–90 seconds gives optimal clone quality',
                                'Use WAV or high-quality MP3 for uploads',
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-0.5 flex-shrink-0">✦</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
