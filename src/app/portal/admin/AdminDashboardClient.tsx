'use client'

import { useState, useTransition, useEffect, useRef, useId, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { Toaster, toast } from 'sonner'
import type { SerializedPending, SerializedPartner } from './page'

type Stats = { active: number; pending: number; paused: number; total: number }

interface Props {
  adminEmail: string
  adminName: string | null
  initialPending: SerializedPending[]
  initialPartners: SerializedPartner[]
  initialStats: Stats
}

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

const ORANGE = '#D83C14'
const YELLOW = '#ffd65b'
const GREEN = '#76dc83'
const GREEN_DK = '#3da452'
const BG_LOWEST = '#0e0e0e'
const BG_LOW = '#1c1b1b'
const BG_HIGHEST = '#353534'
const FG = '#e5e2e1'
const FG_DIM = '#e4beb5'
const FG_MUTED = '#ab8981'

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

// ── icon (inline SVG to avoid lucide stroke vibe — brutalist wants chunky) ──
// Reusing material-symbols-outlined font already loaded globally (globals.css).
function MIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden>
      {name}
    </span>
  )
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

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const buildTag = new Date().toISOString().slice(0, 10).replace(/-/g, '_')

  return (
    <div
      className="flex min-h-screen text-[#e5e2e1] selection:bg-[#D83C14] selection:text-white"
      style={{ ...BODY, backgroundColor: BG_LOWEST }}
    >
      <Toaster position="top-right" theme="dark" richColors />

      {/* Side nav */}
      <SideNav adminName={adminName} />

      {/* Content canvas */}
      <main className="ml-0 md:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <TopBar adminEmail={adminEmail} adminName={adminName} />

        {/* Page body */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          {/* Page header */}
          <section className="mb-10 md:mb-12">
            <div className="flex flex-wrap items-start justify-between gap-6 mb-2">
              <div>
                <div className="flex flex-wrap items-end gap-4 mb-2">
                  <h1
                    className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase"
                    style={HEAD}
                  >
                    Brand Partners
                  </h1>
                  <span
                    className="text-xs px-2 py-0.5 font-bold uppercase mb-1"
                    style={{ ...HEAD, backgroundColor: YELLOW, color: '#3d2f00' }}
                  >
                    *ADMIN_PORTAL
                  </span>
                </div>
                <p className="text-[#e4beb5] tracking-tight max-w-2xl text-sm md:text-base">
                  Approve incoming partners, manage active portals, and monitor operational
                  health. System cycle:{' '}
                  <span className="text-[#e5e2e1] font-bold uppercase tracking-widest" style={HEAD}>
                    {today}
                  </span>
                  .
                </p>
              </div>
              <Link
                href="/portal/admin/brands/new"
                className="px-5 py-3 border-4 border-black bg-[#D83C14] text-white text-xs font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] transition-all flex items-center gap-2"
                style={HEAD}
              >
                <MIcon name="add" className="!text-base" />
                + NEW_BRAND
              </Link>
            </div>
          </section>

          {/* Metric bento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-12">
            <MetricCell
              icon="group"
              iconBg={GREEN_DK}
              iconFg="#00320f"
              status="*STATUS_OK"
              value={stats.active}
              valueColor={FG}
              label="ACTIVE"
            />
            <MetricCell
              icon="schedule"
              iconBg={YELLOW}
              iconFg="#3d2f00"
              status="*WAIT_LIST"
              value={stats.pending}
              valueColor={YELLOW}
              label="PENDING"
              pulse={stats.pending > 0}
            />
            <MetricCell
              icon="pause_circle"
              iconBg={BG_HIGHEST}
              iconFg={FG_DIM}
              status="*IDLE_STATE"
              value={stats.paused}
              valueColor={FG_DIM}
              label="PAUSED"
            />
            <MetricCell
              icon="layers"
              iconBg={ORANGE}
              iconFg="#ffffff"
              status="*LIFETIME"
              value={stats.total}
              valueColor={ORANGE}
              label="TOTAL"
            />
          </div>

          {/* Pending requests */}
          <section className="mb-10 md:mb-12">
            <SectionHead
              icon="pending_actions"
              accent={YELLOW}
              title="Pending Requests"
              count={pending.length}
            />
            {pending.length === 0 ? (
              <EmptyBlock
                icon="inbox"
                title="ALL CAUGHT UP"
                body="No pending requests right now. New sign-ins land here automatically."
              />
            ) : (
              <div className="space-y-4">
                {pending.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#0e0e0e] border-4 border-black p-5 md:p-6 flex flex-wrap items-center justify-between gap-6 group transition-transform hover:translate-x-1"
                  >
                    <div className="flex items-center gap-5 md:gap-6 flex-1 min-w-0">
                      <div
                        className="w-14 h-14 md:w-16 md:h-16 border-4 border-black bg-[#D83C14] flex items-center justify-center shrink-0"
                        style={HEAD}
                      >
                        <span className="text-2xl md:text-3xl font-black text-white">
                          {(p.name || p.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        {p.name && (
                          <div
                            className="text-base md:text-lg font-black tracking-tighter uppercase truncate"
                            style={HEAD}
                          >
                            {p.name}
                          </div>
                        )}
                        <p className="text-xs md:text-sm text-[#e4beb5] truncate">{p.email}</p>
                        <p
                          className="text-[10px] text-[#D83C14] mt-1 uppercase font-bold tracking-widest"
                          style={HEAD}
                        >
                          *REQUESTED {timeAgo(p.requestedAt).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setApproveTarget(p)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#76dc83] text-[#00320f] font-black uppercase text-xs border-4 border-black hover:shadow-[4px_4px_0px_#000] transition-all"
                        style={HEAD}
                      >
                        <MIcon name="check_circle" className="text-sm" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(p)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#2a2a2a] text-[#e5e2e1] font-black uppercase text-xs border-4 border-black hover:bg-[#93000a] hover:text-[#ffdad6] transition-all"
                        style={HEAD}
                      >
                        <MIcon name="cancel" className="text-sm" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Active partners */}
          <section>
            <SectionHead
              icon="check_circle"
              accent={GREEN}
              title="Active Brand Partners"
              count={partners.length}
            />
            {partners.length === 0 ? (
              <EmptyBlock
                icon="group"
                title="NO PARTNERS YET"
                body="Approve a pending request to get started."
              />
            ) : (
              <div className="bg-[#1c1b1b] border-4 border-black divide-y-4 divide-black overflow-hidden">
                {partners.map((p) => (
                  <PartnerRow key={p.id} partner={p} onChange={() => router.refresh()} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer
          className="mt-auto p-6 md:p-8 flex flex-wrap justify-between gap-6 border-t-4 border-black"
          style={{ backgroundColor: BG_LOWEST }}
        >
          <div className="flex flex-wrap gap-8 md:gap-12">
            <FooterCell label="*DATABASE_RELAY" value="STABLE_CONNECTION" valueColor={GREEN} />
            <FooterCell label="*OPERATOR" value={adminEmail.toUpperCase()} />
          </div>
          <div className="text-right">
            <div
              className="text-[10px] uppercase font-bold mb-1 tracking-widest"
              style={{ ...HEAD, color: FG_MUTED }}
            >
              *NYX_OS_BUILD
            </div>
            <div className="text-sm font-bold" style={HEAD}>
              BETA_{buildTag}
            </div>
          </div>
        </footer>
      </main>

      {/* Registration marks */}
      <div className="fixed top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#D83C14] pointer-events-none z-[100]" />
      <div className="fixed top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#D83C14] pointer-events-none z-[100]" />
      <div className="fixed bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#D83C14] pointer-events-none z-[100]" />
      <div className="fixed bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#D83C14] pointer-events-none z-[100]" />

      {/* Modals */}
      {approveTarget && (
        <ApproveModal
          target={approveTarget}
          onClose={() => setApproveTarget(null)}
          onSuccess={() => {
            setApproveTarget(null)
            router.refresh()
          }}
          partners={partners}
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

// ── side nav ───────────────────────────────────────────────────────────────

const ADMIN_NAV_ITEMS: Array<{ icon: string; label: string; href: string; active?: boolean }> = [
  { icon: 'group', label: '*BRAND_PARTNERS', href: '/portal/admin', active: true },
]

function SideNav({ adminName }: { adminName: string | null }) {
  const navItems = ADMIN_NAV_ITEMS

  return (
    <aside
      className="hidden md:flex fixed inset-y-0 left-0 flex-col z-50 w-64 border-r-4 border-black"
      style={{ backgroundColor: BG_LOWEST }}
    >
      {/* Brand */}
      <Link
        href="/"
        className="p-8 border-b-4 border-black hover:bg-[#1c1b1b] transition-colors block"
        aria-label="NYX Studio Home"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logo/NYX-Logo.png"
            alt="NYX"
            width={120}
            height={40}
            unoptimized
            sizes="36px"
            className="w-9 h-9 object-contain"
          />
          <div>
            <div
              className="text-xl font-black tracking-tighter text-[#e5e2e1] leading-none"
              style={HEAD}
            >
              NYX STUDIO
            </div>
            <div
              className="text-[10px] uppercase text-[#e4beb5] tracking-widest mt-1"
              style={HEAD}
            >
              {adminName ? `V.01 · ${adminName.toUpperCase()}` : 'V.01 OPERATOR'}
            </div>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  item.active
                    ? 'flex items-center gap-3 px-6 py-4 bg-[#D83C14] text-white border-y-4 border-black translate-x-1 duration-75'
                    : 'flex items-center gap-3 px-6 py-4 text-[#e4beb5] hover:bg-[#ffd65b] hover:text-[#3d2f00] transition-colors duration-100'
                }
              >
                <MIcon name={item.icon} />
                <span
                  className={
                    item.active
                      ? 'text-xs uppercase tracking-widest font-black'
                      : 'text-xs uppercase font-bold tracking-widest'
                  }
                  style={HEAD}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer actions */}
      <div className="mt-auto border-t-4 border-black">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-6 py-6 text-[#e4beb5] hover:bg-[#93000a] hover:text-[#ffdad6] transition-colors duration-100"
        >
          <MIcon name="logout" />
          <span className="text-xs uppercase font-bold tracking-widest" style={HEAD}>
            *LOGOUT
          </span>
        </button>
      </div>
    </aside>
  )
}

// ── mobile nav (drawer) ─────────────────────────────────────────────────────

function MobileNav() {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    drawerRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="md:hidden w-10 h-10 border-4 border-black flex items-center justify-center text-[#e5e2e1] hover:bg-[#1c1b1b] transition-colors shrink-0"
        style={{ backgroundColor: BG_LOWEST }}
      >
        <MIcon name="menu" />
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-[100]">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 w-72 max-w-[82%] border-r-4 border-black flex flex-col focus:outline-none"
            style={{ backgroundColor: BG_LOWEST }}
          >
            <div className="flex items-center justify-between p-5 border-b-4 border-black">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-lg font-black tracking-tighter text-[#e5e2e1]"
                style={HEAD}
              >
                NYX STUDIO
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#D83C14] hover:text-white flex items-center justify-center transition"
              >
                <MIcon name="close" className="!text-sm" />
              </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto">
              <ul className="space-y-1">
                {ADMIN_NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={
                        item.active
                          ? 'flex items-center gap-3 px-5 py-4 bg-[#D83C14] text-white border-y-4 border-black'
                          : 'flex items-center gap-3 px-5 py-4 text-[#e4beb5] hover:bg-[#ffd65b] hover:text-[#3d2f00] transition-colors'
                      }
                    >
                      <MIcon name={item.icon} />
                      <span className="text-xs uppercase tracking-widest font-black" style={HEAD}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto border-t-4 border-black">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-5 py-5 text-[#e4beb5] hover:bg-[#93000a] hover:text-[#ffdad6] transition-colors"
              >
                <MIcon name="logout" />
                <span className="text-xs uppercase font-bold tracking-widest" style={HEAD}>
                  *LOGOUT
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

type ClientNotification = {
  id: string
  type: string
  message: string
  postTitle: string | null
  postId: string | null
  actor: string
  read: boolean
  createdAt: string
  brandPartner: {
    clientName: string
    clientSlug: string
  }
}

function NotificationCenter() {
  const [notifications, setNotifications] = useState<ClientNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/portal/admin/notifications')
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/portal/admin/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      // Optimistically mark all read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark notifications read', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          fetchNotifications()
        }}
        className="relative w-10 h-10 border-4 border-black flex items-center justify-center bg-black hover:bg-[#D83C14] transition-colors"
        title="Notifications"
      >
        <MIcon name="notifications" className="text-white" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center text-[10px] font-black text-[#000]"
            style={{ backgroundColor: YELLOW, border: '2px solid black' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-80 sm:w-96 border-4 border-black p-4 z-50 text-left shadow-[4px_4px_0px_#000]"
          style={{ backgroundColor: BG_LOW, ...BODY }}
        >
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-white" style={HEAD}>
              Activity Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[10px] uppercase font-bold text-[#D83C14] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {notifications.length === 0 ? (
              <p className="text-xs text-[#ab8981] py-4 text-center">No recent activity</p>
            ) : (
              notifications.map((notif) => {
                const typeColors = {
                  APPROVED: GREEN,
                  REVISION_REQUESTED: ORANGE,
                  NEEDS_APPROVAL: YELLOW,
                  CALENDAR_UPDATED: '#60a5fa',
                }
                const dotColor = typeColors[notif.type as keyof typeof typeColors] ?? FG_MUTED

                return (
                  <div
                    key={notif.id}
                    className={`p-2.5 border-2 border-black flex flex-col gap-1 transition-all ${
                      notif.read ? 'bg-[#181818]' : 'bg-[#222121]'
                    }`}
                    style={{
                      borderLeft: `6px solid ${dotColor}`
                    }}
                  >
                    <div className="flex justify-between items-start text-[9px] uppercase tracking-wider font-bold">
                      <span style={{ color: dotColor }}>
                        {notif.brandPartner.clientName}
                      </span>
                      <span className="text-[#ab8981]">{timeAgo(notif.createdAt)}</span>
                    </div>

                    <p className="text-xs text-[#e5e2e1] leading-snug">
                      {notif.message}
                    </p>

                    <div className="flex justify-between items-center text-[9px] text-[#ab8981] pt-0.5">
                      <span>By: {notif.actor.split('@')[0]}</span>
                      {notif.postId && (
                        <Link
                          href={`/portal/admin/${notif.brandPartner.clientSlug}`}
                          onClick={() => setIsOpen(false)}
                          className="hover:underline font-bold text-white uppercase"
                        >
                          View Calendar
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── top bar ────────────────────────────────────────────────────────────────

function TopBar({ adminEmail, adminName }: { adminEmail: string; adminName: string | null }) {
  return (
    <header
      className="sticky top-0 w-full flex justify-between items-center px-4 md:px-8 py-4 z-40 border-b-4 border-black"
      style={{ backgroundColor: BG_LOW }}
    >
      <div className="flex items-center gap-4 md:gap-8 min-w-0">
        <MobileNav />
        <span
          className="text-base md:text-xl font-black text-[#D83C14] tracking-tighter truncate"
          style={HEAD}
        >
          NYX_SYSTEM_BETA
        </span>
        <nav className="hidden lg:flex gap-6 items-center">
          <Link
            href="/portal/admin"
            className="uppercase text-xs text-[#e4beb5] font-medium hover:text-[#D83C14] transition-all"
            style={HEAD}
          >
            *GLOBAL_VIEW
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1 border-4 border-black text-xs font-bold text-[#76dc83]"
          style={{ ...HEAD, backgroundColor: BG_LOWEST }}
        >
          <span className="block w-2 h-2 bg-[#76dc83] animate-pulse" />
          *SYSTEM_LIVE
        </div>

        <NotificationCenter />

        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-right hidden sm:block">
            <p
              className="text-[10px] uppercase font-bold text-[#e5e2e1] leading-tight"
              style={HEAD}
            >
              {adminName ?? adminEmail.split('@')[0]}
            </p>
            <p className="text-[10px] text-[#e4beb5] leading-tight truncate max-w-[180px]">
              {adminEmail}
            </p>
          </div>
          <div
            className="w-10 h-10 border-4 border-black flex items-center justify-center bg-[#D83C14]"
            style={HEAD}
          >
            <span className="text-base font-black text-white">
              {(adminName ?? adminEmail).charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

// ── small components ───────────────────────────────────────────────────────

function MetricCell({
  icon,
  iconBg,
  iconFg,
  status,
  value,
  valueColor,
  label,
  pulse,
}: {
  icon: string
  iconBg: string
  iconFg: string
  status: string
  value: number
  valueColor: string
  label: string
  pulse?: boolean
}) {
  return (
    <div
      className="border-4 border-black p-6 flex flex-col justify-between h-44 md:h-48 hover:bg-[#2a2a2a] transition-colors"
      style={{ backgroundColor: BG_LOW }}
    >
      <div className="flex justify-between items-start">
        <div
          className={`p-2 border-2 border-black ${pulse ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: iconBg, color: iconFg }}
        >
          <MIcon name={icon} />
        </div>
        <span className="text-[10px] tracking-wider" style={{ ...HEAD, color: FG_DIM }}>
          {status}
        </span>
      </div>
      <div>
        <div
          className="text-5xl font-black tracking-tighter"
          style={{ ...HEAD, color: valueColor }}
        >
          {value}
        </div>
        <div
          className="text-xs uppercase font-bold tracking-widest mt-1"
          style={{ ...HEAD, color: FG_DIM }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}

function SectionHead({
  icon,
  accent,
  title,
  count,
}: {
  icon: string
  accent: string
  title: string
  count: number
}) {
  return (
    <div
      className="flex items-center gap-3 mb-6 border-l-4 pl-4"
      style={{ borderColor: accent }}
    >
      <MIcon name={icon} className="!text-base" />
      <div
        className="text-lg md:text-xl font-black tracking-tighter uppercase"
        style={HEAD}
      >
        {title}
      </div>
      {count > 0 && (
        <span
          className="px-2 font-bold text-xs"
          style={{ ...HEAD, backgroundColor: accent, color: '#0e0e0e' }}
        >
          {count}
        </span>
      )}
    </div>
  )
}

function EmptyBlock({
  icon,
  title,
  body,
}: {
  icon: string
  title: string
  body: string
}) {
  return (
    <div
      className="border-4 border-dashed border-[#353534] p-10 text-center"
      style={{ backgroundColor: BG_LOW }}
    >
      <MIcon name={icon} className="!text-3xl opacity-40 block" />
      <p className="text-sm font-black uppercase tracking-tighter mt-3" style={HEAD}>
        {title}
      </p>
      <p className="text-xs text-[#e4beb5] mt-1 max-w-sm mx-auto">{body}</p>
    </div>
  )
}

function FooterCell({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div>
      <div
        className="text-[10px] uppercase font-bold block mb-1 tracking-widest"
        style={{ ...HEAD, color: FG_MUTED }}
      >
        {label}
      </div>
      <div
        className="text-sm font-bold truncate max-w-[260px]"
        style={{ ...HEAD, color: valueColor ?? FG }}
      >
        {value}
      </div>
    </div>
  )
}

// ── partner row ────────────────────────────────────────────────────────────

function PartnerRow({
  partner,
  onChange,
}: {
  partner: SerializedPartner
  onChange: () => void
}) {
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
    <div
      className={`p-5 md:p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-[#2a2a2a] transition-colors ${
        isPaused ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-5 md:gap-6 flex-1 min-w-0">
        <div
          className="w-14 h-14 md:w-16 md:h-16 border-4 border-black flex items-center justify-center bg-[#D83C14] shrink-0"
          style={HEAD}
        >
          <span className="text-2xl md:text-3xl font-black text-white">
            {partner.clientName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="text-base md:text-lg font-black tracking-tighter uppercase truncate"
              style={HEAD}
            >
              {partner.clientName}
            </div>
            {isPaused && (
              <span
                className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5"
                style={{ ...HEAD, backgroundColor: YELLOW, color: '#3d2f00' }}
              >
                Paused
              </span>
            )}
            <button
              onClick={copyUrl}
              className="text-[#e4beb5] hover:text-[#D83C14] transition-colors"
              title="Copy portal URL"
              aria-label="Copy portal URL"
            >
              <MIcon name="content_copy" className="!text-sm" />
            </button>
          </div>
          <p className="text-xs text-[#e4beb5] font-mono">{portalUrl}</p>
          <p
            className="text-[10px] text-[#76dc83] mt-1 uppercase font-bold tracking-widest"
            style={HEAD}
          >
            *APPROVED {formatDate(partner.approvedAt).toUpperCase()} · {partner.email}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/portal/admin/${partner.clientSlug}/posts`}
          className="px-4 py-2 border-2 border-black font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-[#D83C14] hover:text-white transition-all"
          style={{ ...HEAD, backgroundColor: BG_LOWEST }}
        >
          <MIcon name="grid_view" className="!text-sm" />
          Content
        </Link>
        <Link
          href={`/portal/admin/${partner.clientSlug}/calendar-builder`}
          className="px-4 py-2 border-2 border-black font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-[#76dc83] hover:text-[#00320f] transition-all"
          style={{ ...HEAD, backgroundColor: BG_LOWEST }}
          title="Bulk-create posts for a campaign window"
        >
          <MIcon name="auto_awesome" className="!text-sm" />
          Build
        </Link>
        <Link
          href={`/portal/admin/brands/${partner.clientSlug}/edit`}
          className="px-4 py-2 border-2 border-black font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-[#ffd65b] hover:text-[#3d2f00] transition-all"
          style={{ ...HEAD, backgroundColor: BG_LOWEST }}
        >
          <MIcon name="edit" className="!text-sm" />
          Edit
        </Link>
        <Link
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border-2 border-black font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-[#D83C14] hover:text-white transition-all"
          style={{ ...HEAD, backgroundColor: BG_LOWEST }}
        >
          <MIcon name="visibility" className="!text-sm" />
          Preview
        </Link>
        {isPaused ? (
          <button
            onClick={() => setStatus('ACTIVE')}
            disabled={pending}
            className="px-4 py-2 border-2 border-black font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-[#76dc83] hover:text-[#00320f] transition-all disabled:opacity-50"
            style={{ ...HEAD, backgroundColor: BG_LOWEST }}
          >
            <MIcon name="play_arrow" className="!text-sm" />
            Resume
          </button>
        ) : (
          <button
            onClick={() => setStatus('PAUSED')}
            disabled={pending}
            className="px-4 py-2 border-2 border-black font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-[#ffd65b] hover:text-[#3d2f00] transition-all disabled:opacity-50"
            style={{ ...HEAD, backgroundColor: BG_LOWEST }}
          >
            <MIcon name="pause" className="!text-sm" />
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
          className="px-4 py-2 border-2 border-black font-bold uppercase text-[10px] flex items-center gap-2 hover:bg-[#93000a] hover:text-[#ffdad6] transition-all disabled:opacity-50"
          style={{ ...HEAD, backgroundColor: BG_LOWEST }}
        >
          <MIcon name="archive" className="!text-sm" />
          Archive
        </button>
      </div>
    </div>
  )
}

// ── modals ─────────────────────────────────────────────────────────────────

function ApproveModal({
  target,
  onClose,
  onSuccess,
  partners,
}: {
  target: SerializedPending
  onClose: () => void
  onSuccess: () => void
  partners: SerializedPartner[]
}) {
  const [mode, setMode] = useState<'new' | 'existing'>('new')
  const [clientName, setClientName] = useState(target.name ?? '')
  const [clientSlug, setClientSlug] = useState(suggestSlug(target.name ?? target.email.split('@')[0]))
  
  const [existingPartnerId, setExistingPartnerId] = useState(partners[0]?.id ?? '')
  const [existingRole, setExistingRole] = useState<'partner' | 'viewer'>('partner')

  // Feature gates state
  const [features, setFeatures] = useState({
    calendar: true,
    cards: true,
    feed: true,
    tracker: true,
    packB: true,
  })

  const [submitting, setSubmitting] = useState(false)

  function onNameChange(v: string) {
    setClientName(v)
    const prevSuggestion = suggestSlug(clientName)
    if (clientSlug === prevSuggestion || clientSlug === '') {
      setClientSlug(suggestSlug(v))
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'new' && (!clientName.trim() || !clientSlug.trim())) {
      toast.error('Name and slug are required')
      return
    }
    if (mode === 'existing' && !existingPartnerId) {
      toast.error('Please select an existing brand')
      return
    }

    setSubmitting(true)
    const payload = mode === 'new'
      ? {
          action: 'approve',
          email: target.email,
          mode,
          clientName,
          clientSlug,
          featuresAccess: features,
        }
      : {
          action: 'approve',
          email: target.email,
          mode,
          existingPartnerId,
          existingRole,
        }

    const res = await fetch('/api/admin/portal/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSubmitting(false)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Approval failed' }))
      toast.error(error)
      return
    }
    toast.success(
      mode === 'new'
        ? `${clientName} approved · /portal/${clientSlug}`
        : `${target.email} added to brand portal`
    )
    onSuccess()
  }

  return (
    <ModalShell title="*APPROVE_PARTNER" subtitle={target.email} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        
        {/* Mode selector */}
        <BField label="*APPROVAL_MODE">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase text-[#e5e2e1]">
              <input
                type="radio"
                name="approvalMode"
                checked={mode === 'new'}
                onChange={() => setMode('new')}
                className="w-4 h-4 border-4 border-black bg-[#0e0e0e] text-[#D83C14] focus:ring-0"
              />
              Create Brand Portal
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase text-[#e5e2e1]">
              <input
                type="radio"
                name="approvalMode"
                checked={mode === 'existing'}
                onChange={() => setMode('existing')}
                className="w-4 h-4 border-4 border-black bg-[#0e0e0e] text-[#D83C14] focus:ring-0"
              />
              Add to Existing Brand
            </label>
          </div>
        </BField>

        {mode === 'new' ? (
          <>
            <BField label="*CLIENT_NAME" hint="Display name shown in the portal and admin lists">
              <input
                value={clientName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Dessertino"
                autoFocus
                className="w-full px-4 py-3 bg-[#0e0e0e] border-4 border-black text-sm text-[#e5e2e1] outline-none focus:border-[#D83C14] transition"
                style={HEAD}
              />
            </BField>
            <BField label="*CLIENT_SLUG" hint="URL path · lowercase, hyphens only">
              <div className="flex items-center bg-[#0e0e0e] border-4 border-black overflow-hidden focus-within:border-[#D83C14] transition">
                <span
                  className="px-3 py-3 text-xs text-[#e4beb5] font-mono border-r-4 border-black"
                  style={BODY}
                >
                  /portal/
                </span>
                <input
                  value={clientSlug}
                  onChange={(e) => setClientSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="dessertino"
                  className="flex-1 px-3 py-3 bg-transparent text-sm font-mono text-[#e5e2e1] outline-none"
                />
              </div>
            </BField>

            {/* Feature Access Toggles */}
            <BField label="*PORTAL_SECTION_ACCESS" hint="Enable/disable sections inside the brand portal">
              <div className="grid grid-cols-2 gap-3 mt-1">
                {Object.keys(features).map((key) => {
                  const label = key === 'packB' ? 'Pack B (Goals)' : key + ' view'
                  return (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer font-bold text-[11px] uppercase tracking-wider text-[#e4beb5] hover:text-[#e5e2e1]">
                      <input
                        type="checkbox"
                        checked={features[key as keyof typeof features]}
                        onChange={(e) => setFeatures((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="w-4 h-4 border-4 border-black bg-[#0e0e0e] text-[#D83C14] focus:ring-0 rounded-none"
                      />
                      {label}
                    </label>
                  )
                })}
              </div>
            </BField>
          </>
        ) : (
          <>
            <BField label="*SELECT_BRAND" hint="Select the existing brand portal to assign this user to">
              <select
                value={existingPartnerId}
                onChange={(e) => setExistingPartnerId(e.target.value)}
                className="w-full px-4 py-3 bg-[#0e0e0e] border-4 border-black text-sm text-[#e5e2e1] outline-none focus:border-[#D83C14] transition"
                style={HEAD}
              >
                <option value="">-- SELECT BRAND --</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.clientName} ({p.clientSlug})
                  </option>
                ))}
              </select>
            </BField>

            <BField label="*ACCESS_ROLE" hint="Choose the user's permission level for this brand portal">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase text-[#e5e2e1]">
                  <input
                    type="radio"
                    name="existingRole"
                    checked={existingRole === 'partner'}
                    onChange={() => setExistingRole('partner')}
                    className="w-4 h-4 border-4 border-black bg-[#0e0e0e] text-[#D83C14] focus:ring-0"
                  />
                  Main Brand Partner
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs uppercase text-[#e5e2e1]">
                  <input
                    type="radio"
                    name="existingRole"
                    checked={existingRole === 'viewer'}
                    onChange={() => setExistingRole('viewer')}
                    className="w-4 h-4 border-4 border-black bg-[#0e0e0e] text-[#D83C14] focus:ring-0"
                  />
                  Viewer (Read-only guest)
                </label>
              </div>
            </BField>
          </>
        )}

        <ModalActions>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-black uppercase border-4 border-black text-[#e4beb5] hover:bg-[#2a2a2a] transition"
            style={{ ...HEAD, backgroundColor: BG_LOWEST }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 text-sm font-black uppercase border-4 border-black text-[#00320f] bg-[#76dc83] hover:shadow-[4px_4px_0px_#000] disabled:opacity-50 transition flex items-center justify-center gap-2"
            style={HEAD}
          >
            {submitting ? 'APPROVING…' : (
              <>
                <MIcon name="check_circle" className="!text-base" />
                Approve
              </>
            )}
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
    <ModalShell title="*REJECT_REQUEST" subtitle={target.email} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <BField label="*NOTES (OPTIONAL)" hint="Internal — not visible to the requester">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Not a real client / spam / unrelated…"
            rows={3}
            className="w-full px-4 py-3 bg-[#0e0e0e] border-4 border-black text-sm text-[#e5e2e1] outline-none focus:border-[#93000a] transition resize-none"
            style={BODY}
          />
        </BField>
        <ModalActions>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-black uppercase border-4 border-black text-[#e4beb5] hover:bg-[#2a2a2a] transition"
            style={{ ...HEAD, backgroundColor: BG_LOWEST }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 text-sm font-black uppercase border-4 border-black text-[#ffdad6] bg-[#93000a] hover:shadow-[4px_4px_0px_#000] disabled:opacity-50 transition flex items-center justify-center gap-2"
            style={HEAD}
          >
            {submitting ? 'REJECTING…' : (
              <>
                <MIcon name="cancel" className="!text-base" />
                Reject
              </>
            )}
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
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Remember what had focus so we can restore it when the dialog closes.
    const previouslyFocused = document.activeElement as HTMLElement | null
    // Move focus into the dialog.
    dialogRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full sm:max-w-md border-4 border-black shadow-[8px_8px_0px_#000] focus:outline-none"
        style={{ backgroundColor: BG_LOW }}
      >
        <div className="flex items-start justify-between p-5 border-b-4 border-black">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-base font-black uppercase tracking-tighter text-[#e5e2e1]"
              style={HEAD}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#e4beb5] mt-1 truncate font-mono">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 w-8 h-8 border-2 border-black bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#D83C14] hover:text-white flex items-center justify-center transition shrink-0"
            aria-label="Close"
          >
            <MIcon name="close" className="!text-sm" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function BField({
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
      <label
        className="block text-[10px] uppercase tracking-widest font-bold text-[#e4beb5] mb-2"
        style={HEAD}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-[#ab8981] mt-1.5 italic" style={BODY}>
          {hint}
        </p>
      )}
    </div>
  )
}

function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 pt-1">{children}</div>
}
