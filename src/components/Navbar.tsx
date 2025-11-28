'use client';

import Link from 'next/link';
import { Sparkles, Rocket, User, LogOut, Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
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
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group py-2"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{session.user?.name || 'User'}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl py-2">
                    <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors">
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="group relative px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-100 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] overflow-hidden flex items-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-600" />
                  Get Started
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="ml-auto md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-fade-in">
          <div className="px-6 py-8 space-y-6">
            <div className="flex flex-col space-y-4">
              {['Features', 'How it Works', 'Pricing'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10">
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{session.user?.name || 'User'}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-3 rounded-xl bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-center py-3 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
