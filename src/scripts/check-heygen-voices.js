const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use the key from env OR the one you provided in chat if env fails loading in this script context
const API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_k2p1G9U12te_gXfEbLqvRnODdgosye4f4hIHhD00bs5w';

async function listVoices() {
    console.log("🔍 Checking HeyGen Voices for API Key...");
    console.log(`Key: ${API_KEY.substring(0, 10)}...`);

    try {
        const response = await axios.get('https://api.heygen.com/v2/voices', {
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const voices = response.data.data.voices || [];
        console.log(`✅ Success! Found ${voices.length} voices.`);

        console.log("\n--- Your Available Voices ---");
        voices.forEach((voice) => {
            // Log valuable details like name, id, and language
            console.log(`ID: ${voice.voice_id} | Name: ${voice.name} | Lang: ${voice.language} | Gender: ${voice.gender}`);
        });
        console.log("-------------------------\n");

        if (voices.length === 0) {
            console.warn("⚠️ No voices found! This is unexpected.");
        }

    } catch (error) {
        // Fallback for v1/v2 difference or errors
        const msg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("❌ Failed to list voices:", msg);
    }
}

listVoices();
