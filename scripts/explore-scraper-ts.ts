import { InstagramScraper } from 'instagram-scraper-ts';

async function explore() {
    try {
        const scraper = new InstagramScraper();
        const username = 'cristiano';

        console.log(`Fetching profile for @${username}...`);
        const profile = await scraper.getProfile(username);
        console.log('Profile Data:', JSON.stringify(profile, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

explore();
