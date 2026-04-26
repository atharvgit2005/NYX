import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';
import { generateVideo, VoiceControls } from '@/lib/services/video-gen';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { script, avatarId, voiceId, voiceControls } = body;
        const apiKey = request.headers.get('x-api-key') || undefined;

        console.log("API Received Generate Request:");
        console.log("Avatar ID:", avatarId || 'default');
        console.log("Voice ID:", voiceId);
        console.log("Voice Controls:", voiceControls);

        // Call the video generation service
        const videoResponse = await generateVideo(script, avatarId, voiceId, apiKey, voiceControls as VoiceControls);

        // videoResponse is { videoId: string, status: string, url: string | null }
        if (videoResponse && videoResponse.videoId) {
            // Save to Database if user is authenticated
            const session = await getServerSession(authOptions);

            if (session?.user?.email) {
                try {
                    const user = await prisma.user.findUnique({
                        where: { email: session.user.email }
                    });

                    if (user) {
                        // upsert: if HeyGen returns the same videoId on a retry,
                        // update the existing record instead of crashing on unique constraint
                        await prisma.video.upsert({
                            where: { id: videoResponse.videoId },
                            update: { status: 'processing', updatedAt: new Date() },
                            create: {
                                id: videoResponse.videoId,
                                status: 'processing',
                                userId: user.id
                            }
                        });
                    }
                } catch (dbErr: unknown) {
                    // DB save failure should NOT fail the video generation response
                    console.error('DB save error (non-fatal):', dbErr instanceof Error ? dbErr.message : String(dbErr));
                }
            }

            return NextResponse.json({ success: true, data: videoResponse });
        } else {
            return NextResponse.json(
                { error: 'Failed to generate video or video ID not found' },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        console.error("Video Generation API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate video' },
            { status: 500 }
        );
    }
}
