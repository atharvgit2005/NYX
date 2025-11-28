import { scrapeInstagramProfile } from '../src/lib/services/instagram-scraper';

async function testScraper() {
    const username = 'cristiano';
    console.log(`Testing scraper for @${username}...`);

    try {
        const profile = await scrapeInstagramProfile(username);
        console.log('Scraping Success!');
        console.log('Profile Data:', JSON.stringify(profile, null, 2));
    } catch (error: any) {
        console.error('Scraping Failed:', error.message);
    }
}

testScraper();
