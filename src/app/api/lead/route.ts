import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const lead = await prisma.lead.create({
            data: {
                email,
            },
        });

        return NextResponse.json({ success: true, lead }, { status: 200 });
    } catch (error) {
        console.error("Error creating lead entry:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
