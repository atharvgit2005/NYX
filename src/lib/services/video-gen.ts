import axios from 'axios';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'debug_log.txt');

function logToFile(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
}

export async function generateVideo(script: string, avatarId: string, voiceId: string, apiKey?: string) {
    const HEYGEN_API_KEY = apiKey || process.env.HEYGEN_API_KEY;
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    // 1. Check for API Keys
    if (!HEYGEN_API_KEY) {
        console.warn("Missing HeyGen API Key. Returning mock data.");
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
        logToFile("Generating video with HeyGen...");
        logToFile(`Using Avatar ID: ${avatarId}`);

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
                        // Use provided voiceId or a default public voice (English Male)
                        voice_id: (voiceId && voiceId !== 'mock-voice') ? voiceId : '1bd001e7e50f421d891986aad5158bc8',
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

        logToFile(`HeyGen Payload: ${JSON.stringify(heyGenPayload, null, 2)}`);

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

        logToFile(`HeyGen Response: ${JSON.stringify(videoResponse.data)}`);

        return {
            videoId: videoResponse.data.data.video_id,
            status: 'processing',
            url: null,
        };

    } catch (error: any) {
        logToFile(`HeyGen Generation Error: ${JSON.stringify(error.response?.data || error.message, null, 2)}`);
        console.error("HeyGen Generation Error:", JSON.stringify(error.response?.data || error.message, null, 2));
        throw new Error(`HeyGen Failed: ${error.response?.data?.message || error.message}`);
    }
}

export async function checkVideoStatus(videoId: string, apiKey?: string) {
    const HEYGEN_API_KEY = apiKey || process.env.HEYGEN_API_KEY;

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

        const data = response.data.data || {};
        const status = data.status;
        const url = data.video_url || data.url; // Check both fields just in case
        const error = data.error;

        logToFile(`[HeyGen Status Check] ID: ${videoId}`);
        logToFile(`[HeyGen Response] Status: ${status}, URL: ${url}, Error: ${JSON.stringify(error)}`);
        logToFile(`[HeyGen Full Response] ${JSON.stringify(response.data, null, 2)}`);

        if (status === 'failed' || status === 'error') {
            return {
                status: 'failed',
                progress: 0,
                url: null,
                error: error || 'Video generation failed'
            };
        }

        if (status === 'completed') {
            if (!url) {
                logToFile(`[HeyGen Warning] Status is completed but URL is missing for ID: ${videoId}`);
                console.warn(`[HeyGen Warning] Status is completed but URL is missing for ID: ${videoId}`);
                // Still return completed, but maybe frontend needs to handle null URL or we retry?
                // For now, let's return it as is so we can see the log.
            }
            return {
                status: 'completed',
                progress: 100,
                url: url,
            };
        }

        return {
            status: 'processing',
            progress: 50, // We could maybe map other statuses like 'waiting' to different progress
            url: null,
        };
    } catch (error: any) {
        logToFile(`Status Check Error: ${JSON.stringify(error.response?.data || error.message)}`);
        console.error("Status Check Error:", error.response?.data || error.message);
        return { status: 'error', progress: 0, url: null, error: error.message };
    }
}
