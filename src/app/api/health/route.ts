import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET() {
    try {
        // Attempt to connect and fetch user count
        const count = await prisma.user.count();
        const users = await prisma.user.findMany({ take: 5, select: { email: true } });

        return NextResponse.json({
            status: 'Connected',
            userCount: count,
            users: users,
            env: {
                // Don't leak full secrets, just check existence
                hasDbUrl: !!process.env.DATABASE_URL,
                dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 15),
                hasDirectUrl: !!process.env.DIRECT_URL,
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'Error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
