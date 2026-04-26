
import { NextResponse } from 'next/server';
import { InworldService, CloneVoiceRequest } from '@/lib/inworld';

export async function POST(req: Request) {
    try {
        // Since we are uploading a file (likely multipart/form-data), we need to read it.
        // Wait, the client sends FormData. Let's parse it.
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const displayName = formData.get('name') as string || 'My Cloned Voice';
        const langCode = formData.get('langCode') as string || 'EN_US';

        if (!file) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Read file content as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        // Convert to Base64 string
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString('base64');
        console.log(`[route.ts] Received file: ${file.name}, Byte length: ${arrayBuffer.byteLength}, Base64 length: ${base64Audio.length}`);

        const payload: CloneVoiceRequest = {
            displayName,
            langCode, 
            audioBase64: base64Audio,
            description: `Cloned from uploaded file: ${file.name}`,
            tags: ['custom-clone']
        };

        const result = await InworldService.cloneVoice(payload);

        // The response might be { voice: { ... } } or just { ... }
        const clonedVoice = result.voice || result;
        const voiceId = clonedVoice.voiceId || clonedVoice.id;

        return NextResponse.json({
            success: true,
            voiceId: voiceId,
            voice: clonedVoice
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to clone voice';
        console.error('Error cloning voice:', errorMessage);
        
        let statusCode = 500;
        if (errorMessage.includes('400')) {
            statusCode = 400;
        } else if (errorMessage.includes('401')) {
            statusCode = 401;
        } else if (errorMessage.includes('429')) {
            statusCode = 429;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
