import { InstagramScraper } from '@aduptive/instagram-scraper';

export interface ScrapedProfile {
    username: string;
    fullName: string;
    biography: string;
    followersCount: string;
    posts: ScrapedPost[];
    transcript: string;
}

export interface ScrapedPost {
    caption: string;
    likes: string;
    imageUrl: string;
}

function createTranscript(username: string, fullName: string, bio: string, followers: string, posts: ScrapedPost[]) {
    return `
    Profile: ${fullName} (@${username})
    Bio: ${bio}
    Followers: ${followers}
    
    Recent Content (Captions):
    ${posts.map((p, i) => `[Post ${i + 1}] ${p.caption}`).join('\n\n')}
  `;
}

export async function scrapeInstagramProfile(username: string): Promise<ScrapedProfile> {
    try {
        console.log(`Fetching info for @${username} via local scraper...`);

        const scraper = new InstagramScraper();
        const response = await scraper.getPosts(username, 1);

        const rawPosts = response.posts || [];

        const posts: ScrapedPost[] = rawPosts.map((post: any) => ({
            caption: post.caption || '',
            likes: (post.likes || 0).toString(),
            imageUrl: post.display_url || post.url || ''
        })).slice(0, 12);

        // Note: The scraper doesn't return profile info like bio/followers in the posts response.
        // We'll use placeholders for now as we don't have a reliable way to get them without login.
        const fullName = username; // Fallback
        const biography = 'Bio not available (private/scraped)';
        const followersCount = 'Unknown';

        return {
            username,
            fullName,
            biography,
            followersCount,
            posts,
            transcript: createTranscript(username, fullName, biography, followersCount, posts),
        };

    } catch (error: any) {
        console.error(`Scraper failed: ${error.message}`);
        throw error;
    }
}
