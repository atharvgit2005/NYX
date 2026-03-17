import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro",
    "gemini-pro-latest"
];

async function generateWithFallback(prompt: string): Promise<string> {
    const errors = [];
    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            errors.push(`${modelName}: ${error.message}`);
        }
    }
    throw new Error(`All models failed: ${errors.join(' | ')}`);
}

export async function POST(request: Request) {
    try {
        const { message, script, chatHistory } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                success: true,
                data: "I'm sorry, the AI service is not configured (missing API key). Please add GEMINI_API_KEY to your environment variables."
            });
        }

        // Build context-aware prompt
        const historyContext = chatHistory?.length > 0
            ? `\nPrevious conversation:\n${chatHistory.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}\n`
            : '';

        const prompt = `You are an expert short-form video script consultant embedded inside a script editor tool. Your job is to help the user improve their video script for platforms like YouTube Shorts, Instagram Reels, and TikTok.

Current script being edited:
---
${script || '(empty script)'}
---
${historyContext}
User's request: ${message}

Guidelines:
- Be concise and actionable. Keep responses under 150 words unless the user asks for a full rewrite.
- If the user asks for a rewrite, improvement, new script, or any change that produces a full or partial script, you MUST wrap the script text inside [SCRIPT_START] and [SCRIPT_END] markers. Only the spoken script goes inside these markers — not your commentary.
- Outside the markers, include a brief explanation (1-2 sentences) of what you changed and why.
- If they ask a question or feedback without requesting new script text, respond normally without the markers.
- Focus on hooks, pacing, CTAs, and engagement.
- Use a friendly, collaborative tone — like a creative partner, not a teacher.
- Do NOT use markdown formatting like ## or **. Use plain text with line breaks.
- The script inside the markers should be ready to paste directly — include [HOOK], [BODY], and [CTA] section labels.

Respond now:`;

        const response = await generateWithFallback(prompt);

        return NextResponse.json({ success: true, data: response });

    } catch (error: any) {
        console.error('[Script Chat Error]', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get AI response' },
            { status: 500 }
        );
    }
}
