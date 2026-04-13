'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, X, TrendingUp, Zap } from 'lucide-react';

const DEMO_VIDEOS = [
    {
        id: 1,
        title: "Strategic AI Insights",
        category: "Business",
        views: "1.2M",
        src: "/videos/12bcf38cae1c4466ae4f55ae6d41898b.mp4",
        gradient: "from-orange-600 to-red-600",
        trending: true,
    },
    {
        id: 2,
        title: "AI Problems Solved",
        category: "Tech",
        views: "2.4M",
        src: "/videos/3 AI Problems Experts Can't Solve.mp4",
        gradient: "from-blue-600 to-indigo-700",
    },
    {
        id: 3,
        title: "GPT Paradigm Shift",
        category: "Education",
        views: "850K",
        src: "/videos/90c46bd8d1b34585a2804ec8bcf96016.mp4",
        gradient: "from-emerald-600 to-teal-800",
    },
    {
        id: 4,
        title: "Neural Dynamics",
        category: "Research",
        views: "3.1M",
        src: "/videos/94787b5dbb00431ead061c5173c2dc89.mp4",
        gradient: "from-zinc-800 to-zinc-950",
    },
    {
        id: 5,
        title: "Automated Workflow",
        category: "Productivity",
        views: "500K",
        src: "/videos/VIDEO-2025-12-26-23-20-56.mp4",
        gradient: "from-indigo-600 to-purple-800",
    },
    {
        id: 6,
        title: "The Visionary Edge",
        category: "Creative",
        views: "4.2M",
        src: "/videos/bj.mp4",
        gradient: "from-orange-500 to-yellow-600",
        trending: true,
    },
    {
        id: 7,
        title: "Digital Synthesis",
        category: "Art",
        views: "920K",
        src: "/videos/e2d29b39765947e78f73d139cdf18c57.mp4",
        gradient: "from-rose-600 to-pink-800",
    },
    {
        id: 8,
        title: "NYX Product Demo",
        category: "Product",
        views: "1.8M",
        src: "/videos/preview_video_target (1).mp4",
        gradient: "from-cyan-600 to-blue-800",
    }
];

export default function VideoCarousel() {
    const [selectedVideo, setSelectedVideo] = useState<typeof DEMO_VIDEOS[0] | null>(null);

    // Close modal on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedVideo(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <section className="py-24 relative z-10 overflow-hidden bg-black/40 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">Showcase</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-6 text-white uppercase tracking-tighter condensed">Created with NYX</h2>
                <p className="text-theme-secondary max-w-2xl mx-auto text-lg md:text-xl font-medium">Pushing the boundaries of what&apos;s possible with AI-driven content generation. High-fidelity visuals, zero effort.</p>
            </div>

            {/* Carousel Container */}
            <div className="w-full overflow-hidden relative group/carousel">
                {/* Fade Gradients */}
                <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

                <div className="flex gap-10 animate-marquee hover:[animation-play-state:paused] py-10 px-[10vw]">
                    {[
                        ...Array(4).fill(DEMO_VIDEOS).flat()
                    ].map((video, index) => (
                        <div
                            key={`${video.id}-${index}`}
                            onClick={() => setSelectedVideo(video)}
                            className={`flex-shrink-0 w-[280px] md:w-[315px] h-[497px] md:h-[560px] bg-gradient-to-br ${video.gradient} border border-white/10 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:border-orange-500/50 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(249,115,22,0.3)] relative`}
                        >
                            {/* Video Background */}
                            <div className="absolute inset-0 z-0">
                                <video 
                                    src={encodeURI(video.src)}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000 grayscale-[30%] group-hover:grayscale-0 scale-110 group-hover:scale-100 transition-transform duration-1000"
                                    muted
                                    loop
                                    playsInline
                                    autoPlay
                                    preload="auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
                            </div>

                            {/* Badges */}
                            <div className="absolute top-8 left-8 z-20 flex flex-col gap-2">
                                {video.trending && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-600/90 backdrop-blur-md border border-white/10 animate-pulse">
                                        <TrendingUp className="w-3 h-3 text-white" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Trending</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 z-10 p-8 md:p-10 flex flex-col justify-end">
                                {/* Play Button Accent */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110 shadow-2xl">
                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                </div>

                                <div className="relative transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-600 text-[9px] font-black text-white uppercase tracking-[0.2em] mb-4 shadow-xl shadow-orange-600/20">
                                        <Zap className="w-2.5 h-2.5 fill-white" />
                                        {video.category}
                                    </span>
                                    <h3 className="text-xl md:text-2xl font-black text-white leading-[0.95] mb-4 condensed uppercase group-hover:text-orange-50 transition-all">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-3">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-2xl" />
                                            ))}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest">
                                                {video.views} Views
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Interactive Glow */}
                            <div className="absolute inset-0 border-[4px] border-orange-500/0 rounded-[3rem] group-hover:border-orange-500/20 transition-all duration-700 pointer-events-none m-3" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Cinema Mode Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                    <div 
                        className="absolute inset-0 bg-black/98 backdrop-blur-3xl"
                        onClick={() => setSelectedVideo(null)}
                    />
                    
                    <div className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center overflow-hidden">
                        {/* 9:16 Video Container (Flexible) */}
                        <div className="relative h-full w-auto max-w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(249,115,22,0.3)] border border-white/10 group/modal bg-zinc-950 flex items-center justify-center">
                            <video 
                                src={encodeURI(selectedVideo.src)}
                                className="max-h-[90vh] w-auto transition-all"
                                autoPlay
                                controls
                                playsInline
                            />
                            
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVideo(null);
                                }}
                                className="absolute top-6 right-6 p-4 rounded-full bg-black/50 backdrop-blur-xl text-white border border-white/10 hover:bg-orange-600 hover:border-orange-500 transition-all z-50 group-hover/modal:scale-110"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="absolute bottom-10 left-10 right-10 pointer-events-none opacity-0 group-hover/modal:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-[3rem]">
                                <h3 className="text-2xl font-black text-white uppercase condensed mb-1">{selectedVideo.title}</h3>
                                <p className="text-orange-500 font-bold uppercase tracking-widest text-xs">AI GENERATED • {selectedVideo.category}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
