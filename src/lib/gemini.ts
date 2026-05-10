import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple circuit breaker state
let isRateLimited = false;
let rateLimitResetTime = 0;

// Model rotation: tried in order, falling through on per-model failures.
// As of May 2026 the gemini-1.5 family is sunset and the 2.0 line is on
// the deprecation path - keep the 2.5 family at the top so live traffic
// hits supported models first. The 2.0 entries remain as a soft fallback
// in case a specific 2.5 model is regional-rate-limited.
const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
];

export async function generateWithGemini(prompt: string, options: { model?: string } = {}) {
    // Check if we are currently in a rate-limit cooldown
    if (isRateLimited && Date.now() < rateLimitResetTime) {
        const remaining = Math.round((rateLimitResetTime - Date.now()) / 1000);
        console.warn(`[Gemini Sync] Circuit breaker active. Cooldown: ${remaining}s remaining.`);
        throw new Error('RATE_LIMITED_COOLDOWN');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    
    // Try models in order of preference
    const modelsToTry = options.model ? [options.model, ...MODELS.filter(m => m !== options.model)] : MODELS;

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[Gemini Sync] Attempting generation with ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            // Set a timeout or use a more resilient call
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            
            if (!text) throw new Error("Empty response from model");

            // Success! Reset rate limit state
            isRateLimited = false;
            return text;
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : '';
            const isQuotaError = errorMsg.includes('429') || 
                               errorMsg.toLowerCase().includes('quota') || 
                               errorMsg.toLowerCase().includes('rate limit');

            if (isQuotaError) {
                console.error(`[Gemini Sync] Model ${modelName} hit rate limit (429).`);
                isRateLimited = true;
                rateLimitResetTime = Date.now() + 30000; // Reduced to 30s for better UX
                throw new Error('RATE_LIMITED');
            }

            console.warn(`[Gemini Sync] Model ${modelName} failed: ${errorMsg}`);
            lastError = error instanceof Error ? error : new Error(String(error));
            // Continue to next model
        }
    }

    throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}
