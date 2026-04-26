/**
 * YouTube Data API v3 Service
 * ────────────────────────────────────────────────────────────────────
 * Replaced: HTML scraping via regex extraction of ytInitialData.
 * Reason:   HTML scraping was unreliable — YouTube constantly changes
 *           internal JSON structures and blocks server-side fetch().
 *
 * Now uses the official YouTube Data API v3 with env var YOUTUBE_API_KEY.
 * Falls back to mock data when the key is missing or any API call fails.
 *
 * Architecture matches existing project patterns:
 *   - Raw process.env access (same as GEMINI_API_KEY, HEYGEN_API_KEY)
 *   - Graceful mock fallback (same as instagram-scraper.ts)
 *   - Console logging with [YouTube API] prefix
 *   - Preserves YoutubeProfile / YoutubeShort interfaces for API route compat
 * ────────────────────────────────────────────────────────────────────
 */

// ─── Interfaces (unchanged — consumed by API route + frontend) ──────

export interface YoutubeProfile {
    channelHandle: string;
    channelName: string;
    description: string;
    subscriberCount: number;
    shorts: YoutubeShort[];
    transcript: string; // Pre-built transcript for AI analysis
}

export interface YoutubeShort {
    id: string;
    title: string;
    views: number;
    likes: number;
    thumbnailUrl: string;
    timestamp: string;
}

// ─── In-memory cache (5 min TTL) ───────────────────────────────────

interface CacheEntry {
    data: YoutubeProfile;
    expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(handle: string): YoutubeProfile | null {
    const entry = cache.get(handle.toLowerCase());
    if (entry && Date.now() < entry.expiresAt) {
        console.log(`[YouTube API] Cache hit for ${handle}`);
        return entry.data;
    }
    if (entry) cache.delete(handle.toLowerCase());
    return null;
}

function setCache(handle: string, data: YoutubeProfile): void {
    cache.set(handle.toLowerCase(), {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
    });
}

// ─── YouTube Data API v3 base URL ──────────────────────────────────

const YT_API = 'https://www.googleapis.com/youtube/v3';

function getApiKey(): string {
    return process.env.YOUTUBE_API_KEY || '';
}

// ─── Step 1: Resolve Handle → Channel ID ───────────────────────────

async function getChannelId(handle: string): Promise<string | null> {
    const key = getApiKey();
    const query = handle.startsWith('@') ? handle.slice(1) : handle;

    console.log(`[YouTube API] Step 1 — Resolving handle "${handle}" → Channel ID...`);

    const url = `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=1&key=${key}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Search API failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    const channelId = data?.items?.[0]?.snippet?.channelId || data?.items?.[0]?.id?.channelId;

    if (!channelId) {
        throw new Error(`No channel found for handle "${handle}"`);
    }

    console.log(`[YouTube API] Resolved → ${channelId}`);
    return channelId;
}

// ─── Step 2: Fetch Channel Details ─────────────────────────────────

interface ChannelData {
    name: string;
    description: string;
    subscribers: number;
    thumbnail: string;
}

async function getChannelData(channelId: string): Promise<ChannelData> {
    const key = getApiKey();
    console.log(`[YouTube API] Step 2 — Fetching channel details for ${channelId}...`);

    const url = `${YT_API}/channels?part=snippet,statistics&id=${channelId}&key=${key}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Channels API failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    const channel = data?.items?.[0];

    if (!channel) {
        throw new Error(`Channel ${channelId} not found in API response`);
    }

    return {
        name: channel.snippet?.title || 'Unknown Channel',
        description: channel.snippet?.description || '',
        subscribers: parseInt(channel.statistics?.subscriberCount || '0', 10),
        thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || '',
    };
}

// ─── Step 3: Fetch Recent Videos ───────────────────────────────────

interface RawVideoItem {
    videoId: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
}

async function getRecentVideos(channelId: string): Promise<RawVideoItem[]> {
    const key = getApiKey();
    console.log(`[YouTube API] Step 3 — Fetching recent videos for ${channelId}...`);

    const url = `${YT_API}/search?part=snippet&channelId=${channelId}&maxResults=15&order=date&type=video&key=${key}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Search (videos) API failed (${res.status}): ${body}`);
    }

    const data = await res.json() as { items?: Record<string, unknown>[] };
    const items: RawVideoItem[] = (data?.items || []).map((item) => ({
        videoId: item.id?.videoId || '',
        title: item.snippet?.title || 'Untitled',
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
    }));

    console.log(`[YouTube API] Found ${items.length} recent videos`);
    return items;
}

// ─── Step 4: Filter to Shorts Only ─────────────────────────────────

