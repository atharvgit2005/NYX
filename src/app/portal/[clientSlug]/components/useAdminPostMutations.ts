'use client'

/**
 * Phase 5 — admin canvas overlay mutations.
 *
 * Encapsulates the same optimistic patterns PostsWorkspaceClient uses
 * (createNew / saveEdited / archive / moveStatus / moveToDate / reorder)
 * and exposes them as callable functions plus a `busy` flag. The hook
 * owns the optimistic state update + revert-on-error logic; the caller
 * passes the live `posts` array and a `setPosts` setter so a failed
 * mutation can fully restore the prior state.
 *
 * Reuses Phase 4 endpoints — does not introduce new ones.
 */

import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { ContentType, Platform, PostStatus } from '@prisma/client'
import type { SerializedPost } from './types'

export interface PostCreatePayload {
    title: string
    scheduledDate: string
    contentType: ContentType
    platform: Platform
    caption: string
    hashtags: string[]
    visualDirection: string
    productionNotes: string | null
    thumbnailUrl: string | null
}

export interface PostSavePayload extends PostCreatePayload {
    status?: PostStatus
}

interface Args {
    clientSlug: string
    posts: SerializedPost[]
    setPosts: Dispatch<SetStateAction<SerializedPost[]>>
}

export interface PostMutations {
    busy: boolean
    /** Create a new post. Returns the server-canonical post on success. */
    createPost: (input: PostCreatePayload) => Promise<SerializedPost | null>
    /** Save edits to an existing post. Returns the canonical post on success. */
    savePost: (
        id: string,
        input: PostSavePayload,
    ) => Promise<SerializedPost | null>
    /** Soft-delete via DELETE — drops out of all views, recoverable from
     *  the archive drawer. */
    archivePost: (id: string) => Promise<void>
    /** Hard-delete via DELETE …/permanent — irreversible. Cascades
     *  comments + versions. Called only after an explicit confirm. */
    deletePost: (id: string) => Promise<void>
    /** Restore an archived post back into the active set (PATCH
     *  archivedAt: null). Used by the archive drawer. */
    restorePost: (id: string) => Promise<SerializedPost | null>
    /** Fetch the archived-only list for the drawer. Server-canonical
     *  shape — caller normalises to SerializedPost. */
    fetchArchived: () => Promise<SerializedPost[]>
    /** Clone an existing post into a new IDEA card. */
    duplicatePost: (id: string) => Promise<SerializedPost | null>
    /** Drag-reschedule from the calendar. ISO date string. */
    moveToDate: (id: string, scheduledDate: string) => Promise<void>
    /** Direct status change (e.g. drag between kanban-style swimlanes — not
     *  used by the canvas overlay yet but kept for parity with the workspace). */
    moveStatus: (
        id: string,
        status: PostStatus,
        position?: number,
    ) => Promise<void>
    /** Reorder a post within its column / day. */
    reorder: (id: string, position: number) => Promise<void>
}

/**
 * Normalise the server response (raw Prisma JSON) into the
 * SerializedPost shape the parent state expects.
 */
function normaliseFromServer(
    raw: Record<string, unknown>,
    fallbackComments: SerializedPost['comments'],
): SerializedPost {
    const scheduledDate =
        typeof raw.scheduledDate === 'string'
            ? new Date(raw.scheduledDate).toISOString()
            : new Date().toISOString()
    return {
        id: String(raw.id),
        brandPartnerId: String(raw.brandPartnerId ?? ''),
        title: String(raw.title ?? ''),
        scheduledDate,
        contentType: raw.contentType as ContentType,
        platform: (raw.platform ?? 'INSTAGRAM') as Platform,
        status: raw.status as PostStatus,
        caption: String(raw.caption ?? ''),
        hashtags: Array.isArray(raw.hashtags) ? (raw.hashtags as string[]) : [],
        visualDirection: String(raw.visualDirection ?? ''),
        productionNotes:
            raw.productionNotes === null ? null : String(raw.productionNotes ?? ''),
        thumbnailUrl:
            raw.thumbnailUrl === null ? null : String(raw.thumbnailUrl ?? '') || null,
        mediaUrls: Array.isArray(raw.mediaUrls) ? (raw.mediaUrls as string[]) : [],
        position: typeof raw.position === 'number' ? raw.position : 0,
        archivedAt:
            raw.archivedAt && typeof raw.archivedAt === 'string'
                ? raw.archivedAt
                : null,
        // The Phase 4 admin POST/PATCH route returns the post WITHOUT
        // comments. Carry over what the client already knew.
        comments: fallbackComments,
        createdAt:
            typeof raw.createdAt === 'string'
                ? raw.createdAt
                : new Date().toISOString(),
        updatedAt:
            typeof raw.updatedAt === 'string'
                ? raw.updatedAt
                : new Date().toISOString(),
    }
}

