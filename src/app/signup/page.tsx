'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock signup delay
        setTimeout(() => {
            router.push('/dashboard');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    NYX
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Create your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-white/10">
                    <form className="space-y-6" onSubmit={handleSignup}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-black/50 text-white sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-black/50 text-white sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-black/50 text-white sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Creating account...' : 'Sign up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-black text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button className="w-full inline-flex justify-center py-2 px-4 border border-white/10 rounded-md shadow-sm bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
                                Google
                            </button>
                            <button className="w-full inline-flex justify-center py-2 px-4 border border-white/10 rounded-md shadow-sm bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
                                Instagram
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
