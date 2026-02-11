'use client';

import { useState, useEffect } from 'react';
import { Instagram, Music, Youtube, Check, Loader2, Link as LinkIcon } from 'lucide-react';

export default function ConnectSocials() {
    const [connected, setConnected] = useState<{ [key: string]: string | null }>({
        instagram: null,
        tiktok: null,
        youtube: null,
    });
    const [loading, setLoading] = useState<string | null>(null);
    const [usernameInput, setUsernameInput] = useState('');
    const [activePlatform, setActivePlatform] = useState<string | null>(null);

    useEffect(() => {
        // Load connected accounts from localStorage on mount
        const saved = localStorage.getItem('connected_socials');
        if (saved) {
            setConnected(JSON.parse(saved));
        }
    }, []);

    const handleConnect = async (platform: string) => {
        if (!usernameInput) return;

        setLoading(platform);

        // Simulate API verification
        try {
            // In a real app, we would call the scrape API here to verify the user exists
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newConnected = { ...connected, [platform]: usernameInput };
            setConnected(newConnected);
            localStorage.setItem('connected_socials', JSON.stringify(newConnected));
            localStorage.setItem('primary_username', usernameInput); // For analysis

            setActivePlatform(null);
            setUsernameInput('');
        } catch (error) {
            console.error("Connection failed", error);
        } finally {
            setLoading(null);
        }
    };

    const handleDisconnect = (platform: string) => {
        const newConnected = { ...connected, [platform]: null };
        setConnected(newConnected);
        localStorage.setItem('connected_socials', JSON.stringify(newConnected));
    };

    const platforms = [
        {
            id: 'instagram',
            name: 'Instagram',
            icon: <Instagram className="w-8 h-8" />,
            description: 'Connect to analyze your niche and post Reels.',
            color: 'from-purple-500 to-pink-500',
            placeholder: '@username'
        },
        {
            id: 'tiktok',
            name: 'TikTok',
            icon: <Music className="w-8 h-8" />,
            description: 'Sync for trend analysis and auto-posting.',
            color: 'from-black to-gray-800 border border-white/20',
            placeholder: '@username'
        },
        {
            id: 'youtube',
            name: 'YouTube Shorts',
            icon: <Youtube className="w-8 h-8" />,
            description: 'Publish Shorts directly from the platform.',
            color: 'from-red-600 to-red-700',
            placeholder: 'Channel Handle'
        },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Connect Your Socials</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    Link your accounts to enable AI analysis and auto-publishing. We analyze your content to match your brand voice.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {platforms.map((platform) => (
                    <div
                        key={platform.id}
                        className={`relative group rounded-3xl p-8 border transition-all duration-500 ease-out flex flex-col ${connected[platform.id]
                            ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)]'
                            : 'bg-white/5 border-white/5 hover:border-purple-500/30 hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]'
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br ${platform.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                            <div className="text-white">{platform.icon}</div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">{platform.name}</h3>
                        <p className="text-gray-400 mb-8 flex-grow leading-relaxed">{platform.description}</p>

                        {connected[platform.id] ? (
                            <div className="mt-auto">
                                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3">
                                    <span className="font-medium text-green-400 flex items-center">
                                        <Check className="w-4 h-4 mr-2" /> {connected[platform.id]}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDisconnect(platform.id)}
                                    className="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : activePlatform === platform.id ? (
                            <div className="mt-auto animate-fade-in">
                                <input
                                    type="text"
                                    placeholder={platform.placeholder}
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white mb-3 focus:outline-none focus:border-purple-500 transition-colors"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleConnect(platform.id)}
                                        disabled={!usernameInput || loading === platform.id}
                                        className="flex-1 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {loading === platform.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                                    </button>
                                    <button
                                        onClick={() => { setActivePlatform(null); setUsernameInput(''); }}
                                        className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setActivePlatform(platform.id)}
                                className="mt-auto w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-black"
                            >
                                <LinkIcon className="w-4 h-4" /> Connect
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-16 p-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-3xl border border-white/10 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3 text-sm">AI</span>
                    Why connect your accounts?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Brand Voice Match', desc: 'AI analyzes your past captions to mimic your unique tone.' },
                        { title: 'Performance Data', desc: 'We identify your highest-performing hooks and topics.' },
                        { title: 'One-Click Posting', desc: 'Publish generated videos directly without downloading.' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-start">
                            <div className="mt-1 mr-4 text-green-400"><Check className="w-5 h-5" /></div>
                            <div>
                                <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
