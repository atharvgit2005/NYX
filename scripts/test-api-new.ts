import axios from 'axios';

const RAPID_API_KEY = '62d3620263msh97d465ccecaf1bdp1dc647jsn9867015aa99d';
const RAPID_API_HOST = 'instagram28.p.rapidapi.com';

async function testNewAPI() {
    const username = 'nike';
    console.log(`Testing API for @${username}...`);

    try {
        // 1. Get User Info to find ID
        console.log('1. Fetching User Info...');
        const userInfoUrl = `https://${RAPID_API_HOST}/user_info`;
        const userInfoResponse = await axios.get(userInfoUrl, {
            params: { user_name: username }, // Trying user_name param
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            },
            validateStatus: () => true
        });

        console.log('UserInfo Status:', userInfoResponse.status);
        if (userInfoResponse.status !== 200) {
            console.log('UserInfo Error:', userInfoResponse.data);
            return;
        }

        const userData = userInfoResponse.data.data?.user || userInfoResponse.data;
        console.log('UserInfo Data Preview:', JSON.stringify(userData).substring(0, 200));

        const userId = userData.id || userData.pk;
        console.log('Found User ID:', userId);

        if (!userId) {
            console.error('Could not extract User ID');
            return;
        }

        // 2. Get Medias
        console.log(`2. Fetching Medias for ID ${userId}...`);
        const mediaUrl = `https://${RAPID_API_HOST}/medias_v2`;
        const mediaResponse = await axios.get(mediaUrl, {
            params: { user_id: userId, batch_size: 20 },
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            },
            validateStatus: () => true
        });

        console.log('Media Status:', mediaResponse.status);
        if (mediaResponse.status === 200) {
            console.log('Media Data Preview:', JSON.stringify(mediaResponse.data).substring(0, 2000));
            const edges = mediaResponse.data.data?.user?.edge_owner_to_timeline_media?.edges || [];
            console.log(`Found ${edges.length} posts.`);
            if (edges.length > 0) {
                console.log('First Post Caption:', edges[0].node.edge_media_to_caption?.edges[0]?.node?.text);
            }
        } else {
            console.log('Media Error:', mediaResponse.data);
        }

    } catch (error: any) {
        console.error('Test Failed:', error.message);
    }
}

testNewAPI();
