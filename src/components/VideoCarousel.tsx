'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

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

export default function VideoCarousel() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <section className="py-20 relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-theme-primary">Made with NYX</h2>
                <p className="text-theme-secondary">See what creators are generating right now.</p>
            </div>

            {/* Carousel Container */}
            <div className="w-full overflow-hidden relative">
                <div className="flex gap-6 animate-marquee">
                    {[
                        ...Array(4).fill(DEMO_VIDEOS).flat()
                    ].map((video, index) => (
                        <div
                            key={`${video.id}-${index}`}
                            className="flex-shrink-0 w-card-mobile sm:w-card-desktop bg-card-theme border border-theme rounded-2xl overflow-hidden snap-center group hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                        >
                            <div className="relative aspect-9-16 bg-black w-full h-full">
                                <video
                                    src={video.src}
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onMouseEnter={(e) => e.currentTarget.play()}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.pause();
                                        e.currentTarget.currentTime = 0;
                                    }}
                                />

                                {/* Overlay Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 block">{video.category}</span>
                                    <h3 className="text-lg font-bold text-white leading-tight mb-2 drop-shadow-md">{video.title}</h3>
                                    <div className="flex items-center text-xs text-gray-300">
                                        <span>👁️ {video.views} views</span>
                                    </div>
                                </div>

                                {/* Play Icon Overlay (Initially Visible) */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                        <Play className="w-5 h-5 text-white fill-white ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
