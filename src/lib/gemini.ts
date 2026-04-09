import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple circuit breaker state
let isRateLimited = false;
let rateLimitResetTime = 0;

const MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
];

export async function generateWithGemini(prompt: string, options: { model?: string } = {}) {
    // Check if we are currently in a rate-limit cooldown
    if (isRateLimited && Date.now() < rateLimitResetTime) {
        console.warn('[Gemini Sync] Circuit breaker active. Skipping API call to preserve quota.');
        throw new Error('RATE_LIMITED_COOLDOWN');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    
    // Try models in order of preference
    const modelsToTry = options.model ? [options.model, ...MODELS.filter(m => m !== options.model)] : MODELS;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            
            // Success! Reset rate limit state
            isRateLimited = false;
            return text;
        } catch (error: any) {
            const errorMsg = error.message || '';
            
            // Check for 429 (Too many requests)
            if (errorMsg.includes('429') || errorMsg.includes('quota')) {
                console.error(`[Gemini Sync] Model ${modelName} hit rate limit (429).`);
                isRateLimited = true;
                rateLimitResetTime = Date.now() + 60000; // 60s cooldown
                throw new Error('RATE_LIMITED');
            }

            console.warn(`[Gemini Sync] Model ${modelName} failed: ${errorMsg}`);
            // Continue to next model if it's not a rate limit issue
        }
    }

    throw new Error('All models failed or context exceeded.');
}
