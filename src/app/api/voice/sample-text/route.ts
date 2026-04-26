import { NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/gemini';

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

// Fallback texts per language if Gemini is unavailable
const FALLBACKS: Record<string, string[]> = {
    EN_US: [
        "Hello, I'm recording a voice sample for AI cloning today. The technology is amazing — it can capture the unique character of my voice from just a short recording. I speak clearly and naturally, making sure every word is crisp. Can you hear me well? Great, let's get started!",
        "Imagine a world where your voice can scale instantly. That's why I'm here at the NYX studio today. I'm reading this script to create a high-fidelity digital twin of my vocal cords. It feels like the future is already here, and I'm excited to be a part of it.",
        "Precision is everything when it comes to cloning. I'll read this sentence followed by a brief pause. Then, I'll continue with a slightly different tone. Does my voice sound confident? I hope so, because we're about to build something incredible."
    ],
    EN_GB: [
        "Good day! I am recording a voice sample for artificial intelligence cloning. This rather fascinating technology captures the nuances of one's voice from a brief recording. I shall speak clearly and at a measured pace. Can you hear me properly? Splendid, let us begin.",
        "The weather in London might be grey, but the technology inside this studio is bright. I'm speaking clearly to ensure the AI understands my accent perfectly. It's quite a marvel to think my voice can now live on digitally."
    ],
    HI_IN: [
        "नमस्ते! मैं आज अपनी आवाज़ का एक नमूना रिकॉर्ड कर रहा हूँ। यह AI तकनीक वाकई अद्भुत है। मेरी आवाज़ को सुनकर यह सिस्टम मेरी नकल बना सकता है। मैं स्पष्ट और स्वाभाविक रूप से बोल रहा हूँ। क्या आप मुझे सुन सकते हैं? बढ़िया!",
        "आवाज की क्लोनिंग एक बिल्कुल नया अनुभव है। मैं यह सुनिश्चित करना चाहता हूँ कि मेरी बातचीत में ठहराव और स्पष्टता बनी रहे। NYX के साथ जुड़कर मुझे बहुत खुशी हो रही है।"
    ],
};

// Helper to get random fallback
const getRandomFallback = (lang: string) => {
    const list = FALLBACKS[lang] || FALLBACKS['EN_US'];
    return list[Math.floor(Math.random() * list.length)];
};

export async function POST(req: Request) {
    let langCode = 'EN_US';

    try {
        const body = await req.json();
        langCode = body.langCode || 'EN_US';
    } catch { }

    const langName = LANG_NAMES[langCode] || 'English (US)';

    // If no key, return fallback immediately
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ text: getRandomFallback(langCode), langCode, source: 'fallback (no-key)' });
    }

    try {
        const prompt = `Generate a natural voice recording sample in ${langName} (${langCode}) for AI voice cloning.
        Rules:
        - 4-6 sentences, ~60-90 words
        - Natural conversational tone
        - One question included
        - Output ONLY the text to read
        - Language: ${langName}`;

        const generatedText = await generateWithGemini(prompt, { model: 'gemini-1.5-flash' });

        return NextResponse.json({ text: generatedText, langCode, source: 'gemini' });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Sample text generation error (swapping to fallback):', errorMessage);
        return NextResponse.json({ 
            text: getRandomFallback(langCode), 
            langCode, 
            source: 'fallback',
            reason: errorMessage === 'RATE_LIMITED' ? 'rate_limit' : 'error'
        });
    }
}