async function filterShorts(videos: RawVideoItem[]): Promise<YoutubeShort[]> {
    if (videos.length === 0) return [];

    const key = getApiKey();
    const videoIds = videos.map(v => v.videoId).filter(Boolean).join(',');

    console.log(`[YouTube API] Step 4 — Filtering ${videos.length} videos for Shorts (duration < 60s)...`);

    const url = `${YT_API}/videos?part=contentDetails,statistics&id=${videoIds}&key=${key}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Videos API failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    const shorts: YoutubeShort[] = [];

    for (const video of data?.items || []) {
        const durationStr = video.contentDetails?.duration || '';
        const seconds = parseISO8601Duration(durationStr);

        // Shorts are <= 60 seconds
        if (seconds > 0 && seconds <= 60) {
            const matchingSearch = videos.find(v => v.videoId === video.id);

            shorts.push({
                id: video.id,
                title: matchingSearch?.title || video.snippet?.title || 'Untitled Short',
                views: parseInt(video.statistics?.viewCount || '0', 10),
                likes: parseInt(video.statistics?.likeCount || '0', 10),
                thumbnailUrl: matchingSearch?.thumbnail || '',
                timestamp: matchingSearch?.publishedAt || new Date().toISOString(),
            });
        }

        if (shorts.length >= 10) break; // Limit to 10 Shorts
    }

    console.log(`[YouTube API] Filtered down to ${shorts.length} Shorts`);
    return shorts;
}

/** Parse ISO 8601 duration (e.g. "PT45S", "PT1M30S") → total seconds */
function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
}

// ─── Step 5: Build Transcript (for AI analysis) ────────────────────

function buildTranscript(handle: string, channel: ChannelData, shorts: YoutubeShort[]): string {
    return `
    YouTube Channel: ${channel.name} (@${handle})
    Bio: ${channel.description}
    Subscribers: ${channel.subscribers}
    
    Recent Shorts Content (Titles):
    ${shorts.map((s, i) => `[Short ${i + 1}] ${s.title} (${s.views.toLocaleString()} views, ${s.likes.toLocaleString()} likes)`).join('\n\n')}
    `;
}

// ─── Main Exported Entry Point ─────────────────────────────────────

export async function scrapeYoutubeProfile(channelHandle: string): Promise<YoutubeProfile> {
    const handle = channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`;

    // 1. Check cache first
    const cached = getCached(handle);
    if (cached) return cached;

    // 2. Check if API key exists
    if (!getApiKey()) {
        console.warn('[YouTube API] YOUTUBE_API_KEY is not set. Returning mock data.');
        return getMockYoutubeProfile(channelHandle);
    }

    try {
        // Step 1 → Channel ID
        const channelId = await getChannelId(handle);
        if (!channelId) throw new Error('Channel ID resolution failed');

        // Step 2 → Channel Details
        const channelData = await getChannelData(channelId);

        // Step 3 → Recent Videos
        const recentVideos = await getRecentVideos(channelId);

        // Step 4 → Filter to Shorts
        const shorts = await filterShorts(recentVideos);

        // Step 5 → Build result
        const transcript = buildTranscript(handle, channelData, shorts);

        const result: YoutubeProfile = {
            channelHandle: handle,
            channelName: channelData.name,
            description: channelData.description,
            subscriberCount: channelData.subscribers,
            shorts,
            transcript,
        };

        // Cache the result
        setCache(handle, result);

        console.log(`[YouTube API] ✓ Complete — ${channelData.name}: ${shorts.length} shorts, ${channelData.subscribers} subscribers`);
        return result;

    } catch (error: unknown) {
        console.error(`[YouTube API] Pipeline failed for ${handle}: ${error instanceof Error ? error.message : String(error)}`);
        return getMockYoutubeProfile(channelHandle);
    }
}

// ─── Mock Fallback (matches project pattern) ───────────────────────

function getMockYoutubeProfile(channelHandle: string): YoutubeProfile {
    const shorts: YoutubeShort[] = [
        {
            id: 'mock1',
            title: '3 AI Websites that feel ILLEGAL to know 🤯 #shorts #ai',
            views: 125000,
            likes: 12000,
            thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=711&fit=crop',
            timestamp: new Date().toISOString(),
        },
        {
            id: 'mock2',
            title: 'ChatGPT just changed EVERYTHING (again)',
            views: 89000,
            likes: 8500,
            thumbnailUrl: 'https://images.unsplash.com/photo-1680795456476-85750868f0cb?w=400&h=711&fit=crop',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: 'mock3',
            title: 'How I automate my YouTube channel using Python 🐍',
            views: 210000,
            likes: 24000,
            thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=711&fit=crop',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
    ];

    const transcript = buildTranscript(
        channelHandle,
        { name: `${channelHandle} (Mock)`, description: 'Mock data — YOUTUBE_API_KEY not configured', subscribers: 88500, thumbnail: '' },
        shorts
    );

    return {
        channelHandle,
        channelName: `${channelHandle} (Mock)`,
        description: 'YouTube API key not configured or API call failed. Displaying mock data.',
        subscriberCount: 88500,
        shorts,
        transcript,
    };
}
