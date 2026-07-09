import { Resend } from 'resend'
import prisma from '@/lib/prismadb'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'NYX Studio <onboarding@resend.dev>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.nyxstudio.in'

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

interface TriggerNotificationArgs {
    brandPartnerId: string
    type: 'NEEDS_APPROVAL' | 'APPROVED' | 'REVISION_REQUESTED' | 'CALENDAR_UPDATED'
    message: string
    actor: string
    postId?: string
    postTitle?: string
    revisionComment?: string
}

export async function triggerNotification({
    brandPartnerId,
    type,
    message,
    actor,
    postId,
    postTitle,
    revisionComment,
}: TriggerNotificationArgs): Promise<void> {
    try {
        // 1. Log to Database
        await prisma.notification.create({
            data: {
                brandPartnerId,
                type,
                message,
                actor,
                postId,
                postTitle,
            }
        })

        // 2. Fetch Brand Partner Details
        const brand = await prisma.brandPartner.findUnique({
            where: { id: brandPartnerId },
            include: { configuration: { select: { brandName: true } } }
        })
        if (!brand) return

        const brandName = brand.configuration?.brandName ?? brand.clientName
        const resend = getClient()

        // 3. Email Outbox Routing
        if (type === 'NEEDS_APPROVAL' && postTitle) {
            await sendNeedsApprovalEmail({
                partnerEmail: brand.email,
                partnerName: brand.clientName,
                brandName,
                clientSlug: brand.clientSlug,
                postTitle,
                scheduledDate: new Date().toISOString()
            })
        } else if (type === 'APPROVED' && postTitle && resend && brand.approvedBy) {
            const subject = `${brandName} — "${postTitle}" was approved by client`
            const portalUrl = `${SITE_URL}/portal/${brand.clientSlug}`
            const html = `
                <div style="background:#FAF7F2;padding:32px;font-family:sans-serif;color:#1A2A5E;">
                    <h2>Approval Received</h2>
                    <p>Client approved post: <strong>${escapeHtml(postTitle)}</strong></p>
                    <p>Actor: ${escapeHtml(actor)}</p>
                    <p><a href="${portalUrl}" style="color:#E91E8C;">Go to portal</a></p>
                </div>
            `
            await resend.emails.send({
                from: FROM,
                to: brand.approvedBy,
                subject,
                html,
            }).catch(e => console.error('[notifications] approved email failed:', e))
        } else if (type === 'REVISION_REQUESTED' && postTitle && resend && brand.approvedBy) {
            const subject = `${brandName} — Revision requested on "${postTitle}"`
            const portalUrl = `${SITE_URL}/portal/${brand.clientSlug}`
            const html = `
                <div style="background:#FAF7F2;padding:32px;font-family:sans-serif;color:#1A2A5E;">
                    <h2>Revision Requested</h2>
                    <p>Post: <strong>${escapeHtml(postTitle)}</strong></p>
                    <p>Requested by: ${escapeHtml(actor)}</p>
                    <p>Comment: <em>${escapeHtml(revisionComment ?? '')}</em></p>
                    <p><a href="${portalUrl}" style="color:#E91E8C;">Go to portal</a></p>
                </div>
            `
            await resend.emails.send({
                from: FROM,
                to: brand.approvedBy,
                subject,
                html,
            }).catch(e => console.error('[notifications] revision email failed:', e))
        }

        // 4. Webhook Dispatch (for calling agent, Discord logs, etc.)
        const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL
        if (webhookUrl) {
            const payload = {
                type,
                brandPartnerId,
                brandName,
                postId,
                postTitle,
                message,
                actor,
                revisionComment,
                timestamp: new Date().toISOString()
            }

            // Detect if Discord Webhook URL
            if (webhookUrl.includes('discord.com/api/webhooks')) {
                const colorMap = {
                    NEEDS_APPROVAL: 16711820,   // Pink
                    APPROVED: 3066993,          // Green
                    REVISION_REQUESTED: 15105570, // Orange
                    CALENDAR_UPDATED: 3447003     // Blue
                }
                const discordPayload = {
                    embeds: [{
                        title: `NYX Activity Log: ${type.replace('_', ' ')}`,
                        description: message,
                        color: colorMap[type] ?? 8355711,
                        fields: [
                            { name: 'Brand', value: brandName, inline: true },
                            { name: 'Actor', value: actor, inline: true },
                            { name: 'Post', value: postTitle ?? 'N/A', inline: true }
                        ],
                        timestamp: new Date().toISOString()
                    }]
                }
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(discordPayload)
                }).catch(e => console.error('[notifications] discord webhook dispatch failed:', e))
            } else {
                // Generic POST webhook (ideal for autonomous agent / bots!)
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(e => console.error('[notifications] custom webhook dispatch failed:', e))
            }
        }
    } catch (err) {
        console.error('[notifications] triggerNotification failed:', err)
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
