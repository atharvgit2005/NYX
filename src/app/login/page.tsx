'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (session) {
            router.push('/dashboard');
        }

        // Check for error in URL
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(AuthErrorMessages[errorParam] || errorParam);
        }
    }, [session, router, searchParams]);

    const AuthErrorMessages: Record<string, string> = {
        "Signin": "Try signing with a different account.",
        "OAuthSignin": "Sign in failed. Check if your Google account is valid.",
        "OAuthCallback": "Google denied access or network failed.",
        "OAuthCreateAccount": "Could not create user in database.",
        "EmailCreateAccount": "Could not create user in database.",
        "Callback": "Error during authentication callback.",
        "OAuthAccountNotLinked": "Email already used with another provider.",
        "EmailSignin": "Check your email for a verification link.",
        "CredentialsSignin": "Sign in failed. Check the details you provided.",
        "default": "Unable to sign in."
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            console.error("Login Result Error:", result.error);
            setError(result.error);
            setLoading(false);

            // Helpful alerts for debugging
            if (result.error === "CredentialsSignin") {
                setError("Invalid email or password");
            }
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-page flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden relative shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <Image src="/logo/logo.png" alt="NYX Logo" fill className="object-cover" sizes="64px" />
                    </div>
                    <span className="text-3xl font-bold text-theme-primary">NYX</span>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-theme-primary">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-card-theme py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-theme">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded text-sm text-center">
                                {error}
                            </div>
                        )}
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
                                    autoComplete="current-password"
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
                                {loading ? 'Signing in...' : 'Sign in'}
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
                            <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} className="w-full inline-flex justify-center py-2 px-4 border border-theme rounded-md shadow-sm bg-card-theme text-sm font-medium text-theme-secondary hover:bg-card-theme transition-colors">
                                Google
                            </button>
                            <button className="w-full inline-flex justify-center py-2 px-4 border border-theme rounded-md shadow-sm bg-card-theme text-sm font-medium text-theme-secondary hover:bg-card-theme transition-colors">
                                Instagram
                            </button>
                        </div>

                        <div className="mt-6 text-center text-sm">
                            <p className="text-theme-secondary">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="font-medium text-orange-500 hover:text-orange-400 transition-colors">
                                    Sign up
                                </Link>
                            </p>
                            <p className="mt-2 text-gray-500">
                                <Link href="/" className="font-medium text-theme-secondary hover:text-theme-primary transition-colors flex items-center justify-center gap-1">
                                    ← Back to Home
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-page flex items-center justify-center text-theme-primary">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
