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
    // Mock data simulation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        channelHandle,
        channelName: 'Viral YT Creator',
        description: 'Daily shorts on tech, AI and productivity. Subscribe for more! 🔴',
        subscriberCount: 45000,
        shorts: [
            {
                id: '1',
                title: '3 AI Websites that feel ILLEGAL to know 🤯 #shorts #ai',
                views: 125000,
                likes: 12000,
                thumbnailUrl: 'https://via.placeholder.com/400x711',
                timestamp: new Date().toISOString(),
            },
            {
                id: '2',
                title: 'ChatGPT just changed EVERYTHING (again)',
                views: 89000,
                likes: 8500,
                thumbnailUrl: 'https://via.placeholder.com/400x711',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: '3',
                title: 'How I automate my YouTube channel using Python 🐍',
                views: 210000,
                likes: 24000,
                thumbnailUrl: 'https://via.placeholder.com/400x711',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
            },
        ],
    };
}
