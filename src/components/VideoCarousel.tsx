'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

const DEMO_VIDEOS = [
    {
        id: 1,
        title: "Viral News Explainer",
        category: "News",
        views: "1.2M",
        src: "/videos/loading-background.mp4", // Using existing placeholder for safety
        poster: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80"
    },
    {
        id: 2,
        title: "Tech Product Review",
        category: "Tech",
        views: "850K",
        src: "/videos/loading-background.mp4",
        poster: "https://images.unsplash.com/photo-1526406915894-7bcd43f6245d?w=800&q=80"
    },
    {
        id: 3,
        title: "Motivational Speech",
        category: "Lifestyle",
        views: "2.4M",
        src: "/videos/loading-background.mp4",
        poster: "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80"
    },
    {
        id: 4,
        title: "Daily Vlog Recap",
        category: "Vlog",
        views: "500K",
        src: "/videos/loading-background.mp4",
        poster: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80"
    }
];

export default function VideoCarousel() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <section className="py-20 relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Made with NYX</h2>
                <p className="text-gray-400">See what creators are generating right now.</p>
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 px-4 sm:px-6 lg:px-8 pb-8 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {DEMO_VIDEOS.map((video) => (
                    <div
                        key={video.id}
                        className="flex-shrink-0 w-[280px] sm:w-[320px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden snap-center group hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                    >
                        <div className="relative aspect-[9/16] bg-black">
                            <img
                                src={video.poster}
                                alt={video.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                <button className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:scale-110 transition-transform">
                                    <Play className="w-8 h-8 text-white fill-white" />
                                </button>
                            </div>

                            {/* Overlay Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-12">
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 block">{video.category}</span>
                                <h3 className="text-lg font-bold text-white leading-tight mb-2">{video.title}</h3>
                                <div className="flex items-center text-xs text-gray-400">
                                    <span>👁️ {video.views} views</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* CTA Card */}
                <div className="flex-shrink-0 w-[280px] sm:w-[320px] bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl overflow-hidden snap-center flex flex-col items-center justify-center p-8 text-center group hover:border-purple-500 transition-colors">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Your Turn</h3>
                    <p className="text-gray-400 mb-8">Join thousands of creators automating their content.</p>
                    <Link href="/signup" className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors w-full">
                        Start Creating
                    </Link>
                </div>
            </div>
        </section>
    );
}
