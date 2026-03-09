
import { NextResponse } from 'next/server';
import { InworldService } from '@/lib/inworld';

export async function GET() {
    try {
        const voices = await InworldService.listVoices();
        return NextResponse.json({ voices });
    } catch (error) {
        console.error('Error fetching voices:', (error as any).response?.data || (error as Error).message);
        return NextResponse.json(
            { error: 'Failed to fetch voices' },
            { status: 500 }
        );
    }
}
