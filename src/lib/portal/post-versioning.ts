/**
 * Phase 5 follow-up: snapshot a ContentPost at a meaningful moment.
 * Today the only trigger is the IDLE/IN-FLIGHT → APPROVED transition,
 * so the partner has a frozen "what was approved" reference if admin
 * edits the post afterwards.
 *
 * Idempotent in the small: snapshot creation always succeeds, but the
 * caller should only invoke this on a real status transition (we don't
 * deduplicate inside this module).
 */

import prisma from '@/lib/prismadb'
import type { ContentPost, PostVersion } from '@prisma/client'

export type SnapshotReason = 'APPROVED'

interface SnapshotShape {
    title: string
    scheduledDate: string
    contentType: ContentPost['contentType']
    platform: ContentPost['platform']
    caption: string
    hashtags: string[]
    visualDirection: string
    productionNotes: string | null
    thumbnailUrl: string | null
    mediaUrls: string[]
}

function snapshotFromPost(p: ContentPost): SnapshotShape {
    return {
        title: p.title,
        scheduledDate: p.scheduledDate.toISOString(),
        contentType: p.contentType,
        platform: p.platform,
        caption: p.caption,
        hashtags: p.hashtags,
        visualDirection: p.visualDirection,
        productionNotes: p.productionNotes,
        thumbnailUrl: p.thumbnailUrl,
        mediaUrls: p.mediaUrls,
    }
}

export async function snapshotPost(
    post: ContentPost,
    reason: SnapshotReason,
    snappedBy: string,
): Promise<PostVersion> {
    return prisma.postVersion.create({
        data: {
            postId: post.id,
            reason,
            snappedBy,
            snapshot: snapshotFromPost(post) as object,
        },
    })
}

export async function listVersions(postId: string) {
    return prisma.postVersion.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' },
    })
}

export async function latestApprovedVersion(postId: string) {
    return prisma.postVersion.findFirst({
        where: { postId, reason: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
    })
}
