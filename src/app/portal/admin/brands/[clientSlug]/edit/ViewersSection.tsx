'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

export interface ViewerRow {
    id: string
    email: string
    name: string | null
    addedBy: string
    addedAt: string
}

interface Props {
    clientSlug: string
    initialViewers: ViewerRow[]
}

export default function ViewersSection({ clientSlug, initialViewers }: Props) {
    const [viewers, setViewers] = useState<ViewerRow[]>(initialViewers)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [pending, startTransition] = useTransition()

    function add() {
        const trimmed = email.trim().toLowerCase()
        if (!trimmed.includes('@')) {
            toast.error('Valid email required')
            return
        }
        startTransition(async () => {
            const res = await fetch(
                `/api/portal/admin/brands/${clientSlug}/viewers`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: trimmed,
                        name: name.trim() || null,
                    }),
                },
            )
            if (!res.ok) {
                const { error } = await res
                    .json()
                    .catch(() => ({ error: 'Add failed' }))
                toast.error(error)
                return
            }
            const { viewer } = await res.json()
            const serialised: ViewerRow = {
                id: viewer.id,
                email: viewer.email,
                name: viewer.name ?? null,
                addedBy: viewer.addedBy,
                addedAt: new Date(viewer.addedAt).toISOString(),
            }
            setViewers((prev) => {
                // upsert: replace if email already in list, else prepend
                const without = prev.filter((v) => v.email !== serialised.email)
                return [serialised, ...without]
            })
            setEmail('')
            setName('')
            toast.success(`${trimmed} can now view this portal`)
        })
    }

    function remove(viewerId: string, displayEmail: string) {
        if (
            !confirm(
                `Remove ${displayEmail} from this portal? They lose viewing access immediately.`,
            )
        ) {
            return
        }
        startTransition(async () => {
            const before = viewers
            setViewers((prev) => prev.filter((v) => v.id !== viewerId))
            const res = await fetch(
                `/api/portal/admin/brands/${clientSlug}/viewers/${viewerId}`,
                { method: 'DELETE' },
            )
            if (!res.ok) {
                const { error } = await res
                    .json()
                    .catch(() => ({ error: 'Remove failed' }))
                toast.error(error)
                setViewers(before)
                return
            }
            toast.success(`${displayEmail} removed`)
        })
    }

    return (
        <fieldset className="border-l-4 border-[#D83C14] pl-6 space-y-5 mt-12">
            <legend
                className="text-xs uppercase tracking-[0.2em] text-[#D83C14] font-black mb-2"
                style={HEAD}
            >
                *VIEWER_ACCESS
            </legend>
            <p className="text-xs text-[#ab8981] italic" style={BODY}>
                Read-only guests who can see this brand&apos;s calendar, cards, and
                feed. They can&apos;t edit, drag, or approve — that&apos;s the partner&apos;s
                right. Anyone you add can sign in with that exact email
                address (Google or password) and land here.
            </p>

            {/* Add form */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3">
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    type="email"
                    className="w-full bg-[#0e0e0e] border-4 border-black p-3 text-[#e5e2e1] placeholder:text-[#353534] focus:ring-0 focus:border-[#D83C14] transition-all outline-none"
                    style={HEAD}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            add()
                        }
                    }}
                />
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional display name"
                    type="text"
                    className="w-full bg-[#0e0e0e] border-4 border-black p-3 text-[#e5e2e1] placeholder:text-[#353534] focus:ring-0 focus:border-[#D83C14] transition-all outline-none"
                    style={HEAD}
                />
                <button
                    type="button"
                    onClick={add}
                    disabled={pending || !email.includes('@')}
                    className="px-5 py-3 border-4 border-black bg-[#D83C14] text-white text-xs font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] disabled:opacity-50 transition-all"
                    style={HEAD}
                >
                    + ADD_VIEWER
                </button>
            </div>

            {/* List */}
            {viewers.length === 0 ? (
                <div
                    className="border-4 border-dashed border-[#353534] p-6 text-center text-xs text-[#ab8981]"
                    style={BODY}
                >
                    No viewers yet. The brand partner is the only non-admin who
                    can see this portal.
                </div>
            ) : (
                <div className="bg-[#1c1b1b] border-4 border-black divide-y-4 divide-black">
                    {viewers.map((v) => (
                        <div
                            key={v.id}
                            className="p-4 flex flex-wrap items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    {v.name && (
                                        <span
                                            className="text-sm font-black uppercase tracking-tighter"
                                            style={HEAD}
                                        >
                                            {v.name}
                                        </span>
                                    )}
                                    <span className="text-xs text-[#e4beb5] font-mono">
                                        {v.email}
                                    </span>
                                </div>
                                <p
                                    className="text-[10px] text-[#ab8981] mt-1 uppercase tracking-widest font-bold"
                                    style={HEAD}
                                >
                                    *ADDED{' '}
                                    {new Date(v.addedAt).toLocaleDateString(
                                        'en-IN',
                                        {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        },
                                    )}{' '}
                                    BY {v.addedBy}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(v.id, v.email)}
                                disabled={pending}
                                className="px-3 py-2 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#93000a] hover:text-[#ffdad6] text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                style={HEAD}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </fieldset>
    )
}
