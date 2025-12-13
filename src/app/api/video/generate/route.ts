import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';
import { generateVideo } from '@/lib/services/video-gen';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { script, avatarId, voiceId } = body;
        const apiKey = request.headers.get('x-api-key') || undefined;

        console.log("API Received Generate Request:");
        console.log("Avatar ID:", avatarId || 'default');

        // Call the video generation service
        const videoResponse = await generateVideo(script, avatarId, voiceId, apiKey);

        // videoResponse is { videoId: string, status: string, url: string | null }
        if (videoResponse && videoResponse.videoId) {
            // Save to Database if user is authenticated
            const session = await getServerSession(authOptions);

            if (session?.user?.email) {
                const user = await prisma.user.findUnique({
                    where: { email: session.user.email }
                });

                if (user) {
                    await prisma.video.create({
                        data: {
                            id: videoResponse.videoId,
                            status: 'processing',
                            userId: user.id
                        }
                    });
                }
            }

            return NextResponse.json({ success: true, data: videoResponse });
        } else {
            return NextResponse.json(
                { error: 'Failed to generate video or video ID not found' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Video Generation API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate video' },
            { status: 500 }
        );
    }
}
