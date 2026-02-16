'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, Copy, Check, Play, FileText } from 'lucide-react';

export default function IdeaGenerator() {
    const [generating, setGenerating] = useState(false);
    const [ideas, setIdeas] = useState<any[]>([]);
    const [analysisData, setAnalysisData] = useState<{ niche: string; pillars: string[]; tone: string } | null>(null);

    // Script Generation State
    const [scriptGenerating, setScriptGenerating] = useState<number | null>(null);
    const [generatedScript, setGeneratedScript] = useState<{ id: number; content: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const savedAnalysis = localStorage.getItem('brand_analysis_results');
        if (savedAnalysis) {
            try {
                const parsed = JSON.parse(savedAnalysis);
                setAnalysisData({
                    niche: parsed.niche,
                    pillars: parsed.pillars,
                    tone: parsed.tone || 'Professional & Engaging' // Fallback tone
                });
            } catch (e) {
                console.error('Failed to parse analysis data', e);
            }
        }
    }, []);

    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);

        // Default values if no analysis found
        const niche = analysisData?.niche || 'Productivity & AI Tools';
        const pillars = analysisData?.pillars || ['AI Tools', 'Automation', 'Productivity'];

        try {
            const response = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    niche,
                    pillars,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setIdeas(data.data);
            } else {
                setError(data.error || 'Failed to generate ideas');
            }
        } catch (error) {
            console.error('Idea generation failed:', error);
            setError('Network error. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateScript = async (idea: any) => {
        setScriptGenerating(idea.id);
        try {
            const response = await fetch('/api/scripts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea,
                    tone: analysisData?.tone || 'Professional',
                }),
            });
            const data = await response.json();
            if (data.success) {
                setGeneratedScript({ id: idea.id, content: data.data });
            }
        } catch (error) {
            console.error('Script generation failed:', error);
        } finally {
            setScriptGenerating(null);
        }
    };

    const copyToClipboard = () => {
        if (generatedScript) {
            navigator.clipboard.writeText(generatedScript.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto relative mt-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-theme-primary">Idea Generator</h2>
                    <p className="text-theme-secondary mt-2">
                        Get viral-ready video ideas tailored to your niche.
                    </p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
                >
                    {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : 'Generate Ideas'}
                </button>
            </div>

            {generating && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-theme-secondary animate-pulse">Scanning trends & brainstorming...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-8 text-red-200 text-center animate-fade-in">
                    <p className="font-bold">⚠️ {error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {ideas.map((idea, index) => (
                    <div
                        key={idea.id}
                        className="bg-card-theme p-8 rounded-3xl border border-theme hover:border-purple-500/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:-translate-y-1 animate-fade-in group"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-bold text-theme-primary group-hover:text-purple-300 transition-colors">{idea.title}</h3>
                            <span className="px-4 py-1.5 bg-purple-900/30 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wide border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                {idea.angle}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-card-hover p-6 rounded-2xl border border-theme hover:border-purple-500/20 transition-colors">
                                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> Hook
                                </p>
                                <p className="text-theme-secondary text-lg font-medium italic leading-relaxed">"{idea.hook}"</p>
                            </div>
                            <div className="bg-card-hover p-6 rounded-2xl border border-theme hover:border-purple-500/20 transition-colors">
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Format
                                </p>
                                <p className="text-theme-secondary text-base leading-relaxed">{idea.format}</p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 border-t border-theme pt-6">
                            <button className="px-6 py-3 bg-card-theme hover:bg-card-hover text-theme-secondary hover:text-theme-primary rounded-xl text-sm font-bold transition-all hover:scale-105 border border-transparent hover:border-theme">
                                Save for Later
                            </button>
                            <button
                                onClick={() => handleGenerateScript(idea)}
                                disabled={scriptGenerating === idea.id}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all flex items-center shadow-lg hover:shadow-purple-500/30 hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                {scriptGenerating === idea.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileText className="w-5 h-5 mr-2" /> Generate Script</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!generating && ideas.length === 0 && (
                <div className="text-center py-20 bg-card-theme rounded-2xl border border-theme border-dashed">
                    <p className="text-theme-secondary">No ideas generated yet. Click the button above to start.</p>
                </div>
            )}

            {/* Script Modal */}
            {generatedScript && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card-theme border border-theme rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-theme">
                            <h3 className="text-xl font-bold text-theme-primary flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                                Generated Script
                            </h3>
                            <button
                                onClick={() => setGeneratedScript(null)}
                                className="text-theme-secondary hover:text-theme-primary transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col min-h-0">
                            <textarea
                                value={generatedScript.content}
                                onChange={(e) => setGeneratedScript({ ...generatedScript, content: e.target.value })}
                                className="w-full h-full bg-page p-6 rounded-xl border border-theme font-mono text-sm text-theme-primary focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                                placeholder="Write your script here..."
                            />
                        </div>

                        <div className="p-6 border-t border-theme flex justify-end space-x-3">
                            <button
                                onClick={() => setGeneratedScript(null)}
                                className="px-4 py-2 bg-card-hover hover:bg-theme-secondary/20 text-theme-primary rounded-lg text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-card-hover hover:bg-theme-secondary/20 text-theme-primary rounded-lg text-sm font-medium transition-colors flex items-center"
                            >
                                {copied ? <><Check className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Script</>}
                            </button>
                            <button
                                onClick={() => {
                                    if (generatedScript) {
                                        localStorage.setItem('current_video_script', generatedScript.content);
                                        window.location.href = '/dashboard/video';
                                    }
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-lg text-sm font-bold transition-all flex items-center shadow-lg hover:shadow-purple-500/25"
                            >
                                <Play className="w-4 h-4 mr-2 fill-current" /> Create Video
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
