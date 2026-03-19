import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Language names Inworld actually understands for langCode
const LANG_NAMES: Record<string, string> = {
    EN_US: 'English (US)',
    EN_GB: 'English (UK)',
    HI_IN: 'Hindi',
    ES_ES: 'Spanish',
    FR_FR: 'French',
    DE_DE: 'German',
    JA_JP: 'Japanese',
    KO_KR: 'Korean',
    PT_BR: 'Portuguese (Brazil)',
    ZH_CN: 'Chinese (Mandarin)',
    IT_IT: 'Italian',
    RU_RU: 'Russian',
    AR_SA: 'Arabic',
    NL_NL: 'Dutch',
    PL_PL: 'Polish',
};

export async function POST(req: Request) {
    try {
        const { langCode = 'EN_US' } = await req.json();

        const langName = LANG_NAMES[langCode] || 'English (US)';

        if (!process.env.GEMINI_API_KEY) {
            // Fallback text if no Gemini key
            return NextResponse.json({
                text: `Hello, I'm testing my voice for AI cloning. The weather today is perfect for recording. My name is being captured clearly and naturally. This sample helps the AI understand the full range of my vocal expressions.`,
                langCode,
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Generate a natural voice recording sample text in ${langName} (language code: ${langCode}) for voice cloning.

Requirements:
- 4-6 sentences, roughly 60-90 words total
- Use natural, conversational language (not formal or robotic)
- Include a mix of: short punchy sentences, longer flowing ones, and at least one question
- Cover different vocal patterns: statement, question, exclamation
- If the language is not English, write ENTIRELY in that language (no English)
- Do NOT add any labels, headers, or instructions — just the text to read aloud
- Make it engaging and human-sounding as if someone is actually speaking

Output ONLY the text to read, nothing else.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        return NextResponse.json({ text, langCode });
    } catch (error: any) {
        console.error('Sample text generation error:', error.message);
        return NextResponse.json(
            { error: 'Failed to generate sample text', text: 'Hello, my name is being recorded for voice cloning. This is a test of my natural speaking voice.' },
            { status: 500 }
        );
    }
}
