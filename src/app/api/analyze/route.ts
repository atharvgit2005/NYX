import { NextResponse } from 'next/server';
import { scrapeInstagramProfile } from '@/lib/services/instagram-scraper';
import { scrapeInstagramProfile as scrapeMockProfile } from '@/lib/services/instagram';
import { analyzeNiche } from '@/lib/services/ai-analysis';

export async function POST(request: Request) {
    try {
        const { profileData } = await request.json();
        const { username } = profileData;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        let scrapedProfile;
        let isMockData = false;

        try {
            // 1. Try to scrape the real profile
            console.log(`Scraping profile for @${username}...`);
            scrapedProfile = await scrapeInstagramProfile(username);
        } catch (scrapeError) {
            console.warn(`Live scraping failed for @${username}. Falling back to mock data.`);
            // 2. Fallback to mock data
            const mockProfile = await scrapeMockProfile(username);

            // Convert mock profile to the format expected by analyzeNiche
            // The mock profile has 'posts' but we need a 'transcript' string for the AI
            const transcript = `
            Profile: ${mockProfile.fullName} (@${mockProfile.username})
            Bio: ${mockProfile.biography}
            Followers: ${mockProfile.followersCount}
            
            Recent Content (Captions):
            ${mockProfile.posts.map((p, i) => `[Post ${i + 1}] ${p.caption}`).join('\n\n')}
            `;

            scrapedProfile = {
                ...mockProfile,
                followersCount: mockProfile.followersCount.toString(),
                transcript
            };
            isMockData = true;
        }

        // 3. Analyze the transcript with Gemini
        console.log(`Analyzing transcript with Gemini... (Key exists? ${!!process.env.GEMINI_API_KEY})`);
        const analysis = await analyzeNiche(scrapedProfile.transcript);

        return NextResponse.json({
            success: true,
            data: {
                ...analysis,
                scrapedData: {
                    fullName: scrapedProfile.fullName,
                    followers: scrapedProfile.followersCount,
                    bio: scrapedProfile.biography,
                    posts: scrapedProfile.posts, // Pass posts to frontend
                    isMockData // Inform the frontend/user that this is mock data
                }
            }
        });
    } catch (error: any) {
        console.error("Analysis API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze niche' },
            { status: 500 }
        );
    }
}
