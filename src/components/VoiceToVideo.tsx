'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Mic, Play, Pause, Loader2, Sparkles, ChevronDown, ChevronUp,
    Sliders, RefreshCw, CheckCircle, AlertCircle, Wand2,
    BookOpen, Zap, Flame, Wind, Heart, Moon, Volume2, Link2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClonedVoice {
    voiceId: string;
    displayName: string;
    description?: string;
    createdAt?: string;
}

interface VoiceControls {
    speed: number;
    pitch: number;
    emotion: string;
    style: string;
    model: string;
}

// What we export upward to VideoGeneration
export interface VoiceConfig {
    voiceId: string;
    voiceName: string;
    controls: VoiceControls;
    previewAudioSrc?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_CONTROLS: VoiceControls = { speed: 1.0, pitch: 0, emotion: '', style: '', model: 'inworld-tts-1.5-max' };

const EMOTIONS = [
    { value: '', label: 'Neutral', emoji: '😐' },
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'excited', label: 'Excited', emoji: '🤩' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'angry', label: 'Angry', emoji: '😠' },
    { value: 'fearful', label: 'Fearful', emoji: '😨' },
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

// ─── Slider ───────────────────────────────────────────────────────────────────
function RangeSlider({ label, value, min, max, step, format, onChange, color = '#a855f7' }:
    { label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void; color?: string }) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{label}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg" style={{ color, background: `${color}18` }}>{format(value)}</span>
            </div>
            <div className="relative h-4 flex items-center">
                <div className="absolute w-full h-1 rounded-full bg-white/5" />
                <div className="absolute h-1 rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }} />
                <input type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(parseFloat(e.target.value))}
                    className="absolute w-full opacity-0 cursor-pointer h-4" style={{ zIndex: 1 }} />
                <div className="absolute w-3.5 h-3.5 rounded-full shadow border-2 border-white"
                    style={{ left: `calc(${pct}% - 7px)`, background: color, transition: 'left 0.05s' }} />
            </div>
        </div>
    );
}

// ─── VoiceToVideo Component ───────────────────────────────────────────────────
interface Props {
    script: string;         // Current script text from VideoGeneration
    onChange: (cfg: VoiceConfig | null) => void;  // Notify parent of selected voice+controls
}

