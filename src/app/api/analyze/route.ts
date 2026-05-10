import { NextResponse } from 'next/server';
import { scrapeInstagramProfile } from '@/lib/services/instagram-scraper';
import { analyzeNiche } from '@/lib/services/ai-analysis';

export async function POST(request: Request) {
    try {
        const { profileData } = await request.json();
        const { username } = profileData;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        // 1. Scrape the real profile. The scraper itself never throws -
        //    when every strategy fails it returns a flagged mock instead.
        console.log(`Scraping profile for @${username}...`);
        const scrapedProfile = await scrapeInstagramProfile(username);

        // 2. Refuse to run Gemini on synthetic content. Previously the API
        //    silently analysed the mock transcript, so every username got
        //    the same generic "Creative Tech & AI" analysis - the user
        //    perceived this as "meta data instead of real analysis."
        //    Surface a real error so the UI can prompt the user.
        if (scrapedProfile.isMock) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        `We couldn't read @${username}'s public Instagram profile. ` +
                        `Confirm the account exists and is public, then try again. ` +
                        `If the issue persists Instagram is likely rate-limiting our scrapers - retry in a few minutes.`,
                    scrapeFailed: true,
                },
                { status: 502 },
            );
        }

        // 3. Analyze the (real) transcript with Gemini
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
                    posts: scrapedProfile.posts,
                    isMockData: false,
                },
            },
        });
    } catch (error: unknown) {
        console.error("Analysis API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to analyze niche' },
            { status: 500 }
        );
    }
}
