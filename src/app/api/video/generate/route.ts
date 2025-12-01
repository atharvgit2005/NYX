import { NextResponse } from 'next/server';
import { generateVideo } from '@/lib/services/video-gen';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { script, avatarId, voiceId } = body;
        const apiKey = request.headers.get('x-api-key') || undefined;

        console.log("API Received Generate Request:");
        console.log("Avatar ID:", avatarId);
        console.log("Voice ID:", voiceId);
        console.log("Script Length:", script?.length);
        console.log("Custom API Key Provided:", !!apiKey);

        const video = await generateVideo(script, avatarId, voiceId, apiKey);
        return NextResponse.json({ success: true, data: video });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to generate video' },
            { status: 500 }
        );
    }
}
