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
    const [generating, setGenerating] = useState(false);

    const handleRegenerate = async () => {
        setGenerating(true);
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
            }
        } catch (error) {
            console.error('Script generation failed:', error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Script Editor</h2>
                    <p className="text-gray-400 mt-2">
                        Review and edit your AI-generated script.
                    </p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={handleRegenerate}
                        disabled={generating}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                    >
                        {generating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/scripts', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        title: 'Generated Script', // Could add title input
                                        content: script
                                    })
                                });
                                if (res.ok) {
                                    alert('Script saved!');
                                    // Optional: Redirect or update UI
                                } else {
                                    alert('Failed to save script.');
                                }
                            } catch (e) {
                                console.error(e);
                                alert('Error saving script.');
                            }
                        }}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-white transition-colors"
                    >
                        Save & Create Video →
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                        <div className="bg-black/30 px-4 py-2 border-b border-white/10 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-400">Script Content</span>
                            <span className="text-xs text-gray-500">~145 words • 45 sec</span>
                        </div>
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            className="w-full h-96 bg-transparent p-6 text-lg text-white placeholder-gray-500 focus:outline-none resize-none font-mono leading-relaxed"
                            placeholder="Your script goes here..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4">AI Suggestions</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">💡</span>
                                Make the hook more controversial to increase retention.
                            </li>
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">💡</span>
                                Shorten the body sentences for better pacing.
                            </li>
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">💡</span>
                                Add a specific call to action for higher engagement.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4">Tone Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Energy Level</label>
                                <input type="range" className="w-full accent-purple-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Pacing</label>
                                <input type="range" className="w-full accent-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
