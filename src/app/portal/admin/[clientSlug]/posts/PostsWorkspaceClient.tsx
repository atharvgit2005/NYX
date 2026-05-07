'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'
import type { ContentType, PostStatus, Platform, CommentType } from '@prisma/client'
import KanbanView from './components/KanbanView'
import ListView from './components/ListView'
import CalendarView from './components/CalendarView'
import PostFormModal from './components/PostFormModal'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const
const BODY = { fontFamily: 'var(--font-work-sans), sans-serif' } as const

export interface AdminComment {
  id: string
  authorEmail: string
  body: string
  type: CommentType
  createdAt: string
}

export interface AdminPost {
  id: string
  title: string
  scheduledDate: string
  contentType: ContentType
  platform: Platform
  status: PostStatus
  caption: string
  hashtags: string[]
  visualDirection: string
  productionNotes: string | null
  thumbnailUrl: string | null
  position: number
  archivedAt: string | null
  comments: AdminComment[]
}

type View = 'kanban' | 'list' | 'calendar'

interface Props {
  clientSlug: string
  brandName: string
  brandColor: string
  defaultPlatforms: Platform[]
  initialPosts: AdminPost[]
}

export default function PostsWorkspaceClient({
  clientSlug,
  brandName,
  brandColor,
  defaultPlatforms,
  initialPosts,
}: Props) {
  const router = useRouter()
  const [view, setView] = useState<View>('kanban')
  const [posts, setPosts] = useState<AdminPost[]>(initialPosts)
  const [editing, setEditing] = useState<AdminPost | null>(null)
  const [creating, setCreating] = useState(false)
  const [, startTransition] = useTransition()

  // ── mutation helpers ──
  async function patchPost(id: string, body: Record<string, unknown>) {
    const res = await fetch(
      `/api/portal/admin/${clientSlug}/posts/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Update failed' }))
      throw new Error(error)
    }
    return res.json()
  }

  function applyOptimistic(id: string, partial: Partial<AdminPost>) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)))
  }
  function revert(prev: AdminPost[]) {
    setPosts(prev)
  }

  async function moveStatus(id: string, status: PostStatus, position?: number) {
    const before = posts
    applyOptimistic(id, { status, ...(position !== undefined ? { position } : {}) })
    try {
      await patchPost(id, { status, ...(position !== undefined ? { position } : {}) })
    } catch (e) {
      revert(before)
      toast.error(`Couldn't update status — reverted. ${(e as Error).message}`)
    }
  }
  async function reorder(id: string, position: number) {
    const before = posts
    applyOptimistic(id, { position })
    try {
      await patchPost(id, { position })
    } catch (e) {
      revert(before)
      toast.error(`Couldn't update position — reverted. ${(e as Error).message}`)
    }
  }
  async function moveToDate(id: string, scheduledDate: string) {
    const before = posts
    applyOptimistic(id, { scheduledDate })
    try {
      await patchPost(id, { scheduledDate })
    } catch (e) {
      revert(before)
      toast.error(`Couldn't update date — reverted. ${(e as Error).message}`)
    }
  }
  async function archive(id: string) {
    const before = posts
    setPosts((prev) => prev.filter((p) => p.id !== id))
    try {
      await fetch(`/api/portal/admin/${clientSlug}/posts/${id}`, { method: 'DELETE' })
      toast.success('Post archived')
      startTransition(() => router.refresh())
    } catch (e) {
      revert(before)
      toast.error(`Couldn't archive — reverted. ${(e as Error).message}`)
    }
  }

  async function saveEdited(updated: Partial<AdminPost> & { id: string }) {
    const { id, comments, archivedAt, ...rest } = updated
    void comments
    void archivedAt
    const before = posts
    applyOptimistic(id, rest)
    try {
      const { post } = await patchPost(id, rest)
      // Replace with server-truth (server may transform e.g. dates)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...post,
                scheduledDate: new Date(post.scheduledDate).toISOString(),
                archivedAt: post.archivedAt ? new Date(post.archivedAt).toISOString() : null,
              }
            : p,
        ),
      )
      toast.success('Post saved')
      setEditing(null)
    } catch (e) {
      revert(before)
      toast.error((e as Error).message)
    }
  }

  async function createNew(input: Omit<AdminPost, 'id' | 'archivedAt' | 'position' | 'comments' | 'status'>) {
    try {
      const res = await fetch(`/api/portal/admin/${clientSlug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          scheduledDate: input.scheduledDate,
        }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Create failed' }))
        throw new Error(error)
      }
      const { post } = await res.json()
      setPosts((prev) => [
        ...prev,
        {
          ...post,
          scheduledDate: new Date(post.scheduledDate).toISOString(),
          archivedAt: null,
          comments: [],
        },
      ])
      toast.success('Post created')
      setCreating(false)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div
      className="flex min-h-screen text-[#e5e2e1] selection:bg-[#E8441A] selection:text-white"
      style={{ ...BODY, backgroundColor: '#0e0e0e' }}
    >
      <Toaster position="top-right" theme="dark" richColors />

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header
          className="px-6 md:px-10 py-6 border-b-4 border-black flex flex-wrap items-end justify-between gap-4"
          style={{ backgroundColor: '#1c1b1b' }}
        >
          <div>
            <Link
              href="/portal/admin"
              className="text-xs uppercase tracking-widest text-[#e4beb5] hover:text-[#E8441A]"
              style={HEAD}
            >
              ← Back to admin
            </Link>
            <div className="flex flex-wrap items-end gap-3 mt-1">
              <div
                className="text-3xl md:text-5xl font-black tracking-tighter leading-none uppercase"
                style={HEAD}
                role="heading"
                aria-level={1}
              >
                {brandName}
              </div>
              <span
                className="text-xs px-2 py-0.5 font-bold uppercase mb-1"
                style={{
                  ...HEAD,
                  backgroundColor: brandColor,
                  color: '#ffffff',
                }}
              >
                *CONTENT_WORKSPACE
              </span>
            </div>
            <p className="text-[#e4beb5] text-sm mt-1 font-mono">/portal/{clientSlug}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ViewToggle current={view} onChange={setView} />
            <button
              onClick={() => setCreating(true)}
              className="px-5 py-3 border-4 border-black bg-[#E8441A] text-white text-xs font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] transition-all flex items-center gap-2"
              style={HEAD}
            >
              <span className="material-symbols-outlined !text-base" aria-hidden>
                add
              </span>
              + NEW_POST
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10 overflow-x-auto">
          {posts.length === 0 ? (
            <EmptyState onCreate={() => setCreating(true)} />
          ) : view === 'kanban' ? (
            <KanbanView
              posts={posts}
              onMoveStatus={moveStatus}
              onReorder={reorder}
              onClickPost={(p) => setEditing(p)}
            />
          ) : view === 'list' ? (
            <ListView posts={posts} onClickPost={(p) => setEditing(p)} />
          ) : (
            <CalendarView posts={posts} onMoveDate={moveToDate} onClickPost={(p) => setEditing(p)} />
          )}
        </div>
      </main>

      {creating && (
        <PostFormModal
          mode="create"
          defaultPlatform={defaultPlatforms[0] ?? 'INSTAGRAM'}
          onClose={() => setCreating(false)}
          onSubmit={(values) =>
            createNew({
              title: values.title,
              scheduledDate: values.scheduledDate,
              contentType: values.contentType,
              platform: values.platform,
              caption: values.caption,
              hashtags: values.hashtags,
              visualDirection: values.visualDirection,
              productionNotes: values.productionNotes,
              thumbnailUrl: values.thumbnailUrl,
            })
          }
        />
      )}
      {editing && (
        <PostFormModal
          mode="edit"
          defaultPlatform={editing.platform}
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(values) =>
            saveEdited({
              id: editing.id,
              title: values.title,
              scheduledDate: values.scheduledDate,
              contentType: values.contentType,
              platform: values.platform,
              status: values.status ?? editing.status,
              caption: values.caption,
              hashtags: values.hashtags,
              visualDirection: values.visualDirection,
              productionNotes: values.productionNotes,
              thumbnailUrl: values.thumbnailUrl,
            })
          }
          onArchive={() => {
            archive(editing.id)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function ViewToggle({
  current,
  onChange,
}: {
  current: View
  onChange: (v: View) => void
}) {
  const options: Array<{ key: View; label: string; icon: string }> = [
    { key: 'kanban', label: 'KANBAN', icon: 'view_kanban' },
    { key: 'list', label: 'LIST', icon: 'list' },
    { key: 'calendar', label: 'CALENDAR', icon: 'calendar_month' },
  ]
  return (
    <div className="flex border-4 border-black" style={HEAD}>
      {options.map(({ key, label, icon }) => {
        const active = current === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-3 md:px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all border-r-4 border-black last:border-r-0 ${
              active ? 'bg-[#E8441A] text-white' : 'bg-[#0e0e0e] text-[#e4beb5] hover:bg-[#2a2a2a]'
            }`}
          >
            <span className="material-symbols-outlined !text-sm" aria-hidden>
              {icon}
            </span>
            <span className="hidden md:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="border-4 border-dashed border-[#353534] p-16 text-center bg-[#1c1b1b]">
      <span
        className="material-symbols-outlined !text-5xl text-[#e4beb5] opacity-40 block"
        aria-hidden
      >
        inbox
      </span>
      <div
        className="text-xl font-black uppercase tracking-tighter mt-4"
        style={HEAD}
      >
        NO POSTS YET
      </div>
      <p className="text-[#e4beb5] text-sm mt-2 max-w-md mx-auto">
        Create the first post for this brand to populate the calendar.
      </p>
      <button
        onClick={onCreate}
        className="mt-6 px-5 py-3 border-4 border-black bg-[#E8441A] text-white text-xs font-black uppercase tracking-widest hover:shadow-[4px_4px_0px_#000] transition-all"
        style={HEAD}
      >
        + NEW_POST
      </button>
    </div>
  )
}
