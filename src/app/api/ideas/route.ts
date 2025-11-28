import { NextResponse } from 'next/server';
import { generateIdeas } from '@/lib/services/ai-analysis';

export async function POST(request: Request) {
    try {
        const { niche, pillars } = await request.json();
        const ideas = await generateIdeas(niche, pillars);
        return NextResponse.json({ success: true, data: ideas });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to generate ideas' },
            { status: 500 }
        );
    }
}
