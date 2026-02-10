const axios = require('axios');

// Hardcoded API Key for testing
const API_KEY = 'sk_V2_hgu_k5cngzvfEst_0vjNzUoLPz27k0o5S2bhnhYUZ0JDRzBy';

async function listAvatars() {
    console.log("🔍 Checking HeyGen Avatars for API Key (Hardcoded Test)...");

    try {
        const response = await axios.get('https://api.heygen.com/v2/avatars', {
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const avatars = response.data.data.avatars || [];
        console.log(`✅ Success! Found ${avatars.length} avatars.`);

        console.log("\n--- Available Avatars ---");
        avatars.forEach((avatar) => {
            console.log(`ID: ${avatar.avatar_id} | Name: ${avatar.name || 'Unnamed'} | Type: ${avatar.avatar_type || 'unknown'}`);
        });
        console.log("-------------------------\n");

        if (avatars.length === 0) {
            console.warn("⚠️ No avatars found! This explains the 'Avatar Not Found' error.");
            console.warn("👉 Make sure you created the avatar in the SAME account/workspace as this API Key.");
        }

    } catch (error) {
        console.error("❌ Failed to list avatars:", error.response?.data || error.message);
    }
}

listAvatars();
