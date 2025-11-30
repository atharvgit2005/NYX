import { NextResponse } from 'next/server';
import { generateVideo } from '@/lib/services/video-gen';

export async function POST(request: Request) {
    try {
        const { script, avatarId, voiceId } = await request.json();
        const video = await generateVideo(script, avatarId, voiceId);
        return NextResponse.json({ success: true, data: video });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to generate video' },
            { status: 500 }
        );
    }
}
