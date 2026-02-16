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
        <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-theme-primary via-purple-500 to-pink-500 pb-2">
                    Connect Your Socials
                </h2>
                <p className="text-theme-secondary max-w-2xl mx-auto text-lg leading-relaxed">
                    Link your accounts to unlock AI-powered analysis and auto-publishing.
                    We study your content to perfectly match your unique brand voice.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {platforms.map((platform) => {
                    const isConnected = connected[platform.id];
                    const isActive = activePlatform === platform.id;
                    const isLoading = loading === platform.id;

                    return (
                        <div
                            key={platform.id}
                            className={`relative group rounded-[2rem] transition-all duration-500 overflow-hidden ${isConnected
                                ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] dark:shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                                : 'bg-card-theme border border-theme hover:border-purple-500/50 hover:shadow-xl hover:-translate-y-1'
                                }`}
                        >
                            {/* Inner content wrapper */}
                            <div className="h-full p-8 flex flex-col relative z-10 backdrop-blur-sm">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${platform.color} shadow-lg ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-500`}>
                                        <div className="text-white">{platform.icon}</div>
                                    </div>
                                    {isConnected && (
                                        <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center border border-green-500/20 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                                            Active
                                        </div>
                                    )}
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-theme-primary mb-2">{platform.name}</h3>
                                    <p className="text-theme-secondary leading-relaxed text-sm">{platform.description}</p>
                                </div>

                                {/* Content */}
                                <div className="mt-auto">
                                    {isConnected ? (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-purple-500/20 shadow-sm">
                                                <span className="font-semibold text-theme-primary flex items-center gap-2 truncate">
                                                    @{connected[platform.id]}
                                                </span>
                                                <Check className="w-5 h-5 text-purple-500 bg-purple-100 dark:bg-purple-900/50 rounded-full p-0.5" />
                                            </div>
                                            <button
                                                onClick={() => handleDisconnect(platform.id)}
                                                className="w-full py-3 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                Disconnect Account
                                            </button>
                                        </div>
                                    ) : isActive ? (
                                        <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder={platform.placeholder}
                                                    value={usernameInput}
                                                    onChange={(e) => setUsernameInput(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-black/40 border border-purple-500 rounded-xl px-4 py-4 text-theme-primary focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-400"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleConnect(platform.id)}
                                                    disabled={!usernameInput || isLoading}
                                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center transform active:scale-95"
                                                >
                                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                                                </button>
                                                <button
                                                    onClick={() => { setActivePlatform(null); setUsernameInput(''); }}
                                                    className="px-4 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors text-theme-secondary hover:text-theme-primary"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setActivePlatform(platform.id)}
                                            className="w-full py-4 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-theme hover:border-purple-300 dark:hover:border-purple-500/50 rounded-xl font-bold text-theme-primary transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                                        >
                                            <LinkIcon className="w-4 h-4 text-purple-500" />
                                            Connect Account
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Features Section */}
            <div className="relative rounded-[2.5rem] p-1 bg-gradient-to-br from-theme-primary/10 to-transparent border border-theme overflow-hidden">
                <div className="absolute inset-0 bg-page/80 backdrop-blur-xl" />
                <div className="relative px-6 py-8 md:px-8 md:py-10 flex flex-col md:flex-row items-start gap-10">
                    <div className="md:w-1/3">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold border border-purple-500/30">
                                AI POWERED
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-theme-primary mb-4">Why connect?</h3>
                        <p className="text-theme-secondary">Unlock the full potential of our engine. We analyze your past performance to predict future virality.</p>
                    </div>

                    <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {[
                            { title: 'Voice Match', desc: 'Mimics your unique tone' },
                            { title: 'Viral Hooks', desc: 'Identifies high-performing patterns' },
                            { title: 'Auto-Publish', desc: 'One-click direct upload' },
                            { title: 'Trend Sync', desc: 'Real-time trend adaptation' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start bg-card-theme p-4 rounded-xl border border-theme hover:border-purple-500/20 transition-colors shadow-sm">
                                <div className="mt-1 mr-3 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-theme-primary text-sm mb-1">{item.title}</h4>
                                    <p className="text-xs text-theme-secondary">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
