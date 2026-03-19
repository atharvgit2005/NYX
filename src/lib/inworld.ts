
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
    modelId?: string;       // e.g. 'inworld-tts-1.5-max'
    speed?: number;         // 0.5 to 2.0
    pitch?: number;         // -20 to 20
    emotion?: string;       // e.g. 'happy', 'sad', 'excited'
    style?: string;         // e.g. 'narration', 'conversational'
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

    /**
     * List ALL voices (built-in library + custom clones).
     * Primary source: /tts/v1/voices — returns the full built-in library with
     * isCustom correctly set by Inworld for each voice.
     * If that fails, falls back to /voices/v1/voices (workspace clones only).
     */
    static async listVoices() {
        try {
            // PRIMARY: /tts/v1/voices returns the full catalog with correct isCustom flags
            const primaryUrl = `${INWORLD_API_BASE_URL}/tts/v1/voices`;
            console.log(`Fetching voices from: ${primaryUrl}`);
            const response = await axios.get(primaryUrl, {
                headers: this.getHeaders(),
            });
            console.log('Voices Response Status:', response.status);

            const rawVoices: any[] = response.data.voices || [];
            console.log(`Total voices returned: ${rawVoices.length}`);
            if (rawVoices.length > 0) {
                console.log('Sample voice item:', rawVoices[0]);
            }

            return rawVoices.map((v: any) => ({
                id: v.voiceId || v.id,
                name: v.displayName || v.name,
                gender: v.gender || 'Unknown',
                language: v.langCode || (v.languages && v.languages[0]) || 'en',
                isCustom: v.isCustom === true,   // only true if Inworld explicitly says so
            }));
        } catch (error: any) {
            console.error('Error listing voices:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * List only voices cloned in your workspace (/voices/v1/voices).
     */
    static async listClonedVoices() {
        try {
            const url = `${INWORLD_API_BASE_URL}/voices/v1/voices`;
            const response = await axios.get(url, { headers: this.getHeaders() });
            const rawVoices: any[] = response.data.voices || [];
            return rawVoices.map((v: any) => ({
                id: v.voiceId || v.id,
                name: v.displayName || v.name,
                gender: v.gender || 'Unknown',
                language: v.langCode || 'en',
                isCustom: true,
            }));
        } catch (error: any) {
            console.error('Error listing cloned voices:', error.response?.data || error.message);
            throw error;
        }
    }

    static async synthesizeSpeech(payload: TTSRequest) {
        try {
            const body: Record<string, any> = {
                text: payload.text,
                voiceId: payload.voiceId,
                modelId: payload.modelId || 'inworld-tts-1.5-max',
                audioConfig: {
                    timestampType: 'TIMESTAMP_TYPE_UNSPECIFIED',
                },
            };

            // Optional tone controls
            if (payload.speed && payload.speed !== 1.0) body.speed = payload.speed;
            if (payload.pitch && payload.pitch !== 0) body.pitch = payload.pitch;
            if (payload.emotion) body.emotion = payload.emotion;
            if (payload.style) body.style = payload.style;

            const response = await axios.post(
                `${INWORLD_API_BASE_URL}/tts/v1/voice`,
                body,
                { headers: this.getHeaders() }
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
                            audioData: payload.audioBase64
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
