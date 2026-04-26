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
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-md shadow-glow-white-small relative border border-white/10">
                            <Image src="/logo/logo.png" alt="NYX Logo" fill className="object-cover" sizes="32px" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-theme-primary hidden sm:block leading-none">NYX</span>
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
                            <Link href="/automate/dashboard" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-all group">
                                Dashboard
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/automate/login" className="hidden md:block text-sm font-bold text-theme-secondary hover:text-theme-primary px-3 transition-colors">
                                    Log In
                                </Link>
                                <Link href="/automate/signup" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-all group">
                                    Sign Up
                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
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
                                    <Link href="/automate/dashboard" className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg">
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
                                    <Link href="/automate/login" className="text-center w-full px-4 py-3 text-theme-secondary font-bold hover:bg-card-hover rounded-xl transition-colors border border-transparent hover:border-theme">
                                        Log In
                                    </Link>
                                    <Link href="/automate/signup" className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg">
                                        Sign Up Free <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center pt-0 overflow-hidden bg-black">
                {/* Massive Background Split Text */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
                    <div className="relative w-full h-full max-w-[1440px] mx-auto px-6 md:px-12">
                        {/* AUTOMATE - Left Anchored Zipper Part 1 */}
                        <div className="absolute top-[22%] left-0 md:left-12 opacity-[0.07] md:opacity-[0.12] flex flex-col items-start translate-x-[-10%] md:translate-x-[-5%]">
                            <span className="text-[clamp(60px,12vw,220px)] font-black uppercase tracking-tighter leading-none condensed whitespace-nowrap">
                                AUTOMATE
                            </span>
                            <div className="h-[2px] w-full bg-white opacity-40 mt-1" />
                        </div>
                        
                        {/* EMPIRE - Interlocking Zipper Part 2 */}
                        <div className="absolute top-[38%] left-[45%] md:left-[64%] opacity-[0.07] md:opacity-[0.12] flex flex-col items-start">
                            <span className="text-[clamp(60px,12vw,220px)] font-black uppercase tracking-tighter leading-none condensed whitespace-nowrap">
                                EMPIRE
                            </span>
                            <div className="h-[2px] w-full bg-white opacity-40 mt-1" />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-[140px] md:pt-[160px] pb-24 md:pb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 items-end">
                        {/* Left Side: AUTOMATE STRATEGY */}
                        <div className="flex flex-col items-start text-left">
                            <h2 ref={titleRef} className="text-[clamp(44px,10vw,160px)] font-black uppercase tracking-tighter leading-[0.85] condensed mb-8 md:mb-10 text-white">
                                <span className="block">AUTOMATE</span>
                                <span className="block">STRATEGY</span>
                            </h2>
                            <p ref={subtitleRef} className="text-base md:text-lg lg:text-xl text-[#A1A1AA] max-w-sm mb-10 md:mb-12 leading-relaxed font-medium">
                                Generate viral ideas, write scripts, and produce <span className="text-[#F97316] font-bold">AI videos</span> in minutes. The engine for modern creators.
                            </p>
                            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch sm:items-start w-full sm:w-auto">
                                <Link href={session ? "/automate/dashboard" : "/automate/signup"} className="h-[52px] sm:h-[56px] px-8 sm:px-10 bg-[#F97316] text-white rounded-full text-base font-bold hover:bg-[#F97316]/90 transition-all hover:scale-105 shadow-xl shadow-[#F97316]/20 flex items-center justify-center">
                                    Start Free
                                </Link>
                                <Link href="#how-it-works" className="h-[52px] sm:h-[56px] px-8 sm:px-10 border border-white/30 bg-white/5 backdrop-blur-md text-white rounded-full text-base font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    See How It Works
                                </Link>
                            </div>
                        </div>

                        {/* Right Side: REAL RESULTS */}
                        <div className="flex flex-col items-start md:items-end text-left md:text-right relative">
                            <h2 className="text-[clamp(44px,10vw,160px)] font-black uppercase tracking-tighter leading-[0.85] condensed mb-8 md:mb-0">
                                <span className="text-gradient-hero block">REAL</span>
                                <span className="text-gradient-hero block">RESULTS</span>
                            </h2>
                            
                            {/* Anchored Stat Card */}
                            <div className="w-full sm:w-auto md:absolute md:-bottom-28 md:right-0 bg-black/60 backdrop-blur-xl border border-theme rounded-3xl p-6 shadow-2xl hover:border-[#F97316]/30 transition-all mt-4 md:mt-0 z-30">
                                <div className="flex items-center justify-center sm:justify-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#F97316]/10 flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-[#F97316]" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl font-black text-white condensed leading-none">10K+</div>
                                        <div className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-1">Videos Generated</div>
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
            <section id="how-it-works" className="py-[80px] md:py-[120px] px-6 md:px-12 relative z-10 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <span className="text-[#F97316] text-[11px] font-semibold uppercase tracking-[0.1em] mb-4">Process</span>
                        <h2 className="text-[clamp(28px,6vw,44px)] font-extrabold tracking-tight text-white uppercase condensed leading-tight">From Idea to Viral in 3 Steps</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-px border-t border-white/[0.12] z-0"></div>

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
                                <div className="w-[56px] h-[56px] mb-6 rounded-[12px] bg-white/[0.03] border border-white/[0.15] flex items-center justify-center text-[18px] font-bold text-white z-10 backdrop-blur-sm group-hover:border-[#F97316]/40 transition-all duration-300">
                                    {item.step}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-[18px] font-semibold text-white">{item.title}</h3>
                                    <p className="text-[14px] text-[#A1A1AA] leading-[1.7] max-w-xs">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-[80px] md:py-[120px] px-6 md:px-12 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <span className="text-[#F97316] text-[11px] font-semibold uppercase tracking-[0.1em] mb-4">Capabilities</span>
                        <h2 className="text-[clamp(28px,6vw,44px)] font-extrabold tracking-tight text-white uppercase condensed leading-tight">Everything You Need to Scale</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {[
                            {
                                title: 'Trend-Aware Ideation',
                                desc: 'AI analyzes your niche to generate viral hooks and video concepts.',
                                icon: <Zap className="w-[22px] h-[22px] text-[#F97316]" />,
                            },
                            {
                                title: 'AI Avatar & Voice',
                                desc: 'Clone yourself or use premium AI avatars to present your content.',
                                icon: <Bot className="w-[22px] h-[22px] text-[#F97316]" />,
                            },
                            {
                                title: 'Auto-Publishing',
                                desc: 'Schedule and post directly to Instagram, TikTok, and YouTube.',
                                icon: <Rocket className="w-[22px] h-[22px] text-[#F97316]" />,
                            },
                        ].map((feature, i) => (
                            <div key={i} className="min-h-[280px] p-[32px] rounded-[16px] bg-white/[0.03] border border-white/[0.07] hover:border-[#F97316]/30 transition-all group flex flex-col">
                                <div className="mb-6 w-[48px] h-[48px] rounded-[12px] bg-[#F97316]/10 flex items-center justify-center transition-colors">
                                    {feature.icon}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-[18px] font-bold text-white uppercase condensed">{feature.title}</h3>
                                    <p className="text-[#A1A1AA] leading-[1.7] text-[14px]">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet the Founders */}
            <section id="about" className="py-[80px] md:py-[120px] px-6 md:px-12 relative z-10 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-16 text-center">
                        <span className="text-[#F97316] text-[11px] font-semibold uppercase tracking-[0.1em] mb-4">Visionaries</span>
                        <h2 className="text-[clamp(28px,6vw,44px)] font-extrabold tracking-tight text-white uppercase condensed leading-tight">Meet the Founders</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                            <div key={i} className="p-[40px] rounded-[16px] bg-white/[0.03] border border-white/[0.07] hover:border-[#F97316]/30 transition-all text-center group flex flex-col items-center">
                                <div className="w-[96px] h-[96px] mb-6 rounded-full overflow-hidden ring-2 ring-[#F97316]/30 border-2 border-transparent transition-colors relative">
                                    <Image 
                                        src={founder.image} 
                                        alt={founder.name} 
                                        fill 
                                        className="object-cover rounded-full"
                                        sizes="96px"
                                    />
                                </div>
                                <h3 className="text-[16px] font-extrabold mb-1 text-white uppercase tracking-[0.08em]">{founder.name}</h3>
                                <p className="text-[#F97316] text-[12px] font-medium uppercase tracking-[0.1em] mb-6">{founder.role}</p>
                                <div className="flex justify-center gap-4">
                                    <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" className="w-[40px] h-[40px] flex items-center justify-center bg-white/5 border border-white/15 rounded-full text-white hover:bg-[#F97316] hover:text-black transition-all"><Linkedin className="w-4 h-4" /></a>
                                    <a href={founder.instagram} target="_blank" rel="noopener noreferrer" className="w-[40px] h-[40px] flex items-center justify-center bg-white/5 border border-white/15 rounded-full text-white hover:bg-[#F97316] hover:text-black transition-all"><Instagram className="w-4 h-4" /></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-[80px] md:py-[120px] px-6 md:px-12 relative z-10 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-20 text-center">
                        <span className="text-[#F97316] text-[11px] font-semibold uppercase tracking-[0.1em] mb-4">Pricing</span>
                        <h2 className="text-[clamp(28px,6vw,48px)] font-extrabold tracking-tighter uppercase condensed mb-8 leading-tight">Choose Your Tier</h2>
                        
                        <div className="flex items-center bg-zinc-900 p-1 rounded-full border border-white/5">
                            <button className="px-6 py-2 rounded-full bg-[#F97316] text-white text-xs font-black uppercase tracking-widest">Monthly</button>
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
                                className={`relative p-[32px] rounded-[16px] border ${plan.popular ? 'bg-[#F97316]/5 border-[#F97316] border-[1.5px] shadow-2xl shadow-[#F97316]/10' : 'bg-white/[0.03] border-white/[0.08]'} flex flex-col`}
                            >
                                {plan.popular && (
                                    <span className="absolute top-0 left-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-[#F97316] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full whitespace-nowrap z-20">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="text-xl font-black text-white uppercase condensed mb-2">{plan.name}</h3>
                                <div className="text-5xl font-black text-white condensed mb-8">
                                    {plan.price}<span className="text-sm text-white/40 font-bold uppercase tracking-widest ml-1">/mo</span>
                                </div>
                                
                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-white/60">
                                            <Check className="w-[14px] h-[14px] text-[#F97316] mt-0.5 shrink-0" style={{ marginRight: '10px' }} />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link 
                                    href={session ? "/automate/dashboard" : "/automate/signup"} 
                                    className={`w-full h-[52px] flex items-center justify-center rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center ${plan.popular ? 'bg-[#F97316] text-white hover:bg-[#F97316]/90' : 'bg-transparent text-white hover:bg-white/5 border border-white/20'}`}
                                >
                                    Choose {plan.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof Bar */}
            <div className="w-full bg-[#F97316] py-6 relative z-10 overflow-hidden group">
                <div className="flex whitespace-nowrap animate-marquee-fast">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center mx-16">
                            <span className="text-black font-bold uppercase text-[14px] tracking-tight">
                                Trusted by 500+ creators • 10,000+ videos generated • Instagram, TikTok & YouTube
                            </span>
                            <Rocket className="w-6 h-6 text-black ml-16" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-theme bg-page mt-24">
                <div className="w-full px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                        {/* Brand & Mission */}
                        <div className="md:col-span-1">
                            <Link href="/" className="flex items-center gap-3 mb-6 group hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-md shadow-glow-white-small relative border border-white/10">
                                <Image src="/logo/logo.png" alt="NYX Logo" fill className="object-cover" sizes="32px" />
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
                                <a href="https://www.linkedin.com/company/nyx-studio-ai/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="p-2 text-theme-secondary hover:text-orange-500 transition-colors rounded-full hover:bg-card-hover">
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
