'use client';

import { useState } from 'react';

export default function ScriptEditor() {
    const [script, setScript] = useState<string>(
        `[HOOK]
Stop working hard. Start working smart. Here is the unfair advantage you need in 2024.

[BODY]
Most people think AI is just ChatGPT. But the real pros are using tools that automate the entire workflow. Imagine having a clone that does the work for you while you sleep.

[CTA]
Comment "AI" below and I'll send you the full list of tools I use.`
    );
    const [showToast, setShowToast] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegenerate = async () => {
        setGenerating(true);
        setError(null);
        try {
            const response = await fetch('/api/scripts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea: { title: 'Mock Idea', hook: 'Mock Hook', angle: 'Mock Angle' },
                    tone: 'Professional',
                }),
            });
            const data = await response.json();
            if (data.success) {
                setScript(data.data);
            } else {
                setError(data.error || 'Failed to regenerate script');
            }
        } catch (error) {
            console.error('Script generation failed:', error);
            setError('Network error during generation');
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        try {
            // Simulate saving
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                // Redirect to video generation
                window.location.href = '/dashboard/video';
            }, 1500);

            // In real app, we would POST to API here
            localStorage.setItem('current_video_script', script);

        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-6xl mx-auto relative">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 right-8 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center animate-fade-in z-50">
                    <span className="mr-2">✅</span> Script Saved! Redirecting...
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Script Editor</h2>
                    <p className="text-gray-400 mt-2 text-lg">
                        Refine your masterpiece before production.
                    </p>
                </div>
                <div className="flex space-x-4 w-full md:w-auto">
                    <button
                        onClick={handleRegenerate}
                        disabled={generating}
                        className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
                    >
                        {generating ? 'Regenerating...' : 'Regenerate AI'}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] rounded-xl font-bold text-white transition-all hover:scale-105 flex items-center justify-center group"
                    >
                        Save & Create Video <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-8 text-red-200 flex items-center justify-center animate-fade-in">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl h-[600px] flex flex-col focus-within:border-purple-500/50 transition-colors">
                        <div className="bg-black/20 px-6 py-4 border-b border-white/5 flex justify-between items-center backdrop-blur-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Editor Mode</span>
                        </div>
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            className="w-full h-full bg-transparent p-8 text-lg md:text-xl text-gray-200 placeholder-gray-600 focus:outline-none resize-none font-serif leading-loose selection:bg-purple-500/30"
                            placeholder="Start writing your script..."
                            spellCheck="false"
                        />
                        <div className="px-6 py-3 bg-black/20 border-t border-white/5 text-xs text-gray-500 flex justify-between">
                            <span>{script.split(/\s+/).filter(Boolean).length} words</span>
                            <span>~{Math.ceil(script.split(/\s+/).filter(Boolean).length / 3)} sec</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-900/10 to-transparent p-6 rounded-3xl border border-purple-500/20">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">✨</span> AI Suggestions
                        </h3>
                        <ul className="space-y-4 text-sm text-gray-300">
                            {[
                                "Start with a controversial hook to stop the scroll.",
                                "Keep sentences short (under 15 words) for readability.",
                                "Add a clear Call to Action (CTA) in the last 5 seconds."
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start bg-black/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-yellow-400 mr-3 mt-0.5">💡</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-6">Tone Adjustments</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-2">
                                    <span>Calm</span>
                                    <span>Energetic</span>
                                </div>
                                <input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" defaultValue="75" />
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-2">
                                    <span>Slow</span>
                                    <span>Fast</span>
                                </div>
                                <input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500" defaultValue="60" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
