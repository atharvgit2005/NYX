import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

function adminOnly(email?: string | null) {
    return email === process.env.ADMIN_EMAIL;
}

// GET /api/admin/gates — get all feature gates
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const gates = await prisma.featureGate.findMany();
    const map: Record<string, unknown> = {};
    gates.forEach(g => { map[g.key] = g.value; });

    return NextResponse.json({ gates: map });
}

// PUT /api/admin/gates — upsert a gate value
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { key, value } = await req.json();

    const gate = await prisma.featureGate.upsert({
        where: { key },
        create: { key, value, updatedAt: new Date() },
        update: { value, updatedAt: new Date() },
    });

    return NextResponse.json({ gate });
}
