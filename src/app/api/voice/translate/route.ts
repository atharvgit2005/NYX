import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 400 });
    }

    try {
        const { text, targetLang } = await req.json();

        if (!text || !targetLang) {
            return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
        }

        const langName = LANG_NAMES[targetLang] || targetLang;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

        const prompt = `Translate the following text into ${langName} (${targetLang}).
Rules:
- Translate accurately but keep the exact tone and conversational nuance.
- Output ONLY the translated text, no quotation marks, no headers, no explanations.

Text:
"${text}"`;

        const result = await model.generateContent(prompt);
        const translatedText = result.response.text().trim();

        if (!translatedText) throw new Error('Empty response from Gemini');

        return NextResponse.json({ text: translatedText });

    } catch (error: any) {
        console.error('Translation error:', error.message);
        return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
    }
}
