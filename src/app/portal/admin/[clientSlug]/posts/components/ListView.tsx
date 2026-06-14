'use client'

import type { PostStatus } from '@prisma/client'
import type { AdminPost } from '../PostsWorkspaceClient'

const STATUSES: PostStatus[] = [
  'IDEA',
  'DRAFTING',
  'NEEDS_APPROVAL',
  'NEEDS_REVISION',
  'APPROVED',
  'POSTED',
]

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const

const STATUS_ACCENT: Record<AdminPost['status'], string> = {
  IDEA: '#ab8981',
  DRAFTING: '#e4beb5',
  NEEDS_APPROVAL: '#ffd65b',
  NEEDS_REVISION: '#D83C14',
  APPROVED: '#76dc83',
  POSTED: '#3da452',
}

interface Props {
  posts: AdminPost[]
  onClickPost: (post: AdminPost) => void
  /** Inline status change from the row — no modal. */
  onChangeStatus?: (id: string, status: PostStatus) => void
}

export default function ListView({ posts, onClickPost, onChangeStatus }: Props) {
  const sorted = [...posts].sort(
    (a, b) =>
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime() ||
      a.position - b.position,
  )

  return (
    <div className="border-4 border-black bg-[#1c1b1b] overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-left text-[10px] uppercase tracking-widest font-black border-b-4 border-black"
            style={{ ...HEAD, backgroundColor: '#0e0e0e' }}
          >
            <th className="px-4 py-3"></th>
            <th className="px-4 py-3">*TITLE</th>
            <th className="px-4 py-3">*DATE</th>
            <th className="px-4 py-3">*PLATFORM</th>
            <th className="px-4 py-3">*TYPE</th>
            <th className="px-4 py-3">*STATUS</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.id}
              onClick={() => onClickPost(p)}
              className="border-b-4 border-black cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            >
              <td className="px-4 py-3">
                {p.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnailUrl}
                    alt=""
                    className="w-10 h-10 object-cover border-2 border-black"
                  />
                ) : (
                  <div
                    className="w-10 h-10 border-2 border-black"
                    style={{
                      background: 'linear-gradient(135deg, #2a2a2a 0%, #0e0e0e 100%)',
                    }}
                  />
                )}
              </td>
              <td className="px-4 py-3 font-black uppercase tracking-tighter" style={HEAD}>
                {p.title}
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {new Date(p.scheduledDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </td>
              <td className="px-4 py-3 text-xs uppercase tracking-widest" style={HEAD}>
                {p.platform}
              </td>
              <td className="px-4 py-3 text-xs uppercase tracking-widest text-[#e4beb5]" style={HEAD}>
                {p.contentType.replace('_', ' ')}
              </td>
              <td className="px-4 py-3">
                {onChangeStatus ? (
                  <select
                    value={p.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onChangeStatus(p.id, e.target.value as PostStatus)}
                    className="text-[10px] uppercase tracking-widest font-black px-2 py-1 border-2 border-black cursor-pointer outline-none"
                    style={{
                      ...HEAD,
                      backgroundColor: STATUS_ACCENT[p.status],
                      color: '#0e0e0e',
                    }}
                    aria-label={`Change status for ${p.title}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-white text-black">
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className="text-[10px] uppercase tracking-widest font-black px-2 py-1"
                    style={{
                      ...HEAD,
                      backgroundColor: STATUS_ACCENT[p.status],
                      color: '#0e0e0e',
                    }}
                  >
                    {p.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
