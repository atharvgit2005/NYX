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
                    <h2 className="text-4xl font-bold text-white mb-2">Brand Analysis</h2>
                    <p className="text-gray-400 text-lg">
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
                <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-3xl border border-white/10">
                    <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Target className="w-8 h-8 text-purple-400 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Analyzing your content...</h3>
                    <p className="text-gray-400">Scanning captions, hashtags, and engagement patterns.</p>
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-2xl text-center mb-8">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Analysis Failed</h3>
                    <p className="text-gray-300">{error}</p>
                    <p className="text-sm text-gray-500 mt-4">
                        Tip: Ensure your account is public and you have added the Gemini API Key.
                    </p>
                </div>
            )}

            {analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Niche Card */}
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform"><Target className="w-24 h-24" /></div>
                        <div className="relative z-10">
                            <h3 className="text-purple-400 font-bold mb-2 flex items-center"><Target className="w-5 h-5 mr-2" /> Your Niche</h3>
                            <p className="text-2xl font-bold text-white leading-tight">{analysis.niche}</p>
                        </div>
                    </div>

                    {/* Tone Card */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-pink-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><MessageCircle className="w-24 h-24" /></div>
                        <div className="relative z-10">
                            <h3 className="text-pink-400 font-bold mb-2 flex items-center"><MessageCircle className="w-5 h-5 mr-2" /> Tone of Voice</h3>
                            <p className="text-xl text-white">{analysis.tone}</p>
                        </div>
                    </div>

                    {/* Audience Card */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Users className="w-24 h-24" /></div>
                        <div className="relative z-10">
                            <h3 className="text-blue-400 font-bold mb-2 flex items-center"><Users className="w-5 h-5 mr-2" /> Target Audience</h3>
                            <p className="text-xl text-white">{analysis.audience}</p>
                        </div>
                    </div>

                    {/* Pillars Card */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 lg:col-span-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><Layers className="w-32 h-32" /></div>
                        <h3 className="text-green-400 font-bold mb-6 flex items-center"><Layers className="w-5 h-5 mr-2" /> Content Pillars</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {analysis.pillars.map((pillar: string, i: number) => (
                                <div key={i} className="flex items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    <span className="text-gray-200 font-medium">{pillar}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Competitors Card */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><TrendingUp className="w-32 h-32" /></div>
                        <h3 className="text-yellow-400 font-bold mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2" /> Competitors</h3>
                        <ul className="space-y-3">
                            {analysis.competitors.map((comp: string, i: number) => (
                                <li key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{comp}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
