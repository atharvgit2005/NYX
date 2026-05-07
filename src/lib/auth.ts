import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prismadb"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }

    interface User {
        id: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
    }
}

export const authOptions: AuthOptions = {
    debug: true,
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        maxAge: 15 * 60, // 15 minutes
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'strict',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const ip = req?.headers?.['x-forwarded-for'] || 'unknown';

                // Brute-force protection: check rate limit (5 attempts per 15 min per IP)
                const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
                const attempts = await prisma.loginAttempt.findUnique({
                    where: { ip_email: { ip: String(ip), email: credentials.email } }
                });

                if (attempts && attempts.count >= 5 && attempts.lastAttempt > fifteenMinsAgo) {
                    throw new Error('Too many attempts. Please try again later.');
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    });

                    if (!user || !user.password) {
                        throw new Error('Invalid credentials');
                    }

                    // Account locking
                    if (user.lockUntil && user.lockUntil > new Date()) {
                        throw new Error('Account is locked. Please check your email or try again later.');
                    }

                    const isCorrectPassword = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isCorrectPassword) {
                        // Exponential backoff and failed attempts tracking
                        const newFailedAttempts = user.failedAttempts + 1;
                        let lockUntil = null;
                        
                        if (newFailedAttempts >= 10) {
                            lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Lock for 24 hours
                            // TODO: Send unlock email
                        }

                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                failedAttempts: newFailedAttempts,
                                lockUntil
                            }
                        });

                        // Log attempt
                        await prisma.loginAttempt.upsert({
                            where: { ip_email: { ip: String(ip), email: credentials.email } },
                            update: { count: { increment: 1 }, lastAttempt: new Date() },
                            create: { ip: String(ip), email: credentials.email, count: 1 }
                        });

                        // Exponential backoff simulation (delay response)
                        if (newFailedAttempts >= 3) {
                            const delay = Math.pow(2, newFailedAttempts - 3) * 1000;
                            await new Promise(resolve => setTimeout(resolve, Math.min(delay, 10000)));
                        }

                        throw new Error('Invalid credentials');
                    }

                    // Reset failed attempts on success
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { 
                            failedAttempts: 0, 
                            lockUntil: null,
                            activeSessionId: Math.random().toString(36).substring(2) // Generate new session ID
                        }
                    });

                    // Clear login attempts
                    await prisma.loginAttempt.deleteMany({
                        where: { ip: String(ip), email: credentials.email }
                    });

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        passwordChangedAt: user.passwordChangedAt,
                        activeSessionId: user.activeSessionId
                    } as any;
                } catch (error: any) {
                    console.error("AUTH_Authorize_CRASH:", error.message);
                    throw error;
                }
            }
        })
    ],
    pages: {
        signIn: '/automate/login',
    },
    callbacks: {
        async signIn({ user, account }) {
            console.log("AUTH_SignIn_Callback:", { userEmail: user.email, provider: account?.provider });
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.image;
                token.role = (user as any).role;
                token.passwordChangedAt = (user as any).passwordChangedAt;
                token.activeSessionId = (user as any).activeSessionId;
            }

            // Session Hardening: Check if token is blacklisted
            const isBlacklisted = await prisma.revokedToken.findUnique({
                where: { token: token.jti as string }
            });
            if (isBlacklisted) return null as any;

            // Session Hardening: Invalidate if password changed after token issuance
            const dbUser = await prisma.user.findUnique({
                where: { id: token.id as string },
                select: { passwordChangedAt: true, activeSessionId: true, role: true }
            });

            if (!dbUser) return null as any;

            if (dbUser.passwordChangedAt && token.iat) {
                const tokenIssuanceTime = new Date(token.iat * 1000);
                if (dbUser.passwordChangedAt > tokenIssuanceTime) {
                    return null as any;
                }
            }

            // Concurrent Session Limiting: 1 active session per user unless admin
            if (dbUser.role !== 'admin' && dbUser.activeSessionId !== token.activeSessionId) {
                return null as any;
            }

            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    events: {
        async signOut({ token }) {
            if (token.jti) {
                await prisma.revokedToken.create({
                    data: {
                        token: token.jti,
                        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // Match maxAge
                    }
                });
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretmockkey",
}
