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
        gradient: "from-orange-500 to-red-600",
    },
    {
        id: 2,
        title: "AI Problems Solved",
        category: "Tech",
        views: "2.4M",
        src: "/videos/3 AI Problems Experts Can't Solve.mp4",
        gradient: "from-blue-600 to-purple-600",
    },
    {
        id: 3,
        title: "GPT Paradigm Shift",
        category: "Education",
        views: "850K",
        src: "/videos/90c46bd8d1b34585a2804ec8bcf96016.mp4",
        gradient: "from-emerald-500 to-teal-700",
    },
    {
        id: 4,
        title: "Neural Dynamics",
        category: "Research",
        views: "3.1M",
        src: "/videos/94787b5dbb00431ead061c5173c2dc89.mp4",
        gradient: "from-zinc-700 to-zinc-900",
    },
    {
        id: 5,
        title: "Automated Workflow",
        category: "Productivity",
        views: "500K",
        src: "/videos/VIDEO-2025-12-26-23-20-56.mp4",
        gradient: "from-indigo-600 to-blue-800",
    },
    {
        id: 6,
        title: "The Visionary Edge",
        category: "Creative",
        views: "4.2M",
        src: "/videos/bj.mp4",
        gradient: "from-orange-600 to-yellow-500",
    },
    {
        id: 7,
        title: "Digital Synthesis",
        category: "Art",
        views: "920K",
        src: "/videos/e2d29b39765947e78f73d139cdf18c57.mp4",
        gradient: "from-pink-600 to-rose-700",
    },
    {
        id: 8,
        title: "NYX Product Demo",
        category: "Product",
        views: "1.8M",
        src: "/videos/preview_video_target (1).mp4",
        gradient: "from-cyan-500 to-blue-600",
    }
];

export default function VideoCarousel() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <section className="py-20 relative z-10 overflow-hidden bg-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <span className="text-orange-500 text-xs font-black uppercase tracking-widest">Showcase</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-6 text-white uppercase tracking-tighter condensed">Created with NYX</h2>
                <p className="text-theme-secondary max-w-2xl mx-auto text-lg">Pushing the boundaries of what's possible with AI-driven content generation. High-fidelity visuals, zero effort.</p>
            </div>

            {/* Carousel Container */}
            <div className="w-full overflow-hidden relative">
                <div className="flex gap-8 animate-marquee hover:[animation-play-state:paused]">
                    {[
                        ...Array(4).fill(DEMO_VIDEOS).flat()
                    ].map((video, index) => (
                        <div
                            key={`${video.id}-${index}`}
                            className="flex-shrink-0 w-72 md:w-[400px] h-[450px] md:h-[600px] bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/50 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(249,115,22,0.15)] relative"
                        >
                            {/* Video Background */}
                            <div className="absolute inset-0 z-0">
                                <video 
                                    src={video.src}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700 grayscale-[50%] group-hover:grayscale-0 scale-105 group-hover:scale-100 transition-transform duration-1000"
                                    muted
                                    loop
                                    playsInline
                                    onMouseOver={(e) => e.currentTarget.play()}
                                    onMouseOut={(e) => {
                                        e.currentTarget.pause();
                                        e.currentTarget.currentTime = 0;
                                    }}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80`} />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 z-10 p-8 md:p-10 flex flex-col justify-end">
                                {/* Play Button Accent */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110">
                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                </div>

                                <div className="relative transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-orange-600 text-[10px] font-black text-white uppercase tracking-widest mb-4">
                                        {video.category}
                                    </span>
                                    <h3 className="text-3xl md:text-4xl font-black text-white leading-[1.1] mb-4 condensed uppercase group-hover:text-orange-100 transition-colors">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800 bg-gradient-to-br from-zinc-700 to-zinc-900" />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-widest">
                                            {video.views} Views
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Hover Border Glow */}
                            <div className="absolute inset-0 border-2 border-orange-500/0 rounded-[2.5rem] group-hover:border-orange-500/50 transition-all duration-700 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

