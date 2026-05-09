/**
 * Phase 5 follow-up: outbound email notifications.
 *
 * Today the only trigger is "post entered NEEDS_APPROVAL" — fires when
 * an admin saves the post with that status. The brand partner gets an
 * email with a deep link to the post in the portal.
 *
 * Soft-fails: a missing RESEND_API_KEY logs a warning and returns
 * without throwing, so unconfigured environments (CI, preview deploys
 * before secrets land) don't block the admin save flow.
 */

import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'NYX Studio <onboarding@resend.dev>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.nyxstudio.tech'

let _client: Resend | null = null
function getClient(): Resend | null {
    const key = process.env.RESEND_API_KEY
    if (!key) {
        console.warn('[notifications] RESEND_API_KEY not set — skipping email send')
        return null
    }
    if (!_client) _client = new Resend(key)
    return _client
}

interface NeedsApprovalArgs {
    partnerEmail: string
    partnerName: string | null
    brandName: string
    clientSlug: string
    postTitle: string
    scheduledDate: string // ISO
}

export async function sendNeedsApprovalEmail({
    partnerEmail,
    partnerName,
    brandName,
    clientSlug,
    postTitle,
    scheduledDate,
}: NeedsApprovalArgs): Promise<{ ok: boolean; error?: string }> {
    const client = getClient()
    if (!client) return { ok: false, error: 'RESEND_API_KEY not configured' }

    const portalUrl = `${SITE_URL}/portal/${clientSlug}`
    const dateLabel = new Date(scheduledDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    const subject = `${brandName} — "${postTitle}" needs your approval`

    const html = `
        <!doctype html>
        <html>
        <body style="background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1A2A5E;margin:0;padding:32px 16px;">
            <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E4DC;border-radius:16px;padding:32px;">
                <p style="text-transform:uppercase;letter-spacing:0.2em;font-size:11px;color:#E91E8C;margin:0 0 8px;font-weight:600;">
                    Awaiting your approval
                </p>
                <h1 style="font-size:24px;font-weight:700;margin:0 0 8px;color:#1A2A5E;">
                    ${escapeHtml(postTitle)}
                </h1>
                <p style="color:#6B6B6B;font-size:14px;margin:0 0 24px;">
                    Scheduled for ${dateLabel} on ${escapeHtml(brandName)}.
                </p>
                <p style="color:#1A2A5E;font-size:15px;line-height:1.5;margin:0 0 24px;">
                    ${partnerName ? `Hi ${escapeHtml(partnerName)},` : 'Hi,'} a new post is ready
                    for your review on the NYX Studio portal.
                </p>
                <div style="text-align:center;margin:24px 0;">
                    <a href="${portalUrl}" style="display:inline-block;background:#1A2A5E;color:#FFFFFF;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
                        Open the portal &rarr;
                    </a>
                </div>
                <p style="color:#9CA3AF;font-size:12px;margin:24px 0 0;text-align:center;">
                    Or copy this link: <a href="${portalUrl}" style="color:#1A2A5E;">${portalUrl}</a>
                </p>
            </div>
            <p style="text-align:center;color:#9CA3AF;font-size:11px;margin:24px 0 0;">
                NYX Studio · Sent because you're the brand partner contact for ${escapeHtml(brandName)}.
            </p>
        </body>
        </html>
    `

    try {
        const result = await client.emails.send({
            from: FROM,
            to: partnerEmail,
            subject,
            html,
        })
        if (result.error) {
            console.error('[notifications] resend error:', result.error)
            return { ok: false, error: result.error.message }
        }
        return { ok: true }
    } catch (err) {
        console.error('[notifications] send threw:', err)
        return { ok: false, error: (err as Error).message }
    }
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}
