import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
    console.log("REGISTER_API: Hit");
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Brute-force protection: check rate limit (5 attempts per 15 min per IP)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const attempts = await prisma.loginAttempt.findUnique({
            where: { ip_email: { ip: String(ip), email } }
        });

        if (attempts && attempts.count >= 5 && attempts.lastAttempt > fifteenMinsAgo) {
            return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            }
        });

        if (existingUser) {
            // Log attempt to prevent email enumeration/probing
            await prisma.loginAttempt.upsert({
                where: { ip_email: { ip: String(ip), email } },
                update: { count: { increment: 1 }, lastAttempt: new Date() },
                create: { ip: String(ip), email, count: 1 }
            });
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error: unknown) {
        console.error('REGISTRATION_ERROR_FULL:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
