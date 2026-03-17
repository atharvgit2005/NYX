export interface YoutubeProfile {
    channelHandle: string;
    channelName: string;
    description: string;
    subscriberCount: number;
    shorts: YoutubeShort[];
}

export interface YoutubeShort {
    id: string;
    title: string;
    views: number;
    likes: number;
    thumbnailUrl: string;
    timestamp: string;
}

export async function scrapeYoutubeProfile(channelHandle: string): Promise<YoutubeProfile> {
    try {
        const handle = channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`;
        
        console.log(`[YouTube Scraper] Fetching live HTML for ${handle}...`);
        const response = await fetch(`https://www.youtube.com/${handle}/shorts`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch YouTube page. Status: ${response.status}`);
        }

        const html = await response.text();
        const ytInitialDataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
        
        if (!ytInitialDataMatch || !ytInitialDataMatch[1]) {
            throw new Error('Could not find ytInitialData JSON within the HTML page');
        }

        const ytInitialData = JSON.parse(ytInitialDataMatch[1]);
        
        // Extract basic channel metadata
        const channelMetadata = ytInitialData?.metadata?.channelMetadataRenderer;
        const channelName = channelMetadata?.title || handle;
        const description = channelMetadata?.description || '';
        
        // Find subscribers count
        let subscriberCount = 0;
        const header = ytInitialData?.header?.c4TabbedHeaderRenderer || ytInitialData?.header?.pageHeaderRenderer;
        if (header?.subscriberCountText?.simpleText) {
            subscriberCount = parseYoutubeNumber(header.subscriberCountText.simpleText);
        } else if (header?.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows) {
            // New YouTube desktop layout
            const rows = header.content.pageHeaderViewModel.metadata.contentMetadataViewModel.metadataRows;
            for (const row of rows) {
                const parts = row?.metadataParts || [];
                for (const part of parts) {
                    if (part?.text?.content?.includes('subscribers')) {
                        subscriberCount = parseYoutubeNumber(part.text.content);
                    }
                }
            }
        }

        // Find Shorts tab
        const tabs = ytInitialData?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
        const shortsTab = tabs.find((t: any) => t?.tabRenderer?.title === 'Shorts' || t?.tabRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url?.includes('/shorts'));
        
        const shorts: YoutubeShort[] = [];
        
        if (shortsTab) {
            const richItems = shortsTab?.tabRenderer?.content?.richGridRenderer?.contents || [];
            
            for (const item of richItems) {
                const reel = item?.richItemRenderer?.content?.reelItemRenderer;
                if (!reel) continue;
                
                const title = reel.headline?.simpleText || 'Untitled Short';
                const videoId = reel.videoId;
                const thumbnailUrl = reel.thumbnail?.thumbnails?.[0]?.url || '';
                
                let views = 0;
                if (reel.viewCountText?.simpleText) {
                    views = parseYoutubeNumber(reel.viewCountText.simpleText);
                }

                shorts.push({
                    id: videoId || Math.random().toString(),
                    title,
                    views,
                    likes: Math.floor(views * 0.04), // Roughly estimate likes for shorts feed based on view-ratio
                    thumbnailUrl,
                    timestamp: new Date().toISOString(),
                });

                if (shorts.length >= 10) break; // Analyze the 10 most recent shorts
            }
        }

        if (shorts.length > 0) {
            console.log(`[YouTube Scraper] Successfully scraped live data for ${handle} - ${shorts.length} shorts found.`);
            return {
                channelHandle: handle,
                channelName,
                description,
                subscriberCount,
                shorts
            };
        } else {
            throw new Error("No shorts were parsed from the initial data.");
        }

    } catch (error: any) {
        console.warn(`[YouTube Scraper] Live scrape failed: ${error.message}. Falling back to mock data...`);
        return getMockYoutubeProfile(channelHandle);
    }
}

/** Helper to parse abbreviated numbers like "1.2M subscribers" or "50K views" */
function parseYoutubeNumber(text: string): number {
    const clean = text.replace(/[^0-9.KMBkmb]/g, '').toUpperCase();
    let num = parseFloat(clean);
    
    if (clean.includes('K')) num *= 1000;
    else if (clean.includes('M')) num *= 1000000;
    else if (clean.includes('B')) num *= 1000000000;
    
    return isNaN(num) ? 0 : Math.floor(num);
}

function getMockYoutubeProfile(channelHandle: string): YoutubeProfile {
    return {
        channelHandle,
        channelName: `${channelHandle} (Mocked)`,
        description: 'Failed to live-scrape YouTube. Displaying mocked placeholder data instead.',
        subscriberCount: 88500,
        shorts: [
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
        ],
    };
}
