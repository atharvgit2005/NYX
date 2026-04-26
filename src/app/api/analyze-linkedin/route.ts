import { NextResponse } from 'next/server';
import { scrapeLinkedInProfile } from '@/lib/services/linkedin-scraper';
import { analyzeNiche } from '@/lib/services/ai-analysis';

export async function POST(request: Request) {
    try {
        const { profileData } = await request.json();
        const { username } = profileData;

        if (!username) {
            return NextResponse.json({ error: 'LinkedIn username or profile-id is required' }, { status: 400 });
        }

        console.log(`[LinkedIn API] Starting analysis for @${username}...`);
        
        // 1. Fetch LinkedIn profile data
        const scrapedProfile = await scrapeLinkedInProfile(username);
        
        // 2. Analyze the professional transcript with Gemini
        console.log(`[LinkedIn API] Analyzing professional transcript with Gemini...`);
        const analysis = await analyzeNiche(scrapedProfile.transcript);

        return NextResponse.json({
            success: true,
            data: {
                ...analysis,
                scrapedData: {
                    fullName: scrapedProfile.fullName,
                    followers: scrapedProfile.followersCount,
                    bio: scrapedProfile.biography,
                    posts: scrapedProfile.posts,
                    isMockData: true // Mark as mock for now unless API key is added
                }
            }
        });
    } catch (error: unknown) {
        console.error("LinkedIn Analysis API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to analyze professional profile' },
            { status: 500 }
        );
    }
}
