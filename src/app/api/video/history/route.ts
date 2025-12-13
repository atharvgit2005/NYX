
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

// GET: Fetch user's video history
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        const videos = await prisma.video.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10 // Limit to recent 10 for now
        });

        return NextResponse.json({ success: true, data: videos });
    } catch (error) {
        console.error('[VIDEO_HISTORY_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
