import { NextResponse } from 'next/server';
import { InworldService, TTSRequest } from '@/lib/inworld';

export async function POST(req: Request) {
    try {
        const { text, voiceId, modelId, audioConfig } = await req.json();

        if (!text || !voiceId) {
            return NextResponse.json(
                { error: 'Missing required fields: text, voiceId' },
                { status: 400 }
            );
        }

        const payload: TTSRequest = {
            text,
            voiceId,
            modelId: modelId || 'inworld-tts-1.5-max',
            // The Service handles audioConfig internally for now, or we can update service
        };

        const audioContent = await InworldService.synthesizeSpeech(payload);

        return NextResponse.json({ audioContent });
    } catch (error: any) {
        console.error('Error synthesizing speech:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to synthesize speech', details: error.response?.data },
            { status: 500 }
        );
    }
}
