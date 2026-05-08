'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';

const AuthErrorMessages: Record<string, string> = {
    Signin: 'Try signing with a different account.',
    OAuthSignin: 'Sign in failed. Check if your Google account is valid.',
    OAuthCallback: 'Google denied access or network failed.',
    OAuthCreateAccount: 'Could not create user in database.',
    EmailCreateAccount: 'Could not create user in database.',
    Callback: 'Error during authentication callback.',
    OAuthAccountNotLinked: 'Email already used with another provider.',
    EmailSignin: 'Check your email for a verification link.',
    CredentialsSignin: 'Sign in failed. Check the details you provided.',
    default: 'Unable to sign in.',
};

function LoginContent({ defaultCallbackUrl }: { defaultCallbackUrl: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const rawCallback = searchParams.get('callbackUrl');
    const callbackUrl =
        rawCallback && rawCallback.startsWith('/') ? rawCallback : defaultCallbackUrl;

    const isPortalFlow = callbackUrl.startsWith('/portal');

    useEffect(() => {
        if (session) router.push(callbackUrl);
    }, [session, router, callbackUrl]);

    const errorParam = searchParams.get('error');
    const urlError = errorParam ? AuthErrorMessages[errorParam] || errorParam : '';
    const displayError = error || urlError;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        const result = await signIn('credentials', { redirect: false, email, password });

        if (result?.error) {
            setError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error);
            setLoading(false);
        } else {
            router.push(callbackUrl);
        }
    };

    return <AuthShell mode="login" displayError={displayError} showSignupTab={!isPortalFlow}>
        <form onSubmit={handleLogin} className="space-y-8">
            <FieldEmail />
            <FieldPassword show={showPassword} onToggle={() => setShowPassword((v) => !v)} />

            <div className="flex items-center justify-between font-[var(--font-space-grotesk)] text-[0.7rem] tracking-widest">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 border-4 border-black bg-[#0e0e0e] text-[#E8441A] focus:ring-0 rounded-none" />
                    <span className="text-[#e4beb5] group-hover:text-[#e5e2e1] transition-colors">REMEMBER_IDENTITY</span>
                </label>
                <a
                    href="mailto:hello@nyxstudio.tech?subject=Access%20key%20recovery"
                    className="text-[#E8441A] hover:underline decoration-2 underline-offset-4"
                >
                    FORGOT_KEY?
                </a>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E8441A] py-6 px-8 border-4 border-black flex items-center justify-between group hover:bg-[#ffd65b] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <span className="font-[var(--font-space-grotesk)] font-black text-xl tracking-tighter text-white group-hover:text-[#3d2f00]">
                    {loading ? 'AUTHENTICATING…' : 'ENTER THE VOID'}
                </span>
                <span className="material-symbols-outlined font-bold text-white group-hover:text-[#3d2f00]">arrow_forward</span>
            </button>
        </form>

        <SocialChannels callbackUrl={callbackUrl} />
    </AuthShell>;
}

export default function LoginClient({
    defaultCallbackUrl = '/automate/dashboard',
}: { defaultCallbackUrl?: string } = {}) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center text-[#e5e2e1]">Loading…</div>}>
            <LoginContent defaultCallbackUrl={defaultCallbackUrl} />
        </Suspense>
    );
}

// ───────────────────────────────────────────────────────────────────────
// Shared UI — kept in this file (also imported by SignupClient).
// ───────────────────────────────────────────────────────────────────────

