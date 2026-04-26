import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prismadb';

function adminOnly(email?: string | null) {
    return email === process.env.ADMIN_EMAIL;
}

// GET /api/admin/subscriptions
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const subscriptions = await prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } }
        }
    });

    return NextResponse.json({ subscriptions });
}

// POST /api/admin/subscriptions — create a subscription for a user
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, tier, renewalDate, features } = body;

    const sub = await prisma.subscription.upsert({
        where: { userId },
        create: {
            userId,
            tier: tier || 'Free',
            status: 'pending',
            paymentStatus: 'pending',
            features: features || { voice: false, video: false, api: false, priority: false },
            renewalDate: new Date(renewalDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        update: {
            tier,
            features,
            renewalDate: new Date(renewalDate),
        }
    });

    return NextResponse.json({ subscription: sub });
}

// PATCH /api/admin/subscriptions — update status, paymentStatus, tier, etc.
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session?.user?.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { subscriptionId, patch } = await req.json();

    const updated = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
            ...patch,
            updatedAt: new Date(),
        }
    });

    return NextResponse.json({ subscription: updated });
}
