'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import { User, RefreshCw, X, Wand2, Trash2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

// ─── model-viewer TypeScript declaration ──────────────────────────────────────
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    src?: string;
                    alt?: string;
                    'auto-rotate'?: boolean | string;
                    'camera-controls'?: boolean | string;
                    'shadow-intensity'?: string;
                    exposure?: string;
                    ar?: boolean | string;
                    style?: React.CSSProperties;
                    'environment-image'?: string;
                    'skybox-image'?: string;
                    'rotation-per-second'?: string;
                    poster?: string;
                },
                HTMLElement
            >;
        }
    }
}

// ─── Avaturn embed URL (free hub — no API key needed) ─────────────────────────
const AVATURN_URL = 'https://hub.avaturn.me';

// ─── Fallback rotating orb if no avatar created yet ──────────────────────────
function AvatarOrb({ seed }: { seed: string }) {
    const colors = [
        ['#ffffff', '#333333'],
        ['#eeeeee', '#666666'],
        ['#dddddd', '#999999'],
        ['#cccccc', '#bbbbbb'],
    ];
    const idx = Math.abs(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length;
    const [c1, c2] = colors[idx];
    return (
        <div className="w-full h-full flex items-center justify-center"
            style={{ background: `radial-gradient(ellipse at 30% 30%, ${c1}55, transparent 60%), radial-gradient(ellipse at 70% 70%, ${c2}44, transparent 60%)` }}>
            <div className="text-6xl opacity-30">
                <User className="w-20 h-20 text-theme-primary" />
            </div>
            <div className="absolute inset-0 rounded-2xl"
                style={{ background: `radial-gradient(circle at 30% 25%, ${c1}33 0%, transparent 45%)`, pointerEvents: 'none' }} />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface UserAvatarProps {
    userEmail: string;
    userName?: string | null;
    compact?: boolean; // Show in sidebar/small mode
}

export default function UserAvatar({ userEmail, userName, compact = false }: UserAvatarProps) {
    const [glbUrl, setGlbUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showIframe, setShowIframe] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // ── Fetch saved avatar from DB ─────────────────────────────────────────
    const fetchAvatar = useCallback(async () => {
        try {
            const res = await fetch('/api/user/avatar');
            if (res.ok) {
                const { avatarUrl } = await res.json();
                setGlbUrl(avatarUrl);
            }
        } catch (e) {
            console.error('Failed to fetch avatar', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAvatar();
    }, [fetchAvatar]);

    // ── Listen for Avaturn postMessage export event ────────────────────────
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            // Avaturn sends from hub.avaturn.me
            if (!event.origin.includes('avaturn.me') && !event.origin.includes('avaturn.dev')) return;

            const data = event.data;
            // Support v1 and v2 export events
            const exportedUrl =
                data?.url ||                        // v1 direct
                data?.data?.url ||                  // v2 nested
                data?.avatarUrl;                    // fallback

            if (!exportedUrl) return;

            console.log('[Avaturn] Avatar exported:', exportedUrl);
            setSaving(true);
            setError(null);

            try {
                const res = await fetch('/api/user/avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatarUrl: exportedUrl }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Failed to save avatar');
                }

                const { avatarUrl } = await res.json();
                setGlbUrl(avatarUrl);
                setShowIframe(false);
                setModelReady(false);
            } catch (err: any) {
                setError(err.message);
                console.error('[Avaturn] Save failed:', err);
            } finally {
                setSaving(false);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // ── Delete avatar ──────────────────────────────────────────────────────
    const deleteAvatar = async () => {
        if (!confirm('Remove your 3D avatar?')) return;
        await fetch('/api/user/avatar', { method: 'DELETE' });
        setGlbUrl(null);
        setModelReady(false);
    };

    // ── Compact sidebar mode ───────────────────────────────────────────────
    if (compact) {
        return (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {glbUrl ? (
                    <>
                        <Script
                            src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
                            type="module"
                            strategy="lazyOnload"
                        />
                        {/* @ts-ignore */}
                        <model-viewer
                            src={glbUrl}
                            auto-rotate
                            camera-controls=""
                            style={{ width: '100%', height: '100%', background: 'transparent' }}
                        />
                    </>
                ) : (
                    <div className="w-full h-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {(userName || userEmail || 'U')[0].toUpperCase()}
                    </div>
                )}
            </div>
        );
    }

    // ── Full profile card mode ─────────────────────────────────────────────
    return (
        <>
            {/* Load model-viewer web component from Google CDN */}
            <Script
                src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
                type="module"
                strategy="lazyOnload"
                onLoad={() => setScriptLoaded(true)}
            />

            <div className="w-full space-y-4">
                {/* ─── Glassmorphism Avatar Container ─── */}
                <div className="relative rounded-3xl overflow-hidden group border border-white/10 bg-zinc-950/50 backdrop-blur-2xl shadow-2xl">

                    {/* Neon glow accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Background ambient orbs */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05), transparent)' }} />
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent)' }} />

                    {/* ─── 3D Viewer or Orb ─── */}
                    <div className="relative" style={{ height: 360 }}>
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        ) : glbUrl ? (
                            <>
                                {!modelReady && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            <p className="text-xs text-zinc-500">Loading your 3D avatar…</p>
                                        </div>
                                    </div>
                                )}
                                {/* @ts-ignore — model-viewer is a web component */}
                                <model-viewer
                                    src={glbUrl}
                                    alt={`${userName || 'User'}'s 3D avatar`}
                                    auto-rotate=""
                                    camera-controls=""
                                    shadow-intensity="1"
                                    exposure="0.8"
                                    rotation-per-second="30deg"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'transparent',
                                        opacity: modelReady ? 1 : 0,
                                        transition: 'opacity 0.5s ease',
                                    }}
                                    onLoad={() => setModelReady(true)}
                                />
                            </>
                        ) : (
                            <AvatarOrb seed={userEmail} />
                        )}

                        {/* Saving overlay */}
                        {saving && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
                                style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                <p className="text-sm text-white font-black">Saving your avatar…</p>
                            </div>
                        )}

                        {/* Avatar created badge */}
                        {glbUrl && modelReady && (
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-green-400 border border-green-400/20 bg-green-400/5 backdrop-blur-md">
                                <CheckCircle className="w-3.5 h-3.5" /> 3D Avatar Active
                            </div>
                        )}

                        {/* Action buttons overlay */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <button
                                onClick={() => setShowIframe(true)}
                                title={glbUrl ? 'Recreate avatar' : 'Create avatar'}
                                className="p-2.5 rounded-xl transition-all group/btn bg-white/10 border border-white/10 hover:bg-white/20 backdrop-blur-md"
                            >
                                <Wand2 className="w-4 h-4 text-white" />
                            </button>
                            {glbUrl && (
                                <button onClick={deleteAvatar} title="Remove avatar"
                                    className="p-2.5 rounded-xl transition-all group/btn bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 backdrop-blur-md">
                                    <Trash2 className="w-4 h-4 text-red-500/60" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ─── Label ─── */}
                    <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                        {glbUrl ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-theme-primary">Your 3D Avatar</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">Drag to rotate · Scroll to zoom</p>
                                </div>
                                <button onClick={() => setShowIframe(true)}
                                    className="flex items-center gap-1.5 text-xs text-white hover:text-white/70 transition py-1.5 px-3 rounded-lg bg-white/5 border border-white/10">
                                    <RefreshCw className="w-3 h-3" /> Recreate
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-theme-primary">No 3D Avatar Yet</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">Create your unique avatar with Avaturn</p>
                                </div>
                                <button onClick={() => setShowIframe(true)}
                                    className="flex items-center gap-1.5 text-xs text-black font-black py-2 px-6 rounded-xl transition-all bg-white hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                    <Wand2 className="w-3.5 h-3.5" /> Create Avatar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
                    </div>
                )}
            </div>

            {/* ─── Avaturn iFrame Modal ─── */}
            {showIframe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
                    <div className="relative w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: 'rgba(10,10,20,0.95)',
                            border: '1px solid rgba(168,85,247,0.3)',
                            boxShadow: '0 0 100px rgba(168,85,247,0.15)',
                            height: 'min(85vh, 720px)',
                        }}>

                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white">
                                    <Wand2 className="w-4 h-4 text-black" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-theme-primary">Create Your 3D Avatar</p>
                                    <p className="text-xs text-gray-500">Powered by Avaturn · Customize then click Export</p>
                                </div>
                            </div>
                            <button onClick={() => setShowIframe(false)}
                                className="p-2 rounded-xl text-gray-500 hover:text-theme-primary transition"
                                style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Top accent */}
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        {/* Avaturn iFrame */}
                        <iframe
                            ref={iframeRef}
                            src={AVATURN_URL}
                            className="flex-1 w-full"
                            style={{ border: 'none', background: '#0a0a14' }}
                            allow="camera *; microphone *; fullscreen *"
                            title="Avaturn Avatar Creator"
                        />

                        {/* Footer hint */}
                        <div className="px-5 py-3 text-center border-t"
                            style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
                            <p className="text-xs text-gray-600">
                                Customize your avatar → click <span className="text-white font-bold underline">Export</span> inside Avaturn → your avatar saves automatically
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
