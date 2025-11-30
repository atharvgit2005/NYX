import { NextResponse } from 'next/server';
import { checkVideoStatus } from '@/lib/services/video-gen';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return NextResponse.json(
            { error: 'Missing videoId parameter' },
            { status: 400 }
        );
    }

    try {
        const status = await checkVideoStatus(videoId);
        console.log(`Checking status for ${videoId}:`, status);
        return NextResponse.json({ success: true, data: status });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to check video status' },
            { status: 500 }
        );
    }
}
