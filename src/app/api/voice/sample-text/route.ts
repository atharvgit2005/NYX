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

// Fallback texts per language if Gemini is unavailable
const FALLBACKS: Record<string, string> = {
    EN_US: "Hello, I'm recording a voice sample for AI cloning today. The technology is amazing — it can capture the unique character of my voice from just a short recording. I speak clearly and naturally, making sure every word is crisp. Can you hear me well? Great, let's get started!",
    EN_GB: "Good day! I am recording a voice sample for artificial intelligence cloning. This rather fascinating technology captures the nuances of one's voice from a brief recording. I shall speak clearly and at a measured pace. Can you hear me properly? Splendid, let us begin.",
    HI_IN: "नमस्ते! मैं आज अपनी आवाज़ का एक नमूना रिकॉर्ड कर रहा हूँ। यह AI तकनीक वाकई अद्भुत है। मेरी आवाज़ को सुनकर यह सिस्टम मेरी नकल बना सकता है। मैं स्पष्ट और स्वाभाविक रूप से बोल रहा हूँ। क्या आप मुझे सुन सकते हैं? बढ़िया!",
    ES_ES: "¡Hola! Hoy estoy grabando una muestra de voz para la clonación con inteligencia artificial. Esta tecnología es verdaderamente asombrosa, ¿no crees? Puede capturar las características únicas de mi voz con solo una grabación breve. Hablo con claridad y de forma natural.",
    FR_FR: "Bonjour ! Aujourd'hui, j'enregistre un échantillon de voix pour le clonage par intelligence artificielle. Cette technologie est vraiment fascinante, n'est-ce pas ? Elle peut capturer les nuances uniques de ma voix à partir d'un court enregistrement. Parlez-vous français ?",
    DE_DE: "Hallo! Heute nehme ich eine Sprachprobe für das KI-Klonen auf. Diese Technologie ist wirklich faszinierend, oder? Sie kann die einzigartigen Eigenschaften meiner Stimme aus einer kurzen Aufnahme erfassen. Ich spreche klar und natürlich. Können Sie mich gut hören?",
    JA_JP: "こんにちは！今日はAI音声クローニングのために音声サンプルを録音しています。この技術は本当に素晴らしいですね。短い録音から私の声の特徴を捉えることができます。はっきりと自然に話しています。聞こえていますか？",
    KO_KR: "안녕하세요! 오늘 AI 음성 클로닝을 위한 음성 샘플을 녹음하고 있습니다. 이 기술은 정말 놀랍습니다. 짧은 녹음만으로도 제 목소리의 특징을 포착할 수 있어요. 명확하고 자연스럽게 말하고 있습니다. 잘 들리시나요?",
    PT_BR: "Olá! Hoje estou gravando uma amostra de voz para clonagem com inteligência artificial. Essa tecnologia é verdadeiramente incrível, não é? Ela pode capturar as características únicas da minha voz com apenas uma gravação curta. Falo de forma clara e natural.",
    ZH_CN: "你好！今天我正在录制一段语音样本，用于人工智能语音克隆。这项技术真的很神奇，对吧？它可以从一段简短的录音中捕捉到我声音的独特特征。我说话清晰自然。你能听到我说话吗？",
    IT_IT: "Ciao! Oggi sto registrando un campione vocale per la clonazione tramite intelligenza artificiale. Questa tecnologia è davvero straordinaria, non credi? Può catturare le caratteristiche uniche della mia voce da una breve registrazione. Parlo in modo chiaro e naturale.",
    RU_RU: "Привет! Сегодня я записываю образец голоса для клонирования с помощью искусственного интеллекта. Эта технология действительно удивительная, не правда ли? Она может уловить уникальные особенности моего голоса из короткой записи. Я говорю чётко и естественно.",
    AR_SA: "مرحباً! اليوم أقوم بتسجيل عينة صوتية لاستنساخ الصوت بالذكاء الاصطناعي. هذه التقنية رائعة حقاً، أليس كذلك؟ يمكنها التقاط الخصائص الفريدة لصوتي من تسجيل قصير. أتحدث بوضوح وبشكل طبيعي. هل يمكنكم سماعي جيداً؟",
};

export async function POST(req: Request) {
    let langCode = 'EN_US';

    try {
        const body = await req.json();
        langCode = body.langCode || 'EN_US';
    } catch {
        // malformed body — use default
    }

    const langName = LANG_NAMES[langCode] || 'English (US)';

    // If no Gemini key, return fallback immediately with 200
    if (!process.env.GEMINI_API_KEY) {
        const text = FALLBACKS[langCode] || FALLBACKS['EN_US'];
        return NextResponse.json({ text, langCode, source: 'fallback' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

        const prompt = `Generate a natural voice recording sample in ${langName} (${langCode}) for AI voice cloning.

Rules:
- 4-6 sentences, ~60-90 words total
- Natural conversational tone — not formal or robotic
- Mix: short punchy sentences + one longer flowing sentence + one question
- Cover vocal patterns: statements, a question, maybe a light exclamation
- If not English, write ENTIRELY in that language (zero English words)
- Output ONLY the text to read — no labels, headers, or instructions

Output the text only.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        if (!text) throw new Error('Empty response from Gemini');

        return NextResponse.json({ text, langCode, source: 'gemini' });

    } catch (error: any) {
        console.error('Sample text generation error:', error.message);
        // Always return 200 with fallback — never 500 for this non-critical endpoint
        const text = FALLBACKS[langCode] || FALLBACKS['EN_US'];
        return NextResponse.json({ text, langCode, source: 'fallback' });
    }
}
