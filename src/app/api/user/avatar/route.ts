import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

// GET /api/user/avatar — fetch the current user's stored avatar URL
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { avatarUrl: true },
    });

    return NextResponse.json({ avatarUrl: user?.avatarUrl ?? null });
}

// POST /api/user/avatar — save a new avatar URL for the current user
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { avatarUrl } = await req.json();
    if (!avatarUrl || typeof avatarUrl !== 'string') {
        return NextResponse.json({ error: 'avatarUrl is required' }, { status: 400 });
    }

    // Validate it looks like an Avaturn GLB URL (basic sanity check)
    if (!avatarUrl.startsWith('https://') || !avatarUrl.includes('.glb')) {
        return NextResponse.json({ error: 'Invalid avatar URL — must be a .glb HTTPS URL' }, { status: 400 });
    }

    const user = await prisma.user.update({
        where: { email: session.user.email },
        data: { avatarUrl },
        select: { id: true, avatarUrl: true },
    });

    return NextResponse.json({ avatarUrl: user.avatarUrl });
}

// DELETE /api/user/avatar — clear the avatar
export async function DELETE() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: { avatarUrl: null },
    });

    return NextResponse.json({ success: true });
}
