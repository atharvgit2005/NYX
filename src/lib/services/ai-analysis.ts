import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to get a working model with fallback
async function generateContentWithFallback(prompt: string) {
    // Extended list of models to try
    const models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-2.5-pro",
        "gemini-pro-latest"
    ];

    const errors = [];
    for (const modelName of models) {
        try {
            console.log(`[AI] Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text(); // Success!
        } catch (error: any) {
            console.warn(`[AI] Model ${modelName} failed: ${error.message}`);
            errors.push(`${modelName}: ${error.message}`);
            // Continue to next model
        }
    }
    throw new Error(`All Gemini models failed. Errors: ${errors.join(' | ')}`);
}

export async function analyzeNiche(transcript: string) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("Missing GEMINI_API_KEY");
        return getMockAnalysis();
    }

    try {
        const prompt = `
      Analyze this Instagram profile transcript:
      ${transcript}
      
      Return a VALID JSON object with:
      - niche (string)
      - tone (string)
      - audience (string)
      - pillars (array of strings)
      - competitors (array of strings)

      No markdown. Raw JSON only.
    `;

        const text = await generateContentWithFallback(prompt);
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);

    } catch (error: any) {
        console.error("Gemini Analysis Error:", error);
        return {
            ...getMockAnalysis(),
            error_details: error.message || error.toString()
        };
    }
}

function getMockAnalysis() {
    return {
        niche: "Creative Tech & AI (Fallback)",
        tone: "Innovative, Educational, Future-focused",
        audience: "Developers, Designers, Tech Enthusiasts",
        pillars: ["AI Tools", "Coding Tips", "Future Tech", "Career Growth"],
        competitors: ["@fireship_dev", "@webdevsimplified"]
    };
}

export async function generateIdeas(niche: string, pillars: string[]) {
    if (!process.env.GEMINI_API_KEY) return getMockIdeas();

    try {
        const prompt = `
      Generate 3 viral short-form video ideas for niche: "${niche}" using pillars: ${pillars.join(', ')}.
      
      Return a VALID JSON array of objects with keys: id, title, hook, angle, format.
      No markdown.
    `;

        const text = await generateContentWithFallback(prompt);
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleanText);
        return Array.isArray(json) ? json : json.ideas || [];
    } catch (error) {
        console.error("Gemini Ideation Error:", error);
        return getMockIdeas();
    }
}

function getMockIdeas() {
    return [
        { id: 1, title: 'AI Too Fast?', hook: 'Is AI moving too fast for us to keep up?', angle: 'Controversial', format: 'Talking Head' },
        { id: 2, title: 'Top 3 Coding Hacks', hook: 'Stop writing boilerplate code today.', angle: 'Educational', format: 'Screen Share' },
        { id: 3, title: 'Day in Life of Dev', hook: 'What does a Senior Dev actually do?', angle: 'Lifestyle', format: 'Vlog Style' }
    ];
}

export async function generateScript(idea: any, tone: string) {
    if (!process.env.GEMINI_API_KEY) return "Failed to generate script (Mock fallback).";

    try {
        const prompt = `
      Write a 30-60s spoken script for:
      Title: ${idea.title}
      Hook: ${idea.hook}
      Angle: ${idea.angle}
      Tone: ${tone}
      
      Structure: [HOOK], [BODY], [CTA].
      IMPORTANT: Return ONLY the exact words to be spoken. Do NOT include any stage directions, visual cues, speaker labels (like "Narrator:"), timestamps, or sound effect descriptions. Just the raw spoken text.
    `;

        return await generateContentWithFallback(prompt);
    } catch (error) {
        console.error("Gemini Scripting Error:", error);
        return `[HOOK]\n${idea.hook}\n\n[BODY]\n(Script generation failed. This is a placeholder.)\n\n[CTA]\nFollow for more!`;
    }
}
