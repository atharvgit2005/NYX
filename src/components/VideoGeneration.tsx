'use client';

import { useState, useEffect } from 'react';
import VideoHistoryList from './VideoHistoryList';
import VoiceToVideo, { VoiceConfig } from './VoiceToVideo';
import { Video, Sparkles, AlertTriangle, Play } from 'lucide-react';
import NyxButton from './ui/NyxButton';

export default function VideoGeneration() {
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [script, setScript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [mounted, setMounted] = useState(false);

    // Voice config from VoiceToVideo bridge
    const [voiceConfig, setVoiceConfig] = useState<VoiceConfig | null>(null);

    useEffect(() => {
        setMounted(true);
        const savedScript = localStorage.getItem('current_video_script');
        setScript(savedScript || DEFAULT_SCRIPT);
        const savedKey = localStorage.getItem('heygen_api_key');
        if (savedKey) setApiKey(savedKey);
    }, []);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value;
        setApiKey(key);
        localStorage.setItem('heygen_api_key', key);
    };

    // ── Progress steps for the UI label ───────────────────────────────────────
    const LABELS = [
        { at: 0, text: 'Connecting to Inworld…' },
        { at: 15, text: 'Synthesising voice with your tone settings…' },
        { at: 35, text: 'Uploading audio to HeyGen…' },
        { at: 55, text: 'Animating your avatar…' },
        { at: 80, text: 'Rendering video at 4K…' },
        { at: 92, text: 'Finalising and encoding…' },
    ];

    const updateProgress = (pct: number) => {
        setProgress(pct);
        const label = [...LABELS].reverse().find(l => pct >= l.at)?.text || 'Starting…';
        setProgressLabel(label);
    };

    // ── Status polling ─────────────────────────────────────────────────────────
    const pollStatus = async (id: string): Promise<boolean> => {
        try {
            const headers: Record<string, string> = {};
            if (apiKey) headers['x-api-key'] = apiKey;

            const response = await fetch(`/api/video/status?videoId=${id}`, { headers });
            const data = await response.json();

            if (data.success) {
                const { status: vs, url, error: ve } = data.data;

                if (vs === 'completed' && url) {
                    setVideoUrl(url);
                    setStatus('completed');
                    updateProgress(100);
                    return true;
                } else if (vs === 'failed' || vs === 'error') {
                    setError(typeof ve === 'string' ? ve : JSON.stringify(ve) || 'Video generation failed on server.');
                    setStatus('idle');
                    return true;
                }
            }
        } catch (err) { console.error('Polling error:', err); }
        return false;
    };

    // ── Start generation ───────────────────────────────────────────────────────
    const startGeneration = async () => {
        const customAvatarId = localStorage.getItem('custom_avatar_id');
        if (!customAvatarId) {
            setError('Avatar ID not found. Please set it on the Avatar & Voice page.');
            return;
        }
        if (customAvatarId.startsWith('sk_')) {
            setError(
                'Your saved Avatar ID starts with "sk_" — that\'s a Streaming Avatar ID which only works for live video calls, not video generation. ' +
                'Go to Avatar & Voice → enter a Talking Avatar ID (e.g. pick "Tyler" from the quick picks) → Save.'
            );
            return;
        }
        if (!voiceConfig) {
            setError('Please select a voice in the Voice → Avatar Bridge first.');
            return;
        }

        setStatus('processing');
        updateProgress(5);
        setError(null);
        setVideoUrl(null);

        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (apiKey) headers['x-api-key'] = apiKey;

            const response = await fetch('/api/video/generate', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    script: script || 'Default script',
                    avatarId: customAvatarId,
                    voiceId: voiceConfig.voiceId,
                    voiceControls: {
                        speed: voiceConfig.controls.speed,
                        pitch: voiceConfig.controls.pitch,
                        emotion: voiceConfig.controls.emotion || undefined,
                        style: voiceConfig.controls.style || undefined,
                        model: voiceConfig.controls.model,
                    },
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to start generation');

            const newVideoId = data.data.videoId;
            setVideoId(newVideoId);

            let pollCount = 0;
            const maxPolls = 300;

            const interval = setInterval(async () => {
                pollCount++;
                updateProgress(Math.min(5 + pollCount * 0.4, 92));

                const done = await pollStatus(newVideoId);
                if (done || pollCount >= maxPolls) {
                    clearInterval(interval);
                    if (pollCount >= maxPolls) {
                        setError('Render timed out. Please try again.');
                        setStatus('idle');
                    }
                }
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Unexpected error');
            setStatus('idle');
        }
    };

    const avatarId = mounted ? (localStorage.getItem('custom_avatar_id') || null) : null;
    const canGenerate = !!avatarId && !!voiceConfig && status === 'idle';

    return (
        <div className="max-w-5xl mx-auto mt-8">
            {/* ── Header ── */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-theme-primary flex items-center gap-3">
                        <Video className="w-7 h-7 text-theme-primary" /> Video Generation
                    </h2>
                    <p className="text-theme-secondary mt-1.5">
                        Your cloned Inworld voice drives your HeyGen avatar. Tweak tone, preview, then render.
                    </p>
                </div>
                {status === 'idle' && (
                    <NyxButton 
                        onClick={startGeneration} 
                        icon={Sparkles}
                        className="px-6 py-2.5"
                    >
                        GENERATE VIDEO
                    </NyxButton>
                )}
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-red-300 text-sm">Error</p>
                        <p className="text-sm text-red-200/70 mt-0.5">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500/60 hover:text-red-400 text-xs">Dismiss</button>
                </div>
            )}

            {/* ── Idle state ── */}
            {status === 'idle' && (
                <div className="space-y-6">
                    {/* Two-column main layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* ── Left: Avatar + Script ── */}
                        <div className="space-y-5">
                            {/* Avatar ID card */}
                            <div className="p-5 rounded-3xl border border-theme bg-card-theme">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">HeyGen Avatar</p>
                                <div className={`p-4 rounded-2xl border ${avatarId ? 'border-blue-500/25 bg-blue-500/5' : 'border-dashed border-theme bg-card-theme'}`}>
                                    {avatarId ? (
                                        <>
                                            <p className="text-xs text-orange-500 font-bold mb-1">✓ Avatar ID set</p>
                                            <p className="text-theme-primary font-mono text-xs break-all">{avatarId}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-theme-secondary">No avatar set. <a href="/dashboard/avatar" className="text-theme-primary underline font-bold">Set Avatar ID →</a></p>
                                    )}
                                </div>
                                {avatarId && (
                                    <a href="/dashboard/avatar" className="text-[10px] text-gray-600 hover:text-theme-secondary underline mt-2 block">Change Avatar ID</a>
                                )}
                            </div>

                            {/* Script editor */}
                            <div className="rounded-3xl border border-theme bg-card-theme overflow-hidden">
                                <div className="px-5 py-4 border-b border-theme">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Script</p>
                                </div>
                                <textarea value={script}
                                    onChange={e => { setScript(e.target.value); localStorage.setItem('current_video_script', e.target.value); }}
                                    className="w-full bg-transparent text-theme-secondary font-mono text-xs p-5 focus:outline-none resize-none min-h-[280px]"
                                    placeholder="Paste or write your script here…" />
                            </div>

                            {/* HeyGen API Key */}
                            <div className="p-4 rounded-2xl border border-theme bg-card-theme">
                                <label className="block text-[10px] text-theme-secondary font-bold uppercase tracking-wider mb-2">HeyGen API Key (optional override)</label>
                                <input type="password" value={apiKey} onChange={handleApiKeyChange}
                                    placeholder="Leave blank to use server key"
                                    className="w-full bg-accent border border-theme rounded-xl px-4 py-2.5 text-theme-primary focus:outline-none focus:border-orange-500/50 placeholder-theme-secondary/40 font-mono text-xs transition-colors" />
                            </div>
                        </div>

                        {/* ── Right: Voice Bridge ── */}
                        <div>
                            <VoiceToVideo script={script} onChange={setVoiceConfig} />
                        </div>
                    </div>

                    {/* Generate CTA (also at bottom for convenience) */}
                    <div className="flex items-center justify-between p-5 rounded-3xl border border-theme bg-card-theme">
                        <div>
                            <p className="text-sm font-bold text-theme-primary">
                                {canGenerate ? '✅ Ready to render' : '⚠️ Not ready yet'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {!avatarId && 'Missing avatar ID · '}
                                {!voiceConfig && 'Select a cloned voice · '}
                                {canGenerate && `${voiceConfig!.voiceName} → ${avatarId?.slice(0, 16)}…`}
                            </p>
                        </div>
                        <NyxButton 
                            onClick={startGeneration} 
                            icon={Sparkles}
                            className="px-8 py-3"
                        >
                            GENERATE VIDEO
                        </NyxButton>
                    </div>
                </div>
            )}

            {/* ── Processing ── */}
            {status === 'processing' && (
                <div className="relative bg-card-theme rounded-3xl border border-orange-500/20 overflow-hidden" style={{ minHeight: 400 }}>
                    {/* Animated bg */}
                    <div className="absolute inset-0">
                        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40">
                            <source src="/videos/loading-background.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-page/60 backdrop-blur-sm" />
                        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.12), transparent 70%)' }} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center" style={{ minHeight: 400 }}>
                        {/* Spinner */}
                        <div className="w-20 h-20 border-3 border-theme border-t-orange-500 rounded-full animate-spin mb-8"
                            style={{ borderWidth: 3 }} />

                        <h3 className="text-2xl font-black text-theme-primary mb-2">Rendering Your Video</h3>
                        <p className="text-zinc-400 text-sm mb-8">{progressLabel}</p>

                        {/* Progress bar */}
                        <div className="w-full max-w-md">
                            <div className="w-full bg-secondary border border-theme rounded-full h-2 mb-2 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500 bg-theme"
                                    style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-theme-secondary text-xs">{Math.round(progress)}%</p>
                        </div>

                        {/* Pipeline steps */}
                        <div className="mt-8 flex flex-col gap-2 text-left w-full max-w-sm">
                            {[
                                { label: 'Inworld TTS synthesis', done: progress > 35 },
                                { label: 'Audio upload to HeyGen', done: progress > 55 },
                                { label: 'HeyGen avatar animation', done: progress > 80 },
                                { label: 'Final video render', done: progress >= 100 },
                            ].map(step => (
                                <div key={step.label} className="flex items-center gap-2.5">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${step.done ? 'bg-theme' : 'bg-transparent border border-theme/40'}`}>
                                        {step.done && <span className="text-inverse text-[10px] font-bold">✓</span>}
                                    </div>
                                    <span className={`text-xs transition-colors ${step.done ? 'text-green-600 dark:text-green-400 font-bold' : 'text-theme-secondary/60'}`}>{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Completed ── */}
            {status === 'completed' && videoUrl && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card-theme rounded-3xl overflow-hidden border border-green-500/20 aspect-[9/16] relative">
                        <video src={videoUrl} controls className="w-full h-full object-cover" autoPlay />
                    </div>

                    <div className="space-y-5">
                        <div className="bg-card-theme p-6 rounded-3xl border border-theme">
                            <h3 className="text-xl font-bold text-green-500 mb-1">✅ Render Complete</h3>
                            {voiceConfig && (
                                <p className="text-xs text-theme-secondary mb-4">
                                    Voice: <span className="text-theme-primary font-bold">{voiceConfig.voiceName}</span>
                                    {voiceConfig.controls.emotion && ` · ${voiceConfig.controls.emotion}`}
                                    {voiceConfig.controls.style && ` · ${voiceConfig.controls.style}`}
                                    {` · ${voiceConfig.controls.speed}× speed`}
                                </p>
                            )}
                            <div className="space-y-3">
                                <NyxButton
                                    href={videoUrl}
                                    icon={Play}
                                    className="w-full justify-center"
                                >
                                    DOWNLOAD VIDEO
                                </NyxButton>
                                <button onClick={() => { setStatus('idle'); setVideoUrl(null); setProgress(0); }}
                                    className="w-full py-3 text-sm text-gray-500 hover:text-theme-secondary transition">
                                    Generate another →
                                </button>
                            </div>
                        </div>

                        <div className="bg-card-theme p-6 rounded-3xl border border-theme">
                            <h3 className="text-base font-bold text-theme-primary mb-4">Performance Prediction</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Viral Score', val: '8.5 / 10', color: 'text-orange-500' },
                                    { label: 'Hook Strength', val: 'High', color: 'text-theme-primary' },
                                    { label: 'Watch Time', val: '78%+', color: 'text-theme-primary' },
                                    { label: 'Engagement', val: 'Very High', color: 'text-theme-primary' },
                                ].map(({ label, val, color }) => (
                                    <div key={label} className="bg-secondary p-4 rounded-2xl text-center border border-theme shadow-sm hover:border-theme/80 transition-all">
                                        <p className={`text-xl font-black ${color}`}>{val}</p>
                                        <p className="text-[10px] text-theme-secondary mt-1 uppercase tracking-wide font-bold">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── History ── */}
            <div className="mt-16 pt-8 border-t border-theme">
                <h3 className="text-xl font-bold text-theme-primary mb-6">Recent Videos</h3>
                <VideoHistoryList />
            </div>
        </div>
    );
}

const DEFAULT_SCRIPT = `Arijit Singh's SHOCKING Exit from Playback Singing REVEALED!

[HOOK] (0-5 seconds)
Visual: Close-up of Arijit Singh at a mic, eyes closed, mid-performance.
Audio: Arijit (voiceover, emotional): "I can't do this anymore..."

[BODY] (5-45 seconds)
The voice behind your FAVORITE songs is stepping away! After dominating Bollywood for over a DECADE — why now?
The pressure? The politics? Creative burnout? He's choosing LIVE concerts over playback! Freedom over formulas!

[CTA] (45-60 seconds)
Is this the end...or a NEW beginning? Drop your thoughts below! Follow for more Bollywood bombshells!`;
