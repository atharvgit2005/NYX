import { NextResponse } from 'next/server';
import { generateScript } from '@/lib/services/ai-analysis';

export async function POST(request: Request) {
    try {
        const { idea, tone } = await request.json();
        const script = await generateScript(idea, tone);
        return NextResponse.json({ success: true, data: script });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to generate script' },
            { status: 500 }
        );
    }
}
