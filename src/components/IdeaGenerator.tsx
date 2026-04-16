'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, Copy, Check, Play, FileText, BrainCircuit, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import NyxButton from './ui/NyxButton';

export default function IdeaGenerator() {
    const [generating, setGenerating] = useState(false);
    const [ideas, setIdeas] = useState<any[]>([]);
    const [analysisData, setAnalysisData] = useState<{ niche: string; pillars: string[]; tone: string; platform: string } | null>(null);

    // Script Generation State
    const [scriptGenerating, setScriptGenerating] = useState<number | null>(null);
    const [generatedScript, setGeneratedScript] = useState<{ id: number; content: string; ideaTitle: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [scriptSaved, setScriptSaved] = useState(false);

    useEffect(() => {
        // Check connected accounts and find the latest analysis across platforms
        const savedSocials = localStorage.getItem('connected_socials');
        const primaryUsername = localStorage.getItem('primary_username');

        let foundAnalysis = false;

        if (savedSocials) {
            try {
                const socials = JSON.parse(savedSocials);
                // Check each platform for cached analysis (prefer instagram first, then youtube)
                const platforms: Array<{ key: 'instagram' | 'youtube' | 'tiktok'; label: string }> = [
                    { key: 'instagram', label: 'Instagram' },
                    { key: 'youtube', label: 'YouTube' },
                    { key: 'tiktok', label: 'TikTok' },
                ];

                for (const platform of platforms) {
                    const user = socials[platform.key];
                    if (!user) continue;

                    const cached = localStorage.getItem(`brand_analysis_results_${platform.key}_${user}`);
                    if (cached) {
                        try {
                            const parsed = JSON.parse(cached);
                            setAnalysisData({
                                niche: parsed.niche,
                                pillars: parsed.pillars,
                                tone: parsed.tone || 'Professional & Engaging',
                                platform: platform.label,
                            });
                            foundAnalysis = true;
                            break; // Use the first analysis found
                        } catch (e) {
                            console.error(`Failed to parse ${platform.label} analysis`, e);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to parse connected_socials', e);
            }
        }

        // Fallback: check legacy key format with primary_username
        if (!foundAnalysis && primaryUsername) {
            const legacyCache = localStorage.getItem(`brand_analysis_results_instagram_${primaryUsername}`);
            if (legacyCache) {
                try {
                    const parsed = JSON.parse(legacyCache);
                    setAnalysisData({
                        niche: parsed.niche,
                        pillars: parsed.pillars,
                        tone: parsed.tone || 'Professional & Engaging',
                        platform: 'Instagram',
                    });
                    foundAnalysis = true;
                } catch (e) { }
            }
        }

        if (!foundAnalysis) {
            setAnalysisData(null);
        }

        // Load cached ideas from localStorage
        const savedIdeas = localStorage.getItem('generated_ideas');
        if (savedIdeas) {
            try {
                setIdeas(JSON.parse(savedIdeas));
            } catch (e) {
                console.error('Failed to parse saved ideas', e);
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
                // Persist ideas to localStorage
                localStorage.setItem('generated_ideas', JSON.stringify(data.data));
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
            const response = await fetch('/api/scripts/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea,
                    tone: analysisData?.tone || 'Professional',
                }),
            });
            const data = await response.json();
            if (data.success) {
                setGeneratedScript({ id: idea.id, content: data.data, ideaTitle: idea.title });
                setScriptSaved(false);
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
        <div className="max-w-4xl mx-auto relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-[clamp(24px,5vw,30px)] font-bold text-theme-primary">Idea Generator</h2>
                    <p className="text-sm text-theme-secondary mt-1.5 leading-relaxed">
                        Get viral-ready video ideas tailored to your niche.
                    </p>
                </div>
                <NyxButton
                    onClick={handleGenerate}
                    className="w-full sm:w-auto shrink-0 justify-center py-3"
                >
                    {generating ? 'GENERATING...' : ideas.length > 1 ? 'REGENERATE IDEAS' : 'GENERATE IDEAS'}
                </NyxButton>
            </div>

            {/* Analysis Context Banner */}
            {analysisData ? (
                <div className="mb-8 p-4 rounded-2xl bg-card-theme border border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary border border-theme flex items-center justify-center shrink-0">
                            <BrainCircuit className="w-5 h-5 text-theme-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-theme-primary">
                                Powered by {analysisData.platform} Analysis
                            </p>
                            <p className="text-[10px] sm:text-xs text-theme-secondary">
                                Niche: <span className="text-primary font-bold">{analysisData.niche}</span> · {analysisData.pillars.length} pillars · Tone: {analysisData.tone}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/automate/dashboard/analysis"
                        className="w-full sm:w-auto text-center text-xs font-bold text-theme-primary hover:text-theme-primary/80 transition-colors px-4 py-2 rounded-lg bg-secondary border border-theme"
                    >
                        Re-analyze →
                    </Link>
                </div>
            ) : (
                <div className="mb-8 p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-theme-primary">No Brand Analysis Found</p>
                        <p className="text-xs text-theme-secondary mt-1">
                            Ideas will use generic defaults. Run a Brand Analysis first for personalized results.
                        </p>
                    </div>
                    <NyxButton
                        href="/automate/dashboard/analysis"
                        className="w-full sm:w-auto justify-center"
                    >
                        RUN ANALYSIS
                    </NyxButton>
                </div>
            )}

            {generating && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-theme border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-theme-secondary animate-pulse">Brainstorming viral concepts...</p>
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
                        className="bg-card-theme p-8 rounded-3xl border border-theme hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:-translate-y-1 animate-fade-in group"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-bold text-theme-primary group-hover:opacity-90 transition-opacity">{idea.title}</h3>
                            <span className="px-4 py-1.5 bg-accent text-theme-primary rounded-full text-xs font-bold uppercase tracking-wide border border-theme shadow-lg">
                                {idea.angle}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-secondary p-6 rounded-2xl border border-theme hover:border-theme/80 transition-colors shadow-inner">
                                <p className="text-xs text-theme-secondary font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span> Hook
                                </p>
                                <p className="text-theme-secondary text-lg font-medium italic leading-relaxed">&quot;{idea.hook}&quot;</p>
                            </div>
                            <div className="bg-secondary p-6 rounded-2xl border border-theme hover:border-theme/80 transition-colors shadow-inner">
                                <p className="text-xs text-theme-secondary font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary/60"></span> Format
                                </p>
                                <p className="text-theme-secondary text-base leading-relaxed">{idea.format}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 border-t border-theme pt-6">
                            <NyxButton 
                                variant="outline" 
                                showIconContainer={false}
                                className="px-6 py-2.5 justify-center w-full sm:w-auto"
                            >
                                SAVE FOR LATER
                            </NyxButton>
                            <NyxButton
                                onClick={() => handleGenerateScript(idea)}
                                className="px-6 py-2.5 justify-center w-full sm:w-auto"
                            >
                                {scriptGenerating === idea.id ? 'GENERATING...' : 'GENERATE SCRIPT'}
                            </NyxButton>
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
                <div className="fixed inset-0 bg-page/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card-theme border border-theme rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-theme">
                            <h3 className="text-xl font-bold text-theme-primary flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-primary" />
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
                                className="w-full h-full bg-page p-6 rounded-xl border border-theme font-mono text-sm text-theme-primary focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
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
                                className="px-4 py-2 bg-accent hover:bg-theme-secondary/20 text-theme-primary rounded-lg text-sm font-medium transition-colors flex items-center border border-theme"
                            >
                                {copied ? <><Check className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Script</>}
                            </button>
                            <button
                                onClick={() => {
                                    if (generatedScript) {
                                        localStorage.setItem('current_video_script', generatedScript.content);
                                        localStorage.setItem('current_script_idea', generatedScript.ideaTitle);
                                        setScriptSaved(true);
                                        window.location.href = '/automate/dashboard/scripts';
                                    }
                                }}
                                className="px-4 py-2 bg-accent hover:bg-theme-secondary/20 text-theme-primary rounded-lg text-sm font-medium transition-colors flex items-center border border-theme"
                            >
                                <FileText className="w-4 h-4 mr-2" /> {scriptSaved ? 'Saved ✓' : 'Edit in Script Editor'}
                            </button>
                            <NyxButton
                                onClick={() => {
                                    if (generatedScript) {
                                        localStorage.setItem('current_video_script', generatedScript.content);
                                        localStorage.setItem('current_script_idea', generatedScript.ideaTitle);
                                        window.location.href = '/automate/dashboard/video';
                                    }
                                }}
                                className="px-6 py-2.5"
                            >
                                CREATE VIDEO
                            </NyxButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
