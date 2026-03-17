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

        let scrapedProfile;
        let isMockData = false;

        try {
            console.log(`Scraping YouTube profile for @${channelHandle}...`);
            // Attempt to scrape the YouTube profile
            scrapedProfile = await scrapeYoutubeProfile(channelHandle);

            // Convert to the transcript format expected by analyzeNiche
            const transcript = `
            Profile: ${scrapedProfile.channelName} (@${scrapedProfile.channelHandle})
            Bio: ${scrapedProfile.description}
            Subscribers: ${scrapedProfile.subscriberCount}
            
            Recent Content (Shorts Titles):
            ${scrapedProfile.shorts.map((s, i) => `[Short ${i + 1}] ${s.title}`).join('\n\n')}
            `;

            scrapedProfile = {
                ...scrapedProfile,
                transcript
            };
            isMockData = true; // In our current mock implementation, this is true
        } catch (scrapeError) {
            console.warn(`Live YouTube scraping failed for @${channelHandle}.`);
            throw scrapeError;
        }

        // Analyze the transcript with Gemini
        console.log(`Analyzing YouTube transcript with Gemini...`);
        const analysis = await analyzeNiche(scrapedProfile.transcript);

        return NextResponse.json({
            success: true,
            data: {
                ...analysis,
                platform: 'youtube', // Explicitly marked
                scrapedData: {
                    fullName: scrapedProfile.channelName, // Mapped for frontend compatibility
                    followers: scrapedProfile.subscriberCount, // Mapped for frontend compatibility
                    bio: scrapedProfile.description, // Mapped for frontend compatibility
                    posts: scrapedProfile.shorts.map((s) => ({
                        imageUrl: s.thumbnailUrl,
                        likes: s.views, // Re-purpose likes for views for frontend display continuity
                    })), 
                    rawShortsData: scrapedProfile.shorts, // Kept for exact stats
                    isMockData
                }
            }
        });
    } catch (error: any) {
        console.error("YouTube Analysis API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze YouTube channel' },
            { status: 500 }
        );
    }
}
