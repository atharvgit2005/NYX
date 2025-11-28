'use client';

import { useState, useEffect } from 'react';

export default function VideoGeneration() {
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
    const [progress, setProgress] = useState(0);
    const [script, setScript] = useState<string>('');

    useEffect(() => {
        const savedScript = localStorage.getItem('current_video_script');
        if (savedScript) {
            setScript(savedScript);
        }
    }, []);

    const startGeneration = async () => {
        setStatus('processing');
        setProgress(0);

        try {
            // Get custom IDs from localStorage
            const customAvatarId = localStorage.getItem('custom_avatar_id');
            const customVoiceId = localStorage.getItem('custom_voice_id');

            // Start generation request
            const response = await fetch('/api/video/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script: script || 'Mock script content', // Use real script
                    avatarId: customAvatarId || 'mock-avatar',
                    voiceId: customVoiceId || 'mock-voice',
                }),
            });

            // Simulate progress polling
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStatus('completed');
                        return 100;
                    }
                    return prev + 10;
                });
            }, 500);

        } catch (error) {
            console.error('Video generation failed:', error);
            setStatus('idle');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Video Generation</h2>
                    <p className="text-gray-400 mt-2">
                        Create your final video with AI avatar and voice.
                    </p>
                </div>
                {status === 'idle' && (
                    <button
                        onClick={startGeneration}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white hover:opacity-90 transition-opacity"
                    >
                        Generate Video
                    </button>
                )}
            </div>

            {status === 'idle' && (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                    <div className="text-6xl mb-6">🎬</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Produce</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Your script is approved and your avatar is ready. Click the button above to start rendering your video.
                    </p>

                    {script && (
                        <div className="bg-black/30 p-6 rounded-xl border border-white/5 text-left max-w-2xl mx-auto">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Script Preview</h4>
                            <p className="text-gray-300 font-mono text-sm whitespace-pre-wrap line-clamp-6">
                                {script}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {status === 'processing' && (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                    <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                    <h3 className="text-2xl font-bold text-white mb-4">Rendering Your Video...</h3>
                    <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-2.5 mb-4">
                        <div
                            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-gray-400">
                        {progress < 30 && 'Synthesizing voice...'}
                        {progress >= 30 && progress < 70 && 'Animating avatar...'}
                        {progress >= 70 && 'Finalizing render...'}
                    </p>
                </div>
            )}

            {status === 'completed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="bg-black rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] relative group">
                        {/* Placeholder for video player */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <span className="text-6xl">▶️</span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-black/50 backdrop-blur-md p-3 rounded-lg">
                                <p className="text-white text-sm font-medium">Final_Video_v1.mp4</p>
                                <p className="text-gray-400 text-xs">00:45 • 1080x1920</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold text-green-400 mb-4">✅ Render Complete</h3>
                            <p className="text-gray-300 mb-6">
                                Your video has been successfully generated and is ready for publishing.
                            </p>
                            <div className="space-y-3">
                                <button className="w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors">
                                    Download Video ⬇️
                                </button>
                                <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors">
                                    Schedule Post 📅
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Performance Prediction</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/30 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-green-400">8.5/10</p>
                                    <p className="text-xs text-gray-500 uppercase mt-1">Viral Score</p>
                                </div>
                                <div className="bg-black/30 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-blue-400">High</p>
                                    <p className="text-xs text-gray-500 uppercase mt-1">Retention</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
