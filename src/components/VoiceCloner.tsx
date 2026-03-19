'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Mic, Upload, Play, Pause, Loader2, CheckCircle,
    Trash2, RefreshCw, Volume2, Sparkles, AlertCircle,
    Square, Download, Copy, ChevronDown, ChevronUp, Sliders,
    Wand2, BookOpen, Zap, Wind, Heart, Flame, Moon, Globe,
    WifiOff, Volume, TriangleAlert, Info
} from 'lucide-react';

// ─── Types & Constants ────────────────────────────────────────────────────────
interface ClonedVoice {
    voiceId: string;
    displayName: string;
    langCode?: string;
    createdAt?: string;
    description?: string;
}

interface VoiceControls {
    speed: number;
    pitch: number;
    emotion: string;
    style: string;
    model: string;
}

type Step = 'record' | 'upload' | 'done';

const DEFAULT_CONTROLS: VoiceControls = { speed: 1.0, pitch: 0, emotion: '', style: '', model: 'inworld-tts-1.5-max' };

const LANGUAGES = [
    { code: 'EN_US', label: 'English (US)', flag: '🇺🇸' },
    { code: 'EN_GB', label: 'English (UK)', flag: '🇬🇧' },
    { code: 'HI_IN', label: 'Hindi', flag: '🇮🇳' },
    { code: 'ES_ES', label: 'Spanish', flag: '🇪🇸' },
    { code: 'FR_FR', label: 'French', flag: '🇫🇷' },
    { code: 'DE_DE', label: 'German', flag: '🇩🇪' },
    { code: 'JA_JP', label: 'Japanese', flag: '🇯🇵' },
    { code: 'KO_KR', label: 'Korean', flag: '🇰🇷' },
    { code: 'PT_BR', label: 'Portuguese (BR)', flag: '🇧🇷' },
    { code: 'ZH_CN', label: 'Chinese', flag: '🇨🇳' },
    { code: 'IT_IT', label: 'Italian', flag: '🇮🇹' },
    { code: 'RU_RU', label: 'Russian', flag: '🇷🇺' },
    { code: 'AR_SA', label: 'Arabic', flag: '🇸🇦' },
];

const EMOTIONS = [
    { value: '', label: 'Neutral', icon: '😐' },
    { value: 'happy', label: 'Happy', icon: '😊' },
    { value: 'sad', label: 'Sad', icon: '😢' },
    { value: 'excited', label: 'Excited', icon: '🤩' },
    { value: 'calm', label: 'Calm', icon: '😌' },
    { value: 'angry', label: 'Angry', icon: '😠' },
    { value: 'fearful', label: 'Fearful', icon: '😨' },
];

