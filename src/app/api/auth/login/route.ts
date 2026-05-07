import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const ip = request.headers.get('x-forwarded-for') || 'unknown';

        // Brute-force protection
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const attempts = await prisma.loginAttempt.findUnique({
            where: { ip_email: { ip: String(ip), email } }
        });

        if (attempts && attempts.count >= 5 && attempts.lastAttempt > fifteenMinsAgo) {
            return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Account locking
        if (user.lockUntil && user.lockUntil > new Date()) {
            return NextResponse.json({ error: 'Account is locked.' }, { status: 403 });
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);

        if (!isCorrectPassword) {
            const newFailedAttempts = user.failedAttempts + 1;
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts: newFailedAttempts,
                    lockUntil: newFailedAttempts >= 10 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
                }
            });

            await prisma.loginAttempt.upsert({
                where: { ip_email: { ip: String(ip), email } },
                update: { count: { increment: 1 }, lastAttempt: new Date() },
                create: { ip: String(ip), email, count: 1 }
            });

            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Success - update session
        const activeSessionId = Math.random().toString(36).substring(2);
        await prisma.user.update({
            where: { id: user.id },
            data: { failedAttempts: 0, lockUntil: null, activeSessionId }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            activeSessionId
        });
    } catch (_error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
