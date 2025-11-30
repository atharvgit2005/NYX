import axios from 'axios';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function generateVideo(script: string, avatarId: string, voiceId: string) {
    // 1. Check for API Keys
    if (!HEYGEN_API_KEY || !ELEVENLABS_API_KEY) {
        console.warn("Missing API Keys. Returning mock data.");
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate processing
        return {
            videoId: 'mock-video-id',
            status: 'completed',
            url: 'https://via.placeholder.com/1080x1920?text=Mock+Video+Generated',
        };
    }

    // 2. Generate Audio with ElevenLabs (Optional / Fallback)
    let audioUrl = null;
    try {
        if (voiceId && voiceId !== 'mock-voice') {
            console.log("Generating audio with ElevenLabs...");
            // In a real app, we would upload this audio to a storage bucket and get a URL.
            // For this MVP, we'll skip the actual ElevenLabs call if we can't handle the audio file,
            // OR we would implement the asset upload to HeyGen.
            // For now, let's just log that we would have done it.
            console.log(`[Mock] Would generate audio for voiceId: ${voiceId}`);

            // If you want to enable real ElevenLabs:
            /*
            const audioResponse = await axios.post(
                `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                { text: script, ... },
                { headers: { 'xi-api-key': ELEVENLABS_API_KEY, ... } }
            );
            // Then upload audioResponse.data to S3/Cloudinary and set audioUrl
            */
        }
    } catch (error: any) {
        console.warn("ElevenLabs generation failed (continuing with default voice):", error.response?.data || error.message);
    }

    try {
        console.log("Generating video with HeyGen...");
        console.log(`Using Avatar ID: ${avatarId}`);

        const heyGenPayload = {
            video_inputs: [
                {
                    character: {
                        type: 'avatar',
                        avatar_id: avatarId,
                        avatar_style: 'normal',
                    },
                    voice: {
                        type: 'text',
                        input_text: script,
                        // Use a valid default voice ID found in verification
                        voice_id: '2b76e0cd15dd47279b43a8bfd438b4a9',
                    },
                    background: {
                        type: 'color',
                        value: '#000000',
                    },
                },
            ],
            dimension: {
                width: 720,
                height: 1280,
            },
        };

        console.log("HeyGen Payload:", JSON.stringify(heyGenPayload, null, 2));

        const videoResponse = await axios.post(
            'https://api.heygen.com/v2/video/generate',
            heyGenPayload,
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log("HeyGen Response:", videoResponse.data);

        return {
            videoId: videoResponse.data.data.video_id,
            status: 'processing',
            url: null,
        };

    } catch (error: any) {
        console.error("HeyGen Generation Error:", JSON.stringify(error.response?.data || error.message, null, 2));
        throw new Error(`HeyGen Failed: ${error.response?.data?.message || error.message}`);
    }
}

export async function checkVideoStatus(videoId: string) {
    if (videoId === 'mock-video-id') {
        return {
            status: 'completed',
            progress: 100,
            url: 'https://via.placeholder.com/1080x1920?text=Mock+Video+Generated',
        };
    }

    if (!HEYGEN_API_KEY) {
        throw new Error("Missing API Key for status check.");
    }

    try {
        const response = await axios.get(
            `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
            {
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY,
                },
            }
        );

        const status = response.data.data.status;
        const url = response.data.data.video_url;

        return {
            status: status === 'completed' ? 'completed' : 'processing',
            progress: status === 'completed' ? 100 : 50, // Simplified progress
            url: url,
        };
    } catch (error: any) {
        console.error("Status Check Error:", error.response?.data || error.message);
        return { status: 'error', progress: 0, url: null };
    }
}
