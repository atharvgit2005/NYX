'use client'

import { useMemo } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PostStatus } from '@prisma/client'
import type { AdminPost } from '../PostsWorkspaceClient'
import PostCard from './PostCard'

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const

const COLUMNS: Array<{ status: PostStatus; label: string; accent: string }> = [
  { status: 'IDEA', label: 'IDEA', accent: '#ab8981' },
  { status: 'DRAFTING', label: 'DRAFTING', accent: '#e4beb5' },
  { status: 'NEEDS_APPROVAL', label: 'NEEDS_APPROVAL', accent: '#ffd65b' },
  { status: 'NEEDS_REVISION', label: 'NEEDS_REVISION', accent: '#E8441A' },
  { status: 'APPROVED', label: 'APPROVED', accent: '#76dc83' },
  { status: 'POSTED', label: 'POSTED', accent: '#3da452' },
]

interface Props {
  posts: AdminPost[]
  onMoveStatus: (id: string, status: PostStatus, position?: number) => void
  onReorder: (id: string, position: number) => void
  onClickPost: (post: AdminPost) => void
}

export default function KanbanView({
  posts,
  onMoveStatus,
  onReorder,
  onClickPost,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const grouped = useMemo(() => {
    const m: Record<PostStatus, AdminPost[]> = {
      IDEA: [],
      DRAFTING: [],
      NEEDS_APPROVAL: [],
      NEEDS_REVISION: [],
      APPROVED: [],
      POSTED: [],
    }
    for (const p of posts) m[p.status].push(p)
    for (const k of Object.keys(m) as PostStatus[]) {
      m[k].sort(
        (a, b) =>
          a.position - b.position ||
          new Date(a.scheduledDate).getTime() -
            new Date(b.scheduledDate).getTime(),
      )
    }
    return m
  }, [posts])

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)

    const dragging = posts.find((p) => p.id === activeId)
    if (!dragging) return

    // Dropped on a column header (no overId match)?
    const targetCol = COLUMNS.find((c) => c.status === overId)
    if (targetCol) {
      if (dragging.status !== targetCol.status) {
        const colMax = grouped[targetCol.status].length
        onMoveStatus(activeId, targetCol.status, colMax)
      }
      return
    }

    const overPost = posts.find((p) => p.id === overId)
    if (!overPost) return

    if (overPost.status !== dragging.status) {
      // Moving across columns — drop just above overPost.
      onMoveStatus(activeId, overPost.status, overPost.position)
      return
    }

    // Within same column — reorder using arrayMove for clean position math.
    const col = grouped[dragging.status]
    const oldIdx = col.findIndex((p) => p.id === activeId)
    const newIdx = col.findIndex((p) => p.id === overId)
    if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return
    const reordered = arrayMove(col, oldIdx, newIdx)
    // Recompute the position for the dragged post as the slot it landed in.
    const newPosition = reordered.findIndex((p) => p.id === activeId)
    onReorder(activeId, newPosition)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div
        className="grid gap-4 min-w-max"
        style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(220px, 1fr))` }}
      >
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            accent={col.accent}
            posts={grouped[col.status]}
            onClickPost={onClickPost}
          />
        ))}
      </div>
    </DndContext>
  )
}

function Column({
  status,
  label,
  accent,
  posts,
  onClickPost,
}: {
  status: PostStatus
  label: string
  accent: string
  posts: AdminPost[]
  onClickPost: (post: AdminPost) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`border-4 border-black flex flex-col ${
        isOver ? 'bg-[#2a2a2a]' : 'bg-[#1c1b1b]'
      }`}
    >
      <div
        className="px-3 py-2 border-b-4 border-black flex items-center justify-between gap-2"
        style={{ backgroundColor: '#0e0e0e' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="block w-2 h-2 rounded-none"
            style={{ backgroundColor: accent }}
          />
          <span
            className="text-[10px] uppercase tracking-widest font-black"
            style={HEAD}
          >
            *{label}
          </span>
        </div>
        <span
          className="text-[10px] font-bold tracking-widest"
          style={{ ...HEAD, color: accent }}
        >
          {posts.length}
        </span>
      </div>
      <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="p-3 space-y-3 min-h-[120px]">
          {posts.map((p) => (
            <SortablePost key={p.id} post={p} onClick={() => onClickPost(p)} />
          ))}
          {posts.length === 0 && (
            <div
              className="text-[10px] text-[#5b403a] text-center py-4"
              style={HEAD}
            >
              — empty —
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

function SortablePost({ post, onClick }: { post: AdminPost; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PostCard post={post} onClick={onClick} draggable />
    </div>
  )
}
