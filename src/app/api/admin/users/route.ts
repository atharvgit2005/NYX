import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

function adminOnly(email?: string | null) {
    return email === process.env.ADMIN_EMAIL;
}

// GET /api/admin/users
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            country: true,
            createdAt: true,
            subscription: {
                select: {
                    tier: true,
                    status: true,
                    paymentStatus: true,
                    features: true,
                    renewalDate: true,
                    startDate: true,
                }
            }
        }
    });

    return NextResponse.json({ users });
}

// PATCH /api/admin/users — update status / role / country
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, patch } = await req.json();
    if (!userId || !patch) {
        return NextResponse.json({ error: 'Missing userId or patch' }, { status: 400 });
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: patch,
    });

    return NextResponse.json({ user: updated });
}
