'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { Toaster, toast } from 'sonner'
import {
  Users,
  Clock,
  PauseCircle,
  Layers,
  Mail,
  Eye,
  Pause,
  Archive,
  Play,
  Check,
  X,
  Copy,
  ExternalLink,
  LogOut,
  Inbox,
  Sparkles,
} from 'lucide-react'
import type { SerializedPending, SerializedPartner } from './page'

type Stats = { active: number; pending: number; paused: number; total: number }

interface Props {
  adminEmail: string
  adminName: string | null
  initialPending: SerializedPending[]
  initialPartners: SerializedPartner[]
  initialStats: Stats
}

// ── helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min${m === 1 ? '' : 's'} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function suggestSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── main ───────────────────────────────────────────────────────────────────

export default function AdminDashboardClient({
  adminEmail,
  adminName,
  initialPending,
  initialPartners,
  initialStats,
}: Props) {
  const router = useRouter()
  const [pending] = useState(initialPending)
  const [partners] = useState(initialPartners)
  const [stats] = useState(initialStats)
  const [approveTarget, setApproveTarget] = useState<SerializedPending | null>(null)
  const [rejectTarget, setRejectTarget] = useState<SerializedPending | null>(null)

  return (
    <div className="min-h-screen bg-page text-theme-primary">
      <Toaster position="top-right" theme="dark" richColors />

      {/* Header */}
      <header className="border-b border-theme bg-card-theme/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 relative shrink-0">
              <Image src="/logo/NYX-Logo.png" alt="NYX" width={36} height={36} className="h-full w-full object-contain" unoptimized sizes="36px" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-theme-secondary font-bold">NYX Studio</p>
              <p className="text-sm font-black text-theme-primary -mt-0.5">Portal Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              {adminName && <p className="text-xs font-bold text-theme-primary leading-tight">{adminName}</p>}
              <p className="text-[11px] text-theme-secondary leading-tight">{adminEmail}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-card-theme border border-theme text-theme-secondary hover:text-theme-primary hover:bg-accent transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-black text-theme-primary">Brand Partners</h1>
          <p className="text-theme-secondary mt-1 text-sm">
            Approve incoming partners, manage active portals · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active" value={stats.active} icon={Users} color="#10b981" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="#f59e0b" pulse={stats.pending > 0} />
          <StatCard label="Paused" value={stats.paused} icon={PauseCircle} color="#06b6d4" />
          <StatCard label="Total" value={stats.total} icon={Layers} color="#f97316" />
        </div>

        {/* Pending */}
        <section>
          <SectionHeader
            icon={Clock}
            iconColor="#f59e0b"
            title="Pending Requests"
            count={pending.length}
            description="People who signed in but aren't yet approved"
          />
          {pending.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="All caught up"
              body="No pending requests right now. New sign-ins land here automatically."
            />
          ) : (
            <div className="rounded-2xl border border-theme bg-card-theme overflow-hidden">
              <ul className="divide-y divide-theme">
                {pending.map((p) => (
                  <li key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-sm font-black text-white shrink-0">
                        {(p.name || p.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        {p.name && <p className="text-sm font-bold text-theme-primary truncate">{p.name}</p>}
                        <p className="text-xs text-theme-secondary flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{p.email}</span>
                        </p>
                        <p className="text-[11px] text-theme-secondary mt-0.5">Requested {timeAgo(p.requestedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <button
                        onClick={() => setApproveTarget(p)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(p)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Active partners */}
        <section>
          <SectionHeader
            icon={Sparkles}
            iconColor="#10b981"
            title="Active Brand Partners"
            count={partners.length}
            description="Approved partners with active or paused portals"
          />
          {partners.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No partners yet"
              body="Approve a pending request to get started."
            />
          ) : (
            <div className="rounded-2xl border border-theme bg-card-theme overflow-hidden">
              <ul className="divide-y divide-theme">
                {partners.map((p) => (
                  <PartnerRow key={p.id} partner={p} onChange={() => router.refresh()} />
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {approveTarget && (
        <ApproveModal
          target={approveTarget}
          onClose={() => setApproveTarget(null)}
          onSuccess={() => {
            setApproveTarget(null)
            router.refresh()
          }}
        />
      )}
      {rejectTarget && (
        <RejectModal
          target={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onSuccess={() => {
            setRejectTarget(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

// ── small components ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  pulse,
}: {
  label: string
  value: number
  icon: any
  color: string
  pulse?: boolean
}) {
  return (
    <div className="rounded-2xl border border-theme bg-card-theme p-5 hover:border-orange-500/20 transition-all">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${pulse ? 'animate-pulse' : ''}`}
        style={{ background: `${color}22` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-3xl font-black text-theme-primary leading-none mb-1">{value}</p>
      <p className="text-xs text-theme-secondary uppercase tracking-wider font-bold">{label}</p>
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  iconColor,
  title,
  count,
  description,
}: {
  icon: any
  iconColor: string
  title: string
  count: number
  description: string
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-xl font-black text-theme-primary flex items-center gap-2.5">
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
          {title}
          {count > 0 && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${iconColor}22`, color: iconColor }}
            >
              {count}
            </span>
          )}
        </h2>
        <p className="text-xs text-theme-secondary mt-1">{description}</p>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-theme bg-card-theme/40 p-10 text-center">
      <Icon className="w-8 h-8 mx-auto mb-3 text-theme-secondary opacity-40" />
      <p className="text-sm font-bold text-theme-primary">{title}</p>
      <p className="text-xs text-theme-secondary mt-1 max-w-sm mx-auto">{body}</p>
    </div>
  )
}

function PartnerRow({ partner, onChange }: { partner: SerializedPartner; onChange: () => void }) {
  const [pending, startTransition] = useTransition()
  const isPaused = partner.status === 'PAUSED'
  const portalUrl = `/portal/${partner.clientSlug}`

  async function setStatus(status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') {
    startTransition(async () => {
      const res = await fetch(`/api/admin/portal/partners/${partner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Update failed' }))
        toast.error(error)
        return
      }
      const verb = status === 'ACTIVE' ? 'resumed' : status === 'PAUSED' ? 'paused' : 'archived'
      toast.success(`${partner.clientName} ${verb}`)
      onChange()
    })
  }

  function copyUrl() {
    const fullUrl = `${window.location.origin}${portalUrl}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('Portal URL copied')
  }

  return (
    <li
      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
        isPaused ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-sm font-black text-white shrink-0">
          {partner.clientName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-theme-primary truncate">{partner.clientName}</p>
            {isPaused && (
              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Paused
              </span>
            )}
          </div>
          <button
            onClick={copyUrl}
            className="text-xs text-theme-secondary hover:text-orange-400 flex items-center gap-1.5 group transition mt-0.5"
            title="Click to copy"
          >
            <span className="font-mono truncate">{portalUrl}</span>
            <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100" />
          </button>
          <p className="text-[11px] text-theme-secondary mt-1">
            <Mail className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            {partner.email} · approved {formatDate(partner.approvedAt)} by {partner.approvedBy}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:shrink-0">
        <Link
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
          <ExternalLink className="w-3 h-3 opacity-60" />
        </Link>
        {isPaused ? (
          <button
            onClick={() => setStatus('ACTIVE')}
            disabled={pending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Resume
          </button>
        ) : (
          <button
            onClick={() => setStatus('PAUSED')}
            disabled={pending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition disabled:opacity-50"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        )}
        <button
          onClick={() => {
            if (confirm(`Archive ${partner.clientName}? They lose portal access until restored.`)) {
              setStatus('ARCHIVED')
            }
          }}
          disabled={pending}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
        >
          <Archive className="w-3.5 h-3.5" />
          Archive
        </button>
      </div>
    </li>
  )
}

function ApproveModal({
  target,
  onClose,
  onSuccess,
}: {
  target: SerializedPending
  onClose: () => void
  onSuccess: () => void
}) {
  const [clientName, setClientName] = useState(target.name ?? '')
  const [clientSlug, setClientSlug] = useState(suggestSlug(target.name ?? target.email.split('@')[0]))
  const [submitting, setSubmitting] = useState(false)

  function onNameChange(v: string) {
    setClientName(v)
    // Re-suggest slug as long as it still matches the previously suggested form
    const prevSuggestion = suggestSlug(clientName)
    if (clientSlug === prevSuggestion || clientSlug === '') {
      setClientSlug(suggestSlug(v))
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientName.trim() || !clientSlug.trim()) {
      toast.error('Name and slug are required')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/admin/portal/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', email: target.email, clientName, clientSlug }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Approval failed' }))
      toast.error(error)
      return
    }
    toast.success(`${clientName} approved · /portal/${clientSlug}`)
    onSuccess()
  }

  return (
    <ModalShell title="Approve Partner" subtitle={target.email} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Client Name" hint="Display name shown in the portal and admin lists">
          <input
            value={clientName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Dessertino"
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl bg-page border border-theme text-sm text-theme-primary outline-none focus:border-orange-500/40 transition"
          />
        </Field>
        <Field label="Client Slug" hint="URL path for their portal · lowercase, hyphens only">
          <div className="flex items-center rounded-xl bg-page border border-theme overflow-hidden focus-within:border-orange-500/40 transition">
            <span className="px-3 py-2.5 text-xs text-theme-secondary font-mono border-r border-theme">/portal/</span>
            <input
              value={clientSlug}
              onChange={(e) => setClientSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="dessertino"
              className="flex-1 px-3 py-2.5 bg-transparent text-sm font-mono text-theme-primary outline-none"
            />
          </div>
        </Field>
        <ModalActions>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-theme-secondary border border-theme hover:bg-accent transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-green-600 hover:bg-green-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {submitting ? 'Approving…' : <><Check className="w-4 h-4" /> Approve</>}
          </button>
        </ModalActions>
      </form>
    </ModalShell>
  )
}

function RejectModal({
  target,
  onClose,
  onSuccess,
}: {
  target: SerializedPending
  onClose: () => void
  onSuccess: () => void
}) {
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/admin/portal/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', email: target.email, notes }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Rejection failed' }))
      toast.error(error)
      return
    }
    toast.success('Request rejected')
    onSuccess()
  }

  return (
    <ModalShell title="Reject Request" subtitle={target.email} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Notes (optional)" hint="Internal — why are you rejecting? Not visible to the requester">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Not a real client / spam / unrelated…"
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-page border border-theme text-sm text-theme-primary outline-none focus:border-red-500/40 transition resize-none"
          />
        </Field>
        <ModalActions>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-theme-secondary border border-theme hover:bg-accent transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {submitting ? 'Rejecting…' : <><X className="w-4 h-4" /> Reject</>}
          </button>
        </ModalActions>
      </form>
    </ModalShell>
  )
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md bg-card-theme border border-theme rounded-t-3xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-theme">
          <div className="min-w-0">
            <h3 className="text-base font-black text-theme-primary">{title}</h3>
            {subtitle && (
              <p className="text-xs text-theme-secondary mt-0.5 truncate font-mono">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 w-7 h-7 rounded-lg bg-page border border-theme text-theme-secondary hover:text-theme-primary hover:bg-accent flex items-center justify-center transition shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider font-bold text-theme-secondary mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-theme-secondary mt-1.5">{hint}</p>}
    </div>
  )
}

function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 pt-1">{children}</div>
}
