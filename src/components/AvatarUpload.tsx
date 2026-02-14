'use client';

import { useState, useEffect } from 'react';
import { Upload, Mic, Video, Check, Loader2, AlertCircle, HelpCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

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

    const handleSaveAvatarId = () => {
        if (!avatarId) return;
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
            } else {
                setError(data.error || 'Failed to clone voice');
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
                    Connect your HeyGen Avatar and clone your voice with ElevenLabs to generate personalized videos.
                </p>
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
                                    <HelpCircle className="w-3 h-3 mr-1" /> Where do I find this?
                                </button>
                            </div>
                            <input
                                type="text"
                                value={avatarId}
                                onChange={(e) => setAvatarId(e.target.value)}
                                placeholder="e.g., Tyler-insuit-20220721"
                                className="w-full bg-page border border-theme rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => setAvatarId('Tyler-insuit-20220721')}
                                    className="text-xs bg-card-hover hover:bg-theme-secondary/20 px-3 py-1 rounded-full text-theme-secondary transition-colors"
                                >
                                    Use Demo (Tyler)
                                </button>
                                <button
                                    onClick={() => setAvatarId('Daisy-insuit-20220818')}
                                    className="text-xs bg-card-hover hover:bg-theme-secondary/20 px-3 py-1 rounded-full text-theme-secondary transition-colors"
                                >
                                    Use Demo (Daisy)
                                </button>
                            </div>
                        </div>

                        {showAvatarHelp && (
                            <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/20 text-sm text-gray-300 animate-fade-in">
                                <h4 className="font-bold text-white mb-2 flex items-center"><Info className="w-4 h-4 mr-2" /> How to find your ID:</h4>
                                <ol className="list-decimal list-inside space-y-1 text-xs">
                                    <li>Log in to <a href="https://app.heygen.com" target="_blank" className="text-purple-400 underline">HeyGen</a>.</li>
                                    <li>Click on your Avatar.</li>
                                    <li>Copy the ID from the URL: <br /><span className="font-mono text-purple-300 bg-black/30 px-1 rounded">.../avatars/YOUR_ID</span></li>
                                </ol>
                            </div>
                        )}

                        <button
                            onClick={handleSaveAvatarId}
                            disabled={!avatarId}
                            className="w-full py-3 bg-card-hover hover:bg-card-theme border border-theme rounded-xl font-bold text-theme-primary transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Save Avatar ID
                        </button>
                    </div>
                </div>

                {/* Voice Configuration */}
                <div className="bg-card-theme p-8 rounded-3xl border border-theme hover:border-pink-500/50 transition-colors">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
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
                            <span className="flex-shrink-0 mx-4 text-theme-secondary text-xs uppercase">OR Clone with ElevenLabs</span>
                            <div className="flex-grow border-t border-theme"></div>
                        </div>

                        {/* ElevenLabs Cloning Section (Existing) */}
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
                                    <div className="text-green-400 text-xs font-medium truncate px-2">
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
                                className="w-full mt-3 py-2 bg-theme-primary text-theme-inverse hover:opacity-90 rounded-lg font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
