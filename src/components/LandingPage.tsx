'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThreeBackground from './ThreeBackground';
import VideoCarousel from './VideoCarousel';
import gsap from 'gsap';
import { Zap, Bot, Rocket, Check, Linkedin, Instagram, Menu, X, LogOut, ArrowRight, Globe, ArrowUpRight } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function LandingPage() {
    const { data: session } = useSession();
    const heroRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (titleRef.current && subtitleRef.current && ctaRef.current) {
            tl.fromTo(titleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
                .fromTo(subtitleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=0.5')
                .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5');
        }
    }, []);

    return (
        <div className="min-h-screen text-theme-primary overflow-hidden relative bg-transparent transition-colors duration-300">
            <ThreeBackground />

            {/* Floating Navbar */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
                <div className="w-full max-w-5xl header-bg-theme backdrop-blur-md rounded-full shadow-2xl px-2 py-2 flex items-center justify-between transition-all duration-300 shadow-glow-nav">

                    {/* Left Section: Logo */}
                    <Link href="/" className="flex items-center gap-3 pl-4 group hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-glow-white-small">
                            <span className="text-white font-extrabold text-sm">N</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-theme-primary hidden sm:block">NYX</span>
                    </Link>

                    {/* Center Section: Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors">
                            How it Works
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors">
                            Pricing
                        </Link>
                    </div>

                    {/* Right Section: Auth & Actions */}
                    <div className="flex items-center gap-3 pr-1">
                        <ThemeToggle />
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors rounded-full hover:bg-card-hover">
                            <Globe className="w-4 h-4" />
                            <span className="text-xs font-semibold">EN</span>
                        </button>

                        <div className="hidden md:block w-px h-5 bg-card-theme" />

                        {session ? (
                            <Link href="/dashboard" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:scale-105 transition-all group">
                                Dashboard
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden md:block text-sm font-bold text-theme-secondary hover:text-theme-primary px-3 transition-colors">
                                    Log In
                                </Link>
                                <Link href="/signup" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:scale-105 transition-all group">
                                    Sign Up
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-theme-secondary hover:text-theme-primary transition-colors focus:outline-none bg-card-theme rounded-full hover:bg-card-hover ml-2"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="absolute top-20 w-full max-w-sm px-4 z-40 animate-in slide-in-from-top-4 fade-in duration-200">
                        <div className="header-bg-theme backdrop-blur-xl border-theme rounded-3xl p-4 flex flex-col gap-2 shadow-2xl mt-4">
                            <Link href="#features" className="text-theme-secondary hover:text-theme-primary px-4 py-3 rounded-xl hover:bg-card-hover transition-colors font-medium text-center">Features</Link>
                            <Link href="#how-it-works" className="text-theme-secondary hover:text-theme-primary px-4 py-3 rounded-xl hover:bg-card-hover transition-colors font-medium text-center">How it Works</Link>
                            <Link href="#pricing" className="text-theme-secondary hover:text-theme-primary px-4 py-3 rounded-xl hover:bg-card-hover transition-colors font-medium text-center">Pricing</Link>
                            <div className="h-px bg-card-theme my-2 mx-4" />
                            {session ? (
                                <>
                                    <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg">
                                        Dashboard <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="text-center w-full px-4 py-3 text-theme-secondary hover:text-theme-primary font-medium hover:bg-card-hover rounded-xl transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 pt-2">
                                    <Link href="/login" className="text-center w-full px-4 py-3 text-theme-secondary font-bold hover:bg-card-hover rounded-xl transition-colors border border-transparent hover:border-theme">
                                        Log In
                                    </Link>
                                    <Link href="/signup" className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg">
                                        Sign Up Free <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-black">
                {/* Massive Background Split Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="w-full flex justify-between px-4 md:px-20 items-center">
                        <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-none text-white/5 select-none condensed">
                            AUTOMATE
                        </h1>
                        <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-none text-white/5 select-none condensed">
                            EMPIRE
                        </h1>
                    </div>
                </div>

                {/* Main Hero Content */}
                <div className="container relative z-10 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 py-20">
                        {/* Left Text */}
                        <div className="flex-1 text-center md:text-left z-20">
                            <h2 ref={titleRef} className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] condensed mb-6 text-white">
                                <span>AUTOMATE</span><br />
                                <span>STRATEGY</span>
                            </h2>
                            <p ref={subtitleRef} className="text-lg md:text-xl text-theme-secondary max-w-sm mb-10 leading-relaxed font-medium">
                                Generate viral ideas, write scripts, and produce <span className="text-theme-primary font-bold">AI videos</span> in minutes.
                            </p>
                            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 items-center md:items-start">
                                <Link href={session ? "/dashboard" : "/signup"} className="px-10 py-4 bg-orange-600 text-white rounded-full text-base font-bold hover:bg-orange-700 transition-all hover:scale-105 shadow-xl shadow-orange-500/20 flex items-center gap-3">
                                    Start Free 🚀
                                </Link>
                                <Link href="#how-it-works" className="px-10 py-4 border border-white/40 bg-white/5 backdrop-blur-md text-white rounded-full text-base font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                                    See How It Works
                                </Link>
                            </div>
                        </div>

                        {/* Center Robot Figure */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl flex items-center justify-center z-10 pointer-events-none">
                            <div className="relative w-full h-full aspect-square">
                                <Image 
                                    src="/hero-ai.png" 
                                    alt="NYX AI Humanoid" 
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Right Text */}
                        <div className="flex-1 text-center md:text-right z-20">
                            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] condensed mb-6">
                                <span className="text-gradient-hero">REAL</span><br />
                                <span className="text-gradient-hero">RESULTS</span>
                            </h2>
                            
                            {/* Floating Stat Card */}
                            <div className="mt-12 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-orange-500/30 transition-all inline-block md:ml-auto">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white condensed">10K+</div>
                                        <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">Videos Generated</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Carousel Showcase */}
            <VideoCarousel />

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-page">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16 tracking-tight">From Idea to Viral in 3 Steps</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) - Centered & Responsive */}
                        <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent z-0"></div>

                        {[
                            {
                                step: '01',
                                title: 'Connect',
                                desc: 'Link your social accounts and define your niche.',
                            },
                            {
                                step: '02',
                                title: 'Customize',
                                desc: 'Keep your own voice or choose a premium AI avatar.',
                            },
                            {
                                step: '03',
                                title: 'Automate',
                                desc: 'Set your schedule and watch the content flow.',
                            },
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                                <div className="w-20 h-20 mb-8 rounded-2xl bg-card-theme border-theme flex items-center justify-center text-2xl font-bold text-theme-primary z-10 backdrop-blur-sm group-hover:scale-105 group-hover:border-orange-400/40 group-hover:bg-card-hover transition-all duration-300">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-theme-primary group-hover:text-orange-500 transition-colors">{item.title}</h3>
                                <p className="text-theme-secondary max-w-xs text-sm leading-relaxed transition-colors">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase mb-4 text-sm">Capabilities</span>
                        <h2 className="text-4xl font-bold tracking-tight text-white uppercase condensed">Everything You Need to Scale</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Trend-Aware Ideation',
                                desc: 'AI analyzes your niche to generate viral hooks and video concepts.',
                                icon: <Zap className="w-6 h-6 text-orange-500" />,
                            },
                            {
                                title: 'AI Avatar & Voice',
                                desc: 'Clone yourself or use premium AI avatars to present your content.',
                                icon: <Bot className="w-6 h-6 text-orange-500" />,
                            },
                            {
                                title: 'Auto-Publishing',
                                desc: 'Schedule and post directly to Instagram, TikTok, and YouTube.',
                                icon: <Rocket className="w-6 h-6 text-orange-500" />,
                            },
                        ].map((feature, i) => (
                            <div key={i} className="p-10 rounded-3xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 hover:border-orange-500/30 transition-all group">
                                <div className="mb-8 w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                                    {React.cloneElement(feature.icon as React.ReactElement, { className: 'w-7 h-7 group-hover:text-black' })}
                                </div>
                                <h3 className="text-2xl font-black mb-4 text-white uppercase condensed">{feature.title}</h3>
                                <p className="text-theme-secondary leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet the Founders */}
            <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-black/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase mb-4 text-sm">Visionaries</span>
                        <h2 className="text-4xl font-bold tracking-tight text-white uppercase condensed">Meet the Founders</h2>
                    </div>
                    <div className="flex flex-wrap justify-center gap-12">
                        {[
                            { 
                                name: 'Atharv Paharia', 
                                role: 'Co-Founder & Tech Lead',
                                linkedin: 'https://www.linkedin.com/in/atharv-paharia-468276272/',
                                instagram: 'https://www.instagram.com/i___am__atharv/',
                                image: '/founders/atharv.jpg'
                            },
                            { 
                                name: 'Bhavya Jain', 
                                role: 'Co-Founder & Product',
                                linkedin: 'https://www.linkedin.com/in/bhavya-jain-10963b33a/',
                                instagram: 'https://www.instagram.com/bhavyakun_/',
                                image: '/founders/bhavya.jpg'
                            },
                        ].map((founder, i) => (
                            <div key={i} className="flex-1 min-w-[300px] max-w-sm p-10 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/30 transition-all text-center group">
                                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-orange-500 transition-colors relative">
                                    <Image 
                                        src={founder.image} 
                                        alt={founder.name} 
                                        fill 
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-2xl font-black mb-1 text-white uppercase condensed">{founder.name}</h3>
                                <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">{founder.role}</p>
                                <div className="flex justify-center gap-4">
                                    <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl text-white hover:bg-orange-500 hover:text-black transition-all"><Linkedin className="w-5 h-5" /></a>
                                    <a href={founder.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl text-white hover:bg-orange-500 hover:text-black transition-all"><Instagram className="w-5 h-5" /></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 px-4 relative z-10 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-20 text-center">
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase mb-4 text-sm">Pricing</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase condensed mb-8">Choose Your Tier</h2>
                        
                        <div className="flex items-center bg-zinc-900 p-1 rounded-full border border-white/5">
                            <button className="px-6 py-2 rounded-full bg-orange-600 text-white text-xs font-black uppercase tracking-widest">Monthly</button>
                            <button className="px-6 py-2 rounded-full text-white/50 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">Annual (-20%)</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Starter', price: '₹0', features: ['5 Scripts/mo', 'Basic Analysis', '1 Avatar', 'Community Access'] },
                            { name: 'Pro', price: '₹2,499', features: ['Unlimited Scripts', 'Deep Analysis', 'Custom Avatar', 'Priority Support', 'Auto-Publishing'], popular: true },
                            { name: 'Agency', price: '₹7,999', features: ['Multiple Brands', 'API Access', 'White Label', 'Dedicated Manager', 'Custom Scripts'] },
                        ].map((plan, i) => (
                            <div 
                                key={i} 
                                className={`relative p-10 rounded-[2.5rem] border ${plan.popular ? 'bg-zinc-900 border-orange-500 shadow-2xl shadow-orange-500/10' : 'bg-zinc-900/50 border-white/5'} flex flex-col`}
                            >
                                {plan.popular && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="text-xl font-black text-white uppercase condensed mb-2">{plan.name}</h3>
                                <div className="text-5xl font-black text-white condensed mb-8">
                                    {plan.price}<span className="text-sm text-white/40 font-bold uppercase tracking-widest ml-1">/mo</span>
                                </div>
                                
                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm text-white/60">
                                            <Check className="w-5 h-5 text-orange-500 shrink-0" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link 
                                    href={session ? "/dashboard" : "/signup"} 
                                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center ${plan.popular ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}
                                >
                                    Choose {plan.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof Bar */}
            <div className="w-full bg-orange-600 py-6 relative z-10 overflow-hidden group">
                <div className="flex whitespace-nowrap animate-marquee-fast">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center mx-8">
                            <span className="text-black font-black uppercase text-xl condensed tracking-tighter">
                                Trusted by 500+ creators • 10,000+ videos generated • Instagram, TikTok & YouTube
                            </span>
                            <Rocket className="w-6 h-6 text-black ml-8" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-theme bg-page mt-24">
                <div className="w-full px-6 md:px-12 lg:px-20 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                        {/* Brand & Mission */}
                        <div className="md:col-span-1">
                            <Link href="/" className="flex items-center gap-3 mb-6 group hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-glow-white-small">
                                    <span className="text-white font-extrabold text-sm">N</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-theme-primary">NYX</span>
                            </Link>
                            <p className="text-theme-secondary text-sm leading-relaxed mb-6">
                                Automating the future of content creation. Generate viral ideas, write scripts, and produce AI-narrated videos effortlessly.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://www.instagram.com/nyx.studios.ai/" target="_blank" rel="noopener noreferrer" className="p-2 -ml-2 text-theme-secondary hover:text-orange-500 transition-colors rounded-full hover:bg-card-hover">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 text-theme-secondary hover:text-orange-500 transition-colors rounded-full hover:bg-card-hover">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-theme-primary font-bold mb-6">Product</h4>
                            <ul className="space-y-4">
                                <li><Link href="#features" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">Features</Link></li>
                                <li><Link href="#how-it-works" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">How it Works</Link></li>
                                <li><Link href="#pricing" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">Pricing</Link></li>
                                <li><Link href="#about" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">About Us</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="text-theme-primary font-bold mb-6">Resources</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">Blog</a></li>
                                <li><a href="#" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">API Documentation</a></li>
                                <li><a href="#" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">Community</a></li>
                            </ul>
                        </div>

                        {/* Legal & Contact */}
                        <div>
                            <h4 className="text-theme-primary font-bold mb-6">Company</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">Terms of Service</a></li>
                                <li><Link href="/contact" className="text-theme-secondary hover:text-theme-primary text-sm transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-theme flex flex-col md:flex-row items-center justify-center gap-4">
                        <p className="text-theme-secondary text-sm">
                            © {new Date().getFullYear()} NYX. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
