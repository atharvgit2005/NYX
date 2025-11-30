import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Manually load .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach((line) => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
} catch (e) {
    console.warn('Failed to load .env.local manually');
}

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

async function verifyHeyGen() {
    console.log('--- Verifying HeyGen API Key ---');
    if (!HEYGEN_API_KEY) {
        console.error('❌ HEYGEN_API_KEY is missing in .env.local');
        return;
    }

    try {
        // List Avatars
        const avatarResponse = await axios.get('https://api.heygen.com/v2/avatars', {
            headers: { 'X-Api-Key': HEYGEN_API_KEY },
        });
        console.log('✅ HeyGen API Key is VALID.');
        console.log(`   Found ${avatarResponse.data.data.avatars.length} avatars.`);
        if (avatarResponse.data.data.avatars.length > 0) {
            console.log('   Example Avatar:', JSON.stringify(avatarResponse.data.data.avatars[0], null, 2));
        }

        // List Voices
        const voiceResponse = await axios.get('https://api.heygen.com/v2/voices', {
            headers: { 'X-Api-Key': HEYGEN_API_KEY },
        });
        console.log(`   Found ${voiceResponse.data.data.voices.length} voices.`);
        if (voiceResponse.data.data.voices.length > 0) {
            console.log('   Example Voice:', JSON.stringify(voiceResponse.data.data.voices[0], null, 2));
        }

    } catch (error: any) {
        console.error('❌ HeyGen API Verification FAILED.');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`   Error: ${error.message}`);
        }
    }
}

async function verifyElevenLabs() {
    console.log('\n--- Verifying ElevenLabs API Key ---');
    if (!ELEVENLABS_API_KEY) {
        console.error('❌ ELEVENLABS_API_KEY is missing in .env.local');
        return;
    }

    try {
        // Try to get user info to check auth
        const response = await axios.get('https://api.elevenlabs.io/v1/user', {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        console.log('✅ ElevenLabs API Key is VALID.');
        console.log(`   User: ${response.data.subscription.tier} tier`);
    } catch (error: any) {
        console.error('❌ ElevenLabs API Verification FAILED.');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`   Error: ${error.message}`);
        }
    }
}

async function main() {
    await verifyHeyGen();
    await verifyElevenLabs();
}

main();
