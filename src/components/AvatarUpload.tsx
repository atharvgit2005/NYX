'use client';

import { useState, useEffect } from 'react';
import { Upload, Mic, Video, Check, Loader2, HelpCircle, Info, AlertTriangle, ExternalLink } from 'lucide-react';

// Known working public HeyGen avatar IDs (non-streaming, work with v2/video/generate)
const PUBLIC_AVATARS = [
    { id: 'Tyler-insuit-20220721', label: 'Tyler (Suit)' },
    { id: 'Daisy-insuit-20220818', label: 'Daisy (Suit)' },
    { id: 'Anna_public_3_20240108', label: 'Anna' },
    { id: 'josh_lite3_20230714', label: 'Josh' },
    { id: 'Vanessa-invest-20240722', label: 'Vanessa' },
    { id: 'Eric_public_pro2_20230608', label: 'Eric' },
];

export default function AvatarUpload() {
    const [voiceFile, setVoiceFile] = useState<File | null>(null);
    const [avatarId, setAvatarId] = useState('ca6ee68148474ef1906e5fe06b4493e9');

    const [showAvatarHelp, setShowAvatarHelp] = useState(false);

    const [cloningVoice, setCloningVoice] = useState(false);
    const [voiceId, setVoiceId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load saved IDs
        const savedAvatarId = localStorage.getItem('custom_avatar_id');
        const savedVoiceId = localStorage.getItem('custom_voice_id');
        if (savedAvatarId) setAvatarId(savedAvatarId);
        if (savedVoiceId) setVoiceId(savedVoiceId);
    }, []);

    const isStreamingAvatar = avatarId.startsWith('sk_');

    const handleSaveAvatarId = () => {
        if (!avatarId) return;
        if (isStreamingAvatar) {
            setError('Streaming avatar IDs (starting with sk_) cannot be used for video generation. Please use a Talking Avatar ID from the HeyGen Avatars library instead.');
            return;
        }
        localStorage.setItem('custom_avatar_id', avatarId);
        alert('Avatar ID saved!');
    };

    const handleCloneVoice = async () => {
        if (!voiceFile) return;

        setCloningVoice(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', voiceFile);
            formData.append('name', `NYX Clone - ${new Date().toLocaleDateString()}`);

            const response = await fetch('/api/voice/clone', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setVoiceId(data.voiceId);
                localStorage.setItem('custom_voice_id', data.voiceId);
                setVoiceFile(null); // Clear file input
                alert(`Voice cloned successfully! ID: ${data.voiceId}`);
            } else {
                setError(data.error || 'Failed to clone voice');
                console.error('Clone error details:', data.details);
            }
        } catch (err) {
            console.error(err);
            setError('Network error. Please try again.');
        } finally {
            setCloningVoice(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-theme-primary mb-4">Configure Your Digital Twin</h2>
                <p className="text-theme-secondary max-w-2xl mx-auto">
                    Connect your HeyGen Avatar and clone your voice with Inworld AI to generate personalized videos.
                </p>
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Avatar Configuration */}
                <div className="bg-card-theme p-8 rounded-3xl border border-theme hover:border-purple-500/50 transition-colors">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                            <Video className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-theme-primary mb-2">HeyGen Avatar</h3>
                        <p className="text-sm text-theme-secondary">
                            Enter the <strong>Avatar ID</strong> from your HeyGen account.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-theme-secondary uppercase">Avatar ID</label>
                                <button
                                    onClick={() => setShowAvatarHelp(!showAvatarHelp)}
                                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
                                >
                                    <HelpCircle className="w-4 h-4 mr-1" /> Where do I find this?
                                </button>
                            </div>
                            <input
                                type="text"
                                value={avatarId}
                                onChange={(e) => { setAvatarId(e.target.value); setError(null); }}
                                placeholder="e.g., Tyler-insuit-20220721"
                                className={`w-full bg-page border rounded-xl px-4 py-3 text-theme-primary focus:outline-none transition-colors font-mono text-sm ${
                                    isStreamingAvatar ? 'border-red-500/60 focus:border-red-500' : 'border-theme focus:border-purple-500'
                                }`}
                            />

                            {/* sk_ streaming avatar warning */}
                            {isStreamingAvatar && (
                                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-red-300">
                                        <p className="font-bold mb-1">⚠️ Wrong ID type — Streaming Avatar</p>
                                        <p className="text-red-400/80">IDs starting with <code className="bg-red-500/20 px-1 rounded">sk_</code> are for HeyGen&apos;s <strong>Live Streaming</strong> feature — they do <strong>not</strong> work with video generation.</p>
                                        <p className="mt-1 text-red-400/80">Go to <a href="https://app.heygen.com/avatars" target="_blank" rel="noopener noreferrer" className="underline text-red-300 font-medium inline-flex items-center gap-1">HeyGen Avatars <ExternalLink className="w-3 h-3" /></a> → select a <strong>Talking Avatar</strong> (not Streaming) → copy its ID.</p>
                                    </div>
                                </div>
                            )}

                            {/* Quick-pick public avatars */}
                            <div className="mt-3">
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-2">Quick Pick — Public Avatars</p>
                                <div className="flex flex-wrap gap-2">
                                    {PUBLIC_AVATARS.map(a => (
                                        <button key={a.id}
                                            onClick={() => { setAvatarId(a.id); setError(null); }}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                                                avatarId === a.id
                                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                                    : 'bg-card-hover border-theme text-theme-secondary hover:border-purple-500/30 hover:text-theme-primary'
                                            }`}>
                                            {a.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {showAvatarHelp && (
                            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 text-sm text-theme-secondary animate-fade-in">
                                <h4 className="font-bold text-theme-primary mb-2 flex items-center"><Info className="w-4 h-4 mr-2" /> How to find your Avatar ID:</h4>
                                <ol className="list-decimal list-inside space-y-1 text-xs">
                                    <li>Log in to <a href="https://app.heygen.com/avatars" target="_blank" className="text-purple-400 underline">HeyGen Avatars</a>.</li>
                                    <li>Click a <strong>Talking Avatar</strong> (NOT a Streaming Avatar — those start with sk_ and don&apos;t work here).</li>
                                    <li>Copy the ID from the URL or avatar settings.</li>
                                    <li>Or use the public ones above to test.</li>
                                </ol>
                            </div>
                        )}

                        <button
                            onClick={handleSaveAvatarId}
                            disabled={!avatarId || isStreamingAvatar}
                            className="w-full py-3 bg-card-hover hover:bg-card-theme border border-theme rounded-xl font-bold text-theme-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Check className="w-4 h-4" /> Save Avatar ID
                        </button>
                    </div>
                </div>

                {/* Voice Configuration */}
                <div className="bg-card-theme p-8 rounded-3xl border border-theme hover:border-pink-500/50 transition-colors">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
                            <Mic className="w-8 h-8 text-pink-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-theme-primary mb-2">Voice Configuration</h3>
                        <p className="text-sm text-theme-secondary">
                            Enter your <strong>HeyGen Voice ID</strong> or clone a new one.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Manual Voice ID Input */}
                        <div>
                            <label className="block text-xs font-bold text-theme-secondary uppercase mb-2">HeyGen Voice ID</label>
                            <input
                                type="text"
                                value={voiceId || ''}
                                onChange={(e) => setVoiceId(e.target.value)}
                                placeholder="e.g., 2d5b0e6cf361460aa7fc47e3cee4b35c"
                                className="w-full bg-page border border-theme rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-pink-500 transition-colors font-mono text-sm"
                            />
                            <p className="text-xs text-theme-secondary mt-2">
                                Enter the ID of your custom voice from HeyGen.
                            </p>
                        </div>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-theme"></div>
                            <span className="flex-shrink-0 mx-4 text-theme-secondary text-xs uppercase">OR Clone with Inworld</span>
                            <div className="flex-grow border-t border-theme"></div>
                        </div>

                        {/* Inworld Cloning Section */}
                        <div className="bg-card-hover p-4 rounded-xl border border-theme">
                            <h4 className="text-sm font-bold text-theme-primary mb-2">Instant Voice Clone</h4>
                            <div className="border-2 border-dashed border-theme rounded-lg p-6 text-center hover:bg-card-theme transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                                />
                                <Upload className="w-6 h-6 text-theme-secondary mx-auto mb-2 group-hover:text-pink-400 transition-colors" />
                                {voiceFile ? (
                                    <div className="text-green-500 text-xs font-medium truncate px-2">
                                        {voiceFile.name}
                                    </div>
                                ) : (
                                    <div className="text-theme-secondary text-xs">
                                        <span className="text-pink-400 font-medium">Click to upload</span> audio sample
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCloneVoice}
                                disabled={!voiceFile || cloningVoice}
                                className="w-full mt-3 py-2 bg-theme-primary text-white hover:opacity-90 rounded-lg font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {cloningVoice ? <><Loader2 className="w-4 h-4 animate-spin" /> Cloning...</> : 'Clone & Use this Voice'}
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                if (voiceId) {
                                    localStorage.setItem('custom_voice_id', voiceId);
                                    alert('Voice ID saved!');
                                }
                            }}
                            className="w-full py-3 bg-card-hover hover:bg-card-theme rounded-xl font-bold text-theme-primary transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Save Voice ID
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
