'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import {
    AuthShell,
    FieldEmail,
    FieldText,
    FieldPassword,
    SocialChannels,
} from '../login/LoginClient';

export default function SignupClient() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (session) router.push('/automate/dashboard');
    }, [session, router]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.error || 'Signup failed.');
                setLoading(false);
                return;
            }

            const result = await signIn('credentials', {
                redirect: true,
                callbackUrl: '/automate/dashboard',
                email,
                password,
            });

            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(message);
            setLoading(false);
        }
    };

    return (
        <AuthShell mode="signup" displayError={error}>
            <form onSubmit={handleSignup} className="space-y-8">
                <FieldText
                    id="name"
                    name="name"
                    label="OPERATOR_NAME"
                    autoComplete="name"
                    placeholder="FULL NAME"
                />
                <FieldEmail />
                <FieldPassword
                    show={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                    autoComplete="new-password"
                    label="NEW_ACCESS_KEY (PASSWORD)"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#E8441A] py-6 px-8 border-4 border-black flex items-center justify-between group hover:bg-[#ffd65b] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <span className="font-[var(--font-space-grotesk)] font-black text-xl tracking-tighter text-white group-hover:text-[#3d2f00]">
                        {loading ? 'INITIATING…' : 'CREATE OPERATOR'}
                    </span>
                    <span className="material-symbols-outlined font-bold text-white group-hover:text-[#3d2f00]">arrow_forward</span>
                </button>
            </form>

            <SocialChannels callbackUrl="/automate/dashboard" />
        </AuthShell>
    );
}
