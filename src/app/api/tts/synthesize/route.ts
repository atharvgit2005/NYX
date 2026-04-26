import { NextResponse } from 'next/server';
import { InworldService, TTSRequest } from '@/lib/inworld';

export async function POST(req: Request) {
    try {
        const { text, voiceId, modelId, speed, pitch, emotion, style } = await req.json();

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
            speed: speed ?? 1.0,
            pitch: pitch ?? 0,
            emotion: emotion ?? '',
            style: style ?? '',
        };

        const audioContent = await InworldService.synthesizeSpeech(payload);

        return NextResponse.json({ audioContent });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to synthesize speech';
        console.error('Error synthesizing speech:', errorMessage);
        return NextResponse.json(
            { error: 'Failed to synthesize speech', details: errorMessage },
            { status: 500 }
        );
    }
}