export function useAdminPostMutations({
    clientSlug,
    posts,
    setPosts,
}: Args): PostMutations {
    const [busy, setBusy] = useState(false)

    const patchRequest = useCallback(
        async (id: string, body: Record<string, unknown>) => {
            const res = await fetch(
                `/api/portal/admin/${clientSlug}/posts/${id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                },
            )
            if (!res.ok) {
                const { error } = await res.json().catch(() => ({
                    error: 'Update failed',
                }))
                throw new Error(error || 'Update failed')
            }
            const json = (await res.json()) as { post: Record<string, unknown> }
            return json.post
        },
        [clientSlug],
    )

    // ── Create ────────────────────────────────────────────────────
    const createPost = useCallback(
        async (input: PostCreatePayload): Promise<SerializedPost | null> => {
            setBusy(true)
            try {
                const res = await fetch(
                    `/api/portal/admin/${clientSlug}/posts`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(input),
                    },
                )
                if (!res.ok) {
                    const { error } = await res.json().catch(() => ({
                        error: 'Create failed',
                    }))
                    throw new Error(error || 'Create failed')
                }
                const { post } = (await res.json()) as {
                    post: Record<string, unknown>
                }
                const normalised = normaliseFromServer(post, [])
                setPosts((prev) => [...prev, normalised])
                toast.success('Post created')
                return normalised
            } catch (e) {
                toast.error((e as Error).message)
                return null
            } finally {
                setBusy(false)
            }
        },
        [clientSlug, setPosts],
    )

    // ── Save edits ────────────────────────────────────────────────
    const savePost = useCallback(
        async (
            id: string,
            input: PostSavePayload,
        ): Promise<SerializedPost | null> => {
            setBusy(true)
            const before = posts
            // Optimistic merge so the canvas reflects the new fields
            // immediately. We keep prior comments untouched.
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === id
                        ? {
                              ...p,
                              ...input,
                              status: input.status ?? p.status,
                          }
                        : p,
                ),
            )
            try {
                const post = await patchRequest(id, { ...input })
                const prior = before.find((p) => p.id === id)
                const normalised = normaliseFromServer(post, prior?.comments ?? [])
                setPosts((prev) =>
                    prev.map((p) => (p.id === id ? normalised : p)),
                )
                toast.success('Post saved')
                return normalised
            } catch (e) {
                setPosts(before)
                toast.error((e as Error).message)
                return null
            } finally {
                setBusy(false)
            }
        },
        [posts, setPosts, patchRequest],
    )

    // ── Archive (soft-delete) ─────────────────────────────────────
    const archivePost = useCallback(
        async (id: string) => {
            setBusy(true)
            const before = posts
            setPosts((prev) => prev.filter((p) => p.id !== id))
            try {
                const res = await fetch(
                    `/api/portal/admin/${clientSlug}/posts/${id}`,
                    { method: 'DELETE' },
                )
                if (!res.ok) {
                    const { error } = await res.json().catch(() => ({
                        error: 'Archive failed',
                    }))
                    throw new Error(error || 'Archive failed')
                }
                toast.success('Post archived')
            } catch (e) {
                setPosts(before)
                toast.error((e as Error).message)
            } finally {
                setBusy(false)
            }
        },
        [clientSlug, posts, setPosts],
    )

    // ── Drag mutations (optimistic, revert on error) ──────────────

    const moveToDate = useCallback(
        async (id: string, scheduledDate: string) => {
            const before = posts
            setPosts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, scheduledDate } : p)),
            )
            try {
                await patchRequest(id, { scheduledDate })
            } catch (e) {
                setPosts(before)
                toast.error(
                    `Couldn't update date — reverted. ${(e as Error).message}`,
                )
            }
        },
        [posts, setPosts, patchRequest],
    )

    const moveStatus = useCallback(
        async (id: string, status: PostStatus, position?: number) => {
            const before = posts
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === id
                        ? {
                              ...p,
                              status,
                              ...(position !== undefined ? { position } : {}),
                          }
                        : p,
                ),
            )
            try {
                await patchRequest(id, {
                    status,
                    ...(position !== undefined ? { position } : {}),
                })
            } catch (e) {
                setPosts(before)
                toast.error(
                    `Couldn't update status — reverted. ${(e as Error).message}`,
                )
            }
        },
        [posts, setPosts, patchRequest],
    )

    const reorder = useCallback(
        async (id: string, position: number) => {
            const before = posts
            setPosts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, position } : p)),
            )
            try {
                await patchRequest(id, { position })
            } catch (e) {
                setPosts(before)
                toast.error(
                    `Couldn't update position — reverted. ${(e as Error).message}`,
                )
            }
        },
        [posts, setPosts, patchRequest],
    )

    // ── Hard delete ───────────────────────────────────────────────
    const deletePost = useCallback(
        async (id: string) => {
            setBusy(true)
            const before = posts
            // Optimistically drop from active list. If the call fails
            // we put it back. (If the post was already archived and is
            // being deleted from the drawer, posts[] won't contain it
            // — this filter is a no-op in that case, which is fine.)
            setPosts((prev) => prev.filter((p) => p.id !== id))
            try {
                const res = await fetch(
                    `/api/portal/admin/${clientSlug}/posts/${id}/permanent`,
                    { method: 'DELETE' },
                )
                if (!res.ok) {
                    const { error } = await res.json().catch(() => ({
                        error: 'Delete failed',
                    }))
                    throw new Error(error || 'Delete failed')
                }
                toast.success('Post deleted')
            } catch (e) {
                setPosts(before)
                toast.error((e as Error).message)
            } finally {
                setBusy(false)
            }
        },
        [clientSlug, posts, setPosts],
    )

    // ── Restore (un-archive) ──────────────────────────────────────
    const restorePost = useCallback(
        async (id: string): Promise<SerializedPost | null> => {
            setBusy(true)
            try {
                const post = await patchRequest(id, { archivedAt: null })
                const normalised = normaliseFromServer(post, [])
                // Push back into active list. Caller is responsible for
                // removing it from any local archive cache.
                setPosts((prev) => [...prev, normalised])
                toast.success('Post restored')
                return normalised
            } catch (e) {
                toast.error((e as Error).message)
                return null
            } finally {
                setBusy(false)
            }
        },
        [patchRequest, setPosts],
    )

    // ── Fetch archived for the drawer ─────────────────────────────
    const fetchArchived = useCallback(async (): Promise<SerializedPost[]> => {
        try {
            const res = await fetch(
                `/api/portal/admin/${clientSlug}/posts?archivedOnly=1`,
            )
            if (!res.ok) {
                const { error } = await res.json().catch(() => ({
                    error: 'Failed to load archive',
                }))
                throw new Error(error || 'Failed to load archive')
            }
            const { posts: raw } = (await res.json()) as {
                posts: Record<string, unknown>[]
            }
            // The admin GET returns full posts with comments included.
            // Walk the comments through normaliseFromServer's fallback.
            return raw.map((r) => {
                const rawComments = Array.isArray(r.comments)
                    ? (r.comments as Record<string, unknown>[])
                    : []
                const comments: SerializedPost['comments'] = rawComments.map((c) => ({
                    id: String(c.id),
                    authorEmail: String(c.authorEmail ?? ''),
                    body: String(c.body ?? ''),
                    type: c.type as SerializedPost['comments'][number]['type'],
                    createdAt:
                        typeof c.createdAt === 'string'
                            ? c.createdAt
                            : new Date().toISOString(),
                }))
                return normaliseFromServer(r, comments)
            })
        } catch (e) {
            toast.error((e as Error).message)
            return []
        }
    }, [clientSlug])

    // ── Duplicate ─────────────────────────────────────────────────
    const duplicatePost = useCallback(
        async (id: string): Promise<SerializedPost | null> => {
            setBusy(true)
            try {
                const res = await fetch(
                    `/api/portal/admin/${clientSlug}/posts/${id}/duplicate`,
                    { method: 'POST' },
                )
                if (!res.ok) {
                    const { error } = await res.json().catch(() => ({
                        error: 'Duplicate failed',
                    }))
                    throw new Error(error || 'Duplicate failed')
                }
                const { post } = (await res.json()) as {
                    post: Record<string, unknown>
                }
                const normalised = normaliseFromServer(post, [])
                setPosts((prev) => [...prev, normalised])
                toast.success('Duplicated as new IDEA post')
                return normalised
            } catch (e) {
                toast.error((e as Error).message)
                return null
            } finally {
                setBusy(false)
            }
        },
        [clientSlug, setPosts],
    )

    return {
        busy,
        createPost,
        savePost,
        archivePost,
        deletePost,
        restorePost,
        fetchArchived,
        duplicatePost,
        moveToDate,
        moveStatus,
        reorder,
    }
}
