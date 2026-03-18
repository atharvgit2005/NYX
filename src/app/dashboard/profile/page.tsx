'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { LogOut, Edit2, Check, X, Film, FileText, Mic, Copy, CheckCheck, ExternalLink, Sparkles } from 'lucide-react';
import Image from 'next/image';

// ─── Animated 3D Avatar using DiceBear ───────────────────────────────────────
// Uses the "lorelei" style which has a 3D illustrated look.
// The seed is the user's email so every user gets their unique avatar.
function Avatar3D({ seed, size = 120 }: { seed: string; size?: number }) {
    const styles = ['lorelei', 'adventurer', 'avataaars', 'bottts', 'fun-emoji'];
    const [styleIdx] = useState(() => Math.abs(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % styles.length);
    const style = styles[styleIdx];
    const url = `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* 3D glow ring */}
            <div className="absolute inset-0 rounded-full"
                style={{
                    background: 'conic-gradient(from 0deg, #a855f7, #ec4899, #06b6d4, #a855f7)',
                    padding: 3,
                    borderRadius: '50%',
                    animation: 'spin 6s linear infinite',
                }}>
                <div className="w-full h-full rounded-full" style={{ background: '#07070f' }} />
            </div>
            {/* Shadow glow */}
            <div className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 40px rgba(168,85,247,0.4)', borderRadius: '50%', zIndex: -1 }} />
            {/* Avatar image */}
            <div className="absolute inset-[3px] rounded-full overflow-hidden bg-gradient-to-br from-purple-900/40 to-pink-900/40"
                style={{ animation: 'float 4s ease-in-out infinite' }}>
                <img
                    src={url}
                    alt="Your avatar"
                    className="w-full h-full object-cover"
                    style={{ transform: 'scale(1.1)' }}
                />
            </div>
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [scriptCount, setScriptCount] = useState(0);
    const [videoCount, setVideoCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);

    const user = session?.user;

    useEffect(() => {
        if (user?.name) setNameInput(user.name);
        // Fetch real script + video counts
        fetch('/api/dashboard').then(r => r.json()).then(d => {
            setScriptCount(d.scriptCount ?? 0);
            setVideoCount(d.videoCount ?? 0);
        }).catch(() => {});
    }, [user]);

    const copyId = () => {
        if (!user?.email) return;
        navigator.clipboard.writeText(user.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const saveName = async () => {
        if (!nameInput.trim()) return;
        setSaving(true);
        try {
            await update({ name: nameInput.trim() });
        } catch (e) {
            console.error('Failed to update name', e);
        } finally {
            setSaving(false);
            setEditingName(false);
        }
    };

    const memberSince = user ? new Date(session?.expires || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

    if (!user) return null;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-start pt-8 pb-16">
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px) scale(1.05); } 50% { transform: translateY(-8px) scale(1.05); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div className="w-full max-w-2xl space-y-6">
                {/* ─── Avatar + Name Card ─── */}
                <div className="relative rounded-3xl border border-white/5 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(236,72,153,0.03) 50%, rgba(6,182,212,0.05) 100%)' }}>

                    {/* Background blur orbs */}
                    <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
                    <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

                    <div className="relative p-8 flex flex-col items-center text-center gap-5">
                        {/* 3D Avatar */}
                        <Avatar3D seed={user.email || 'nyx-user'} size={140} />

                        {/* Name */}
                        <div className="space-y-1">
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        value={nameInput}
                                        onChange={e => setNameInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && saveName()}
                                        autoFocus
                                        className="text-2xl font-black bg-white/10 border border-purple-500/40 rounded-xl px-4 py-1.5 text-white text-center focus:outline-none focus:border-purple-500"
                                        style={{ width: Math.max(nameInput.length * 18, 200) }}
                                    />
                                    <button onClick={saveName} disabled={saving} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingName(false)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 justify-center">
                                    <h1 className="text-3xl font-black text-white">{user.name || 'Creator'}</h1>
                                    <button onClick={() => setEditingName(true)} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/10 transition">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-2 justify-center">
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <button onClick={copyId} className="p-1 rounded text-gray-600 hover:text-purple-400 transition">
                                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 justify-center mt-1 flex-wrap">
                                <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold">
                                    ✦ NYX Creator
                                </span>
                                <span className="text-xs text-gray-600">Member since {memberSince}</span>
                            </div>
                        </div>

                        {/* Google avatar if exists */}
                        {user.image && (
                            <div className="absolute top-5 right-5">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10" title="Your Google photo">
                                    <Image src={user.image} alt="Google photo" width={32} height={32} className="object-cover" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Stats ─── */}
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Your Activity
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard label="Scripts Created" value={scriptCount} icon={FileText} color="#a855f7" />
                        <StatCard label="Videos Generated" value={videoCount} icon={Film} color="#06b6d4" />
                        <StatCard label="Voice Clones" value={JSON.parse(localStorage?.getItem?.('cloned_voices') || '[]').length} icon={Mic} color="#ec4899" />
                    </div>
                </div>

                {/* ─── Account Settings ─── */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5">
                        <p className="text-sm font-bold text-white">Account Settings</p>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {[
                            { label: 'Display Name', value: user.name || '—' },
                            { label: 'Email', value: user.email || '—' },
                            { label: 'Login Method', value: 'Google OAuth' },
                            { label: 'Plan', value: 'Free' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between px-6 py-4">
                                <span className="text-sm text-gray-500">{label}</span>
                                <span className="text-sm text-white font-medium">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Danger Zone ─── */}
                <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-6">
                    <p className="text-sm font-bold text-red-400 mb-4">Account Actions</p>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
