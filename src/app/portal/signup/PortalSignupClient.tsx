'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { AuthShell, FieldText, FieldEmail } from '../../automate/login/LoginClient'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

export default function PortalSignupClient() {
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState<{
        email: string
        message: string
    } | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        const form = e.target as HTMLFormElement
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
            email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
            brandName: (form.elements.namedItem('brandName') as HTMLInputElement).value.trim(),
            message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
        }
        if (!data.name) return setError('Full name is required')
        if (!data.email.includes('@')) return setError('Valid email required')

        setSubmitting(true)
        try {
            const res = await fetch('/api/portal/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            const payload = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(payload.error ?? 'Request failed')
                setSubmitting(false)
                return
            }
            setSubmitted({ email: data.email, message: payload.message ?? 'Thanks — we got your request.' })
        } catch (err: unknown) {
            setError((err as Error)?.message ?? 'Network error')
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <AuthShell mode="signup" portalFlow showSignupTab={true}>
                <div className="space-y-6" style={BODY}>
                    <div
                        className="border-4 border-black bg-[#76dc83] text-[#00320f] p-5"
                        style={HEAD}
                    >
                        <div className="text-xs uppercase tracking-widest font-bold mb-2">
                            *REQUEST_RECEIVED
                        </div>
                        <p className="text-base">{submitted.message}</p>
                        <p className="text-xs mt-3 font-mono">{submitted.email}</p>
                    </div>
                    <p className="text-[#e4beb5] text-sm">
                        Once an admin approves your access, sign in with the same Google
                        account ({submitted.email}) at the link below — your portal will
                        load automatically.
                    </p>
                    <Link
                        href="/portal/login"
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
        <AuthShell mode="signup" portalFlow showSignupTab={true} displayError={error ?? undefined}>
            <form onSubmit={handleSubmit} className="space-y-8">
                <FieldText id="name" name="name" label="FULL_NAME" placeholder="Your name" autoComplete="name" />
                <FieldEmail />
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
                        rows={4}
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
                        {submitting ? 'SENDING…' : 'REQUEST ACCESS'}
                    </span>
                    <span className="material-symbols-outlined font-bold text-white group-hover:text-[#3d2f00]">
                        arrow_forward
                    </span>
                </button>

                <p className="text-[11px] text-[#ab8981] italic" style={BODY}>
                    Already approved? Sign in with Google on the login page — your portal
                    will load instantly. New here? Submit this form and we&apos;ll review.
                </p>
            </form>

            <div className="pt-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#353534]" />
                    <span
                        className="text-[0.6rem] tracking-[0.3em] text-[#353534]"
                        style={HEAD}
                    >
                        OR_SIGN_IN_DIRECTLY
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
