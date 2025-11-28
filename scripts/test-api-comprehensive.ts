import axios from 'axios';
import fs from 'fs';

const RAPID_API_KEY = '62d3620263msh97d465ccecaf1bdp1dc647jsn9867015aa99d';
const RAPID_API_HOST = 'instagram-data1.p.rapidapi.com';

const username = 'nike';

async function testEndpoint(path: string, params: any) {
    console.log(`Testing ${path} with params:`, params);
    try {
        const response = await axios.get(`https://${RAPID_API_HOST}${path}`, {
            params,
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            },
            validateStatus: () => true // Don't throw on error status
        });
        console.log(`Status: ${response.status}`);
        if (response.status === 200) {
            console.log('Success! Data preview:', JSON.stringify(response.data).substring(0, 200));
            return true;
        } else {
            console.log('Error:', response.data);
        }
    } catch (error: any) {
        console.log('Exception:', error.message);
    }
    return false;
}

async function runTests() {
    // 1. Try various params for /user/info
    await testEndpoint('/user/info', { username });
    await testEndpoint('/user/info', { user_name: username });
    await testEndpoint('/user/info', { name: username });
    await testEndpoint('/user/info', { query: username });

    // 2. Try other potential endpoints
    await testEndpoint('/user/profile', { username });
    await testEndpoint('/user/data', { username });
    await testEndpoint('/user/details', { username });

    // 3. Try search again and save HTML
    console.log('Fetching /user/search...');
    try {
        const response = await axios.get(`https://${RAPID_API_HOST}/user/search`, {
            params: { keyword: username },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        });
        fs.writeFileSync('debug_search.html', response.data);
        console.log('Saved debug_search.html');
    } catch (e) {
        console.error(e);
    }
}

runTests();
