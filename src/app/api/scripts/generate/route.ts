import { NextResponse } from 'next/server';
import { generateScript } from '@/lib/services/ai-analysis';

export async function POST(request: Request) {
    try {
        const { idea, tone } = await request.json();

        if (!idea) {
            return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
        }

        const scriptContent = await generateScript(idea, tone);
        return NextResponse.json({ success: true, data: scriptContent });
    } catch (error) {
        console.error('Failed to generate script:', error);
        return NextResponse.json(
            { error: 'Failed to generate script' },
            { status: 500 }
        );
    }
}
