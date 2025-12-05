import fs from 'fs';
import path from 'path';
import { generateVideo, checkVideoStatus } from '../src/lib/services/video-gen';

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

async function testVideoFlow() {
    console.log("🚀 Starting Video Flow Test...");

    const SCRIPT = "This is a test video to verify the rendering status.";
    // Use the known valid Avatar ID from previous verification
    const AVATAR_ID = "2383be497820408080b5ce5efd5e11ea";
    // Use the known valid Voice ID
    const VOICE_ID = "2b76e0cd15dd47279b43a8bfd438b4a9";

    try {
        console.log("1. Generating Video...");
        const genResult = await generateVideo(SCRIPT, AVATAR_ID, VOICE_ID);
        console.log("Generation Result:", genResult);

        if (!genResult.videoId) {
            console.error("❌ Failed to get video ID");
            return;
        }

        const videoId = genResult.videoId;
        console.log(`\n2. Polling Status for Video ID: ${videoId}`);

        let attempts = 0;
        const maxAttempts = 30; // 5 minutes (10s interval)

        const poll = setInterval(async () => {
            attempts++;
            process.stdout.write(`\rAttempt ${attempts}/${maxAttempts}... `);

            try {
                const statusResult = await checkVideoStatus(videoId);
                console.log(`Status: ${statusResult.status} | Progress: ${statusResult.progress}%`);

                if (statusResult.status === 'completed') {
                    console.log("\n✅ Video Generation Completed!");
                    console.log("Video URL:", statusResult.url);
                    clearInterval(poll);
                } else if (statusResult.status === 'failed' || statusResult.status === 'error') {
                    console.log("\n❌ Video Generation Failed!");
                    console.log("Result:", statusResult);
                    clearInterval(poll);
                } else if (attempts >= maxAttempts) {
                    console.log("\n⚠️ Timed out waiting for video.");
                    clearInterval(poll);
                }
            } catch (err) {
                console.error("\nError checking status:", err);
            }
        }, 10000); // Check every 10 seconds

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
    }
}

testVideoFlow();
