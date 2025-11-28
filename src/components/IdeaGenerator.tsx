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

    const handleGenerate = async () => {
        setGenerating(true);

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
            }
        } catch (error) {
            console.error('Idea generation failed:', error);
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
        <div className="max-w-4xl mx-auto relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Idea Generator</h2>
                    <p className="text-gray-400 mt-2">
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
                    <p className="text-gray-400 animate-pulse">Scanning trends & brainstorming...</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {ideas.map((idea) => (
                    <div key={idea.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors animate-fade-in">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">{idea.title}</h3>
                            <span className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs font-medium border border-purple-500/20">
                                {idea.angle}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase mb-1">Hook</p>
                                <p className="text-gray-300 italic">"{idea.hook}"</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase mb-1">Format</p>
                                <p className="text-gray-300">{idea.format}</p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                                Save for Later
                            </button>
                            <button
                                onClick={() => handleGenerateScript(idea)}
                                disabled={scriptGenerating === idea.id}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
                            >
                                {scriptGenerating === idea.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FileText className="w-4 h-4 mr-2" /> Generate Script</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!generating && ideas.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                    <p className="text-gray-400">No ideas generated yet. Click the button above to start.</p>
                </div>
            )}

            {/* Script Modal */}
            {generatedScript && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                                Generated Script
                            </h3>
                            <button
                                onClick={() => setGeneratedScript(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col min-h-0">
                            <textarea
                                value={generatedScript.content}
                                onChange={(e) => setGeneratedScript({ ...generatedScript, content: e.target.value })}
                                className="w-full h-full bg-black/30 p-6 rounded-xl border border-white/5 font-mono text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                                placeholder="Write your script here..."
                            />
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end space-x-3">
                            <button
                                onClick={() => setGeneratedScript(null)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
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