const STYLES = [
    { value: '', label: 'Default', icon: <Volume2 className="w-3.5 h-3.5" /> },
    { value: 'narration', label: 'Narration', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { value: 'conversational', label: 'Conversational', icon: <Zap className="w-3.5 h-3.5" /> },
    { value: 'newscast', label: 'Newscast', icon: <Flame className="w-3.5 h-3.5" /> },
    { value: 'documentary', label: 'Documentary', icon: <Wind className="w-3.5 h-3.5" /> },
    { value: 'poetry', label: 'Poetic', icon: <Heart className="w-3.5 h-3.5" /> },
    { value: 'meditation', label: 'Meditation', icon: <Moon className="w-3.5 h-3.5" /> },
];

const MODELS = [
    { value: 'inworld-tts-1.5-max', label: 'TTS 1.5 Max', badge: 'Best' },
    { value: 'inworld-tts-1.5', label: 'TTS 1.5', badge: 'Fast' },
    { value: 'inworld-tts-1', label: 'TTS 1.0', badge: 'Classic' },
];

const SAMPLE_TEXTS = [
    "Hey, this is my cloned voice. Pretty cool, right?",
    "Welcome to NYX — the future of AI content creation.",
    "The quick brown fox jumps over the lazy dog.",
    "Imagine a world where your voice can be everywhere at once. That world is here.",
    "Breaking news: AI voice cloning has reached a new frontier of quality.",
];

// Recording environment tips
const RECORDING_TIPS = [
    { icon: <WifiOff className="w-4 h-4" />, color: '#f59e0b', text: 'Go noise-free — close windows, turn off fans' },
    { icon: <Volume className="w-4 h-4" />, color: '#a855f7', text: 'Keep mic 6–12 inches from your mouth' },
    { icon: <TriangleAlert className="w-4 h-4" />, color: '#06b6d4', text: 'Avoid rooms with echo — closets work great' },
    { icon: <Info className="w-4 h-4" />, color: '#10b981', text: 'Speak naturally at a comfortable pace' },
];

// ─── Sub Components ───────────────────────────────────────────────────────────
function RangeSlider({ label, value, min, max, step, format, onChange, color = '#a855f7' }:
    { label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void; color?: string }) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-medium">{label}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ color, background: `${color}18` }}>{format(value)}</span>
            </div>
            <div className="relative h-5 flex items-center">
                <div className="absolute w-full h-1.5 rounded-full bg-white/5" />
                <div className="absolute h-1.5 rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                <input type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(parseFloat(e.target.value))}
                    className="absolute w-full opacity-0 cursor-pointer h-5" style={{ zIndex: 1 }} />
                <div className="absolute w-4 h-4 rounded-full shadow-lg border-2 border-white" style={{ left: `calc(${pct}% - 8px)`, background: color }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-600">
                <span>{format(min)}</span><span>{format(max)}</span>
            </div>
        </div>
    );
}

