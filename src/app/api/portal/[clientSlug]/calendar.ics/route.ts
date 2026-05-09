/**
 * GET /api/portal/[clientSlug]/calendar.ics
 *
 * iCalendar feed of every active scheduled post for a brand. Brand
 * partners (and admins / viewers) can download or subscribe in their
 * native calendar app — Google Calendar, Apple Calendar, Outlook, etc.
 *
 * Format is hand-rolled per RFC 5545 to avoid a dependency. Each post
 * is an all-day VEVENT on its scheduled date. The post status is
 * encoded in the SUMMARY prefix so the client can see what's
 * approved vs in-flight at a glance.
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { requirePartner } from '../_helpers'
import { getContentPosts } from '@/lib/portal/content-store'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.nyxstudio.tech'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ clientSlug: string }> },
) {
    const { clientSlug } = await params
    const auth = await requirePartner(clientSlug)
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const partner = await prisma.brandPartner.findUnique({
        where: { clientSlug },
        select: { id: true, clientName: true, configuration: { select: { brandName: true } } },
    })
    if (!partner) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const posts = await getContentPosts(partner.id)
    const brandName = partner.configuration?.brandName ?? partner.clientName

    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//NYX Studio//Content Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeIcs(`${brandName} — Content Calendar`)}`,
        `X-WR-CALDESC:${escapeIcs(`NYX Studio content schedule for ${brandName}.`)}`,
        'X-PUBLISHED-TTL:PT1H',
    ]

    const now = formatIcsDateTime(new Date())

    for (const p of posts) {
        const dt = formatIcsDate(p.scheduledDate)
        // All-day events use DTSTART;VALUE=DATE — DTEND is the day AFTER.
        const dtEnd = formatIcsDate(addDays(p.scheduledDate, 1))
        const summary = `[${labelForStatus(p.status)}] ${p.title}`
        const description = [
            `Status: ${p.status}`,
            `Type: ${p.contentType.replace('_', ' ')}`,
            `Platform: ${p.platform}`,
            '',
            p.caption.trim(),
        ]
            .filter(Boolean)
            .join('\\n')
        const url = `${SITE_URL}/portal/${clientSlug}`

        lines.push(
            'BEGIN:VEVENT',
            `UID:${p.id}@nyxstudio.tech`,
            `DTSTAMP:${now}`,
            `DTSTART;VALUE=DATE:${dt}`,
            `DTEND;VALUE=DATE:${dtEnd}`,
            `SUMMARY:${escapeIcs(summary)}`,
            `DESCRIPTION:${escapeIcs(description)}`,
            `URL:${url}`,
            `STATUS:${p.status === 'POSTED' ? 'CONFIRMED' : 'TENTATIVE'}`,
            `CATEGORIES:${escapeIcs(p.contentType)}`,
            'END:VEVENT',
        )
    }

    lines.push('END:VCALENDAR')
    const body = lines.join('\r\n') + '\r\n'

    return new NextResponse(body, {
        status: 200,
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="${clientSlug}-calendar.ics"`,
            'Cache-Control': 'private, max-age=0, must-revalidate',
        },
    })
}

// ── helpers ────────────────────────────────────────────────────────────

function escapeIcs(s: string): string {
    return s
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n')
}

function formatIcsDate(d: Date): string {
    // YYYYMMDD in UTC.
    return (
        d.getUTCFullYear().toString() +
        String(d.getUTCMonth() + 1).padStart(2, '0') +
        String(d.getUTCDate()).padStart(2, '0')
    )
}

function formatIcsDateTime(d: Date): string {
    // YYYYMMDDTHHmmssZ in UTC.
    return (
        formatIcsDate(d) +
        'T' +
        String(d.getUTCHours()).padStart(2, '0') +
        String(d.getUTCMinutes()).padStart(2, '0') +
        String(d.getUTCSeconds()).padStart(2, '0') +
        'Z'
    )
}

function addDays(d: Date, n: number): Date {
    const out = new Date(d)
    out.setUTCDate(out.getUTCDate() + n)
    return out
}

function labelForStatus(status: string): string {
    switch (status) {
        case 'IDEA':
            return 'Idea'
        case 'DRAFTING':
            return 'Drafting'
        case 'NEEDS_APPROVAL':
            return 'Awaiting approval'
        case 'NEEDS_REVISION':
            return 'Revising'
        case 'APPROVED':
            return 'Approved'
        case 'POSTED':
            return 'Posted'
        default:
            return status
    }
}
