import { NextResponse } from 'next/server';

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
        const { text, targetLang } = await req.json();

        if (!text || !targetLang) {
            return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
        }

        // Convert targetLang like "ES_ES" or "HI_IN" into just "es" or "hi" for Google Translate
        const tl = targetLang.split('_')[0].toLowerCase();
        
        // Free Google Translate unofficial web endpoint
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
        
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Google Translate HTTP error ${res.status}`);
        }
        
        const data = await res.json();
        
        // The API returns an array where data[0] is an array of segments: [["translated text segment 1", "original text"], ["segment 2", "original 2"], ...]
        let translatedText = '';
        if (data && data[0] && Array.isArray(data[0])) {
            for (const segment of data[0]) {
                if (segment[0]) translatedText += segment[0];
            }
        }
        
        if (!translatedText) throw new Error('Empty response from Google Translate');

        return NextResponse.json({ text: translatedText.trim() });

    } catch (error: any) {
        console.error('Translation error:', error.message);
        return NextResponse.json({ error: error.message || 'Failed to translate' }, { status: 500 });
    }
}
