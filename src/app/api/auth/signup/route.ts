import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { name, email, password } = body;

    return NextResponse.json({
        success: true,
        user: {
            id: '3',
            name: name,
            email: email,
        },
        token: 'mock-jwt-token-signup',
    });
}
