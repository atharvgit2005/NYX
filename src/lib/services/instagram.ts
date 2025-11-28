export interface InstagramProfile {
    username: string;
    fullName: string;
    biography: string;
    followersCount: number;
    posts: InstagramPost[];
}

export interface InstagramPost {
    id: string;
    caption: string;
    likes: number;
    comments: number;
    imageUrl: string;
    timestamp: string;
}

export async function scrapeInstagramProfile(username: string): Promise<InstagramProfile> {
    // Mock data simulation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        username,
        fullName: 'AI Creator',
        biography: 'Helping solopreneurs scale with AI tools. 🚀\nBuilding in public.',
        followersCount: 12500,
        posts: [
            {
                id: '1',
                caption: 'Stop trading time for money. Use these 3 AI tools instead. #ai #productivity',
                likes: 1200,
                comments: 45,
                imageUrl: 'https://via.placeholder.com/400',
                timestamp: new Date().toISOString(),
            },
            {
                id: '2',
                caption: 'The future of content creation is automated. Are you ready?',
                likes: 850,
                comments: 30,
                imageUrl: 'https://via.placeholder.com/400',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: '3',
                caption: 'My exact workflow for creating 10 videos in 1 hour.',
                likes: 2100,
                comments: 120,
                imageUrl: 'https://via.placeholder.com/400',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
            },
        ],
    };
}
