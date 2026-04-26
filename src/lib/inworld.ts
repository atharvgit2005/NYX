


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
            console.log(`[Inworld] Fetching voices from: ${primaryUrl}`);

            // Using native fetch for better TLS/socket handling in modern Node.js
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

            const response = await fetch(primaryUrl, {
                method: 'GET',
                headers: {
                    ...this.getHeaders(),
                    'User-Agent': 'NYX-AI-Automation-Platform', // Some APIs require this
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Inworld API error: ${response.status} ${errorText}`);
            }

            const data = await response.json() as { voices?: Record<string, unknown>[] };
            const rawVoices = data.voices || [];
            console.log(`[Inworld] Total voices returned: ${rawVoices.length}`);

            return rawVoices.map((v) => ({
                id: (v.voiceId || v.id) as string,
                name: (v.displayName || v.name) as string,
                gender: (v.gender || 'Unknown') as string,
                language: (v.langCode || (v.languages && (v.languages as string[])[0]) || 'en') as string,
                isCustom: v.isCustom === true,   // only true if Inworld explicitly says so
            }));
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.error('[Inworld] listVoices timed out after 20s');
                throw new Error('Connection to Inworld API timed out. Please check your network or try again.');
            }
            console.error('[Inworld] Error listing voices:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    /**
     * List only voices cloned in your workspace (/voices/v1/voices).
     */
    static async listClonedVoices() {
        try {
            const url = `${INWORLD_API_BASE_URL}/voices/v1/voices`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Inworld API error: ${response.status} ${errorText}`);
            }

            const data = await response.json() as { voices?: Record<string, unknown>[] };
            const rawVoices = data.voices || [];
            return rawVoices.map((v) => ({
                id: (v.voiceId || v.id) as string,
                name: (v.displayName || v.name) as string,
                gender: (v.gender || 'Unknown') as string,
                language: (v.langCode || 'en') as string,
                isCustom: true,
            }));
        } catch (error: unknown) {
            console.error('Error listing cloned voices:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    static async synthesizeSpeech(payload: TTSRequest) {
        try {
            const body: Record<string, unknown> = {
                text: payload.text,
                voiceId: payload.voiceId,
                modelId: payload.modelId || 'inworld-tts-1.5-max',
                audioConfig: {
                    timestampType: 'TIMESTAMP_TYPE_UNSPECIFIED',
                    speakingRate: payload.speed || 1.0,  
                    pitch: payload.pitch || 0
                }
            };

            if (payload.emotion) body.emotion = payload.emotion;
            if (payload.style) body.style = payload.style;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const response = await fetch(`${INWORLD_API_BASE_URL}/tts/v1/voice`, {
                method: 'POST',
                headers: {
                    ...this.getHeaders(),
                    'User-Agent': 'NYX-AI-Automation-Platform',
                },
                body: JSON.stringify(body),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Inworld synthesis failed: ${response.status} ${errorText}`);
            }

            const data = await response.json() as { audioContent: string };
            return data.audioContent;
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.error('[Inworld] synthesizeSpeech timed out');
                throw new Error('Synthesis timed out. The text might be too long or the server is busy.');
            }
            console.error('[Inworld] Error synthesizing speech:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    static async cloneVoice(payload: CloneVoiceRequest) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 mins timeout - cloning is intensive

            const response = await fetch(`${INWORLD_API_BASE_URL}/voices/v1/voices:clone`, {
                method: 'POST',
                headers: {
                    ...this.getHeaders(),
                    'User-Agent': 'NYX-AI-Automation-Platform',
                },
                body: JSON.stringify({
                    displayName: payload.displayName,
                    langCode: payload.langCode || 'EN_US',
                    description: payload.description || 'Cloned voice via NYX',
                    tags: payload.tags || ['custom'],
                    voiceSamples: [
                        {
                            audioData: payload.audioBase64
                        }
                    ]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Inworld cloning failed: ${response.status} ${errorText}`);
            }

            return await response.json();
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.error('[Inworld] cloneVoice timed out after 300s');
                throw new Error('Cloning process timed out. This often happens if the audio file is large or complex. Try a shorter sample.');
            }
            console.error('[Inworld] Error cloning voice:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    static async deleteVoice(voiceId: string) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(`${INWORLD_API_BASE_URL}/voices/v1/voices/${voiceId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) return false;
            return true;
        } catch (error: unknown) {
            console.error('[Inworld] Error deleting voice:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
}
