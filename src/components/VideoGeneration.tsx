'use client';

import { useState, useEffect } from 'react';

export default function VideoGeneration() {
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
    const [progress, setProgress] = useState(0);
    const [script, setScript] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const savedScript = localStorage.getItem('current_video_script');
        if (savedScript) {
            setScript(savedScript);
        }
        const savedApiKey = localStorage.getItem('heygen_api_key');
        if (savedApiKey) {
            setApiKey(savedApiKey);
        }
    }, []);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value;
        setApiKey(key);
        localStorage.setItem('heygen_api_key', key);
    };

    const pollStatus = async (id: string) => {
        try {
            console.log(`Polling status for video ID: ${id}`);
            const headers: Record<string, string> = {};
            if (apiKey) {
                headers['x-api-key'] = apiKey;
            }

            const response = await fetch(`/api/video/status?videoId=${id}`, {
                headers
            });
            const data = await response.json();
            console.log('Poll response:', data);

            if (data.success) {
                const { status: videoStatus, url, error: videoError } = data.data;
                console.log(`Current status: ${videoStatus}, URL: ${url}`);

                if (videoStatus === 'completed') {
                    if (url) {
                        setVideoUrl(url);
                        setStatus('completed');
                        setProgress(100);
                        return true; // Stop polling
                    } else {
                        console.warn('Video status is completed but URL is missing. Continuing to poll...');
                        // Optionally update UI to show "Finalizing..."
                        return false; // Continue polling
                    }
                } else if (videoStatus === 'failed' || videoStatus === 'error') {
                    console.error('Video generation failed:', videoError);
                    let errorMessage = 'Video generation failed on server.';
                    if (videoError) {
                        errorMessage = typeof videoError === 'string'
                            ? videoError
                            : JSON.stringify(videoError);
                    }
                    setError(errorMessage);
                    setStatus('idle');
                    return true; // Stop polling
                }
            }
        } catch (err) {
            console.error('Polling error:', err);
            // Don't stop polling immediately on network error, but maybe after max retries
        }
        return false; // Continue polling
    };

    const startGeneration = async () => {
        console.log('Starting video generation...');
        setStatus('processing');
        setProgress(0);
        setError(null);
        setVideoUrl(null);

        try {
            // Get custom IDs from localStorage
            const customAvatarId = localStorage.getItem('custom_avatar_id');
            const customVoiceId = localStorage.getItem('custom_voice_id');
            console.log('Using Avatar ID:', customAvatarId);
            console.log('Using Voice ID:', customVoiceId);

            if (!customAvatarId) {
                throw new Error("Avatar ID not found. Please set it in the Avatar & Voice page.");
            }

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['x-api-key'] = apiKey;
            }

            // Start generation request
            const response = await fetch('/api/video/generate', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    script: script || 'Mock script content', // Use real script
                    avatarId: customAvatarId,
                    voiceId: customVoiceId || 'mock-voice',
                }),
            });

            const data = await response.json();
            console.log('Generation response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate video');
            }

            const newVideoId = data.data.videoId;
            setVideoId(newVideoId);

            // Start polling
            let pollCount = 0;
            const maxPolls = 300; // 10 minutes (if 2s interval)

            const interval = setInterval(async () => {
                pollCount++;
                // Fake progress while waiting
                setProgress((prev) => Math.min(prev + 1, 90));

                const isComplete = await pollStatus(newVideoId);

                if (isComplete) {
                    clearInterval(interval);
                } else if (pollCount >= maxPolls) {
                    clearInterval(interval);
                    setError('Video generation timed out. Please check back later.');
                    setStatus('idle');
                }
            }, 2000);

        } catch (error: any) {
            console.error('Video generation failed:', error);
            setError(error.message || 'An unexpected error occurred');
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

            {/* API Key Input */}
            <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">HeyGen API Key (Optional)</label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    placeholder="Enter your HeyGen API Key to override default"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                    Leave blank to use the server-configured API key.
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-8 text-red-200 flex items-center animate-fade-in">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                        <p className="font-bold">Generation Failed</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                </div>
            )}

            {status === 'idle' && (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                    <div className="text-6xl mb-6">🎬</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Produce</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Your script is approved. Click the button above to start rendering.
                    </p>

                    {/* Avatar ID Check */}
                    <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl max-w-md mx-auto text-left">
                        <p className="text-xs text-blue-300 uppercase font-bold mb-1">Using Avatar ID</p>
                        <p className="text-white font-mono text-sm break-all">
                            {localStorage.getItem('custom_avatar_id') || 'Not Set'}
                        </p>
                        <a href="/dashboard/avatar" className="text-xs text-blue-400 hover:text-blue-300 underline mt-2 block">
                            Change Avatar ID &rarr;
                        </a>
                    </div>

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
                        {progress >= 30 && progress < 90 && 'Animating avatar...'}
                        {progress >= 90 && 'Finalizing render...'}
                    </p>
                </div>
            )}

            {status === 'completed' && videoUrl && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="bg-black rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] relative group">
                        <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-cover"
                            autoPlay
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold text-green-400 mb-4">✅ Render Complete</h3>
                            <p className="text-gray-300 mb-6">
                                Your video has been successfully generated and is ready for publishing.
                            </p>
                            <div className="space-y-3">
                                <a
                                    href={videoUrl}
                                    download="generated_video.mp4"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors text-center"
                                >
                                    Download Video ⬇️
                                </a>
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
