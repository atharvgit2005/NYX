'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function Signup() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session) {
            router.push('/automate/dashboard');
        }
    }, [session, router]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Clear previous errors if any

        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            // 1. Create User
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                console.error("Signup failed:", data.error);
                setLoading(false);
                alert(`Signup failed: ${data.error}`);
                return;
            }

            // 2. Sign In
            const result = await signIn('credentials', {
                redirect: true,
                callbackUrl: '/automate/dashboard',
                email,
                password,
            });

            if (result?.error) {
                console.error("Auto-login failed:", result.error);
                setLoading(false);
                alert(`Auto-login failed: ${result.error}`);
            }

        } catch (error: unknown) {
            console.error("Signup error:", error);
            setLoading(false);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            alert(`Something went wrong: ${message}`);
        }
    };

    return (
        <div className="min-h-screen bg-page flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 relative group-hover:scale-105 transition-transform duration-300">
                        <Image src="/logo/NYX-Logo.png" alt="NYX Logo" fill className="object-contain" unoptimized sizes="64px" />
                    </div>
                    <span className="text-3xl font-bold text-theme-primary">NYX</span>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-theme-primary">
                    Create your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-card-theme py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-theme">
                    <form className="space-y-6" onSubmit={handleSignup}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-theme-secondary">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-theme rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-page/50 text-theme-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-theme-secondary">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-theme rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-page/50 text-theme-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-theme-secondary">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-theme rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-page/50 text-theme-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating account...' : 'Sign up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-theme" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-page text-theme-secondary">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button onClick={() => signIn('google', { callbackUrl: '/automate/dashboard' })} className="w-full inline-flex justify-center py-2 px-4 border border-theme rounded-md shadow-sm bg-card-theme text-sm font-medium text-theme-secondary hover:bg-card-theme transition-colors">
                                Google
                            </button>
                            <button className="w-full inline-flex justify-center py-2 px-4 border border-theme rounded-md shadow-sm bg-card-theme text-sm font-medium text-theme-secondary hover:bg-card-theme transition-colors">
                                Instagram
                            </button>
                        </div>
                        <div className="mt-6 text-center text-sm">
                            <p className="text-theme-secondary">
                                Already have an account?{' '}
                                <Link href="/automate/login" className="font-medium text-orange-500 hover:text-orange-400 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
