'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { AuthShell, FieldText, FieldEmail } from '@/components/auth/LoginClient'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

export default function PortalSignupClient() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [emailExistsRedirect, setEmailExistsRedirect] = useState<{
        email: string
        loginUrl: string
    } | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setEmailExistsRedirect(null)
        const form = e.target as HTMLFormElement
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
            email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
            password: (form.elements.namedItem('password') as HTMLInputElement).value,
            confirmPassword: (form.elements.namedItem('confirmPassword') as HTMLInputElement).value,
            brandName: (form.elements.namedItem('brandName') as HTMLInputElement).value.trim(),
            message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
        }
        if (!data.name) return setError('Full name is required')
        if (!data.email.includes('@')) return setError('Valid email required')
        if (data.password.length < 8) return setError('Password must be at least 8 characters')
        if (data.password !== data.confirmPassword) return setError('Passwords don’t match')

        setSubmitting(true)
        try {
            const res = await fetch('/api/portal/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    brandName: data.brandName,
                    message: data.message,
                }),
            })
            const payload = await res.json().catch(() => ({}))
            if (!res.ok) {
                if (payload.errorCode === 'ALREADY_REGISTERED') {
                    setEmailExistsRedirect({
                        email: data.email,
                        loginUrl: payload.loginUrl ?? '/portal/login',
                    })
                    setSubmitting(false)
                    return
                }
                setError(payload.error ?? 'Request failed')
                setSubmitting(false)
                return
            }
            // Auto-sign in after successful signup so the user lands on
            // /portal (which shows the pending-approval screen).
            const result = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
            })
            if (result?.error) {
                setError(
                    'Account created, but auto-login failed. Please try signing in manually.',
                )
                setSubmitting(false)
                return
            }
            router.push('/portal')
        } catch (err: unknown) {
            setError((err as Error)?.message ?? 'Network error')
            setSubmitting(false)
        }
    }

    if (emailExistsRedirect) {
        return (
            <AuthShell mode="signup" showSignupTab={true}>
                <div className="space-y-6" style={BODY}>
                    <div
                        className="border-4 border-black bg-[#ffd65b] text-[#3d2f00] p-5"
                        style={HEAD}
                    >
                        <div className="text-xs uppercase tracking-widest font-bold mb-2">
                            *EMAIL_ALREADY_REGISTERED
                        </div>
                        <p className="text-base">
                            An account with{' '}
                            <span className="font-mono">{emailExistsRedirect.email}</span>{' '}
                            already exists.
                        </p>
                        <p className="text-sm mt-2">
                            Sign in below with your existing password — or use Google if
                            you originally signed up that way.
                        </p>
                    </div>
                    <Link
                        href={emailExistsRedirect.loginUrl}
                        className="block w-full bg-[#E8441A] py-5 px-8 border-4 border-black text-center hover:bg-[#ffd65b] hover:text-[#3d2f00] transition-all"
                        style={HEAD}
                    >
                        <span className="font-black text-lg tracking-tighter text-white">
                            GO TO LOGIN →
                        </span>
                    </Link>
                </div>
            </AuthShell>
        )
    }

    return (
        <AuthShell mode="signup" showSignupTab={true} displayError={error ?? undefined}>
            <form onSubmit={handleSubmit} className="space-y-8">
                <FieldText id="name" name="name" label="FULL_NAME" placeholder="Your name" autoComplete="name" />
                <FieldEmail />
                <div className="relative group">
                    <label
                        htmlFor="password"
                        className="absolute -top-3 left-4 px-2 py-0.5 bg-[#131313] text-[0.65rem] font-bold tracking-[0.2em] text-[#e4beb5] transition-all duration-200 group-focus-within:bg-[#ffd65b] group-focus-within:text-[#3d2f00]"
                        style={HEAD}
                    >
                        *PASSWORD (8+ CHARS)
                    </label>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        placeholder="••••••••••••"
                        className="w-full bg-[#0e0e0e] border-4 border-black p-5 pr-14 text-[#e5e2e1] placeholder:text-[#353534] focus:ring-0 focus:border-[#E8441A] transition-all outline-none"
                        style={HEAD}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#353534] hover:text-[#E8441A] transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        <span className="material-symbols-outlined">
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                </div>
                <div className="relative group">
                    <label
                        htmlFor="confirmPassword"
                        className="absolute -top-3 left-4 px-2 py-0.5 bg-[#131313] text-[0.65rem] font-bold tracking-[0.2em] text-[#e4beb5] transition-all duration-200 group-focus-within:bg-[#ffd65b] group-focus-within:text-[#3d2f00]"
                        style={HEAD}
                    >
                        *CONFIRM_PASSWORD
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        placeholder="••••••••••••"
                        className="w-full bg-[#0e0e0e] border-4 border-black p-5 text-[#e5e2e1] placeholder:text-[#353534] focus:ring-0 focus:border-[#E8441A] transition-all outline-none"
                        style={HEAD}
                    />
                </div>
                <FieldText
                    id="brandName"
                    name="brandName"
                    label="BRAND_NAME (OPTIONAL)"
                    placeholder="Brand or company"
                    required={false}
                />
                <div className="relative group">
                    <label
                        htmlFor="message"
                        className="absolute -top-3 left-4 px-2 py-0.5 bg-[#131313] text-[0.65rem] font-bold tracking-[0.2em] text-[#e4beb5] transition-all duration-200 group-focus-within:bg-[#ffd65b] group-focus-within:text-[#3d2f00]"
                        style={HEAD}
                    >
                        MESSAGE (OPTIONAL)
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows={3}
                        maxLength={2000}
                        placeholder="A quick note about your brand or what you're after."
                        className="w-full bg-[#0e0e0e] border-4 border-black p-5 text-[#e5e2e1] placeholder:text-[#353534] focus:ring-0 focus:border-[#E8441A] transition-all outline-none resize-none"
                        style={BODY}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#E8441A] py-6 px-8 border-4 border-black flex items-center justify-between group hover:bg-[#ffd65b] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <span
                        className="font-black text-xl tracking-tighter text-white group-hover:text-[#3d2f00]"
                        style={HEAD}
                    >
                        {submitting ? 'CREATING…' : 'CREATE ACCOUNT'}
                    </span>
                    <span className="material-symbols-outlined font-bold text-white group-hover:text-[#3d2f00]">
                        arrow_forward
                    </span>
                </button>

                <p className="text-[11px] text-[#ab8981] italic" style={BODY}>
                    Already have an account?{' '}
                    <Link
                        href="/portal/login"
                        className="text-[#E8441A] hover:underline decoration-2 underline-offset-4 not-italic"
                    >
                        Sign in here
                    </Link>
                    .
                </p>
            </form>

            <div className="pt-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#353534]" />
                    <span
                        className="text-[0.6rem] tracking-[0.3em] text-[#353534]"
                        style={HEAD}
                    >
                        OR_SIGN_UP_WITH
                    </span>
                    <div className="h-px flex-1 bg-[#353534]" />
                </div>
                <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/portal' })}
                    className="w-full bg-[#1c1b1b] border-2 border-black p-4 flex items-center justify-center gap-3 hover:bg-[#353534] transition-all group"
                >
                    <GoogleLogo className="w-5 h-5" />
                    <span
                        className="text-[0.7rem] font-bold tracking-widest"
                        style={HEAD}
                    >
                        GOOGLE_AUTH
                    </span>
                </button>
            </div>
        </AuthShell>
    )
}

// Inline so PortalSignupClient stays self-contained.
function GoogleLogo({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    )
}
