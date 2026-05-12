'use client'

/**
 * Phase 5 — admin canvas overlay shell.
 *
 * Mounts the editorial-themed PostFormModal when there's a pending
 * create or edit. Owns no state of its own — the parent
 * (BrandPartnerPortalClient) tracks `editing` / `creating` so it can
 * also pass click handlers down to views without re-implementing the
 * controller.
 *
 * Lazily-loaded via next/dynamic from the parent so partner traffic
 * never pulls @dnd-kit / PostFormModal into its bundle.
 */

import type { Platform } from '@prisma/client'
import PostFormModal, {
    type PostFormInitial,
    type PostFormValues,
} from '../../admin/[clientSlug]/posts/components/PostFormModal'

interface Props {
    /** Brand's primary platform — prefilled in the new-post form. */
    defaultPlatform: Platform
    /** Non-null → edit modal renders for this post. */
    editing: PostFormInitial | null
    /** Non-null → create modal renders. `scheduledDate` (ISO) prefills
     *  the date picker (set when admin clicks an empty calendar day). */
    creating: { scheduledDate?: string } | null
    onCloseEdit: () => void
    onCloseCreate: () => void
    onSave: (id: string, values: PostFormValues) => void | Promise<void>
    onCreate: (values: PostFormValues) => void | Promise<void>
    onArchive: (id: string) => void | Promise<void>
    onDelete: (id: string) => void | Promise<void>
    onDuplicate?: (id: string) => void | Promise<void>
}

export default function AdminEditOverlay({
    defaultPlatform,
    editing,
    creating,
    onCloseEdit,
    onCloseCreate,
    onSave,
    onCreate,
    onArchive,
    onDelete,
    onDuplicate,
}: Props) {
    return (
        <>
            {creating && (
                <PostFormModal
                    mode="create"
                    theme="editorial"
                    defaultPlatform={defaultPlatform}
                    defaultScheduledDate={creating.scheduledDate}
                    onClose={onCloseCreate}
                    onSubmit={onCreate}
                />
            )}
            {editing && (
                <PostFormModal
                    mode="edit"
                    theme="editorial"
                    defaultPlatform={editing.platform}
                    initial={editing}
                    onClose={onCloseEdit}
                    onSubmit={(values) => onSave(editing.id, values)}
                    onArchive={() => onArchive(editing.id)}
                    onDelete={() => onDelete(editing.id)}
                    onDuplicate={onDuplicate ? () => onDuplicate(editing.id) : undefined}
                />
            )}
        </>
    )
}
