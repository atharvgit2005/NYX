import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prismadb';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { avatarConfig: true },
    });

    return NextResponse.json({ avatarConfig: user?.avatarConfig ?? null });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { avatarConfig } = await req.json();
    if (!avatarConfig || typeof avatarConfig !== 'object') {
        return NextResponse.json({ error: 'avatarConfig must be an object' }, { status: 400 });
    }

    const user = await prisma.user.update({
        where: { email: session.user.email },
        data: { avatarConfig },
        select: { avatarConfig: true },
    });

    return NextResponse.json({ avatarConfig: user.avatarConfig });
}
