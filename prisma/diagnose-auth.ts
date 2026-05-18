/**
 * Auth diagnostic / cleanup for a single email.
 *
 * Hits the DB and prints every User row + every Account row that has any
 * connection to the given email, so we can see *why* Google sign-in is
 * failing with OAuthAccountNotLinked in production.
 *
 * Read-only by default. Pass --fix to actually delete the orphan rows
 * the report flags. Pass --email=foo@bar.com to override the default.
 *
 * Usage (against PROD DB — set DATABASE_URL accordingly):
 *
 *   DATABASE_URL="<prod-url>" npx tsx prisma/diagnose-auth.ts
 *   DATABASE_URL="<prod-url>" npx tsx prisma/diagnose-auth.ts --fix
 *   DATABASE_URL="<prod-url>" npx tsx prisma/diagnose-auth.ts --email=other@email.com --fix
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function arg(name: string, fallback: string | null = null): string | null {
    const found = process.argv.find((a) => a.startsWith(`--${name}=`))
    if (!found) return fallback
    return found.slice(`--${name}=`.length)
}

const FIX = process.argv.includes('--fix')
const EMAIL = (arg('email') ?? 'pahariaatharv2005@gmail.com').trim().toLowerCase()

async function main() {
    console.log(`\n=== Auth diagnostic for ${EMAIL} ===\n`)
    console.log(`Mode: ${FIX ? 'FIX (will delete orphan rows)' : 'READ-ONLY'}\n`)

    // 1. All User rows with this email (or variants)
    const usersExact = await prisma.user.findMany({
        where: { email: EMAIL },
        include: { accounts: true, sessions: true },
    })

    const usersFuzzy = await prisma.user.findMany({
        where: {
            email: {
                contains: EMAIL.split('@')[0],
                mode: 'insensitive',
            },
            NOT: { email: EMAIL },
        },
        include: { accounts: true },
    })

    console.log(`Users with exact email "${EMAIL}": ${usersExact.length}`)
    for (const u of usersExact) {
        console.log(`  • id=${u.id}  role=${u.role}  name=${u.name ?? '—'}`)
        console.log(`    password? ${u.password ? 'yes' : 'no'}`)
        console.log(`    accounts: ${u.accounts.length}`)
        for (const a of u.accounts) {
            console.log(
                `      - provider=${a.provider}  providerAccountId=${a.providerAccountId}  type=${a.type}`,
            )
        }
        console.log(`    sessions: ${u.sessions.length}`)
        console.log(
            `    createdAt=${u.createdAt.toISOString()}  passwordChangedAt=${u.passwordChangedAt?.toISOString() ?? '—'}`,
        )
    }

    if (usersFuzzy.length > 0) {
        console.log(`\nOther users with similar local-part: ${usersFuzzy.length}`)
        for (const u of usersFuzzy) {
            console.log(`  • id=${u.id}  email=${u.email}  role=${u.role}`)
            for (const a of u.accounts) {
                console.log(
                    `      - account ${a.provider}/${a.providerAccountId}`,
                )
            }
        }
    }

    // 2. Account rows whose userId points at a non-existent user (orphans)
    const allAccounts = await prisma.account.findMany({
        select: { id: true, userId: true, provider: true, providerAccountId: true },
    })
    const userIds = new Set(
        (await prisma.user.findMany({ select: { id: true } })).map((u) => u.id),
    )
    const orphans = allAccounts.filter((a) => !userIds.has(a.userId))
    console.log(`\nOrphan Account rows (userId points at no user): ${orphans.length}`)
    for (const o of orphans.slice(0, 10)) {
        console.log(
            `  • ${o.provider}/${o.providerAccountId}  →  missing userId ${o.userId}`,
        )
    }
    if (orphans.length > 10) console.log(`  …and ${orphans.length - 10} more.`)

    // 3. Accounts that share (provider, providerAccountId) — should be impossible
    //    given the unique constraint, but sanity check the data anyway.
    const dupKey = new Map<string, number>()
    for (const a of allAccounts) {
        const k = `${a.provider}/${a.providerAccountId}`
        dupKey.set(k, (dupKey.get(k) ?? 0) + 1)
    }
    const dups = Array.from(dupKey.entries()).filter(([, n]) => n > 1)
    console.log(`\nDuplicate (provider, providerAccountId) rows: ${dups.length}`)
    for (const [k, n] of dups) console.log(`  • ${k} → ${n} rows`)

    // 4. Recommendation block
    console.log(`\n=== Recommendation ===`)
    if (usersExact.length === 0) {
        console.log(
            `No user with email ${EMAIL} in the DB. Google sign-in would create one. If OAuthAccountNotLinked is firing anyway, the Google Account row is linked to a different email — fuzzy-search above should show it.`,
        )
    } else if (usersExact.length === 1) {
        const u = usersExact[0]
        const googleAccount = u.accounts.find((a) => a.provider === 'google')
        if (googleAccount) {
            console.log(
                `Single user, Google already linked (providerAccountId=${googleAccount.providerAccountId}). Login should work. If it doesn't, the issue is at the OAuth-callback layer, not in the DB.`,
            )
        } else {
            console.log(
                `Single user, NO Google Account row yet. Try Google sign-in once. The signIn callback (auth.ts) should upsert a row.`,
            )
        }
    } else {
        console.log(
            `Multiple users (${usersExact.length}) share the exact email — that is the bug. Email is supposed to be unique. One of them is probably a shadow row from NextAuth's adapter. Manual cleanup needed.`,
        )
    }

    if (orphans.length > 0) {
        console.log(
            `\n${orphans.length} orphan Account row(s) found. These can block Google linking because the (provider, providerAccountId) unique key is occupied by a row pointing at nothing.`,
        )
        if (FIX) {
            const result = await prisma.account.deleteMany({
                where: { id: { in: orphans.map((o) => o.id) } },
            })
            console.log(`  → Deleted ${result.count} orphan row(s).`)
        } else {
            console.log(`  → Re-run with --fix to delete them.`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
