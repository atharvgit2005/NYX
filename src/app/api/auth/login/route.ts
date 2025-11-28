import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, password } = body;

    // Mock validation
    if (email === 'test@example.com' && password === 'password') {
        return NextResponse.json({
            success: true,
            user: {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
            },
            token: 'mock-jwt-token',
        });
    }

    // Allow any login for MVP demo purposes if not specific test user
    return NextResponse.json({
        success: true,
        user: {
            id: '2',
            name: 'Demo User',
            email: email,
        },
        token: 'mock-jwt-token-demo',
    });
}
