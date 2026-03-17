'use client';

import Link from 'next/link';
import { Mail, Instagram, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen text-theme-primary bg-page flex flex-col items-center justify-center p-4 sm:p-8 relative">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors z-10">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
            </Link>

            <div className="max-w-2xl w-full bg-card-theme border-theme p-10 md:p-16 rounded-3xl shadow-glow-nav text-center relative overflow-hidden mt-16 md:mt-0">
                {/* Decorative background gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
                
                <div className="mb-8 flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md shadow-glow-white-small">
                        <span className="text-white font-extrabold text-2xl">N</span>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-theme-primary tracking-tight">
                    Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Touch</span>
                </h1>
                
                <p className="text-theme-secondary mb-12 text-lg">
                    Have questions or want to collaborate? Reach out to us through our official channels below.
                </p>

                <div className="flex flex-col gap-6 items-center">
                    <a 
                        href="mailto:nyx.studios.ai@gmail.com" 
                        className="flex items-center gap-6 p-6 w-full bg-page border border-white/5 hover:border-purple-500/30 rounded-2xl group transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:-translate-y-1"
                    >
                        <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform flex-shrink-0">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-medium text-theme-secondary mb-1">Email Us</h3>
                            <p className="text-lg font-bold text-theme-primary truncate">nyx.studios.ai@gmail.com</p>
                        </div>
                    </a>

                    <a 
                        href="https://www.instagram.com/nyx.studios.ai/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-6 p-6 w-full bg-page border border-white/5 hover:border-pink-500/30 rounded-2xl group transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:-translate-y-1"
                    >
                        <div className="w-14 h-14 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform flex-shrink-0">
                            <Instagram className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-medium text-theme-secondary mb-1">Follow us on Instagram</h3>
                            <p className="text-lg font-bold text-theme-primary truncate">@nyx.studios.ai</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
