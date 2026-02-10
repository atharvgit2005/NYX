import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await req.json();
        console.log(`[VIDEO_DELETE] Attempting to delete video ${id} for user ${session.user.email}`);

        if (!id) {
            return new NextResponse('Missing ID', { status: 400 });
        }

        // Check if video exists
        const existingVideo = await prisma.video.findUnique({
            where: { id }
        });

        if (!existingVideo) {
            console.warn(`[VIDEO_DELETE] Video not found: ${id}`);
            return new NextResponse('Video not found', { status: 404 });
        }

        // Admin Oerride
        const ADMIN_EMAILS = ['atharv@gmail.com', 'pahariaatharv2005@gmail.com'];
        const isAdmin = ADMIN_EMAILS.includes(session.user.email || '');

        let isOwner = false;
        if (!isAdmin) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email }
            });
            isOwner = existingVideo.userId === user?.id;
        }

        if (!isAdmin && !isOwner) {
            console.warn(`[VIDEO_DELETE] Unauthorized Delete Attempt by ${session.user.email} on video ${id}`);
            return new NextResponse('Unauthorized: You do not own this video', { status: 403 });
        }

        // Proceed to delete
        await prisma.video.delete({
            where: { id }
        });

        console.log(`[VIDEO_DELETE] Successfully deleted video ${id}`);

        return NextResponse.json({ success: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[VIDEO_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
