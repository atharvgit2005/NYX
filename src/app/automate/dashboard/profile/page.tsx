'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    LogOut, Edit2, Check, X, Film, FileText,
    Mic, Copy, CheckCheck, Sparkles,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import AvatarUpload from '@/components/AvatarUpload';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: LucideIcon; color: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-theme bg-card-theme hover:bg-card-theme transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
                <p className="text-2xl font-black text-theme-primary">{value}</p>
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
    const [voiceCloneCount, setVoiceCloneCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);

    const user = session?.user;

    useEffect(() => {
        if (user?.name) setNameInput(user.name);

        // Voice clone count — only read localStorage client-side
        try {
            const clones = JSON.parse(window.localStorage.getItem('cloned_voices') || '[]');
            setVoiceCloneCount(Array.isArray(clones) ? clones.length : 0);
        } catch { setVoiceCloneCount(0); }

        // Real script + video counts
        fetch('/api/dashboard').then(r => r.json()).then(d => {
            setScriptCount(d.scriptCount ?? 0);
            setVideoCount(d.videoCount ?? 0);
        }).catch(() => { });
    }, [user]);

    const copyEmail = () => {
        if (!user?.email) return;
        navigator.clipboard.writeText(user.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const saveName = async () => {
        if (!nameInput.trim()) return;
        setSaving(true);
        try { await update({ name: nameInput.trim() }); }
        catch (e) { console.error('Failed to update name', e); }
        finally { setSaving(false); setEditingName(false); }
    };

    if (!user) return null;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-start pt-8 pb-16 px-4">
            <div className="w-full max-w-2xl space-y-6">

                {/* ─── Hero: name + email ─── */}
                <div className="relative rounded-3xl border border-theme overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.05) 0%, rgba(251,146,60,0.03) 50%, rgba(6,182,212,0.05) 100%)' }}>
                    <div className="absolute -top-16 left-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10"
                        style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
                    <div className="absolute -bottom-16 right-1/4 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-10"
                        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

                    <div className="relative p-8 flex flex-col items-center text-center gap-4">
                        {/* Google profile photo (small, top-right) */}
                        {user.image && (
                            <div className="absolute top-5 right-5 w-8 h-8 rounded-full overflow-hidden border border-theme" title="Google photo">
                                <Image src={user.image} alt="Google photo" width={32} height={32} className="object-cover" />
                            </div>
                        )}

                        {/* Name */}
                        <div className="space-y-2">
                            {editingName ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <input
                                        value={nameInput}
                                        onChange={e => setNameInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && saveName()}
                                        autoFocus
                                        className="text-2xl font-black bg-card-theme border border-orange-500/40 rounded-xl px-4 py-1.5 text-theme-primary text-center focus:outline-none focus:border-orange-500"
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
                                    <h1 className="text-3xl font-black text-theme-primary">{user.name || 'Creator'}</h1>
                                    <button onClick={() => setEditingName(true)} className="p-1.5 rounded-lg text-gray-600 hover:text-theme-secondary hover:bg-card-theme transition">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-2 justify-center">
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <button onClick={copyEmail} className="p-1 rounded text-gray-600 hover:text-orange-500 transition">
                                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 justify-center">
                                <span className="text-xs px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold">
                                    ✦ NYX Creator
                                </span>
                            </div>
                        </div>
                    </div>
                </div>



                {/* ─── Stats ─── */}
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Your Activity
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard label="Scripts Created" value={scriptCount} icon={FileText} color="#f97316" />
                        <StatCard label="Videos Generated" value={videoCount} icon={Film} color="#06b6d4" />
                        <StatCard label="Voice Clones" value={voiceCloneCount} icon={Mic} color="#fb923c" />
                    </div>
                </div>

                {/* ─── Account Settings ─── */}
                <div className="rounded-2xl border border-theme bg-card-theme overflow-hidden">
                    <div className="px-6 py-4 border-b border-theme">
                        <p className="text-sm font-bold text-theme-primary">Account Details</p>
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
                                <span className="text-sm text-theme-primary font-medium">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── API Integrations & Avatar ─── */}
                <div className="pt-4">
                    <AvatarUpload />
                </div>

                {/* ─── Sign Out ─── */}
                <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-6">
                    <p className="text-sm font-bold text-red-400 mb-4">Account Actions</p>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-bold transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
