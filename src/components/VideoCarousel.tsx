'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, X } from 'lucide-react';

const DEMO_VIDEOS = [
    {
        id: 1,
        title: "AI News Update",
        category: "News",
        views: "1.2M",
        src: "/videos/12bcf38cae1c4466ae4f55ae6d41898b.mp4#t=0.001",
    },
    {
        id: 2,
        title: "Unsolved AI Problems",
        category: "Tech",
        views: "2.4M",
        src: "/videos/3 AI Problems Experts Can't Solve.mp4#t=0.001",
    },
    {
        id: 3,
        title: "Future of Coding",
        category: "Education",
        views: "850K",
        src: "/videos/90c46bd8d1b34585a2804ec8bcf96016.mp4#t=0.001",
    },
    {
        id: 4,
        title: "Robotics Revolution",
        category: "Tech",
        views: "3.1M",
        src: "/videos/94787b5dbb00431ead061c5173c2dc89.mp4#t=0.001",
    },
    {
        id: 5,
        title: "Daily Tech Vlog",
        category: "Vlog",
        views: "500K",
        src: "/videos/VIDEO-2025-12-26-23-20-56.mp4#t=0.001",
    },
    {
        id: 6,
        title: "Short & Sweet",
        category: "Shorts",
        views: "4.2M",
        src: "/videos/bj.mp4#t=0.001",
    },
    {
        id: 7,
        title: "Creative Coding",
        category: "Art",
        views: "920K",
        src: "/videos/e2d29b39765947e78f73d139cdf18c57.mp4#t=0.001",
    },
    {
        id: 8,
        title: "Product Showcase",
        category: "Product",
        views: "1.8M",
        src: "/videos/preview_video_target (1).mp4#t=0.001",
    }
];

function VideoCard({ video, onSelect }: { video: typeof DEMO_VIDEOS[0], onSelect: (v: typeof DEMO_VIDEOS[0]) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => { });
            setIsPlaying(true);
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            // Always reset to muted on leave? Or keep user preference? 
            // Usually good to reset for list views to avoid surprise noise later.
            videoRef.current.muted = true;
            setIsMuted(true);
            setIsPlaying(false);
        }
    };

    return (
        <div
            className="flex-shrink-0 w-card-mobile sm:w-card-desktop bg-card-theme border border-theme rounded-2xl overflow-hidden snap-center group hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] cursor-pointer relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onSelect(video)}
        >
            <div className="relative aspect-9-16 bg-gray-900 w-full h-full">
                <video
                    ref={videoRef}
                    src={video.src}
                    muted={isMuted}
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Mute Button */}
                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={toggleMute}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/10"
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                </div>

                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 block">{video.category}</span>
                    <h3 className="text-lg font-bold text-white leading-tight mb-2 drop-shadow-md">{video.title}</h3>
                    <div className="flex items-center text-xs text-gray-300">
                        <span>👁️ {video.views} views</span>
                    </div>
                </div>

                {/* Play Icon Overlay (Initially Visible, fades on hover) */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Play className="w-5 h-5 text-white fill-white ml-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function VideoModal({ video, onClose }: { video: typeof DEMO_VIDEOS[0], onClose: () => void }) {
    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[110]"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <video
                    src={video.src}
                    autoPlay
                    controls
                    className="w-full h-full object-contain"
                />
            </div>
        </div>
    );
}

export default function VideoCarousel() {
    const [selectedVideo, setSelectedVideo] = useState<typeof DEMO_VIDEOS[0] | null>(null);

    return (
        <section className="py-20 relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-theme-primary">Made with NYX</h2>
                <p className="text-theme-secondary">See what creators are generating right now.</p>
            </div>

            {/* Carousel Container */}
            <div className="w-full overflow-hidden relative">
                <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused]">
                    {[
                        ...Array(4).fill(DEMO_VIDEOS).flat()
                    ].map((video, index) => (
                        <VideoCard
                            key={`${video.id}-${index}`}
                            video={video}
                            onSelect={setSelectedVideo}
                        />
                    ))}
                </div>
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
            )}
        </section>
    );
}
