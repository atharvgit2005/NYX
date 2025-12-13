
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

// POST: Save a new script
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { title, content } = body;

        // Get user ID from DB
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        const script = await prisma.script.create({
            data: {
                title: title || 'Untitled Script',
                content,
                userId: user.id
            }
        });

        return NextResponse.json({ success: true, data: script });
    } catch (error) {
        console.error('[SCRIPTS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// GET: Fetch user scripts
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

        const scripts = await prisma.script.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to recent 20
        });

        return NextResponse.json({ success: true, data: scripts });
    } catch (error) {
        console.error('[SCRIPTS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
