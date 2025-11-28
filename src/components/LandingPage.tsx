'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import ThreeBackground from './ThreeBackground';
import gsap from 'gsap';
import { Zap, Bot, Rocket, Check, Users, Linkedin, Twitter } from 'lucide-react';

export default function LandingPage() {
    const heroRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (titleRef.current && subtitleRef.current && ctaRef.current) {
            tl.fromTo(titleRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
                .fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=0.5')
                .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5');
        }
    }, []);

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            <ThreeBackground />

            {/* Hero Section */}
            <section ref={heroRef} className="relative flex flex-col items-center justify-center text-center z-10 min-h-screen px-6 sm:px-8 lg:px-12">
                <div className="max-w-5xl mx-auto -mt-20">
                    <h1 ref={titleRef} className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-300 drop-shadow-2xl leading-tight">
                        Automate Your <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Content Empire</span>
                    </h1>
                    <p ref={subtitleRef} className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                        Generate viral ideas, write scripts, and produce <span className="text-white font-medium">AI-narrated videos</span> in minutes.
                        The all-in-one engine for modern creators.
                    </p>
                    <div ref={ctaRef} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <Link href="/signup" className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-bold text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden ring-1 ring-white/20">
                            <span className="relative z-10 flex items-center gap-2">
                                Start Free <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                        <Link href="#how-it-works" className="group px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-lg font-medium transition-all flex items-center justify-center gap-2 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                            See How It Works
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Everything You Need to Scale</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Trend-Aware Ideation',
                                desc: 'AI analyzes your niche to generate viral hooks and video concepts.',
                                icon: <Zap className="w-10 h-10 text-yellow-400" />,
                            },
                            {
                                title: 'AI Avatar & Voice',
                                desc: 'Clone yourself or use premium avatars to present your content.',
                                icon: <Bot className="w-10 h-10 text-purple-400" />,
                            },
                            {
                                title: 'Auto-Publishing',
                                desc: 'Schedule and post directly to Instagram, TikTok, and YouTube.',
                                icon: <Rocket className="w-10 h-10 text-pink-400" />,
                            },
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-2 group">
                                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 bg-black/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">Meet the Founders</h2>
                    <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
                        The visionaries behind the next generation of content automation.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: 'Atharv Paharia', role: 'Co-Founder & Tech Lead' },
                            { name: 'Bhavya Jain', role: 'Co-Founder & Product' },
                            { name: 'Khyati Kapil', role: 'Co-Founder & Design' },
                            { name: 'Abhey Dua', role: 'Co-Founder & Operations' },
                        ].map((founder, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all text-center group">
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold shadow-lg group-hover:scale-105 transition-transform">
                                    {founder.name[0]}
                                </div>
                                <h3 className="text-xl font-bold mb-1">{founder.name}</h3>
                                <p className="text-purple-400 text-sm mb-4">{founder.role}</p>
                                <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Linkedin className="w-4 h-4" /></button>
                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Twitter className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Starter', price: '$0', features: ['5 Scripts/mo', 'Basic Analysis', '1 Avatar'] },
                            { name: 'Pro', price: '$29', features: ['Unlimited Scripts', 'Deep Analysis', 'Custom Avatar', 'Priority Support'], popular: true },
                            { name: 'Agency', price: '$99', features: ['Multiple Brands', 'API Access', 'White Label', 'Dedicated Manager'] },
                        ].map((plan, i) => (
                            <div key={i} className={`relative p-8 rounded-2xl border backdrop-blur-md transition-all ${plan.popular ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-105' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-sm font-bold">Most Popular</span>}
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-400 font-normal">/mo</span></div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center text-gray-300">
                                            <Check className="w-5 h-5 mr-3 text-green-400" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/10 hover:bg-white/20'}`}>
                                    Choose {plan.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
