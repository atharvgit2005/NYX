'use client';

import Link from 'next/link';
import { Sparkles, Rocket, User, LogOut, Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import NyxButton from './ui/NyxButton';

export default function Navbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-page/80 backdrop-blur-xl border-b border-theme transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="NYX Studio Home">
              <div className="w-8 h-8 relative flex-shrink-0">
                <Image 
                  src="/logo/NYX-Logo.png" 
                  alt="NYX Studio logo" 
                  fill 
                  unoptimized
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-zinc-950 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight transition-all duration-300">
                NYX
              </span>
            </Link>
          </div>

          {/* Desktop Menu - Left Aligned */}
          <div className="hidden md:block ml-10">
            <div className="flex items-baseline space-x-8">
              {['Features', 'How it Works', 'Pricing'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors relative group py-2"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zinc-950 dark:bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button or User Menu - Pushed to Right */}
          <div className="ml-auto hidden md:block">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card-theme hover:bg-card-theme border border-theme transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{session.user?.name || 'User'}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-page/90 backdrop-blur-xl border border-theme rounded-xl shadow-xl py-2">
                    <Link href="/automate/dashboard" className="block px-4 py-2 text-sm hover:bg-card-theme transition-colors">
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-card-theme transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NyxButton href="/automate/signup" className="py-2.5">
                START FREE
              </NyxButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="ml-auto md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-card-theme text-theme-secondary hover:text-theme-primary hover:bg-card-theme transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-page/95 backdrop-blur-xl border-b border-theme shadow-2xl animate-fade-in">
          <div className="px-6 py-8 space-y-6">
            <div className="flex flex-col space-y-4">
              {['Features', 'How it Works', 'Pricing'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-theme">
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-theme-secondary">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{session.user?.name || 'User'}</span>
                  </div>
                  <Link
                    href="/automate/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-3 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black font-bold border border-white/10 hover:opacity-90 transition-opacity"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-center py-3 rounded-xl bg-card-theme text-theme-secondary font-medium hover:bg-card-theme transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                  <NyxButton
                    href="/automate/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full justify-start"
                  >
                    START FREE
                  </NyxButton>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
