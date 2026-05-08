/**
 * Phase 5 follow-up: PortalViewer CRUD.
 *
 * Viewers are read-only guests granted access to a single brand's
 * /portal/[clientSlug]. Permission model:
 *   • Can view the canvas (Calendar / Cards / Feed) — same as the partner
 *   • CANNOT see the admin overlay (drag, edit, create, archive) — that's
 *     gated by isAdminEmail
 *   • CANNOT approve / request revision — that's the brand partner's
 *     right (the approve/revise API enforces it via requirePartner())
 *   • Each row is for one (brandPartnerId, email) pair; an email can be
 *     a viewer for multiple brands
 */

import prisma from '@/lib/prismadb'

export interface ViewerInput {
    brandPartnerId: string
    email: string
    name?: string | null
    addedBy: string
}

export class ViewerValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ViewerValidationError'
    }
}

export async function listViewersForBrand(brandPartnerId: string) {
    return prisma.portalViewer.findMany({
        where: { brandPartnerId },
        orderBy: { addedAt: 'desc' },
    })
}

export async function listBrandsForViewer(email: string) {
    return prisma.portalViewer.findMany({
        where: { email: email.toLowerCase() },
        include: {
            brandPartner: {
                select: {
                    id: true,
                    clientSlug: true,
                    clientName: true,
                    status: true,
                },
            },
        },
    })
}

export async function isViewerOf(
    email: string,
    brandPartnerId: string,
): Promise<boolean> {
    const row = await prisma.portalViewer.findUnique({
        where: {
            brandPartnerId_email: {
                brandPartnerId,
                email: email.toLowerCase(),
            },
        },
        select: { id: true },
    })
    return !!row
}

export async function isViewerOfSlug(
    email: string,
    clientSlug: string,
): Promise<boolean> {
    const row = await prisma.portalViewer.findFirst({
        where: {
            email: email.toLowerCase(),
            brandPartner: { clientSlug },
        },
        select: { id: true },
    })
    return !!row
}

export async function addViewer(input: ViewerInput) {
    const email = input.email.trim().toLowerCase()
    if (!email.includes('@') || email.length < 5 || email.length > 256) {
        throw new ViewerValidationError('Valid email required')
    }

    // Don't double-grant if this email is already the brand partner.
    const partner = await prisma.brandPartner.findUnique({
        where: { id: input.brandPartnerId },
        select: { email: true },
    })
    if (!partner) throw new ViewerValidationError('Brand not found')
    if (partner.email.toLowerCase() === email) {
        throw new ViewerValidationError(
            'That email is already the brand partner — they have access by default.',
        )
    }

    return prisma.portalViewer.upsert({
        where: {
            brandPartnerId_email: {
                brandPartnerId: input.brandPartnerId,
                email,
            },
        },
        update: {
            name: input.name ?? undefined,
            addedBy: input.addedBy,
            addedAt: new Date(),
        },
        create: {
            brandPartnerId: input.brandPartnerId,
            email,
            name: input.name ?? null,
            addedBy: input.addedBy,
        },
    })
}

export async function removeViewer(viewerId: string) {
    return prisma.portalViewer.delete({ where: { id: viewerId } })
}
