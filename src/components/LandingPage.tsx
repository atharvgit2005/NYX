'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ThreeBackground from './ThreeBackground';
import gsap from 'gsap';
import { Zap, Bot, Rocket, Check, Users, Linkedin, Twitter, Menu, X, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

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
            tl.fromTo(titleRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
                .fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=0.5')
                .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5');
        }
    }, []);

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            <ThreeBackground />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                                NYX
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <Link href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</Link>
                                <Link href="#how-it-works" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">How it Works</Link>
                                <Link href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</Link>
                            </div>
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            {session ? (
                                <>
                                    <Link href="/dashboard" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-500/20">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                                        Log In
                                    </Link>
                                    <Link href="/signup" className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm font-medium transition-all backdrop-blur-sm">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="bg-white/5 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link href="#features" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Features</Link>
                            <Link href="#how-it-works" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">How it Works</Link>
                            <Link href="#pricing" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Pricing</Link>
                            <div className="border-t border-white/10 mt-4 pt-4 flex flex-col gap-2">
                                {session ? (
                                    <>
                                        <Link href="/dashboard" className="text-center w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-bold">
                                            Go to Dashboard
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="text-center w-full px-4 py-3 bg-white/5 text-gray-300 rounded-lg font-medium"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="text-center w-full px-4 py-3 bg-white/5 text-white rounded-lg font-medium">
                                            Log In
                                        </Link>
                                        <Link href="/signup" className="text-center w-full px-4 py-3 bg-white text-black rounded-lg font-bold">
                                            Sign Up Free
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

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

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 bg-black/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">From Idea to Viral Video in 3 Steps</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 z-0"></div>

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
                                <div className="w-24 h-24 mb-6 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 flex items-center justify-center text-3xl font-bold shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] group-hover:border-purple-500/60 backdrop-blur-xl">
                                    <span className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">{item.step}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-400 max-w-xs">{item.desc}</p>
                            </div>
                        ))}
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
                    {/* Infinite Marquee Container */}
                    <div className="w-full overflow-hidden relative fade-mask">
                        <div className="animate-marquee flex items-center gap-8 py-10">
                            {[
                                { name: 'Starter', price: '₹0', features: ['5 Scripts/mo', 'Basic Analysis', '1 Avatar'] },
                                { name: 'Pro', price: '₹2,499', features: ['Unlimited Scripts', 'Deep Analysis', 'Custom Avatar', 'Priority Support'], popular: true },
                                { name: 'Agency', price: '₹7,999', features: ['Multiple Brands', 'API Access', 'White Label', 'Dedicated Manager'] },
                                { name: 'Starter', price: '₹0', features: ['5 Scripts/mo', 'Basic Analysis', '1 Avatar'] },
                                { name: 'Pro', price: '₹2,499', features: ['Unlimited Scripts', 'Deep Analysis', 'Custom Avatar', 'Priority Support'], popular: true },
                                { name: 'Agency', price: '₹7,999', features: ['Multiple Brands', 'API Access', 'White Label', 'Dedicated Manager'] },
                                { name: 'Starter', price: '₹0', features: ['5 Scripts/mo', 'Basic Analysis', '1 Avatar'] },
                                { name: 'Pro', price: '₹2,499', features: ['Unlimited Scripts', 'Deep Analysis', 'Custom Avatar', 'Priority Support'], popular: true },
                                { name: 'Agency', price: '₹7,999', features: ['Multiple Brands', 'API Access', 'White Label', 'Dedicated Manager'] },
                                { name: 'Starter', price: '₹0', features: ['5 Scripts/mo', 'Basic Analysis', '1 Avatar'] },
                                { name: 'Pro', price: '₹2,499', features: ['Unlimited Scripts', 'Deep Analysis', 'Custom Avatar', 'Priority Support'], popular: true },
                                { name: 'Agency', price: '₹7,999', features: ['Multiple Brands', 'API Access', 'White Label', 'Dedicated Manager'] },
                            ].map((plan, i) => (
                                <Link href="/signup" key={i} className={`relative flex-shrink-0 w-80 p-8 rounded-2xl border backdrop-blur-md transition-all duration-300 group hover:-translate-y-2 ${plan.popular ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}>
                                    {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-sm font-bold shadow-lg">Most Popular</span>}
                                    <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{plan.name}</h3>
                                    <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-400 font-normal">/mo</span></div>
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((f, j) => (
                                            <li key={j} className="flex items-center text-gray-300">
                                                <Check className="w-5 h-5 mr-3 text-green-400" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={`w-full py-3 rounded-xl font-bold text-center transition-all ${plan.popular ? 'bg-purple-600 group-hover:bg-purple-700 shadow-lg group-hover:shadow-purple-500/50' : 'bg-white/10 group-hover:bg-white/20'}`}>
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