function WaveformBars({ active, color = '#a855f7' }: { active: boolean; color?: string }) {
    return (
        <div className="flex items-center gap-0.5 h-8">
            {[...Array(28)].map((_, i) => (
                <div key={i} className="w-1 rounded-full transition-all duration-100"
                    style={{
                        background: active ? color : `${color}40`,
                        height: active ? `${12 + Math.abs(Math.sin(i * 0.6)) * 20}px` : '3px',
                        animation: active ? `pulse-bar 0.${(i % 5) + 3}s ease-in-out infinite alternate` : 'none',
                        animationDelay: `${i * 0.04}s`,
                    }} />
            ))}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VoiceCloner() {
    const [step, setStep] = useState<Step>('record');
    const [tab, setTab] = useState<'record' | 'upload'>('record');
    const [voiceName, setVoiceName] = useState('');
    const [voiceDescription, setVoiceDescription] = useState('');

    // Language
    const [langCode, setLangCode] = useState('EN_US');
    const [sampleText, setSampleText] = useState<string | null>(null);
    const [loadingSample, setLoadingSample] = useState(false);

    // Recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [showTips, setShowTips] = useState(true);

    // Upload
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    // Cloning
    const [cloning, setCloning] = useState(false);
    const [cloneError, setCloneError] = useState<string | null>(null);
    const [clonedVoice, setClonedVoice] = useState<ClonedVoice | null>(null);

    // Test / playback
    const [testText, setTestText] = useState(SAMPLE_TEXTS[0]);
    const [synthesizing, setSynthesizing] = useState(false);
    const [testAudioSrc, setTestAudioSrc] = useState<string | null>(null);
    const [isPlayingTest, setIsPlayingTest] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [controls, setControls] = useState<VoiceControls>(DEFAULT_CONTROLS);

    // Voice library
    const [savedVoices, setSavedVoices] = useState<ClonedVoice[]>([]);
    const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const previewAudioRef = useRef<HTMLAudioElement | null>(null);
    const testAudioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null!);

    // ── Load saved voices ──────────────────────────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem('cloned_voices');
        if (saved) { try { setSavedVoices(JSON.parse(saved)); } catch { } }
    }, []);

    const persistVoices = (list: ClonedVoice[]) => {
        setSavedVoices(list);
        localStorage.setItem('cloned_voices', JSON.stringify(list));
    };

    const saveVoice = (voice: ClonedVoice) =>
        persistVoices([voice, ...savedVoices.filter(v => v.voiceId !== voice.voiceId)]);

    const removeVoice = (voiceId: string) =>
        persistVoices(savedVoices.filter(v => v.voiceId !== voiceId));

    const copyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    };

    // ── Gemini Sample Text ─────────────────────────────────────────────────
    const fetchSampleText = async (code = langCode) => {
        setLoadingSample(true);
        setSampleText(null);
        try {
            const res = await fetch('/api/voice/sample-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ langCode: code }),
            });
            const data = await res.json();
            setSampleText(data.text || null);
        } catch {
            setSampleText(null);
        } finally {
            setLoadingSample(false);
        }
    };

    // Auto-fetch when switching to Record tab
    useEffect(() => {
        if (tab === 'record' && !sampleText) fetchSampleText();
    }, [tab]);

    // ── Recording ──────────────────────────────────────────────────────────
    const startRecording = async () => {
        // Fetch a fresh sample each time recording starts
        fetchSampleText(langCode);
        setShowTips(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(t => t.stop());
            };
            mediaRecorder.start(100);
            setIsRecording(true);
            setRecordingTime(0);
            setAudioBlob(null);
            setAudioUrl(null);
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } catch { setCloneError('Microphone access denied. Please allow permissions.'); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const togglePreview = () => {
        if (!audioUrl) return;
        if (!previewAudioRef.current) {
            previewAudioRef.current = new Audio(audioUrl);
            previewAudioRef.current.onended = () => setIsPlayingPreview(false);
        }
        if (isPlayingPreview) { previewAudioRef.current.pause(); setIsPlayingPreview(false); }
        else { previewAudioRef.current.src = audioUrl; previewAudioRef.current.play(); setIsPlayingPreview(true); }
    };

    // ── File Upload ────────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('audio/')) { setCloneError('Please upload an audio file.'); return; }
        if (file.size > 25 * 1024 * 1024) { setCloneError('Max 25MB.'); return; }
        setUploadFile(file);
        setAudioUrl(URL.createObjectURL(file));
        setAudioBlob(null);
        setCloneError(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange({ target: { files: [file] } } as any);
    };

    // ── Clone ──────────────────────────────────────────────────────────────
    const handleClone = async () => {
        const sourceBlob = audioBlob || uploadFile;
        if (!sourceBlob || !voiceName.trim()) {
            setCloneError('Add a voice name first.');
            return;
        }
        setCloning(true);
        setCloneError(null);

        const formData = new FormData();
        formData.append('file', sourceBlob, audioBlob ? 'recording.webm' : (uploadFile?.name || 'audio.mp3'));
        formData.append('name', voiceName.trim());
        formData.append('langCode', langCode);
        if (voiceDescription.trim()) formData.append('description', voiceDescription.trim());

        try {
            const res = await fetch('/api/voice/clone', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to clone voice');

            const voice: ClonedVoice = {
                voiceId: data.voiceId,
                displayName: voiceName.trim(),
                langCode,
                description: voiceDescription.trim() || undefined,
                createdAt: new Date().toISOString(),
            };
            setClonedVoice(voice);
            saveVoice(voice);
            setActiveVoiceId(voice.voiceId);
            setStep('done');
        } catch (err: any) {
            setCloneError(err.message || 'Something went wrong.');
        } finally {
            setCloning(false);
        }
    };

    // ── Test Voice ─────────────────────────────────────────────────────────
    const handleTestVoice = async (voiceId: string) => {
        if (!testText.trim()) return;
        setSynthesizing(true);
        setTestAudioSrc(null);
        setIsPlayingTest(false);
        try {
            const res = await fetch('/api/tts/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: testText, voiceId,
                    modelId: controls.model,
                    speed: controls.speed, pitch: controls.pitch,
                    emotion: controls.emotion, style: controls.style,
                }),
            });
            const data = await res.json();
            if (data.audioContent) {
                const src = `data:audio/wav;base64,${data.audioContent}`;
                setTestAudioSrc(src);
                testAudioRef.current = new Audio(src);
                testAudioRef.current.onended = () => setIsPlayingTest(false);
                testAudioRef.current.play();
                setIsPlayingTest(true);
            } else {
                setCloneError('No audio returned.');
            }
        } catch { setCloneError('Failed to synthesize audio.'); }
        finally { setSynthesizing(false); }
    };

    const toggleTestAudio = () => {
        if (!testAudioRef.current) return;
        if (isPlayingTest) { testAudioRef.current.pause(); setIsPlayingTest(false); }
        else { testAudioRef.current.play(); setIsPlayingTest(true); }
    };

    const downloadTestAudio = () => {
        if (!testAudioSrc) return;
        const a = document.createElement('a');
        a.href = testAudioSrc;
        a.download = `nyx-voice-${clonedVoice?.displayName || 'output'}.wav`;
        a.click();
    };

    const patchControls = useCallback(<K extends keyof VoiceControls>(key: K, val: VoiceControls[K]) => {
        setControls(c => ({ ...c, [key]: val }));
        setTestAudioSrc(null);
    }, []);

    const reset = () => {
        setStep('record'); setTab('record');
        setAudioBlob(null); setAudioUrl(null); setUploadFile(null);
        setVoiceName(''); setVoiceDescription('');
        setCloneError(null); setClonedVoice(null);
        setTestAudioSrc(null); setRecordingTime(0);
        setControls(DEFAULT_CONTROLS); setSampleText(null);
    };

    const hasAudio = !!(audioBlob || uploadFile || audioUrl);
    const activeVoice = clonedVoice || savedVoices.find(v => v.voiceId === activeVoiceId);
    const selectedLang = LANGUAGES.find(l => l.code === langCode);

    return (
        <div className="max-w-5xl mx-auto">
            <style>{`
                @keyframes pulse-bar { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
            `}</style>

            <div className="mb-8">
                <h2 className="text-4xl font-bold text-theme-primary tracking-tight flex items-center gap-3">
                    <Wand2 className="w-8 h-8 text-purple-400" /> Voice Studio
                </h2>
                <p className="text-theme-secondary mt-2">Clone your voice, sculpt it — control tone, emotion, speed, and style.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── LEFT: Clone Flow ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Error */}
                    {cloneError && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-red-300">{cloneError}</p>
                                <button onClick={() => setCloneError(null)} className="text-xs text-red-400/70 hover:text-red-400 mt-1">Dismiss</button>
                            </div>
                        </div>
                    )}

                    {/* ── Language Selector ── */}
                    {step === 'record' && (
                        <div className="bg-card-theme rounded-2xl border border-theme p-4 flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-bold text-theme-primary">Clone Language</span>
                            </div>
                            <div className="flex-1 relative">
                                <select
                                    value={langCode}
                                    onChange={e => {
                                        setLangCode(e.target.value);
                                        setSampleText(null);
                                    }}
                                    className="w-full bg-card-hover border border-theme rounded-xl px-3 py-2 text-theme-primary text-sm focus:outline-none focus:border-purple-500/50 appearance-none"
                                >
                                    {LANGUAGES.map(l => (
                                        <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                            <button
                                onClick={() => fetchSampleText(langCode)}
                                disabled={loadingSample}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition disabled:opacity-50"
                            >
                                {loadingSample ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                Get Sample Text
                            </button>
                        </div>
                    )}

                    {/* ── Record / Upload Card ── */}
                    {step === 'record' && (
                        <div className="bg-card-theme rounded-3xl border border-theme overflow-hidden">
                            <div className="flex border-b border-theme">
                                {(['record', 'upload'] as const).map(t => (
                                    <button key={t} onClick={() => { setTab(t); setAudioBlob(null); setAudioUrl(null); setUploadFile(null); }}
                                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${tab === t ? 'text-purple-400 border-b-2 border-purple-500' : 'text-theme-secondary hover:text-theme-primary'}`}>
                                        {t === 'record' ? <><Mic className="w-4 h-4" /> Record Voice</> : <><Upload className="w-4 h-4" /> Upload File</>}
                                    </button>
                                ))}
                            </div>

                            <div className="p-7">
                                {tab === 'record' && (
                                    <div className="space-y-6">
                                        {/* ── Recording Tips Banner ── */}
                                        {showTips && !isRecording && !audioBlob && (
                                            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.04)' }}>
                                                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(168,85,247,0.1)' }}>
                                                    <p className="text-xs font-bold text-purple-300 uppercase tracking-wide">Before you record</p>
                                                    <button onClick={() => setShowTips(false)} className="text-[10px] text-gray-600 hover:text-gray-400">Hide</button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-px p-0.5" style={{ background: 'rgba(168,85,247,0.08)' }}>
                                                    {RECORDING_TIPS.map((tip, i) => (
                                                        <div key={i} className="flex items-start gap-2.5 p-3 bg-card-theme">
                                                            <span style={{ color: tip.color }} className="flex-shrink-0 mt-0.5">{tip.icon}</span>
                                                            <p className="text-xs text-gray-400">{tip.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Gemini Sample Text ── */}
                                        {tab === 'record' && (
                                            <div className="rounded-2xl border border-theme overflow-hidden">
                                                <div className="flex items-center justify-between px-4 py-3 bg-card-hover border-b border-theme">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                                        <p className="text-xs font-bold text-theme-primary">Read This Aloud</p>
                                                        <span className="text-[10px] text-gray-600">· AI-generated in {selectedLang?.label}</span>
                                                    </div>
                                                    <button onClick={() => fetchSampleText(langCode)} disabled={loadingSample}
                                                        className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition">
                                                        <RefreshCw className={`w-3 h-3 ${loadingSample ? 'animate-spin' : ''}`} /> Regenerate
                                                    </button>
                                                </div>
                                                <div className="p-4 min-h-[80px] flex items-start">
                                                    {loadingSample ? (
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                                            Gemini is writing a sample in {selectedLang?.label}…
                                                        </div>
                                                    ) : sampleText ? (
                                                        <p className="text-sm text-theme-primary leading-relaxed font-medium">{sampleText}</p>
                                                    ) : (
                                                        <p className="text-xs text-gray-600 italic">Click "Get Sample Text" or it will auto-load when you start recording.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Big record button ── */}
                                        <div className="flex flex-col items-center gap-5">
                                            <div className={`relative w-36 h-36 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500
                                                ${isRecording ? 'bg-red-500/10 ring-4 ring-red-500/30 ring-offset-4 ring-offset-transparent'
                                                    : audioBlob ? 'bg-green-500/10 ring-2 ring-green-500/30'
                                                        : 'bg-card-hover ring-2 ring-theme hover:ring-purple-500/30'}`}
                                                onClick={isRecording ? stopRecording : startRecording}>
                                                {isRecording && <>
                                                    <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
                                                    <div className="absolute inset-[-10px] rounded-full border border-red-500/15 animate-pulse" />
                                                </>}
                                                <span className={`relative z-10 transition-transform hover:scale-110 ${isRecording ? 'text-red-400' : audioBlob ? 'text-green-400' : 'text-purple-400'}`}>
                                                    {isRecording ? <Square className="w-12 h-12 fill-current" /> : audioBlob ? <CheckCircle className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
                                                </span>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-3xl font-mono font-black text-theme-primary">{fmt(recordingTime)}</p>
                                                <p className="text-xs text-theme-secondary mt-1">
                                                    {isRecording ? '🔴 Recording — click square to stop' : audioBlob ? '✅ Captured' : `${selectedLang?.flag} Click the mic to start recording in ${selectedLang?.label}`}
                                                </p>
                                                {recordingTime > 0 && recordingTime < 30 && !isRecording && (
                                                    <p className="text-xs text-amber-400 mt-1">⚠️ Recommend at least 30 seconds for best results</p>
                                                )}
                                            </div>

                                            <WaveformBars active={isRecording} color="#a855f7" />
                                        </div>

                                        {/* Playback bar */}
                                        {audioBlob && !isRecording && (
                                            <div className="flex items-center justify-between p-4 bg-card-hover rounded-2xl border border-theme">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={togglePreview}
                                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:opacity-90 transition">
                                                        {isPlayingPreview ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                                    </button>
                                                    <div>
                                                        <p className="text-sm font-medium text-theme-primary">Recording Preview</p>
                                                        <p className="text-xs text-theme-secondary">{fmt(recordingTime)} · webm · {selectedLang?.flag} {selectedLang?.label}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setAudioBlob(null); setAudioUrl(null); setRecordingTime(0); }}
                                                    className="p-2 rounded-xl hover:bg-red-500/10 text-theme-secondary hover:text-red-400 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {tab === 'upload' && (
                                    <div className="space-y-5">
                                        <p className="text-center text-sm text-theme-secondary">Upload an audio file of your voice. MP3, WAV, M4A up to 25MB.</p>
                                        <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-10 text-center cursor-pointer transition-all group hover:bg-purple-500/5">
                                            <Upload className="w-10 h-10 text-purple-400/40 group-hover:text-purple-400 mx-auto mb-3 transition-colors" />
                                            <p className="text-theme-secondary group-hover:text-theme-primary">Drop here or <span className="text-purple-400 font-bold">browse</span></p>
                                            <p className="text-xs text-theme-secondary/40 mt-1.5">MP3 · WAV · M4A · WEBM · Max 25MB</p>
                                            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                                        </div>
                                        {uploadFile && (
                                            <div className="flex items-center justify-between p-4 bg-card-hover rounded-2xl border border-theme">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                        <Volume2 className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-theme-primary truncate max-w-[200px]">{uploadFile.name}</p>
                                                        <p className="text-xs text-theme-secondary">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setUploadFile(null); setAudioUrl(null); }}
                                                    className="p-2 rounded-xl hover:bg-red-500/10 text-theme-secondary hover:text-red-400 transition">
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
                    {step === 'record' && hasAudio && (
                        <div className="bg-card-theme rounded-3xl border border-theme p-6 space-y-4">
                            <h3 className="text-sm font-bold text-theme-primary">Name Your Clone</h3>
                            <input type="text" value={voiceName} onChange={e => setVoiceName(e.target.value)}
                                placeholder="e.g. Atharv — Deep & Confident" maxLength={50}
                                className="w-full bg-card-hover border border-theme rounded-xl px-4 py-3 text-theme-primary placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm" />
                            <textarea value={voiceDescription} onChange={e => setVoiceDescription(e.target.value)}
                                placeholder="Optional: describe this voice" rows={2}
                                className="w-full bg-card-hover border border-theme rounded-xl px-4 py-3 text-theme-primary placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm resize-none" />
                            <button onClick={handleClone} disabled={cloning || !voiceName.trim()}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-40 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-purple-500/30">
                                {cloning ? <><Loader2 className="w-5 h-5 animate-spin" /> Cloning…</> : <><Sparkles className="w-5 h-5" /> Clone My Voice ({selectedLang?.flag} {selectedLang?.label})</>}
                            </button>
                            <p className="text-xs text-center text-theme-secondary/50">~30 seconds · Stays private</p>
                        </div>
                    )}

                    {/* ── Done / Test ── */}
                    {step === 'done' && activeVoice && (
                        <div className="bg-card-theme rounded-3xl border border-green-500/20 overflow-hidden">
                            <div className="p-6 border-b border-theme flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-theme-primary">{activeVoice.displayName}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-theme-secondary font-mono">{activeVoice.voiceId.slice(0, 20)}…</p>
                                        <button onClick={() => copyId(activeVoice.voiceId)} className="p-1 rounded text-gray-600 hover:text-purple-400">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                        {copied === activeVoice.voiceId && <span className="text-[10px] text-green-400">Copied!</span>}
                                        {activeVoice.langCode && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                                {LANGUAGES.find(l => l.code === activeVoice.langCode)?.flag} {activeVoice.langCode}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={reset} className="flex items-center gap-2 text-xs py-2 px-4 rounded-xl bg-card-hover border border-theme text-theme-secondary hover:text-theme-primary transition">
                                    <RefreshCw className="w-3.5 h-3.5" /> Clone Another
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-theme-primary">Test Your Voice</h4>
                                    <div className="flex gap-1.5">
                                        {SAMPLE_TEXTS.map((t, i) => (
                                            <button key={i} onClick={() => { setTestText(t); setTestAudioSrc(null); }}
                                                title={t}
                                                className={`w-6 h-6 rounded-full text-[10px] font-bold transition border ${testText === t ? 'bg-purple-500 border-purple-500 text-white' : 'bg-card-hover border-theme text-theme-secondary hover:border-purple-500/40'}`}>
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea value={testText} onChange={e => { setTestText(e.target.value); setTestAudioSrc(null); }}
                                    rows={3} placeholder="Type something..." className="w-full bg-card-hover border border-theme rounded-2xl px-4 py-3 text-theme-primary text-sm focus:outline-none focus:border-purple-500/50 resize-none" />

                                {/* Controls */}
                                <div className="rounded-2xl border border-theme overflow-hidden">
                                    <button onClick={() => setShowControls(s => !s)} className="w-full flex items-center justify-between px-5 py-3.5 bg-card-hover hover:bg-card-theme transition">
                                        <div className="flex items-center gap-2 text-sm font-bold text-theme-primary">
                                            <Sliders className="w-4 h-4 text-purple-400" /> Voice Controls
                                            {(controls.speed !== 1 || controls.pitch !== 0 || controls.emotion || controls.style) && (
                                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 text-purple-400 font-bold border border-purple-500/20">Modified</span>
                                            )}
                                        </div>
                                        {showControls ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </button>
                                    {showControls && (
                                        <div className="p-5 space-y-5">
                                            <div className="grid grid-cols-2 gap-5">
                                                <RangeSlider label="Speed" value={controls.speed} min={0.5} max={2.0} step={0.05} format={v => `${v.toFixed(2)}×`} onChange={v => patchControls('speed', v)} color="#a855f7" />
                                                <RangeSlider label="Pitch" value={controls.pitch} min={-10} max={10} step={0.5} format={v => v > 0 ? `+${v}` : `${v}`} onChange={v => patchControls('pitch', v)} color="#06b6d4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium mb-2">Emotion</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {EMOTIONS.map(e => (
                                                        <button key={e.value} onClick={() => patchControls('emotion', e.value)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${controls.emotion === e.value ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-card-hover border-theme text-theme-secondary hover:border-purple-500/30'}`}>
                                                            {e.icon} {e.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium mb-2">Style</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {STYLES.map(s => (
                                                        <button key={s.value} onClick={() => patchControls('style', s.value)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${controls.style === s.value ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-card-hover border-theme text-theme-secondary hover:border-cyan-500/30'}`}>
                                                            {s.icon} {s.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium mb-2">Model</p>
                                                <div className="flex gap-2">
                                                    {MODELS.map(m => (
                                                        <button key={m.value} onClick={() => patchControls('model', m.value)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition ${controls.model === m.value ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-card-hover border-theme text-theme-secondary hover:border-amber-500/30'}`}>
                                                            {m.label} <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${controls.model === m.value ? 'bg-amber-500/30 text-amber-200' : 'bg-white/5 text-gray-500'}`}>{m.badge}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button onClick={() => { setControls(DEFAULT_CONTROLS); setTestAudioSrc(null); }} className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1 transition">
                                                <RefreshCw className="w-3 h-3" /> Reset defaults
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => testAudioSrc ? toggleTestAudio() : handleTestVoice(activeVoice.voiceId)} disabled={synthesizing}
                                        className="flex-1 py-3.5 font-bold text-sm text-white rounded-2xl flex items-center justify-center gap-2.5 transition-all hover:opacity-90 disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)', boxShadow: '0 4px 20px rgba(168,85,247,0.3)' }}>
                                        {synthesizing ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                                            : testAudioSrc
                                                ? (isPlayingTest ? <><Pause className="w-4 h-4 fill-current" /> Pause</> : <><Play className="w-4 h-4 fill-current" /> Play</>)
                                                : <><Sparkles className="w-4 h-4" /> Generate Audio</>}
                                    </button>
                                    {testAudioSrc && (
                                        <>
                                            <button onClick={() => handleTestVoice(activeVoice.voiceId)} title="Regenerate"
                                                className="p-3.5 rounded-2xl border border-theme bg-card-hover hover:bg-card-theme text-theme-secondary hover:text-theme-primary transition">
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button onClick={downloadTestAudio} title="Download"
                                                className="p-3.5 rounded-2xl border border-theme bg-card-hover hover:bg-card-theme text-theme-secondary hover:text-theme-primary transition">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                                {isPlayingTest && (
                                    <div className="flex justify-center py-1">
                                        <WaveformBars active={true} color="#a855f7" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Voice Library ── */}
                <div className="space-y-4">
                    <div className="bg-card-theme rounded-3xl border border-theme overflow-hidden">
                        <div className="px-5 py-4 border-b border-theme flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-theme-primary">Voice Library</h3>
                                <p className="text-xs text-theme-secondary mt-0.5">{savedVoices.length} voice{savedVoices.length !== 1 ? 's' : ''}</p>
                            </div>
                            <Mic className="w-4 h-4 text-purple-400/50" />
                        </div>
                        <div className="p-3 space-y-2 max-h-[460px] overflow-y-auto">
                            {savedVoices.length === 0 ? (
                                <div className="text-center py-10">
                                    <Mic className="w-8 h-8 text-theme-secondary/20 mx-auto mb-3" />
                                    <p className="text-xs text-theme-secondary/40">No voices yet.</p>
                                </div>
                            ) : savedVoices.map(voice => (
                                <div key={voice.voiceId}
                                    className={`p-4 rounded-2xl border group cursor-pointer transition-all ${activeVoiceId === voice.voiceId ? 'border-purple-500/40 bg-purple-500/10' : 'border-theme bg-card-hover hover:border-purple-500/20'}`}
                                    onClick={() => { setActiveVoiceId(voice.voiceId); setClonedVoice(voice); setStep('done'); setTestAudioSrc(null); }}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${activeVoiceId === voice.voiceId ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-card-theme border border-theme'}`}>
                                                <Mic className={`w-4 h-4 ${activeVoiceId === voice.voiceId ? 'text-white' : 'text-purple-400/60'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-theme-primary truncate">{voice.displayName}</p>
                                                {voice.langCode && (
                                                    <span className="text-[10px] text-gray-600">
                                                        {LANGUAGES.find(l => l.code === voice.langCode)?.flag} {voice.langCode}
                                                    </span>
                                                )}
                                                <p className="text-[10px] text-theme-secondary/50 mt-0.5">
                                                    {voice.createdAt ? new Date(voice.createdAt).toLocaleDateString() : '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button onClick={e => { e.stopPropagation(); copyId(voice.voiceId); }}
                                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-gray-600 hover:text-gray-300 transition">
                                                <Copy className={`w-3 h-3 ${copied === voice.voiceId ? 'text-green-400' : ''}`} />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); removeVoice(voice.voiceId); }}
                                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    {activeVoiceId === voice.voiceId && (
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                            <span className="text-[10px] text-green-400 font-medium">Active</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-gradient-to-br from-purple-900/10 to-pink-900/5 rounded-3xl border border-purple-500/10 p-5 space-y-3">
                        <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Recording Tips
                        </h3>
                        <ul className="space-y-2 text-xs text-theme-secondary">
                            {[
                                'Record in a quiet room — silence is gold',
                                'Speak naturally at a comfortable pace',
                                '30–90 seconds = optimal clone quality',
                                'WAV/MP3 uploads give best results',
                                'Use the AI sample text for varied vocal range',
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-0.5 flex-shrink-0">✦</span> {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
