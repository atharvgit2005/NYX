'use client'

import { useMemo } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PostStatus } from '@prisma/client'
import type { AdminPost } from '../PostsWorkspaceClient'
import PostCard from './PostCard'
import { dndScreenReaderInstructions, makeDndAnnouncements } from '@/lib/portal/dnd-a11y'

// Space picks up / drops a card so Enter stays free to open the post editor.
const KEYBOARD_CODES = {
  start: ['Space'],
  cancel: ['Escape'],
  end: ['Space'],
}

const HEAD = { fontFamily: 'var(--font-space-grotesk), sans-serif' } as const

const COLUMNS: Array<{ status: PostStatus; label: string; accent: string }> = [
  { status: 'IDEA', label: 'IDEA', accent: '#ab8981' },
  { status: 'DRAFTING', label: 'DRAFTING', accent: '#e4beb5' },
  { status: 'NEEDS_APPROVAL', label: 'NEEDS_APPROVAL', accent: '#ffd65b' },
  { status: 'NEEDS_REVISION', label: 'NEEDS_REVISION', accent: '#D83C14' },
  { status: 'APPROVED', label: 'APPROVED', accent: '#76dc83' },
  { status: 'POSTED', label: 'POSTED', accent: '#3da452' },
]

interface Props {
  posts: AdminPost[]
  onMoveStatus: (id: string, status: PostStatus, position?: number) => void
  onReorder: (id: string, position: number) => void
  onClickPost: (post: AdminPost) => void
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
}

export default function KanbanView({
  posts,
  onMoveStatus,
  onReorder,
  onClickPost,
  selectedIds,
  onToggleSelect,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      keyboardCodes: KEYBOARD_CODES,
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const announcements = useMemo(
    () =>
      makeDndAnnouncements(
        (id) => posts.find((p) => p.id === id)?.title ?? 'post',
      ),
    [posts],
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
    <DndContext
      sensors={sensors}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: dndScreenReaderInstructions,
      }}
    >
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
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
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
  selectedIds,
  onToggleSelect,
}: {
  status: PostStatus
  label: string
  accent: string
  posts: AdminPost[]
  onClickPost: (post: AdminPost) => void
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
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
            <SortablePost
              key={p.id}
              post={p}
              onClick={() => onClickPost(p)}
              selected={selectedIds?.has(p.id) ?? false}
              onToggleSelect={onToggleSelect}
            />
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

function SortablePost({
  post,
  onClick,
  selected,
  onToggleSelect,
}: {
  post: AdminPost
  onClick: () => void
  selected: boolean
  onToggleSelect?: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${selected ? 'ring-2 ring-[#D83C14]' : ''}`}
    >
      {onToggleSelect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect(post.id)
          }}
          className={`absolute top-2 left-2 z-10 w-5 h-5 border-2 border-black flex items-center justify-center transition-colors ${
            selected ? 'bg-[#D83C14] text-white' : 'bg-[#1c1b1b] text-[#e4beb5] hover:bg-[#2a2a2a]'
          }`}
          aria-label={selected ? 'Deselect post' : 'Select post'}
          aria-pressed={selected}
        >
          {selected && (
            <span className="material-symbols-outlined !text-[14px] leading-none" aria-hidden>
              check
            </span>
          )}
        </button>
      )}
      <div
        {...attributes}
        {...listeners}
        onKeyDown={(e) => {
          // Space (handled by the keyboard sensor) drags; Enter opens the post.
          if (e.key === 'Enter') {
            e.preventDefault()
            onClick()
            return
          }
          listeners?.onKeyDown?.(e)
        }}
        aria-label={`${post.title ?? 'Post'} — press Enter to open, Space to drag`}
      >
        <PostCard post={post} onClick={onClick} draggable />
      </div>
    </div>
  )
}
