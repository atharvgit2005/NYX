import { generateWithGemini } from '@/lib/gemini';

/**
 * Analyses a social profile transcript and returns niche/tone/audience
 * insights. Throws on any failure (missing key, model error, malformed
 * AI response) so the calling route can return a real error to the UI
 * instead of silently surfacing the hard-coded "Creative Tech & AI
 * (Fallback)" object that the user mistakes for a real analysis.
 */
export async function analyzeNiche(transcript: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is not configured. Set it in the environment to enable AI brand analysis.",
        );
    }

    const prompt = `
      Analyze this social media profile transcript:
      ${transcript}

      Return a VALID JSON object with exactly these keys:
      - niche (string)
      - tone (string)
      - audience (string)
      - pillars (array of strings)
      - competitors (array of strings)

      IMPORTANT: Return ONLY the JSON object. Do not include any introductory remarks, markdown code blocks, or conclusions. Raw JSON only.
    `;

    let text: string;
    try {
        text = await generateWithGemini(prompt);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("Gemini Analysis Error (model call):", msg);
        // Re-throw with a stable, user-readable message. Differentiate
        // the two common cases so /api/analyze can render them cleanly.
        if (msg.includes('RATE_LIMITED') || msg.toLowerCase().includes('quota')) {
            throw new Error(
                "Gemini is rate-limiting requests right now. Try again in 30-60 seconds.",
            );
        }
        throw new Error(`AI analysis failed: ${msg}`);
    }

    // Robust extraction of JSON object string
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error("Gemini Analysis Error (no JSON):", text.slice(0, 200));
        throw new Error("AI returned an unparseable response. Please retry.");
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch {
        console.error("Gemini Analysis Error (JSON parse):", jsonMatch[0].slice(0, 200));
        throw new Error("AI returned malformed JSON. Please retry.");
    }
}

export async function generateIdeas(niche: string, pillars: string[]) {
    if (!process.env.GEMINI_API_KEY) return getMockIdeas();

    try {
        const prompt = `
      Generate 3 viral short-form video ideas for niche: "${niche}" using pillars: ${pillars.join(', ')}.
      
      Return a VALID JSON array of objects with keys: id, title, hook, angle, format.
      No markdown.
    `;

        const text = await generateWithGemini(prompt);
        
        // Robust extraction of JSON content (likely a [ ... ] array or { ... } object)
        const jsonMatch = text.match(/[\{\[][\s\S]*[\}\]]/);
        if (!jsonMatch) throw new Error("No JSON structure found");
        
        const json = JSON.parse(jsonMatch[0]);
        return Array.isArray(json) ? json : json.ideas || [];
    } catch {
        console.error("Gemini Ideation Error");
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

export async function generateScript(idea: { title: string; hook: string; angle: string }, tone: string) {
    if (!process.env.GEMINI_API_KEY) return "Failed to generate script (Mock fallback).";

    try {
        const prompt = `
      Write a 30-60s spoken script for:
      Title: ${idea.title}
      Hook: ${idea.hook}
      Angle: ${idea.angle}
      Tone: ${tone}
      
      IMPORTANT: Return ONLY the exact words to be spoken. Do NOT include any section labels (like [HOOK] or [BODY]), stage directions, visual cues, speaker labels (like "Narrator:"), timestamps, or sound effect descriptions. Just the raw spoken text.
    `;

        return await generateWithGemini(prompt);
    } catch {
        console.error("Gemini Scripting Error");
        return `[HOOK]\n${idea.hook}\n\n[BODY]\n(Script generation failed. This is a placeholder.)\n\n[CTA]\nFollow for more!`;
    }
}