export function AuthShell({
    mode,
    displayError,
    showSignupTab = true,
    children,
}: {
    mode: 'login' | 'signup';
    displayError?: string;
    showSignupTab?: boolean;
    children: React.ReactNode;
}) {
    // The LOGIN_ACCESS tab needs to point at whichever login page the user is
    // currently on. Hardcoding /automate/login here used to bounce portal-flow
    // users onto the automate subdomain via the next.config redirect.
    const pathname = usePathname();
    const loginHref = pathname?.startsWith('/portal') ? '/portal/login' : '/automate/login';
    const heading = mode === 'login' ? 'OPERATOR LOGIN' : 'INITIATE OPERATOR';
    const subheading =
        mode === 'login'
            ? '*Identification required for system entry.'
            : '*Register a new operator identity for system access.';

    return (
        <main
            className="grid grid-cols-12 min-h-screen bg-[#0e0e0e] text-[#e5e2e1] selection:bg-[#E8441A] selection:text-white"
            style={{ fontFamily: 'var(--font-work-sans), sans-serif' }}
        >
            {/* MODULE 1: HOOK */}
            <section className="col-span-12 md:col-span-7 relative overflow-hidden border-b-4 md:border-b-0 md:border-r-4 border-black bg-[#0e0e0e] min-h-[60vh] md:min-h-screen">
                {/* Grid pattern background */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(#e5e2e1 1px, transparent 1px), linear-gradient(90deg, #e5e2e1 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />

                {/* Diagonal accent stripe */}
                <div
                    aria-hidden
                    className="absolute -right-32 top-1/4 w-[600px] h-[600px] opacity-[0.04] pointer-events-none"
                    style={{
                        background:
                            'repeating-linear-gradient(45deg, #E8441A 0 8px, transparent 8px 24px)',
                    }}
                />

                {/* Header — logo matches landing page (image + bold sans NYX) */}
                <div className="absolute top-0 left-0 w-full p-6 md:p-8 z-20 flex justify-between items-start">
                    <Link href="/" className="flex items-center gap-3 group" aria-label="NYX Studio Home">
                        <div className="w-10 h-10 md:w-12 md:h-12 relative group-hover:scale-105 transition-transform">
                            <Image
                                src="/logo/NYX-Logo.png"
                                alt="NYX Studio logo"
                                width={120}
                                height={40}
                                unoptimized
                                sizes="48px"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <span className="text-xl md:text-2xl font-bold tracking-tight text-[#e5e2e1]">NYX</span>
                    </Link>
                    <div
                        className="text-[0.65rem] md:text-[0.75rem] tracking-[0.2em] border-2 border-[#E8441A] px-3 py-1 text-[#E8441A]"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                        VERSION_2.4.0
                    </div>
                </div>

                {/* Hero copy — using div not h1 to avoid global h1 GSAP animation hydration mismatch */}
                <div className="relative z-10 px-8 md:px-16 pt-32 md:pt-40 pb-12 max-w-3xl">
                    <div
                        className="text-[0.65rem] md:text-[0.75rem] tracking-[0.3em] text-[#E8441A] mb-6"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                        ◆ SECURE_CHANNEL_OPEN
                    </div>
                    <div
                        className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                        AUTHENTICATION_<br />
                        <span className="text-[#E8441A] italic">PORTAL</span>
                    </div>

                    <p className="mt-8 md:mt-10 text-[#e4beb5] text-base md:text-lg max-w-lg leading-relaxed">
                        Stop scrolling. Start converting.<br />
                        <span className="text-[#ab8981] text-sm">
                            The midnight manifesto for D2C operators who refuse to be invisible.
                        </span>
                    </p>
                </div>

                {/* Stats / spec block bottom-left */}
                <div className="absolute bottom-0 left-0 right-0 z-10 px-8 md:px-16 pb-8 md:pb-16">
                    <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl">
                        <SpecCell label="BUILD" value="2.4.0" />
                        <SpecCell label="STATUS" value="LIVE" />
                        <SpecCell label="INTAKE" value="Q3'26" />
                    </div>
                </div>

                {/* Corner accents */}
                <div
                    className="absolute top-12 right-12 text-[#E8441A] text-4xl opacity-30 select-none"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    aria-hidden
                >
                    *
                </div>
                <div
                    className="absolute bottom-12 right-12 text-[#E8441A] text-4xl opacity-30 select-none"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    aria-hidden
                >
                    +
                </div>

                {/* Vertical caption strip */}
                <div
                    aria-hidden
                    className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 rotate-90 origin-center text-[0.55rem] tracking-[0.5em] text-[#5b403a]"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                    NYX_STUDIO · {new Date().getFullYear()} · MIDNIGHT_MANIFESTO
                </div>
            </section>

            {/* MODULE 2: AUTH */}
            <section className="col-span-12 md:col-span-5 bg-[#131313] p-8 md:p-16 flex flex-col justify-center relative">
                <div className="max-w-md w-full mx-auto">
                    {/* Toggle */}
                    <div className="flex mb-12 md:mb-16 border-b-4 border-black">
                        <Link
                            href={loginHref}
                            className={`flex-1 py-4 text-center text-sm font-bold tracking-widest transition-all ${
                                mode === 'login'
                                    ? 'border-b-4 border-[#E8441A] text-[#E8441A]'
                                    : 'text-[#e4beb5] hover:text-[#e5e2e1]'
                            }`}
                            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                        >
                            LOGIN_ACCESS
                        </Link>
                        {showSignupTab && (
                            <Link
                                href="/automate/signup"
                                className={`flex-1 py-4 text-center text-sm font-bold tracking-widest transition-all ${
                                    mode === 'signup'
                                        ? 'border-b-4 border-[#E8441A] text-[#E8441A]'
                                        : 'text-[#e4beb5] hover:text-[#e5e2e1]'
                                }`}
                                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                            >
                                INITIATE_SIGNUP
                            </Link>
                        )}
                    </div>

                    <div className="space-y-10">
                        <div className="space-y-2">
                            <div
                                className="text-3xl md:text-4xl font-bold tracking-tighter uppercase"
                                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                                role="heading"
                                aria-level={1}
                            >
                                {heading}
                            </div>
                            <p className="text-[#e4beb5] text-sm">{subheading}</p>
                        </div>

                        {displayError && (
                            <div
                                role="alert"
                                aria-live="polite"
                                className="border-4 border-[#93000a] bg-[#93000a]/30 text-[#ffb4ab] px-4 py-3 text-xs tracking-widest"
                                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                            >
                                {displayError.toUpperCase()}
                            </div>
                        )}

                        {children}
                    </div>

                    <footer className="mt-20 pt-12 border-t-2 border-[#1c1b1b] flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
                        <div
                            className="text-[0.6rem] tracking-widest uppercase"
                            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                        >
                            © NYX STUDIO | THE MIDNIGHT MANIFESTO
                        </div>
                        <div className="flex gap-6">
                            <Link
                                href="/"
                                className="text-[0.6rem] tracking-widest hover:text-[#E8441A] transition-colors"
                                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                            >
                                HOME
                            </Link>
                        </div>
                    </footer>
                </div>

                <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#353534] m-4" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#353534] m-4" />
            </section>
        </main>
    );
}

function SpecCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-l-2 border-[#E8441A] pl-3 md:pl-4">
            <div
                className="text-[0.55rem] md:text-[0.65rem] tracking-[0.2em] text-[#ab8981] mb-1"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
                {label}
            </div>
            <div
                className="text-xl md:text-2xl font-bold tracking-tight text-[#e5e2e1]"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
                {value}
            </div>
        </div>
    );
}

export function FieldText({
    id,
    name,
    label,
    type = 'text',
    autoComplete,
    placeholder,
    required = true,
}: {
    id: string;
    name: string;
    label: string;
    type?: string;
    autoComplete?: string;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <div className="relative group">
            <label
                htmlFor={id}
                className="absolute -top-3 left-4 px-2 py-0.5 bg-[#131313] text-[0.65rem] font-[var(--font-space-grotesk)] font-bold tracking-[0.2em] text-[#e4beb5] transition-all duration-200 group-focus-within:bg-[#ffd65b] group-focus-within:text-[#3d2f00]"
            >
                *{label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                autoComplete={autoComplete}
                required={required}
                placeholder={placeholder}
                className="w-full bg-[#0e0e0e] border-4 border-black p-5 font-[var(--font-space-grotesk)] text-[#e5e2e1] placeholder:text-[#353534] focus:ring-0 focus:border-[#E8441A] transition-all outline-none"
            />
        </div>
    );
}

export function FieldEmail() {
    return (
        <FieldText
            id="email"
            name="email"
            label="OPERATOR_ID (EMAIL)"
            type="email"
            autoComplete="email"
            placeholder="IDENTITY@DOMAIN.VOID"
        />
    );
}

export function FieldPassword({
    show,
    onToggle,
    autoComplete = 'current-password',
    label = 'ACCESS_KEY (PASSWORD)',
}: {
    show: boolean;
    onToggle: () => void;
    autoComplete?: string;
    label?: string;
}) {
    return (
        <div className="relative group">
            <label
                htmlFor="password"
                className="absolute -top-3 left-4 px-2 py-0.5 bg-[#131313] text-[0.65rem] font-[var(--font-space-grotesk)] font-bold tracking-[0.2em] text-[#e4beb5] transition-all duration-200 group-focus-within:bg-[#ffd65b] group-focus-within:text-[#3d2f00]"
            >
                *{label}
            </label>
            <input
                id="password"
                name="password"
                type={show ? 'text' : 'password'}
                autoComplete={autoComplete}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#0e0e0e] border-4 border-black p-5 pr-14 font-[var(--font-space-grotesk)] text-[#e5e2e1] placeholder:text-[#353534] focus:ring-0 focus:border-[#E8441A] transition-all outline-none"
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#353534] hover:text-[#E8441A] transition-colors"
                aria-label={show ? 'Hide password' : 'Show password'}
            >
                <span className="material-symbols-outlined">{show ? 'visibility_off' : 'visibility'}</span>
            </button>
        </div>
    );
}

export function SocialChannels({ callbackUrl }: { callbackUrl: string }) {
    return (
        <div className="pt-8 space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[#353534]" />
                <span className="font-[var(--font-space-grotesk)] text-[0.6rem] tracking-[0.3em] text-[#353534]">SECURE_CHANNELS</span>
                <div className="h-px flex-1 bg-[#353534]" />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl })}
                    className="bg-[#1c1b1b] border-2 border-black p-4 flex items-center justify-center gap-3 hover:bg-[#353534] transition-all group"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                        <path fill="#EA4335" d="M12 10.2v3.96h5.5c-.24 1.43-1.69 4.2-5.5 4.2-3.31 0-6.01-2.74-6.01-6.12S8.69 6.12 12 6.12c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.84 3.46 14.6 2.5 12 2.5 6.76 2.5 2.5 6.76 2.5 12s4.26 9.5 9.5 9.5c5.48 0 9.11-3.85 9.11-9.27 0-.62-.07-1.1-.16-1.53H12z" />
                    </svg>
                    <span className="font-[var(--font-space-grotesk)] text-[0.7rem] font-bold tracking-widest">GOOGLE_AUTH</span>
                </button>
            </div>
        </div>
    );
}
