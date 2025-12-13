'use client';

import { Search, Bell, Menu, X, LogOut } from 'lucide-react';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from './Sidebar';
import { signOut } from 'next-auth/react';
import { useSidebar } from '@/context/SidebarContext';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl h-20 flex items-center justify-between pl-7 pr-5 transition-all duration-300">
            <div className="flex items-center gap-4 mt-2">
                {/* Mobile Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors md:hidden"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Desktop Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex p-2 mr-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    NYX
                </Link>
            </div>

            <div className="flex items-center gap-6">
                {/* Search bar - Expandable */}
                <div className={`group hidden md:block transition-all duration-300 ease-out ${mobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div
                        className={`flex items-center rounded-full h-10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] relative overflow-hidden ${isSearchOpen ? 'w-64 bg-[#121212] border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'w-10 bg-transparent border border-transparent hover:bg-white/10 cursor-pointer'}`}
                        onClick={() => {
                            if (!isSearchOpen) {
                                setIsSearchOpen(true);
                                setTimeout(() => searchInputRef.current?.focus(), 100);
                            }
                        }}
                    >
                        {/* Icon - moves left with container expansion */}
                        <div className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center z-10">
                            <Search className={`h-5 w-5 transition-colors duration-300 ${isSearchOpen ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'}`} />
                        </div>

                        {/* Input Field - fades in */}
                        <input
                            ref={searchInputRef}
                            id="search"
                            name="search"
                            className={`w-full h-full bg-transparent border-none py-1 pl-12 pr-4 text-gray-200 placeholder-gray-500 focus:ring-0 text-[15px] font-normal leading-normal transition-all duration-500 ease-out ${isSearchOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
                            placeholder="Type to search..."
                            type="search"
                            autoComplete="off"
                            onBlur={() => {
                                setTimeout(() => setIsSearchOpen(false), 200);
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-gray-400 hover:text-white transition-colors group">
                        <span className="sr-only"></span>
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-black animate-pulse"></span>
                    </button>
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
