'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

const DEMO_VIDEOS = [
    {
        id: 1,
        title: "Strategic AI Insights",
        category: "Business",
        views: "1.2M",
        src: "/videos/12bcf38cae1c4466ae4f55ae6d41898b.mp4",
        gradient: "from-orange-600 to-red-600",
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <section className="py-24 relative z-10 overflow-hidden bg-black/40 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">Showcase</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-6 text-white uppercase tracking-tighter condensed">Created with NYX</h2>
                <p className="text-theme-secondary max-w-2xl mx-auto text-lg md:text-xl font-medium">Pushing the boundaries of what's possible with AI-driven content generation. High-fidelity visuals, zero effort.</p>
            </div>

            {/* Carousel Container */}
            <div className="w-full overflow-hidden relative">
                {/* Fade Gradients */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

                <div className="flex gap-10 animate-marquee hover:[animation-play-state:paused] py-10">
                    {[
                        ...Array(4).fill(DEMO_VIDEOS).flat()
                    ].map((video, index) => (
                        <div
                            key={`${video.id}-${index}`}
                            className={`flex-shrink-0 w-[300px] md:w-[450px] h-[550px] md:h-[700px] bg-gradient-to-br ${video.gradient} border border-white/10 rounded-[3rem] overflow-hidden group hover:border-orange-500/50 transition-all duration-700 hover:-translate-y-6 hover:shadow-[0_30px_60px_rgba(249,115,22,0.25)] relative`}
                        >
                            {/* Video Background */}
                            <div className="absolute inset-0 z-0">
                                <video 
                                    src={encodeURI(video.src)}
                                    className="w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-1000 grayscale-[50%] group-hover:grayscale-0 scale-110 group-hover:scale-100 transition-transform duration-1000"
                                    muted
                                    loop
                                    playsInline
                                    onMouseOver={(e) => {
                                        const playPromise = e.currentTarget.play();
                                        if (playPromise !== undefined) {
                                            playPromise.catch(() => { /* Auto-play was prevented */ });
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.pause();
                                        e.currentTarget.currentTime = 0;
                                    }}
                                />
                                {/* Overlay to ensure text readability even with white videos */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 z-10 p-10 md:p-12 flex flex-col justify-end">
                                {/* Play Button Accent */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125">
                                    <Play className="w-10 h-10 text-white fill-white ml-1.5" />
                                </div>

                                <div className="relative transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                                    <span className="inline-block px-5 py-2 rounded-full bg-orange-600 text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 shadow-lg shadow-orange-600/20">
                                        {video.category}
                                    </span>
                                    <h3 className="text-4xl md:text-5xl font-black text-white leading-[1] mb-6 condensed uppercase group-hover:text-orange-50 group-hover:tracking-tight transition-all">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-3">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-xl" />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2.5 text-white/50 text-[11px] font-black uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                            {video.views} Views
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Hover Inner Border */}
                            <div className="absolute inset-0 border-[3px] border-orange-500/0 rounded-[3rem] group-hover:border-orange-500/30 transition-all duration-700 pointer-events-none m-2" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


