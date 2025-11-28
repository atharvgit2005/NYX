'use client';

import { Search, Bell, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from './Sidebar';
import { signOut } from 'next-auth/react';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="bg-black/80 backdrop-blur-md border-b border-white/10 h-20 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-40 transition-all duration-300">
            <div className="flex-1 flex justify-between items-center">
                <div className="flex items-center gap-4 md:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">NYX</span>
                </div>

                <div className="flex-1 flex max-w-2xl ml-4 md:ml-0">
                    {/* Search bar */}
                    <div className="w-full max-w-lg hidden md:block">
                        <label htmlFor="search" className="sr-only">
                            Search
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            </div>
                            <input
                                id="search"
                                name="search"
                                className="block w-full pl-11 pr-4 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 sm:text-sm transition-all duration-200 ease-out shadow-sm"
                                placeholder="Search campaigns, scripts, or ideas..."
                                type="search"
                            />
                        </div>
                    </div>
                </div>
                <div className="ml-4 flex items-center md:ml-6 gap-4">
                    <button className="bg-white/5 p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-purple-500 transition-all duration-200 relative group">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6 group-hover:animate-swing" />
                        <span className="absolute top-2.5 right-3 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-black animate-pulse"></span>
                    </button>
                    <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="absolute top-20 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-fade-in md:hidden">
                    <div className="px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-purple-600/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-white'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center px-4 py-3 text-base font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
