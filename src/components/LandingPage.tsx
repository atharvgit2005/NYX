'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ThreeBackground from './ThreeBackground';
import VideoCarousel from './VideoCarousel';

import gsap from 'gsap';
import { Zap, Bot, Rocket, Check, Linkedin, Twitter, Menu, X, LogOut, ArrowRight, Globe } from 'lucide-react';
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
        <div className="min-h-screen text-theme-primary overflow-hidden relative bg-page transition-colors duration-300">
            <ThreeBackground />

            {/* Floating Navbar */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
                <div className="w-full max-w-5xl header-bg-theme backdrop-blur-md rounded-full shadow-2xl px-2 py-2 flex items-center justify-between transition-all duration-300 shadow-glow-nav">

                    {/* Left Section: Logo */}
                    <Link href="/" className="flex items-center gap-3 pl-4 group hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md shadow-glow-white-small">
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
                            <Link href="/dashboard" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-glow-purple hover:scale-105 transition-all shadow-md group">
                                Dashboard
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden md:block text-sm font-bold text-theme-secondary hover:text-theme-primary px-3 transition-colors">
                                    Log In
                                </Link>
                                <Link href="/signup" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-glow-purple hover:scale-105 transition-all shadow-md group">
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
                                    <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors shadow-lg">
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
                                    <Link href="/signup" className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors shadow-lg">
                                        Sign Up Free <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative flex flex-col items-center justify-center text-center z-10 min-h-screen px-4 sm:px-6 lg:px-8 pt-20">
                <div className="max-w-4xl mx-auto">
                    <h1 ref={titleRef} className="text-5xl sm:text-7xl font-bold tracking-tighter mb-8 text-theme-primary leading-tight">
                        Automate Your <br />
                        <span className="text-gradient-hero filter drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">Content Empire</span>
                    </h1>
                    <p ref={subtitleRef} className="text-lg sm:text-xl text-theme-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
                        Generate viral ideas, write scripts, and produce <span className="text-theme-primary font-bold">AI-narrated videos</span> in minutes.
                        The engine for modern creators.
                    </p>
                    <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href={session ? "/dashboard" : "/signup"} className="px-8 py-3 bg-purple-600 text-white rounded-full text-base font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-glow-white-strong">
                            Start Free <Rocket className="w-4 h-4" />
                        </Link>
                        <Link href="#how-it-works" className="px-8 py-3 bg-card-theme border-theme rounded-full text-base font-medium hover:bg-card-hover transition-all flex items-center gap-2 text-theme-primary">
                            See How It Works
                        </Link>
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
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent z-0 opacity-50"></div>

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
                                <div className="w-20 h-20 mb-8 rounded-2xl bg-card-theme border-theme flex items-center justify-center text-2xl font-bold text-theme-primary z-10 backdrop-blur-sm group-hover:scale-105 group-hover:border-purple-400/40 group-hover:bg-card-hover group-hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all duration-300">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-theme-primary group-hover:text-purple-500 transition-colors">{item.title}</h3>
                                <p className="text-theme-secondary max-w-xs text-sm leading-relaxed transition-colors">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16 tracking-tight">Everything You Need to Scale</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Trend-Aware Ideation',
                                desc: 'AI analyzes your niche to generate viral hooks and video concepts.',
                                icon: <Zap className="w-6 h-6 text-yellow-400" />,
                            },
                            {
                                title: 'AI Avatar & Voice',
                                desc: 'Clone yourself or use premium AI avatars to present your content.',
                                icon: <Bot className="w-6 h-6 text-purple-400" />,
                            },
                            {
                                title: 'Auto-Publishing',
                                desc: 'Schedule and post directly to Instagram, TikTok, and YouTube.',
                                icon: <Rocket className="w-6 h-6 text-pink-500" />,
                            },
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-card-theme border-theme hover:bg-card-hover transition-colors">
                                <div className="mb-6 inline-flex p-3 rounded-lg bg-transparent">{feature.icon}</div>
                                <h3 className="text-lg font-bold mb-3 text-theme-primary">{feature.title}</h3>
                                <p className="text-theme-secondary leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Us Section */}

            <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-6 tracking-tight">Meet the Founders</h2>
                    <p className="text-theme-secondary text-center mb-16 max-w-2xl mx-auto text-sm">
                        Building the future of content automation.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: 'Atharv Paharia', role: 'Co-Founder & Tech Lead' },
                            { name: 'Bhavya Jain', role: 'Co-Founder & Product' },
                        ].map((founder, i) => (
                            <div key={i} className="p-6 rounded-xl bg-card-theme border-theme hover:bg-card-hover transition-colors text-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-page flex items-center justify-center text-xl font-bold text-theme-primary border-theme">
                                    {founder.name[0]}
                                </div>
                                <h3 className="text-lg font-bold mb-1 text-theme-primary">{founder.name}</h3>
                                <p className="text-theme-secondary text-xs mb-4">{founder.role}</p>
                                <div className="flex justify-center gap-3">
                                    <button className="p-2 text-theme-secondary hover:text-theme-primary transition-colors"><Linkedin className="w-4 h-4" /></button>
                                    <button className="p-2 text-theme-secondary hover:text-theme-primary transition-colors"><Twitter className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16 tracking-tight">Simple, Transparent Pricing</h2>
                    {/* Infinite Marquee Container */}
                    <div className="w-full overflow-hidden relative">
                        {/* Gradient Masks */}
                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none fade-mask-theme-left" />
                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none fade-mask-theme-right" />

                        <div className="flex items-center gap-6 animate-marquee">
                            {[
                                ...Array(4).fill([
                                    { name: 'Starter', price: '₹0', features: ['5 Scripts/mo', 'Basic Analysis', '1 Avatar'] },
                                    { name: 'Pro', price: '₹2,499', features: ['Unlimited Scripts', 'Deep Analysis', 'Custom Avatar', 'Priority Support'], popular: true },
                                    { name: 'Agency', price: '₹7,999', features: ['Multiple Brands', 'API Access', 'White Label', 'Dedicated Manager'] },
                                ]).flat()
                            ].map((plan: any, i: number) => (
                                <Link href={session ? "/dashboard" : "/signup"} key={i} className={`relative flex-shrink-0 w-80 p-8 rounded-2xl border transition-all duration-300 group hover:-translate-y-2 ${plan.popular ? 'bg-page border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'bg-card-theme border-theme hover:bg-card-hover'}`}>
                                    {plan.popular && <span className="absolute -top-3 left-8 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold border border-purple-400">Most Popular</span>}
                                    <h3 className="text-xl font-bold mb-2 text-theme-primary">{plan.name}</h3>
                                    <div className="text-4xl font-bold mb-6 text-theme-primary">{plan.price}<span className="text-sm text-theme-secondary font-normal">/mo</span></div>
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((f: string, j: number) => (
                                            <li key={j} className="flex items-center text-theme-secondary text-sm">
                                                <Check className={`w-4 h-4 mr-3 ${plan.popular ? 'text-green-400' : 'text-green-500'}`} /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={`w-full py-3 rounded-lg font-bold text-center text-sm transition-all ${plan.popular ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/25' : 'bg-white/10 text-theme-primary hover:bg-white/20'}`}>
                                        Choose {plan.name}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
