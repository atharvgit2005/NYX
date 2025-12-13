
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

// GET: Fetch dashboard stats
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                _count: {
                    select: {
                        scripts: true,
                        videos: true
                    }
                }
            }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Calculate stats
        const stats = {
            totalVideos: user._count.videos,
            totalScripts: user._count.scripts,
            pendingIdeas: 0, // Placeholder for now, unless we add an Idea model
            engagement: 'N/A' // Placeholder
        };

        return NextResponse.json({ success: true, data: stats });
    } catch (error) {
        console.error('[DASHBOARD_STATS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
