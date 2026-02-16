
import { NextResponse } from 'next/server';
import { InworldService, CloneVoiceRequest } from '@/lib/inworld';

export async function POST(req: Request) {
    try {
        // Since we are uploading a file (likely multipart/form-data), we need to read it.
        // Wait, the client sends FormData. Let's parse it.
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const displayName = formData.get('name') as string || 'My Cloned Voice';

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

        const payload: CloneVoiceRequest = {
            displayName,
            langCode: 'EN_US', // Default for now
            audioBase64: base64Audio,
            description: `Cloned from uploaded file: ${file.name}`,
            tags: ['custom-clone']
        };

        const result = await InworldService.cloneVoice(payload);

        // The response contains the voice object: { voice: { voiceId: '...', ... } } (or top level depending on service)
        // InworldService returns response.data directly.
        // API documentation says: { voice: { ... } }

        const clonedVoice = result.voice;

        return NextResponse.json({
            success: true,
            voiceId: clonedVoice.voiceId,
            voice: clonedVoice
        });

    } catch (error: any) {
        console.error('Error cloning voice:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to clone voice', details: error.response?.data },
            { status: 500 }
        );
    }
}
