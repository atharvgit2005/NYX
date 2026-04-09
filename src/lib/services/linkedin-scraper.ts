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
    LinkedIn Profile: ${fullName} (@${username})
    Headline/Bio: ${bio}
    Connections/Followers: ${followers}
    
    Recent Professional Updates & Posts:
    ${posts.map((p, i) => `[Post ${i + 1}] ${p.caption}`).join('\n\n')}
  `;
}

/**
 * LinkedIn Scraper Service
 * NOTE: LinkedIn is highly restrictive. This service provides a structure for 
 * RapidAPI integration but defaults to a high-quality Mock Fallback for evaluation.
 */
export async function scrapeLinkedInProfile(username: string): Promise<ScrapedProfile> {
    console.log(`[LinkedIn Scraper] Starting scrape for ${username}`);
    
    // In a real production environment, you would use a service like Proxycurl or Apify via RapidAPI:
    /*
    if (process.env.RAPIDAPI_KEY) {
        try {
            const options = {
                method: 'GET',
                url: 'https://linkedin-data-scraper.p.rapidapi.com/person',
                params: { username },
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'linkedin-data-scraper.p.rapidapi.com'
                }
            };
            const response = await axios.request(options);
            // ... parse response ...
        } catch (error) {
            console.error('RapidAPI LinkedIn failed', error);
        }
    }
    */

    // Defaulting to professional Mock Data to demonstrate functionality
    console.warn('[LinkedIn Scraper] Using Professional Mock Data fallback');
    return getMockLinkedInProfile(username);
}

function getMockLinkedInProfile(username: string): ScrapedProfile {
    const posts: ScrapedPost[] = [
        { 
            caption: "I'm thrilled to announce that I've just completed a major milestone in our AI research. The intersection of generative models and creative workflow is where the magic happens. 🚀 #AI #Innovation #FutureTech", 
            likes: "450", 
            imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60" 
        },
        { 
            caption: "Leadership isn't about being in charge. It's about taking care of those in your charge. Grateful for my team every single day. #Leadership #CompanyCulture", 
            likes: "820", 
            imageUrl: "https://images.unsplash.com/photo-1522071823991-b9671f903f60?w=500&auto=format&fit=crop&q=60" 
        },
        { 
            caption: "The most common question I get: 'How do you stay productive?' My answer is simple: Focus on deep work and eliminate the noise. What's your top productivity hack? 👇", 
            likes: "312", 
            imageUrl: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=500&auto=format&fit=crop&q=60" 
        },
        { 
            caption: "Just spoke at the AI Frontiers summit. The energy was incredible. We are just at the beginning of what's possible with large language models in enterprise. #AIGlobal #Keynote", 
            likes: "1.2k", 
            imageUrl: "https://images.unsplash.com/photo-1475721027767-p753cce59d44?w=500&auto=format&fit=crop&q=60" 
        },
        { 
            caption: "Consistency over intensity. If you want to build a personal brand, you have to show up every day, even when the algorithm doesn't favor you. Keep pushing. #PersonalBranding #Marketing", 
            likes: "640", 
            imageUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&auto=format&fit=crop&q=60" 
        }
    ];

    const fullName = username.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || "Alexander Sterling";

    return {
        username,
        fullName,
        biography: "Founder & CEO @ NYX | AI Research Lead | Helping creators scale their impact with intelligent workflows | Top 50 AI Innovators 2024",
        followersCount: "24.8k",
        posts,
        transcript: createTranscript(username, fullName, "Founder & CEO @ NYX | AI Research Lead", "24.8k", posts)
    };
}
