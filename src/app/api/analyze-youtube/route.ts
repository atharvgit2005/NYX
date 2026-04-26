import { NextResponse } from 'next/server';
import { scrapeYoutubeProfile } from '@/lib/services/youtube';
import { analyzeNiche } from '@/lib/services/ai-analysis';

export async function POST(request: Request) {
    try {
        const { profileData } = await request.json();
        const { channelHandle } = profileData;

        if (!channelHandle) {
            return NextResponse.json({ error: 'Channel handle is required' }, { status: 400 });
        }

        console.log(`[YouTube Route] Starting analysis for @${channelHandle}...`);

        // 1. Fetch YouTube channel data (API v3 with mock fallback)
        const ytProfile = await scrapeYoutubeProfile(channelHandle);

        // Detect if mock data was returned (channel name contains "Mock")
        const isMockData = ytProfile.channelName.includes('(Mock)');

        // 2. Analyze the transcript with Gemini
        console.log(`[YouTube Route] Analyzing transcript with Gemini... (Key exists? ${!!process.env.GEMINI_API_KEY})`);
        const analysis = await analyzeNiche(ytProfile.transcript);

        // 3. Return in the same shape the frontend expects
        return NextResponse.json({
            success: true,
            data: {
                ...analysis,
                platform: 'youtube',
                scrapedData: {
                    fullName: ytProfile.channelName,
                    followers: ytProfile.subscriberCount,
                    bio: ytProfile.description,
                    posts: ytProfile.shorts.map((s) => ({
                        imageUrl: s.thumbnailUrl,
                        likes: s.views, // Frontend displays views in the likes slot
                    })),
                    rawShortsData: ytProfile.shorts,
                    isMockData
                }
            }
        });
    } catch (error: unknown) {
        console.error("[YouTube Route] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to analyze YouTube channel' },
            { status: 500 }
        );
    }
}
