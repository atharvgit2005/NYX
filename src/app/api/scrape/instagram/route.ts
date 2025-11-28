import { NextResponse } from 'next/server';
import { scrapeInstagramProfile } from '@/lib/services/instagram-scraper';

export async function POST(request: Request) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        const profile = await scrapeInstagramProfile(username);

        return NextResponse.json({ success: true, data: profile });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to scrape profile' },
            { status: 500 }
        );
    }
}
