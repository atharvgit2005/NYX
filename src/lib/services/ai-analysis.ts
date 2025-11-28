import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeNiche(transcript: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in .env.local");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Analyze the following Instagram profile transcript and determine the niche, tone, target audience, content pillars, and potential competitors.
      
      TRANSCRIPT:
      ${transcript}
      
      Return the result as a VALID JSON object with the following keys:
      - niche (string)
      - tone (string)
      - audience (string)
      - pillars (array of strings)
      - competitors (array of strings)

      Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        // Fallback to mock analysis if Gemini fails
        return {
            niche: "AI & Productivity",
            tone: "Professional, Encouraging, Forward-thinking",
            audience: "Solopreneurs, Content Creators, Small Business Owners",
            pillars: [
                "AI Tools & Tutorials",
                "Productivity Hacks",
                "Business Automation",
                "Future of Work"
            ],
            competitors: [
                "@mattwolfe",
                "@rowancheung",
                "@theaiadvantage"
            ]
        };
    }
}

export async function generateIdeas(niche: string, pillars: string[]) {
    if (!process.env.GEMINI_API_KEY) {
        return [
            { id: 1, title: 'Mock Idea 1', hook: 'Hook 1', angle: 'Angle 1', format: 'Format 1' },
            { id: 2, title: 'Mock Idea 2', hook: 'Hook 2', angle: 'Angle 2', format: 'Format 2' },
        ];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Generate 3 viral short-form video ideas for the niche: "${niche}" and content pillars: ${pillars.join(', ')}.
      
      For each idea, provide:
      - title
      - hook (first 3 seconds)
      - angle (e.g., Educational, Controversial)
      - format (e.g., Talking Head, Green Screen)
      
      Return the result as a VALID JSON array of objects with keys: id, title, hook, angle, format.
      Do not include markdown formatting.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const json = JSON.parse(cleanText);
        return Array.isArray(json) ? json : json.ideas || [];
    } catch (error) {
        console.error("Gemini Ideation Error:", error);
        return [];
    }
}

export async function generateScript(idea: any, tone: string) {
    if (!process.env.GEMINI_API_KEY) {
        return `[HOOK]\nMock Hook\n\n[BODY]\nMock Body\n\n[CTA]\nMock CTA`;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Write a 30-60 second short-form video script for the following idea:
      Title: ${idea.title}
      Hook: ${idea.hook}
      Angle: ${idea.angle}
      
      Tone: ${tone}
      
      Structure the script with [HOOK], [BODY], and [CTA] sections.
      Keep sentences short and punchy. Optimized for retention.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Scripting Error:", error);
        return "Failed to generate script.";
    }
}
