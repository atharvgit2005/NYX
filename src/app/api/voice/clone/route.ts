import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const name = formData.get('name') as string || 'My Cloned Voice';
        const description = formData.get('description') as string || 'Cloned via NYX Engine';

        if (!file) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        if (!process.env.ELEVENLABS_API_KEY) {
            return NextResponse.json({ error: 'Missing ElevenLabs API Key' }, { status: 500 });
        }

        // Prepare data for ElevenLabs
        const elevenLabsData = new FormData();
        elevenLabsData.append('name', name);
        elevenLabsData.append('description', description);
        elevenLabsData.append('files', file);

        console.log('Uploading voice to ElevenLabs...');

        const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', elevenLabsData, {
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY,
                // axios automatically sets Content-Type for FormData
            },
        });

        const voiceId = response.data.voice_id;
        console.log('Voice created successfully:', voiceId);

        return NextResponse.json({
            success: true,
            voiceId: voiceId,
            message: 'Voice cloned successfully!'
        });

    } catch (error: any) {
        console.error('Voice Cloning Error:', error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data?.detail?.message || 'Failed to clone voice' },
            { status: 500 }
        );
    }
}
