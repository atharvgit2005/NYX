
import { NextResponse } from 'next/server';
import { InworldService } from '@/lib/inworld';

export async function GET() {
    try {
        const voices = await InworldService.listVoices();
        return NextResponse.json({ voices });
    } catch (error: any) {
        console.error('Error fetching voices:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to fetch voices' },
            { status: 500 }
        );
    }
}
