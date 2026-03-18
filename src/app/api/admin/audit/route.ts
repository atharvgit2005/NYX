import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

function adminOnly(email?: string | null) {
    return email === process.env.ADMIN_EMAIL;
}

// GET /api/admin/audit
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');

    const logs = await prisma.auditLog.findMany({
        where: category ? { category } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });

    return NextResponse.json({ logs });
}

// POST /api/admin/audit — write a new audit entry
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, target, details, category } = await req.json();

    const log = await prisma.auditLog.create({
        data: {
            admin: session!.user!.email!,
            action,
            target,
            details,
            category,
        }
    });

    return NextResponse.json({ log });
}
