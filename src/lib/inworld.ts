
import axios from 'axios';

const INWORLD_API_BASE_URL = 'https://api.inworld.ai';

// Types based on Inworld Docs
export interface InworldVoice {
    id: string; // This could be voiceId from the new API
    name: string; // displayName
    gender: string;
    language: string; // langCode
    isCustom: boolean;
    voiceId?: string; // New field from v1 API
    displayName?: string; // New field from v1 API
    langCode?: string; // New field from v1 API
}

export interface TTSRequest {
    text: string;
    voiceId: string;
    modelId?: string; // e.g. 'inworld-tts-1.5-max'
    speed?: number; // 0.5 to 2.0
    pitch?: number; // -20 to 20
}

export interface CloneVoiceRequest {
    displayName: string;
    langCode: string; // e.g., 'EN_US'
    audioBase64: string; // Base64 encoded audio
    description?: string;
    tags?: string[];
}

export class InworldService {
    private static getHeaders() {
        const apiKey = process.env.INWORLD_API_KEY;
        if (!apiKey) {
            throw new Error('INWORLD_API_KEY is not defined in environment variables');
        }
        return {
            'Authorization': `Basic ${apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    static async listVoices() {
        try {
            console.log('Attempting to list voices from Inworld...');
            // First, try the new v1 endpoint: GET /voices/v1/voices
            // Why? The user specifically provided docs for it and it's less deprecated.
            try {
                const v1Url = `${INWORLD_API_BASE_URL}/voices/v1/voices`;
                console.log(`Fetching v1 voices from: ${v1Url}`);
                const response = await axios.get(v1Url, {
                    headers: this.getHeaders(),
                });
                console.log('v1 Voices Response Status:', response.status);
                console.log('v1 Voices Data (first 2 items):', response.data.voices?.slice(0, 2));
                // Map v1 response structure to our common interface if needed, or just return as is
                // v1 response: { voices: [{ voiceId, displayName, langCode, ... }] }
                return response.data.voices.map((v: any) => ({
                    id: v.voiceId,
                    name: v.displayName,
                    gender: 'Unknown', // v1 doesn't seem to return gender explicitly in the basic list
                    language: v.langCode,
                    isCustom: true // Assumed since it's from the workspace endpoint usually
                }));
            } catch (v1Error: any) {
                console.warn('Failed to fetch from v1/voices, falling back to tts/v1/voices', v1Error.message);
                // Fallback to the old endpoint if v1 fails (maybe permissions or different plan)
                const fallbackUrl = `${INWORLD_API_BASE_URL}/tts/v1/voices`;
                console.log(`Fetching fallback voices from: ${fallbackUrl}`);
                const response = await axios.get(fallbackUrl, {
                    headers: this.getHeaders(),
                });
                console.log('Fallback Voices Response Status:', response.status);
                console.log('Fallback Voices Data keys:', Object.keys(response.data));
                if (response.data.voices && response.data.voices.length > 0) {
                    console.log('Fallback Voice Item sample:', response.data.voices[0]);
                }

                // Map fallback response (which returns voiceId, displayName, languages=[])
                return response.data.voices.map((v: any) => ({
                    id: v.voiceId,
                    name: v.displayName,
                    gender: 'Unknown',
                    // Fallback might have 'languages' array instead of 'langCode'
                    language: v.langCode || (v.languages && v.languages[0]) || 'en',
                    isCustom: v.isCustom || false
                }));
            }
        } catch (error: any) {
            console.error('Error listing voices:', error.response?.data || error.message);
            throw error;
        }
    }

    static async synthesizeSpeech(payload: TTSRequest) {
        try {
            const response = await axios.post(
                `${INWORLD_API_BASE_URL}/tts/v1/voice`,
                {
                    text: payload.text,
                    voiceId: payload.voiceId,
                    modelId: payload.modelId || 'inworld-tts-1.5-max',
                    audioConfig: {
                        timestampType: "TIMESTAMP_TYPE_UNSPECIFIED"
                    }
                },
                {
                    headers: this.getHeaders(),
                }
            );

            return response.data.audioContent;
        } catch (error: any) {
            console.error('Error synthesizing speech:', error.response?.data || error.message);
            throw error;
        }
    }

    static async cloneVoice(payload: CloneVoiceRequest) {
        try {
            // POST /voices/v1/voices:clone
            // Body: { displayName, langCode, voiceSamples: [{ content: base64 }] }
            // Note: The docs say "voiceSamples" is object[], child attributes hidden in provided text.
            // Standard Google/Inworld pattern for audio bytes is usually "content" or "audioContent".
            // Let's try sending "content" with the base64 string.

            const response = await axios.post(
                `${INWORLD_API_BASE_URL}/voices/v1/voices:clone`,
                {
                    displayName: payload.displayName,
                    langCode: payload.langCode || 'EN_US',
                    description: payload.description || 'Cloned voice via NYX',
                    tags: payload.tags || ['custom'],
                    voiceSamples: [
                        {
                            content: payload.audioBase64
                            // If this fails, we might need to check if it expects a filename too?
                            // Or maybe the field is `audioData`? But usually `content` for input.
                        }
                    ]
                },
                {
                    headers: this.getHeaders(),
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Error cloning voice:', error.response?.data || error.message);
            throw error;
        }
    }

    static async deleteVoice(voiceId: string) {
        try {
            // DELETE /voices/v1/voices/{voiceId}
            await axios.delete(`${INWORLD_API_BASE_URL}/voices/v1/voices/${voiceId}`, {
                headers: this.getHeaders(),
            });
            return true;
        } catch (error: any) {
            console.error('Error deleting voice:', error.response?.data || error.message);
            throw error;
        }
    }
}
