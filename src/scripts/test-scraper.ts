
import { scrapeInstagramProfile } from '../lib/services/instagram-scraper';

async function testScraper(username: string) {
    console.log(`Testing scraper for user: ${username}`);
    try {
        // Use our robust local scraper service (Mirror Strategy)
        const response = await scrapeInstagramProfile(username);

        console.log("Scraper Response Success!");
        console.log(`Found ${response.posts.length} posts.`);

        if (response.posts.length > 0) {
            console.log("First post caption:", response.posts[0].caption);
            console.log("First post image:", response.posts[0].imageUrl);
        } else {
            console.log("No posts found or account is private/empty.");
        }

        console.log("\n--- Full Profile Data ---");
        console.log(`Name: ${response.fullName}`);
        console.log(`Bio: ${response.biography}`);
        console.log(`Followers: ${response.followersCount}`);

    } catch (error: any) {
        console.error("Scraper Failed!");
        console.error(error);
    }
}

// Replace with a public username to test
const targetUser = process.argv[2] || 'instagram';
testScraper(targetUser);
