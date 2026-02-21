import * as cheerio from 'cheerio';
import axios from 'axios';

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

// Strategy: Official IG Public API (Hidden)
async function scrapeWithIGApi(username: string): Promise<ScrapedProfile | null> {
    console.log(`[Strategy: IG API] Fetching info for @${username}...`);
    try {
        const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
        // Note: Using native fetch to easily send correct headers
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Instagram 219.0.0.12.117 Android',
                'X-IG-App-ID': '936619743392459',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (res.status !== 200) {
            console.warn(`[Strategy: IG API] Failed with status ${res.status}`);
            return null;
        }

        const data = await res.json();
        const user = data?.data?.user;
        if (!user) return null;

        const fullName = user.full_name || username;
        const biography = user.biography || 'Bio not available';

        let followersCountNum = user.edge_followed_by?.count || 0;
        let followersCount = followersCountNum >= 1000000
            ? (followersCountNum / 1000000).toFixed(1) + 'M'
            : followersCountNum >= 1000
                ? (followersCountNum / 1000).toFixed(1) + 'k'
                : followersCountNum.toString();

        const posts: ScrapedPost[] = [];
        const edges = user.edge_owner_to_timeline_media?.edges || [];

        for (let i = 0; i < Math.min(6, edges.length); i++) {
            const node = edges[i].node;
            const caption = node.edge_media_to_caption?.edges[0]?.node?.text || 'No caption';

            let likesNum = node.edge_liked_by?.count || 0;
            let likes = likesNum >= 1000000
                ? (likesNum / 1000000).toFixed(1) + 'M'
                : likesNum >= 1000
                    ? (likesNum / 1000).toFixed(1) + 'k'
                    : likesNum.toString();

            const imageUrl = node.display_url || '';

            if (imageUrl) {
                posts.push({ caption, likes, imageUrl });
            }
        }

        if (posts.length === 0) {
            console.warn('[Strategy: IG API] Found 0 posts. Account might be private.');
        } else {
            console.log(`[Strategy: IG API] Success! Found ${posts.length} posts for @${username}`);
        }

        return {
            username,
            fullName,
            biography,
            followersCount,
            posts,
            transcript: createTranscript(username, fullName, biography, followersCount, posts)
        };

    } catch (error: any) {
        console.error(`[Strategy: IG API] Error: ${error.message}`);
        return null;
    }
}

// Strategy: Scrape a Public Web Viewer (Picuki)
// This bypasses Instagram's direct anti-scraping measures by using a public mirror.
async function scrapeWithPicuki(username: string): Promise<ScrapedProfile | null> {
    console.log(`[Strategy: Picuki Mirror] Fetching info for @${username}...`);
    try {
        const url = `https://www.picuki.com/profile/${username}`;
        const { data } = await axios.get(url, {
            headers: {
                // Mimic a real browser to avoid simplistic blocking
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            },
            timeout: 15000 // 15s timeout
        });

        const $ = cheerio.load(data);

        // 1. Extract Profile Info
        const fullName = $('.profile-name h1').text().trim() || username;
        const biography = $('.profile-description').text().trim() || 'Bio not available';
        const followersCount = $('.followed_by').text().replace('Followers', '').trim() || 'Unknown';

        // 2. Extract Posts
        const posts: ScrapedPost[] = [];
        $('.box-photo').each((i, el) => {
            if (i >= 6) return; // Limit to 6 posts

            const caption = $(el).find('.photo-description').text().trim() || 'No caption';
            const likes = $(el).find('.likes_photo').text().trim() || '0';
            const imageUrl = $(el).find('img').attr('src') || '';

            if (imageUrl) {
                posts.push({ caption, likes, imageUrl });
            }
        });

        if (posts.length === 0) {
            console.warn('[Strategy: Picuki] Found 0 posts. Account might be private or not found.');
            return null;
        }

        console.log(`[Strategy: Picuki] Success! Found ${posts.length} posts for @${username}`);

        return {
            username,
            fullName,
            biography,
            followersCount,
            posts,
            transcript: createTranscript(username, fullName, biography, followersCount, posts)
        };

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error(`[Strategy: Picuki] Request failed: ${error.response?.status} ${error.response?.statusText}`);
        } else {
            console.error(`[Strategy: Picuki] Failed: ${error.message}`);
        }
        return null; // Fallback to next strategy
    }
}

// Strategy: Dumpoir (Backup Mirror)
async function scrapeWithDumpoir(username: string): Promise<ScrapedProfile | null> {
    console.log(`[Strategy: Dumpoir Mirror] Fetching info for @${username}...`);
    try {
        const url = `https://www.dumpoir.com/v/${username}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);

        const fullName = $('.user__title h1').text().trim() || username;
        const biography = $('.user__info-desc').text().trim() || '';
        const followersCount = 'Unknown';

        const posts: ScrapedPost[] = [];
        $('.content__img').each((i, el) => {
            if (i >= 6) return;
            const imageUrl = $(el).attr('src') || '';
            const caption = $(el).attr('alt') || 'No caption';
            if (imageUrl) posts.push({ caption, likes: 'Unknown', imageUrl });
        });

        if (posts.length === 0) return null;

        return {
            username,
            fullName,
            biography,
            followersCount,
            posts,
            transcript: createTranscript(username, fullName, biography, followersCount, posts)
        };
    } catch (error) {
        console.warn(`[Strategy: Dumpoir] Failed`);
        return null;
    }
}


export async function scrapeInstagramProfile(username: string): Promise<ScrapedProfile> {
    // 1. Try Direct IG API (Most reliable right now)
    const igResult = await scrapeWithIGApi(username);
    if (igResult) return igResult;

    // 2. Try Picuki (Backup reliable public viewer)
    const picukiResult = await scrapeWithPicuki(username);
    if (picukiResult) return picukiResult;

    // 3. Try Dumpoir (Backup viewer)
    const dumpoirResult = await scrapeWithDumpoir(username);
    if (dumpoirResult) return dumpoirResult;

    console.warn('[Scraper] All mirror strategies failed. Returning Fallback Mock Data.');
    return getMockProfile(username);
}

// Mock Data Fallback
function getMockProfile(username: string): ScrapedProfile {
    // Context-aware mock posts
    const posts: ScrapedPost[] = [
        { caption: "Building the future of AI. Innovation never sleeps. #Tech #AI", likes: "1.2k", imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60" },
        { caption: "Behind the scenes at our new office. Minimalism is key.", likes: "950", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=60" },
        { caption: "Just launched our new product! Check the link in bio.", likes: "2.1k", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60" },
        { caption: "Coffee and code. The perfect Sunday morning.", likes: "800", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60" },
        { caption: "Speaking at the global tech summit next week! Cannot wait.", likes: "1.5k", imageUrl: "https://images.unsplash.com/photo-1475721027767-p753cce59d44?w=500&auto=format&fit=crop&q=60" },
        { caption: "Exploring new frontiers in generative art. Does this look real?", likes: "3.2k", imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=500&auto=format&fit=crop&q=60" }
    ];

    return {
        username,
        fullName: `${username} (Demo Mirror Failed)`,
        biography: "Creative Technologist • Building next-gen AI tools • Public Speaker",
        followersCount: "15.2k",
        posts,
        transcript: createTranscript(username, `${username} (Demo)`, "Creative Technologist • Building next-gen AI tools", "15.2k", posts)
    };
}
