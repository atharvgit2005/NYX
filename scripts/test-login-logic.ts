
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
    console.log("Starting Login Test...");
    try {
        const email = "testdebug@nyx.com"; // The user I created via curl
        const password = "password123";

        console.log(`Searching for user: ${email}`);
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error("❌ User not found in DB!");
            // List all users to see what's there
            const users = await prisma.user.findMany();
            console.log("Available users:", users);
            return;
        }

        console.log("✅ User found:", user.id, user.email);
        console.log("Hashed Password in DB:", user.password);

        console.log("Verifying password...");
        if (!user.password) {
            console.error("❌ User has no password set!");
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
            console.log("✅ Password match! Login logic is sound.");
        } else {
            console.error("❌ Password mismatch! Hashing issue?");
            // Try hashing the password again to see what it looks like
            const testHash = await bcrypt.hash(password, 12);
            console.log("Test Hash of input:", testHash);
        }

    } catch (e) {
        console.error("❌ Test crashed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
