'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function VideoHistoryList() {
    const { data: session } = useSession();
    const [videos, setVideos] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    const fetchVideos = () => {
        fetch('/api/video/history')
            .then(res => res.json())
            .then(data => {
                if (data.success) setVideos(data.data);
            })
            .catch(err => console.error("Failed to load history", err));
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const res = await fetch('/api/video/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setVideos(prev => prev.filter(v => v.id !== id));
            } else {
                const text = await res.text();
                console.error("Delete failed:", text);
                alert(`Failed to delete: ${text}`);
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("Delete failed due to network error");
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/video/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                fetchVideos(); // Refresh list to show new video
            } else {
                alert('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert('Upload error');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div>
            {/* Debug Info */}
            <div className="mb-4 text-xs text-theme-secondary font-mono text-right">
                Logged in as: <span className="text-purple-400 font-bold">{session?.user?.email || "Not Logged In"}</span>
            </div>

            {/* Admin Controls */}
            <div className="flex justify-end mb-6">
                <input
                    type="file"
                    accept="video/*"
                    id="video-upload"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                />
                <label
                    htmlFor="video-upload"
                    className={`cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Uploading...
                        </>
                    ) : (
                        <>
                            <span>⬆️ Upload Video</span>
                        </>
                    )}
                </label>
            </div>

            {videos.length === 0 ? (
                <p className="text-theme-secondary text-center py-10">No videos found. Upload one to get started!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <VideoListItem key={video.id} video={video} onDelete={() => handleDelete(video.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}


function VideoListItem({ video: initialVideo, onDelete }: { video: any, onDelete: () => void }) {
    const [video, setVideo] = useState(initialVideo);
    const [progress, setProgress] = useState(0);
    const [playError, setPlayError] = useState(false);

    // Sync initialVideo if updated (e.g. from parent refresh)
    useEffect(() => {
        setVideo(initialVideo);
        setPlayError(false); // Reset error on new video
    }, [initialVideo]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (video.status === 'processing') {
            // Poll for updates
            interval = setInterval(async () => {
                try {
                    // Simulate visual progress for UX since API might not return %
                    setProgress(prev => Math.min(prev + (100 - prev) * 0.1, 95));

                    const res = await fetch(`/api/video/status?videoId=${video.id}`);
                    const data = await res.json();

                    if (data.success && data.data) {
                        const { status, url } = data.data;

                        // Update if status changed
                        if (status !== 'processing') {
                            setVideo((prev: any) => ({ ...prev, status, url }));
                            setProgress(100);
                        }
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 3000);
        } else if (video.status === 'completed') {
            setProgress(100);
        }

        return () => clearInterval(interval);
    }, [video.status, video.id]);

    return (
        <div className="bg-card-theme rounded-xl overflow-hidden border border-theme hover:border-purple-500/30 transition-colors relative group">

            {/* Delete Button (Always Visible) */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="absolute top-2 right-2 z-20 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Video"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>

            <div className="aspect-[9/16] bg-black flex items-center justify-center relative">
                {video.url ? (
                    video.url.includes('placeholder') ? (
                        <>
                            <img
                                src={video.url}
                                alt="Mock Video Preview"
                                className="w-full h-full object-cover opacity-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-page px-3 py-1 rounded text-xs text-theme-secondary">Mock Preview (Not Playable)</span>
                            </div>
                        </>
                    ) : playError ? (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                            <div className="text-4xl mb-2">⚠️</div>
                            <p className="text-xs text-red-400 font-bold">Video File Not Found</p>
                            <p className="text-[10px] text-theme-secondary mt-1">This demo video might only be available locally.</p>
                        </div>
                    ) : (
                        <video
                            src={video.url}
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                            playsInline
                            onError={() => setPlayError(true)}
                        />
                    )
                ) : (
                    <div className="text-theme-secondary text-sm flex flex-col items-center w-full px-6">
                        {video.status === 'processing' ? (
                            <div className="w-full">
                                <div className="flex justify-between text-xs text-purple-400 mb-2">
                                    <span>Creating Video...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-purple-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <span>Processing Failed</span>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-theme-secondary font-mono" title={video.id}>ID: {video.id.substring(0, 8)}...</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${video.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        video.status === 'processing' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {video.status}
                    </span>
                </div>
                <p className="text-xs text-theme-secondary">
                    {new Date(video.createdAt).toLocaleDateString()} {new Date(video.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {/* Download Button for Completed */}
                {video.status === 'completed' && !video.url?.includes('placeholder') && !playError && (
                    <a
                        href={video.url}
                        download
                        target="_blank"
                        className="mt-3 block w-full py-2 bg-card-hover hover:bg-card-theme border border-theme rounded text-center text-xs font-bold text-theme-secondary hover:text-theme-primary transition-colors"
                    >
                        Download Video
                    </a>
                )}
            </div>
        </div>
    );
}
