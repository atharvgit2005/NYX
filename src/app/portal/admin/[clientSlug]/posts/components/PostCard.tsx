'use client'

import type { AdminPost } from '../PostsWorkspaceClient'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const

const TYPE_LABEL: Record<AdminPost['contentType'], string> = {
  REEL: 'REEL',
  CAROUSEL: 'CAROUSEL',
  STATIC_POST: 'POST',
  STORY: 'STORY',
  REEL_STORY: 'REEL+STORY',
}

const PLATFORM_ICON: Record<AdminPost['platform'], string> = {
  INSTAGRAM: 'photo_camera',
  TIKTOK: 'music_note',
}

function formatShortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

interface Props {
  post: AdminPost
  onClick?: () => void
  draggable?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export default function PostCard({ post, onClick, draggable, dragHandleProps }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0e0e0e] border-4 border-black p-3 ${
        onClick ? 'cursor-pointer hover:translate-x-1 transition-transform' : ''
      } ${draggable ? 'select-none' : ''}`}
      {...dragHandleProps}
    >
      <div className="flex gap-3">
        {post.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnailUrl}
            alt=""
            className="w-14 h-14 object-cover border-2 border-black bg-[#1c1b1b] shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 border-2 border-black flex items-center justify-center shrink-0"
            style={{
              background:
                'linear-gradient(135deg, #2a2a2a 0%, #0e0e0e 100%)',
            }}
          >
            <span
              className="material-symbols-outlined text-[#e4beb5]"
              aria-hidden
            >
              {PLATFORM_ICON[post.platform]}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div
            className="text-xs uppercase tracking-tighter font-black truncate"
            style={HEAD}
            title={post.title}
          >
            {post.title}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="text-[10px] uppercase font-bold text-[#e4beb5]"
              style={HEAD}
            >
              {formatShortDate(post.scheduledDate)}
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-widest"
              style={{
                ...HEAD,
                backgroundColor: '#2a2a2a',
                color: '#e4beb5',
              }}
            >
              {TYPE_LABEL[post.contentType]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
