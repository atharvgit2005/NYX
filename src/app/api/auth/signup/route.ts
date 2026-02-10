import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
    console.log("REGISTER_API: Hit");
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
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
    } catch (error: any) {
        console.error('REGISTRATION_ERROR_FULL:', error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
