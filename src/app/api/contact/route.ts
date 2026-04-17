import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, objective, message } = body;

        if (!name || !email || !objective || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const contact = await prisma.contact.create({
            data: {
                name,
                email,
                objective,
                message,
            },
        });

        return NextResponse.json({ success: true, contact }, { status: 200 });
    } catch (error) {
        console.error("Error creating contact entry:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
