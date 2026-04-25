"use client";

import React, { useState, useEffect } from "react";

export function WorkGrid() {
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    const openVideo = (src: string) => {
        setActiveVideo(src);
    };

    const closeVideo = () => {
        setActiveVideo(null);
    };

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeVideo();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[minmax(300px,auto)]">
                {/* Project 01 */}
                <div 
                    onClick={() => openVideo("/videos/dessertino_happiness.mp4")}
                    className="bento-card md:col-span-8 group relative overflow-hidden bento-border bg-[#1c1b1b] transition-all duration-300 hover:bg-[#ffb4a2] cursor-pointer"
                >
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <span className="bg-black text-white px-3 py-1 font-label text-xs uppercase">* EDITORIAL DESIGN</span>
                    </div>
                    <div className="h-full w-full min-h-[500px] flex flex-col md:flex-row pointer-events-none">
                        <div className="md:w-1/2 p-12 flex flex-col justify-between">
                            <div>
                                <span className="font-headline text-6xl text-[#E8441A] group-hover:text-black transition-colors">01</span>
                                <h2 className="font-headline text-5xl font-bold uppercase mt-4 group-hover:text-black transition-colors">DESSERTINO HAPPINESS</h2>
                            </div>
                            <p className="font-body text-lg max-w-xs group-hover:text-black/80 transition-colors">A delightful exploration of sweetness and joy.</p>
                        </div>
                        <div className="md:w-1/2 bg-black relative overflow-hidden">
                            <video autoPlay loop muted playsInline className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700">
                                <source src="/videos/dessertino_happiness.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                    <div className="absolute top-1/2 right-1/4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 scale-50 group-hover:scale-100">
                        <span className="material-symbols-outlined text-8xl text-white drop-shadow-xl">play_circle</span>
                    </div>
                </div>

                {/* Project 02 */}
                <div 
                    onClick={() => openVideo("/videos/mango_jungle.mp4")}
                    className="bento-card md:col-span-4 group relative overflow-hidden bento-border bg-[#2a2a2a] transition-all duration-300 hover:bg-[#ffd65b] cursor-pointer"
                >
                    <div className="p-8 h-full flex flex-col pointer-events-none">
                        <div className="mb-8">
                            <span className="bg-black text-white px-3 py-1 font-label text-xs uppercase">* DIGITAL PRODUCT</span>
                        </div>
                        <div className="flex-grow">
                            <span className="font-headline text-4xl text-[#F5C518] group-hover:text-black">02</span>
                            <h2 className="font-headline text-4xl font-bold uppercase mt-2 group-hover:text-black">MANGO JUNGLE</h2>
                        </div>
                        <div className="mt-8 border-t-4 border-black pt-4 group-hover:border-black/20">
                            <video autoPlay loop muted playsInline className="w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-500">
                                <source src="/videos/mango_jungle.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                    <div className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 scale-50 group-hover:scale-100">
                        <span className="material-symbols-outlined text-8xl text-white drop-shadow-xl">play_circle</span>
                    </div>
                </div>

                {/* Project 03 */}
                <div 
                    onClick={() => openVideo("/videos/mango_shower_dessertino.mp4")}
                    className="bento-card md:col-span-5 group relative overflow-hidden bento-border bg-[#0e0e0e] transition-all duration-300 hover:bg-[#3da452] cursor-pointer"
                >
                    <div className="h-full flex flex-col pointer-events-none">
                        <div className="relative h-64 overflow-hidden">
                            <video autoPlay loop muted playsInline className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-125 group-hover:scale-100">
                                <source src="/videos/mango_shower_dessertino.mp4" type="video/mp4" />
                            </video>
                        </div>
                        <div className="p-8 flex-grow flex flex-col justify-between">
                            <div>
                                <span className="font-headline text-4xl text-[#76dc83] group-hover:text-white">03</span>
                                <h2 className="font-headline text-4xl font-bold uppercase mt-2 group-hover:text-white">MANGO SHOWER</h2>
                            </div>
                            <div className="mt-4">
                                <span className="font-label text-xs uppercase text-stone-500 group-hover:text-white/70 tracking-widest">* ART DIRECTION</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-32 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 scale-50 group-hover:scale-100">
                        <span className="material-symbols-outlined text-8xl text-white drop-shadow-xl">play_circle</span>
                    </div>
                </div>

                {/* Project 04 */}
                <div 
                    onClick={() => openVideo("/videos/brioso_unboxing.mp4")}
                    className="bento-card md:col-span-7 group relative overflow-hidden bento-border bg-black transition-all duration-300 hover:invert cursor-pointer"
                >
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                            <source src="/videos/brioso_unboxing.mp4" type="video/mp4" />
                        </video>
                    </div>
                    <div className="relative z-10 p-12 h-full flex flex-col justify-center items-center text-center pointer-events-none">
                        <span className="font-headline text-9xl text-white drop-shadow-2xl">04</span>
                        <h2 className="font-headline text-6xl font-black uppercase mt-4 text-white">BRIOSO UNBOXING</h2>
                        <p className="font-body text-white/60 mt-6 max-w-md tracking-wider uppercase text-sm">Experience the reveal and product details.</p>
                        <div className="mt-12">
                            <button 
                                onClick={(e) => { e.stopPropagation(); openVideo('/videos/brioso_unboxing.mp4'); }}
                                className="border-4 border-white text-white px-10 py-4 font-headline font-bold uppercase hover:bg-white hover:text-black transition-all pointer-events-auto flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">play_arrow</span> WATCH FULL VIDEO
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Modal Player */}
            {activeVideo && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-500 ease-out p-4 md:p-8"
                    onClick={closeVideo}
                >
                    {/* Close Button */}
                    <button 
                        onClick={closeVideo}
                        className="absolute top-6 right-6 md:top-10 md:right-10 z-[110] p-4 text-white hover:text-[#F5C518] hover:scale-110 transition-all bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20"
                    >
                        <span className="material-symbols-outlined text-3xl md:text-4xl">close</span>
                    </button>

                    {/* Video Container */}
                    <div 
                        className="relative w-full max-w-7xl aspect-video rounded-xl md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 bg-black animate-in zoom-in-95 duration-500"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
                    >
                        <video 
                            src={activeVideo} 
                            autoPlay 
                            controls 
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
