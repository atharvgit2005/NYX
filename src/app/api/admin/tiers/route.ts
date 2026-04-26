import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prismadb';

function adminOnly(email?: string | null) {
    return email === process.env.ADMIN_EMAIL;
}

// GET /api/admin/tiers
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tiers = await prisma.tier.findMany({
        orderBy: { price: 'asc' }
    });

    return NextResponse.json({ tiers });
}

// POST /api/admin/tiers
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const tier = await prisma.tier.create({
        data: body
    });

    return NextResponse.json({ tier });
}

// PATCH /api/admin/tiers
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, ...patch } = await req.json();

    const updated = await prisma.tier.update({
        where: { id },
        data: patch,
    });

    return NextResponse.json({ tier: updated });
}

// DELETE /api/admin/tiers
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.tier.delete({
        where: { id }
    });

    return NextResponse.json({ success: true });
}
