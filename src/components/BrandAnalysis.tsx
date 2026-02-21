'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, MessageCircle, Users, Layers, TrendingUp, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function BrandAnalysis() {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [username, setUsername] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for connected account
        const savedUsername = localStorage.getItem('primary_username');
        setUsername(savedUsername);
    }, []);

    const handleAnalyze = async () => {
        if (!username) return;

        setAnalyzing(true);
        setError(null);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileData: { username: username } }),
            });
            const data = await response.json();

            if (data.success) {
                setAnalysis(data.data);
                // Save to localStorage for Idea Generator
                localStorage.setItem('brand_analysis_results', JSON.stringify(data.data));
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
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">No Account Connected</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Please connect your Instagram or TikTok account to enable AI brand analysis.
                </p>
                <Link
                    href="/dashboard/connect"
                    className="inline-flex items-center px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-full font-bold text-white transition-all hover:scale-105"
                >
                    Connect Account <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-theme-primary mb-2">Brand Analysis</h2>
                    <p className="text-theme-secondary text-lg">
                        AI insights for <span className="text-purple-400 font-bold">@{username}</span>
                    </p>
                </div>
                {!analysis && (
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {analyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</> : <><Target className="w-5 h-5 mr-2" /> Start Analysis</>}
                    </button>
                )}
            </div>

            {analyzing && (
                <div className="flex flex-col items-center justify-center py-32 bg-card-theme rounded-3xl border border-theme">
                    <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Target className="w-8 h-8 text-purple-400 animate-pulse" />
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
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Target className="w-20 h-20" /></div>
                                <div className="relative z-10">
                                    <h3 className="text-purple-400 font-bold mb-2 flex items-center"><Target className="w-5 h-5 mr-2" /> Your Niche</h3>
                                    <p className="text-2xl font-bold text-theme-primary leading-tight">{analysis.niche}</p>
                                </div>
                            </div>
                            <div className="p-8 rounded-3xl bg-card-theme border border-theme relative overflow-hidden group hover:border-pink-500/30 transition-colors">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><MessageCircle className="w-20 h-20" /></div>
                                <div className="relative z-10">
                                    <h3 className="text-pink-400 font-bold mb-2 flex items-center"><MessageCircle className="w-5 h-5 mr-2" /> Tone of Voice</h3>
                                    <p className="text-xl text-theme-primary">{analysis.tone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Audience */}
                        <div className="p-8 rounded-3xl bg-card-theme border border-theme relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Users className="w-20 h-20" /></div>
                            <div className="relative z-10">
                                <h3 className="text-blue-400 font-bold mb-2 flex items-center"><Users className="w-5 h-5 mr-2" /> Target Audience</h3>
                                <p className="text-xl text-theme-primary">{analysis.audience}</p>
                            </div>
                        </div>

                        {/* Pillars */}
                        <div className="p-8 rounded-3xl bg-card-theme border border-theme relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5"><Layers className="w-24 h-24" /></div>
                            <h3 className="text-green-400 font-bold mb-6 flex items-center relative z-10"><Layers className="w-5 h-5 mr-2" /> Content Pillars</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                {analysis.pillars.map((pillar: string, i: number) => (
                                    <div key={i} className="flex items-center bg-card-theme p-4 rounded-xl border border-theme">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                        <span className="text-theme-secondary font-medium">{pillar}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Competitors */}
                        <div className="p-8 rounded-3xl bg-card-theme border border-theme relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5"><TrendingUp className="w-24 h-24" /></div>
                            <h3 className="text-yellow-400 font-bold mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2" /> Competitors</h3>
                            <ul className="space-y-3">
                                {analysis.competitors.map((comp: string, i: number) => (
                                    <li key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover transition-colors cursor-pointer group">
                                        <span className="text-theme-secondary font-medium group-hover:text-theme-primary transition-colors">{comp}</span>
                                        <ArrowRight className="w-4 h-4 text-theme-secondary group-hover:text-theme-primary transition-colors" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Instagram Profile Preview */}
                    <div className="space-y-6">
                        <div className="bg-card-theme backdrop-blur-xl border border-theme rounded-3xl p-6 sticky top-24">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                        {/* Avatar Fallback */}
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
                                    <p className="text-xs text-theme-secondary">Posts</p>
                                </div>
                                <div>
                                    <p className="font-bold text-theme-primary">{analysis.scrapedData?.followers || 'N/A'}</p>
                                    <p className="text-xs text-theme-secondary">Followers</p>
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
                            <h4 className="text-xs font-bold text-theme-secondary uppercase mb-3">Recent Posts</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {analysis.scrapedData?.posts?.map((post: any, i: number) => (
                                    <div key={i} className="aspect-square bg-card-theme rounded-lg overflow-hidden relative group cursor-pointer border border-theme">
                                        {post.imageUrl ? (
                                            <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-900">
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

                            <a
                                href={`https://instagram.com/${username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 block w-full py-3 bg-card-hover hover:bg-card-theme text-theme-primary text-center rounded-xl font-bold text-sm transition-colors border border-theme"
                            >
                                View on Instagram ↗
                            </a>

                            {analysis.scrapedData?.isMockData && (
                                <p className="text-[10px] text-yellow-500/50 text-center mt-4">
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
