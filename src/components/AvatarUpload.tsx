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
                <h2 className="text-4xl font-bold text-white mb-4">Configure Your Digital Twin</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Connect your HeyGen Avatar and clone your voice with ElevenLabs to generate personalized videos.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Avatar Configuration */}
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-colors">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                            <Video className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">HeyGen Avatar</h3>
                        <p className="text-sm text-gray-400">
                            Enter the <strong>Avatar ID</strong> from your HeyGen account.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Avatar ID</label>
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
                                placeholder="e.g., 2d5b0e6cf361460aa7fc47e3cee4b35c"
                                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                            />
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
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Save Avatar ID
                        </button>
                    </div>
                </div>

                {/* Voice Cloning */}
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-pink-500/50 transition-colors">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
                            <Mic className="w-8 h-8 text-pink-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Instant Voice Clone</h3>
                        <p className="text-sm text-gray-400">
                            Upload a 1-minute audio sample to clone your voice instantly.
                        </p>
                    </div>

                    {voiceId ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Check className="w-6 h-6 text-green-400" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-1">Voice Ready!</h4>
                            <p className="text-sm text-gray-400 mb-4 break-all font-mono">{voiceId}</p>
                            <button
                                onClick={() => { setVoiceId(null); localStorage.removeItem('custom_voice_id'); }}
                                className="text-xs text-red-400 hover:text-red-300 underline"
                            >
                                Remove & Clone New Voice
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-pink-900/10 p-4 rounded-xl border border-pink-500/10">
                                <h4 className="text-xs font-bold text-pink-400 uppercase mb-2 flex items-center">
                                    <Info className="w-3 h-3 mr-1" /> Recording Best Practices
                                </h4>
                                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                                    <li>Record <strong>1-2 minutes</strong> of clear speech.</li>
                                    <li>Avoid background noise or echo.</li>
                                    <li>Speak naturally as you would in a video.</li>
                                </ul>
                            </div>

                            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                                />
                                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3 group-hover:text-pink-400 transition-colors" />
                                {voiceFile ? (
                                    <div className="text-green-400 font-medium truncate px-4">
                                        {voiceFile.name}
                                    </div>
                                ) : (
                                    <div className="text-gray-400">
                                        <span className="text-pink-400 font-medium">Click to upload</span> audio
                                        <br />
                                        <span className="text-xs text-gray-500">MP3, WAV (Max 10MB)</span>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="flex items-start text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                onClick={handleCloneVoice}
                                disabled={!voiceFile || cloningVoice}
                                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {cloningVoice ? <><Loader2 className="w-5 h-5 animate-spin" /> Cloning...</> : 'Clone Voice Now'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
