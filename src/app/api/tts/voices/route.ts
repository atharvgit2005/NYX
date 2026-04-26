
import { NextResponse } from 'next/server';
import { InworldService } from '@/lib/inworld';

export async function GET() {
    try {
        const voices = await InworldService.listVoices();
        return NextResponse.json({ voices });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching voices:', errorMessage);
        return NextResponse.json(
            { error: 'Failed to fetch voices' },
            { status: 500 }
        );
    }
}
