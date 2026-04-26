'use client';

import { useState, useEffect } from 'react';
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
        <section className="py-[120px] relative z-10 overflow-hidden bg-black border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 mb-20 text-center">
                <div className="inline-block mb-4">
                    <span className="text-[#F97316] text-[11px] font-semibold uppercase tracking-[0.1em]">Showcase</span>
                </div>
                <h2 className="text-[clamp(32px,8vw,72px)] font-extrabold mb-6 text-white uppercase tracking-tighter condensed">Created with NYX</h2>
                <p className="text-[#A1A1AA] max-w-2xl mx-auto text-[clamp(16px,2vw,20px)] font-medium leading-relaxed">Pushing the boundaries of what&apos;s possible with AI-driven content generation. High-fidelity visuals, zero effort.</p>
            </div>

            {/* Carousel Container */}
            <div className="w-full overflow-hidden relative group/carousel">
                {/* Fade Gradients */}
                <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

                <div className="flex gap-5 animate-marquee hover:[animation-play-state:paused] py-5 px-6 md:px-[10vw]">
                    {[
                        ...Array(4).fill(DEMO_VIDEOS).flat()
                    ].map((video, index) => (
                        <div
                            key={`${video.id}-${index}`}
                            onClick={() => setSelectedVideo(video)}
                            className={`flex-shrink-0 w-[240px] md:w-[315px] aspect-[9/16] bg-gradient-to-br ${video.gradient} border border-white/10 rounded-[16px] overflow-hidden group cursor-pointer hover:border-[#F97316] hover:scale-[1.03] transition-all duration-[300ms] ease-in-out relative`}
                        >
                            {/* Video Background */}
                            <div className="absolute inset-0 z-0">
                                <video 
                                    src={encodeURI(video.src)}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000 grayscale-[30%] group-hover:grayscale-0 transition-transform duration-1000"
                                    muted
                                    loop
                                    playsInline
                                    autoPlay
                                    preload="auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
                            </div>

                            {/* Badges container - fixed height to align content below */}
                            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 h-[24px]">
                                {video.trending ? (
                                    <div className="flex items-center gap-1 px-[10px] py-[4px] rounded-full bg-[#F97316] shadow-lg">
                                        <TrendingUp className="w-3 h-3 text-[#000000]" />
                                        <span className="text-[11px] font-bold text-[#000000] uppercase tracking-[0.05em]">Trending</span>
                                    </div>
                                ) : (
                                    <div className="h-[24px]" /> 
                                )}
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 z-10 p-6 md:p-8 flex flex-col justify-end">
                                {/* Play Button Accent */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110 shadow-2xl">
                                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                </div>

                                <div className="relative">
                                    <span className="inline-flex items-center gap-1 px-[10px] py-[4px] rounded-full bg-[#F97316] text-[11px] font-bold text-[#000000] uppercase tracking-[0.05em] mb-3 shadow-lg">
                                        <Zap className="w-2.5 h-2.5 fill-[#000000]" />
                                        {video.category}
                                    </span>
                                    <h3 className="text-lg md:text-xl font-bold text-white leading-[0.95] mb-3 condensed uppercase">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-3">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border border-black bg-zinc-800 bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-xl" />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">
                                            {video.views} Views
                                        </span>
                                    </div>
                                </div>
                            </div>
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
