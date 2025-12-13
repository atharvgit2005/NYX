import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
    console.log("REGISTER_API: Hit");
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!email || !password) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            }
        });

        if (existingUser) {
            return new NextResponse('Email already exists', { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`, // Auto generate avatar
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('REGISTRATION_ERROR_FULL:', error);
        // @ts-ignore
        if (error.message) console.error('ERROR_MSG:', error.message);
        return new NextResponse(`Internal Error: ${error}`, { status: 500 });
    }
}
