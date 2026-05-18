/**
 * One-shot helper: create / update a credentials-login admin user.
 *
 * Phase 5 follow-up — adminnyx@gmail.com / atharvpaharia123 set up so the
 * agency has a shared admin login for testing without sharing a Google
 * account. Idempotent: re-running re-hashes and updates the password.
 *
 * Run:  npx tsx prisma/setup-admin-user.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EMAIL = 'adminnyx@gmail.com'
const PASSWORD = 'atharvpaharia123'
const NAME = 'NYX Admin'

async function main() {
    const hashed = await bcrypt.hash(PASSWORD, 10)

    const existing = await prisma.user.findUnique({ where: { email: EMAIL } })

    if (existing) {
        await prisma.user.update({
            where: { email: EMAIL },
            data: {
                password: hashed,
                role: 'admin',
                name: existing.name ?? NAME,
                passwordChangedAt: new Date(),
                failedAttempts: 0,
                lockUntil: null,
            },
        })
        console.log(`✓ Updated existing user ${EMAIL} (id=${existing.id}).`)
    } else {
        const created = await prisma.user.create({
            data: {
                email: EMAIL,
                password: hashed,
                name: NAME,
                role: 'admin',
                country: 'India',
            },
        })
        console.log(`✓ Created admin user ${EMAIL} (id=${created.id}).`)
    }

    console.log('')
    console.log('Sign in at:')
    console.log('  /portal/login    (brand-partner-themed, lands at /portal → /portal/admin)')
    console.log(`Email:    ${EMAIL}`)
    console.log(`Password: ${PASSWORD}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
