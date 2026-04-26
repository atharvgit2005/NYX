'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, MessageCircle, Users, Layers, TrendingUp, ArrowRight, AlertCircle, Link as LinkIcon } from 'lucide-react';
import NyxButton from './ui/NyxButton';

interface AnalysisResult {
    niche: string;
    tone: string;
    audience: string;
    pillars: string[];
    competitors: string[];
    scrapedData?: {
        fullName?: string;
        followers?: string | number;
        bio?: string;
        isMockData?: boolean;
        posts?: {
            imageUrl?: string;
            likes?: string | number;
            caption?: string;
        }[];
    };
}

export default function BrandAnalysis() {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [activePlatform, setActivePlatform] = useState<'instagram' | 'youtube' | 'linkedin'>('instagram');

    const [error, setError] = useState<string | null>(null);

    const handleCacheLoad = useCallback((user: string | null, platform: 'instagram' | 'youtube' | 'linkedin') => {
        if (user) {
            const savedAnalysis = localStorage.getItem(`brand_analysis_results_${platform}_${user}`);
            if (savedAnalysis) {
                try {
                    setAnalysis(JSON.parse(savedAnalysis));
                } catch {
                    console.error("Failed to parse saved analysis");
                }
            } else {
                setAnalysis(null); // Ensure we don't display stale data
            }
        }
    }, []);

    useEffect(() => {
        // Check for connected accounts
        const savedSocials = localStorage.getItem('connected_socials');
        let initialPlatform: 'instagram' | 'youtube' | 'linkedin' = 'instagram';

        if (savedSocials) {
            try {
                const parsed = JSON.parse(savedSocials);
                // Prefer instagram, fallback to youtube
                if (parsed.youtube && !parsed.instagram && !parsed.tiktok) {
                    initialPlatform = 'youtube';
                    setUsername(parsed.youtube);
                } else {
                    setUsername(parsed.instagram || parsed.tiktok || localStorage.getItem('primary_username'));
                }
            } catch {
                setUsername(localStorage.getItem('primary_username'));
            }
        } else {
            setUsername(localStorage.getItem('primary_username'));
        }

        setActivePlatform(initialPlatform);

        // Check for existing analysis cache
        handleCacheLoad(username, initialPlatform);
    }, [username, handleCacheLoad]);

    const switchPlatform = (platform: 'instagram' | 'youtube' | 'linkedin') => {
        const savedSocials = localStorage.getItem('connected_socials');
        if (savedSocials) {
            try {
                const parsed = JSON.parse(savedSocials);
                const newUser = parsed[platform];
                setUsername(newUser || null);
                setActivePlatform(platform);
                handleCacheLoad(newUser, platform);
            } catch { }
        }
    };

    const handleAnalyze = async () => {
        if (!username) return;

        setAnalyzing(true);
        setError(null);
        try {
            const endpoint = 
                activePlatform === 'youtube' ? '/api/analyze-youtube' : 
                activePlatform === 'linkedin' ? '/api/analyze-linkedin' : 
                '/api/analyze';
            
            const payload = 
                activePlatform === 'youtube' ? { profileData: { channelHandle: username } } : 
                activePlatform === 'linkedin' ? { profileData: { username: username } } : 
                { profileData: { username: username } };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (data.success) {
                setAnalysis(data.data);
                // Save to localStorage partitioned by username and platform
                localStorage.setItem(`brand_analysis_results_${activePlatform}_${username}`, JSON.stringify(data.data));

                // Also update the IdeaGenerator main cache pointer
                localStorage.setItem('primary_username', username);
            } else {
                setError(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            setError('Network error. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (!username) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary border border-theme mb-6">
                    <AlertCircle className="w-10 h-10 text-theme-secondary" />
                </div>
                <h2 className="text-3xl font-bold text-theme-primary mb-4">No Account Connected</h2>
                <p className="text-theme-secondary mb-8 max-w-md mx-auto">
                    Please connect an Instagram or YouTube account to enable AI brand analysis.
                </p>
                <NyxButton
                    href="/automate/dashboard/connect"
                    icon={LinkIcon}
                    className="px-8 py-4"
                >
                    CONNECT ACCOUNT
                </NyxButton>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center mb-10 gap-6">
                <div className="bg-card-theme p-1.5 rounded-2xl sm:rounded-full flex flex-col sm:flex-row border border-theme shadow-lg w-full sm:w-auto">
                    {(['instagram', 'youtube', 'linkedin'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => switchPlatform(p)}
                            className={`px-6 sm:px-8 py-2.5 sm:py-2 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-black sm:font-bold transition-all uppercase tracking-widest ${activePlatform === p ? 'bg-orange-500 text-white shadow-lg' : 'text-theme-secondary hover:text-theme-primary'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
                <div>
                    <h2 className="text-[clamp(28px,6vw,40px)] font-bold text-theme-primary mb-2">Brand Analysis</h2>
                    <p className="text-theme-secondary text-base sm:text-lg">
                        AI insights for <span className="text-theme-primary font-bold">@{username}</span>
                    </p>
                </div>
                <NyxButton
                    onClick={handleAnalyze}
                    className="w-full sm:w-auto px-8 py-4 justify-center"
                >
                    {analyzing ? 'ANALYZING...' : analysis ? 'REGENERATE ANALYSIS' : 'START ANALYSIS'}
                </NyxButton>
            </div>

            {analyzing && (
                <div className="flex flex-col items-center justify-center py-32 bg-secondary rounded-3xl border border-theme">
                    <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-theme/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-theme border-t-orange-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Target className="w-8 h-8 text-theme-primary animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-theme-primary mb-2">Analyzing your content...</h3>
                    <p className="text-theme-secondary">Scanning captions, hashtags, and engagement patterns.</p>
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-2xl text-center mb-8">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Analysis Failed</h3>
                    <p className="text-theme-secondary">{error}</p>
                    <p className="text-sm text-theme-secondary mt-4">
                        Tip: Ensure your account is public and you have added the Gemini API Key.
                    </p>
                </div>
            )}

            {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">

                    {/* Left Column: Analysis (Span 2) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Niche & Tone Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 sm:p-8 rounded-3xl bg-secondary border border-theme relative overflow-hidden group shadow-2xl">
                                <div className="absolute -bottom-8 -right-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform"><Target className="w-48 h-48" /></div>
                                <div className="relative z-10">
                                    <h3 className="text-theme-secondary font-bold text-xs mb-2 flex items-center uppercase tracking-wide"><Target className="w-4 h-4 mr-2" /> Your Niche</h3>
                                    <p className="text-[clamp(20px,4vw,24px)] font-bold text-theme-primary leading-tight">{analysis.niche}</p>
                                </div>
                            </div>
                            <div className="p-6 sm:p-8 rounded-3xl bg-secondary border border-theme relative overflow-hidden group hover:border-theme/80 transition-colors">
                                <div className="absolute -bottom-8 -right-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform"><MessageCircle className="w-48 h-48" /></div>
                                <div className="relative z-10">
                                    <h3 className="text-theme-secondary font-bold text-xs mb-2 flex items-center uppercase tracking-wide"><MessageCircle className="w-4 h-4 mr-2" /> Tone of Voice</h3>
                                    <p className="text-lg sm:text-xl text-theme-primary font-medium">{analysis.tone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Audience */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-secondary border border-theme relative overflow-hidden group hover:border-theme/80 transition-colors">
                            <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform"><Users className="w-56 h-56" /></div>
                            <div className="relative z-10">
                                <h3 className="text-theme-secondary font-bold text-xs mb-2 flex items-center uppercase tracking-wide"><Users className="w-4 h-4 mr-2" /> Target Audience</h3>
                                <p className="text-base sm:text-xl text-theme-primary font-medium">{analysis.audience}</p>
                            </div>
                        </div>

                        {/* Pillars */}
                        <div className="p-8 rounded-3xl bg-secondary border border-theme relative overflow-hidden group">
                            <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform"><Layers className="w-56 h-56" /></div>
                            <h3 className="text-theme-secondary font-bold mb-6 flex items-center relative z-10"><Layers className="w-5 h-5 mr-2" /> Content Pillars</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                {analysis.pillars.map((pillar: string, i: number) => (
                                    <div key={i} className="flex items-center bg-accent p-4 rounded-xl border border-theme">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 shadow-[0_0_10px_rgba(249,115,22,0.3)]"></div>
                                        <span className="text-theme-secondary font-medium">{pillar}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Competitors */}
                        <div className="p-8 rounded-3xl bg-secondary border border-theme relative overflow-hidden group">
                            <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform"><TrendingUp className="w-56 h-56" /></div>
                            <h3 className="text-theme-secondary font-bold mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2" /> Competitors</h3>
                            <ul className="space-y-3">
                                {analysis.competitors.map((comp: string, i: number) => (
                                    <li key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer group">
                                        <span className="text-theme-secondary font-medium group-hover:text-theme-primary transition-colors">{comp}</span>
                                        <ArrowRight className="w-4 h-4 text-theme-secondary group-hover:text-theme-primary transition-colors" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Profile Preview */}
                    <div className="space-y-6">
                        <div className="bg-secondary/60 backdrop-blur-xl border border-theme rounded-3xl p-6 sticky top-24 shadow-2xl">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className={`w-16 h-16 rounded-full p-[2px] bg-accent border-2 border-theme`}>
                                    <div className="w-full h-full rounded-full bg-transparent overflow-hidden relative">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${analysis.scrapedData?.fullName || username}`}
                                            alt={username || 'Profile'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-theme-primary text-lg">{analysis.scrapedData?.fullName || username}</h3>
                                    <p className="text-theme-secondary text-sm">@{username}</p>
                                </div>
                            </div>

                            <div className="flex justify-between text-center mb-6 py-4 border-y border-theme">
                                <div>
                                    <p className="font-bold text-theme-primary">{analysis.scrapedData?.posts?.length || 0}</p>
                                    <p className="text-xs text-theme-secondary">{activePlatform === 'youtube' ? 'Videos' : 'Posts'}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-theme-primary">{analysis.scrapedData?.followers || 'N/A'}</p>
                                    <p className="text-xs text-theme-secondary">{activePlatform === 'youtube' ? 'Subscribers' : 'Followers'}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-theme-primary">N/A</p>
                                    <p className="text-xs text-theme-secondary">Following</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-theme-secondary whitespace-pre-wrap">{analysis.scrapedData?.bio || 'No biography available.'}</p>
                            </div>

                            {/* Recent Posts Grid */}
                                <div className={`grid gap-2 ${activePlatform === 'youtube' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                    {analysis.scrapedData?.posts?.slice(0, 6).map((post, i: number) => (
                                        <div key={i} className={`${activePlatform === 'youtube' ? 'aspect-[9/16]' : 'aspect-square'} bg-accent rounded-lg overflow-hidden relative group cursor-pointer border border-theme/20`}>
                                        {post.imageUrl ? (
                                            <img src={`/api/proxy-image?url=${encodeURIComponent(post.imageUrl)}`} alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-theme-secondary bg-accent">
                                                <AlertCircle className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="flex items-center text-white text-xs font-bold">
                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                {post.likes}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <NyxButton
                                href={
                                    activePlatform === 'youtube' ? `https://youtube.com/@${username}` : 
                                    activePlatform === 'linkedin' ? `https://linkedin.com/in/${username}` : 
                                    `https://instagram.com/${username}`
                                }
                                className="mt-6 w-full justify-center"
                                variant="outline"
                            >
                                VIEW ON {
                                    activePlatform === 'youtube' ? 'YOUTUBE' : 
                                    activePlatform === 'linkedin' ? 'LINKEDIN' : 
                                    'INSTAGRAM'
                                }
                            </NyxButton>

                            {analysis.scrapedData?.isMockData && (
                                <p className="text-[10px] text-theme-secondary text-center mt-4 opacity-60">
                                    *Showing mock data (Scraper restricted)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