export default function VoiceToVideo({ script, onChange }: Props) {
    const [voices, setVoices] = useState<ClonedVoice[]>([]);
    const [selected, setSelected] = useState<ClonedVoice | null>(null);
    const [controls, setControls] = useState<VoiceControls>(DEFAULT_CONTROLS);
    const [showControls, setShowControls] = useState(false);

    // Preview state
    const [previewing, setPreviewing] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load cloned voices from localStorage
    const loadVoices = () => {
        const raw = localStorage.getItem('cloned_voices');
        if (raw) {
            try {
                const list: ClonedVoice[] = JSON.parse(raw);
                setVoices(list);
                // Auto-select the first voice if none selected
                if (list.length > 0 && !selected) setSelected(list[0]);
            } catch { }
        }
    };

    useEffect(() => { loadVoices(); }, []);

    // Notify parent whenever selection or controls change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!selected) { onChange(null); return; }
        onChange({
            voiceId: selected.voiceId,
            voiceName: selected.displayName,
            controls,
            previewAudioSrc: previewSrc ?? undefined,
        });
    }, [selected, controls, previewSrc]); // intentionally omitting onChange - stable callback

    const patch = useCallback(<K extends keyof VoiceControls>(k: K, v: VoiceControls[K]) => {
        setControls(c => ({ ...c, [k]: v }));
        setPreviewSrc(null);
    }, []);

    const isModified = controls.speed !== 1 || controls.pitch !== 0 || !!controls.emotion || !!controls.style;

    // ── Preview: synthesise a short excerpt of the script ─────────────────
    const previewVoice = async () => {
        if (!selected || !script.trim()) return;

        // Only send the first ~300 chars to keep preview fast
        const previewText = script.trim().slice(0, 300) + (script.trim().length > 300 ? '…' : '');

        setPreviewing(true);
        setPreviewSrc(null);
        setIsPlaying(false);
        setPreviewError(null);

        try {
            const res = await fetch('/api/tts/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: previewText,
                    voiceId: selected.voiceId,
                    modelId: controls.model,
                    speed: controls.speed,
                    pitch: controls.pitch,
                    emotion: controls.emotion || undefined,
                    style: controls.style || undefined,
                }),
            });

            const data = await res.json();
            if (data.audioContent) {
                const src = `data:audio/wav;base64,${data.audioContent}`;
                setPreviewSrc(src);
                audioRef.current = new Audio(src);
                audioRef.current.onended = () => setIsPlaying(false);
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                setPreviewError(data.error || 'No audio returned');
            }
        } catch (e: any) {
            setPreviewError('Synthesis failed — check your Inworld API key');
        } finally {
            setPreviewing(false);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current || !previewSrc) return;
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play(); setIsPlaying(true); }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="rounded-3xl border border-theme bg-card-theme overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-theme"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(236,72,153,0.03) 100%)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <Link2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-black text-white">Voice → Avatar Bridge</p>
                    <p className="text-xs text-gray-500">Pick your Inworld cloned voice · tweak tone · preview · then render</p>
                </div>
                {selected && (
                    <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-green-400"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <CheckCircle className="w-3 h-3" /> Voice set
                    </div>
                )}
            </div>

            <div className="p-6 space-y-5">
                {/* ── Voice picker ── */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Select Cloned Voice</p>
                        <button onClick={loadVoices} title="Refresh list from localStorage"
                            className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400 transition">
                            <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                    </div>
                    {voices.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                            <Mic className="w-8 h-8 text-gray-700 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-gray-400">No cloned voices yet</p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Go to <a href="/dashboard/avatar" className="text-purple-400 hover:text-purple-300 underline">Avatar &amp; Voice</a> → scroll to &ldquo;Voice Studio&rdquo; to clone your voice first.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {voices.map(v => (
                                <button key={v.voiceId} onClick={() => { setSelected(v); setPreviewSrc(null); setIsPlaying(false); }}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left w-full transition-all ${selected?.voiceId === v.voiceId
                                        ? 'border-purple-500/50 bg-purple-500/10'
                                        : 'border-theme bg-card-hover hover:border-purple-500/25'}`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${selected?.voiceId === v.voiceId ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-white/5 border border-white/10'}`}>
                                        <Mic className={`w-4 h-4 ${selected?.voiceId === v.voiceId ? 'text-white' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${selected?.voiceId === v.voiceId ? 'text-white' : 'text-theme-primary'}`}>{v.displayName}</p>
                                        {v.description && <p className="text-[10px] text-gray-600 truncate">{v.description}</p>}
                                        <p className="text-[10px] text-gray-700 font-mono mt-0.5">{v.voiceId.slice(0, 24)}…</p>
                                    </div>
                                    {selected?.voiceId === v.voiceId && (
                                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Controls (collapsible) ── */}
                {selected && (
                    <>
                        <div className="rounded-2xl border border-theme overflow-hidden">
                            <button onClick={() => setShowControls(s => !s)}
                                className="w-full flex items-center justify-between px-5 py-3.5 bg-card-hover hover:bg-card-theme transition">
                                <div className="flex items-center gap-2 text-sm font-bold text-theme-primary">
                                    <Sliders className="w-4 h-4 text-purple-400" />
                                    Voice Controls
                                    {isModified && (
                                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 text-purple-400 font-bold border border-purple-500/20">Modified</span>
                                    )}
                                </div>
                                {showControls ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                            </button>

                            {showControls && (
                                <div className="p-5 space-y-4 border-t border-theme">
                                    {/* Sliders */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <RangeSlider label="Speed" value={controls.speed} min={0.5} max={2.0} step={0.05}
                                            format={v => `${v.toFixed(2)}×`} onChange={v => patch('speed', v)} color="#a855f7" />
                                        <RangeSlider label="Pitch" value={controls.pitch} min={-10} max={10} step={0.5}
                                            format={v => v > 0 ? `+${v}` : `${v}`} onChange={v => patch('pitch', v)} color="#06b6d4" />
                                    </div>

                                    {/* Emotion */}
                                    <div>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-1.5">Emotion</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {EMOTIONS.map(e => (
                                                <button key={e.value} onClick={() => patch('emotion', e.value)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${controls.emotion === e.value ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-card-hover border-theme text-gray-500 hover:border-purple-500/30'}`}>
                                                    {e.emoji} {e.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Style */}
                                    <div>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-1.5">Style</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {STYLES.map(s => (
                                                <button key={s.value} onClick={() => patch('style', s.value)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${controls.style === s.value ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-card-hover border-theme text-gray-500 hover:border-cyan-500/30'}`}>
                                                    {s.icon} {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Model */}
                                    <div>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mb-1.5">Model</p>
                                        <div className="flex gap-2">
                                            {MODELS.map(m => (
                                                <button key={m.value} onClick={() => patch('model', m.value)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${controls.model === m.value ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-card-hover border-theme text-gray-500 hover:border-amber-500/30'}`}>
                                                    {m.label}
                                                    <span className={`text-[9px] px-1 py-0.5 rounded font-black ${controls.model === m.value ? 'bg-amber-500/30 text-amber-200' : 'bg-white/5 text-gray-600'}`}>{m.badge}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button onClick={() => { setControls(DEFAULT_CONTROLS); setPreviewSrc(null); }}
                                        className="text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1 transition">
                                        <RefreshCw className="w-3 h-3" /> Reset to defaults
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Preview bar ── */}
                        <div className="rounded-2xl border border-theme overflow-hidden">
                            <div className="flex items-center gap-3 px-4 py-3 bg-card-hover">
                                <Wand2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                                <p className="text-xs font-bold text-theme-primary flex-1">Voice Preview</p>
                                <p className="text-[10px] text-gray-600">Synthesises first ~300 chars of your script</p>
                            </div>

                            <div className="px-4 py-4 flex items-center gap-3">
                                {/* Preview / Play button */}
                                <button
                                    onClick={previewSrc ? togglePlay : previewVoice}
                                    disabled={previewing}
                                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 4px 15px rgba(168,85,247,0.3)' }}>
                                    {previewing
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : previewSrc
                                            ? (isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />)
                                            : <Play className="w-4 h-4 fill-current ml-0.5" />
                                    }
                                </button>

                                <div className="flex-1 min-w-0">
                                    {previewing && <p className="text-xs text-gray-400">Synthesising preview…</p>}
                                    {!previewing && !previewSrc && !previewError && (
                                        <p className="text-xs text-gray-500">
                                            {selected.displayName} · {controls.speed}× speed
                                            {controls.emotion && ` · ${controls.emotion}`}
                                            {controls.style && ` · ${controls.style}`}
                                        </p>
                                    )}
                                    {previewSrc && !previewing && (
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-end gap-0.5 h-5">
                                                {[...Array(18)].map((_, i) => (
                                                    <div key={i} className="w-0.5 rounded-full transition-all"
                                                        style={{
                                                            height: isPlaying ? `${4 + Math.abs(Math.sin(i * 0.8)) * 12}px` : '3px',
                                                            background: isPlaying ? '#a855f7' : '#a855f740',
                                                            animation: isPlaying ? `pulse 0.${(i % 5) + 3}s ease-in-out infinite alternate` : 'none',
                                                            animationDelay: `${i * 0.05}s`,
                                                        }} />
                                                ))}
                                            </div>
                                            <p className="text-xs text-purple-400 font-medium">{isPlaying ? 'Playing…' : 'Ready'}</p>
                                        </div>
                                    )}
                                    {previewError && (
                                        <p className="text-xs text-red-400">{previewError}</p>
                                    )}
                                </div>

                                {previewSrc && (
                                    <button onClick={previewVoice} title="Re-synthesise" disabled={previewing}
                                        className="p-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition flex-shrink-0">
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ── Config summary ── */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Will render with:</span>
                            <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                {selected.displayName}
                            </span>
                            <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                {controls.speed}× speed
                            </span>
                            {controls.pitch !== 0 && (
                                <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                    pitch {controls.pitch > 0 ? '+' : ''}{controls.pitch}
                                </span>
                            )}
                            {controls.emotion && (
                                <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                    {EMOTIONS.find(e => e.value === controls.emotion)?.emoji} {controls.emotion}
                                </span>
                            )}
                            {controls.style && (
                                <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                    {controls.style}
                                </span>
                            )}
                            <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                {controls.model}
                            </span>
                        </div>

                        {/* Error */}
                        {previewError && (
                            <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-red-400"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {previewError}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer info */}
            {!selected && voices.length > 0 && (
                <div className="px-6 pb-5">
                    <p className="text-[10px] text-gray-600 text-center">
                        Select a voice above → adjust tone controls → preview → then click Generate Video
                    </p>
                </div>
            )}
        </div>
    );
}
