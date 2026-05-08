import { AuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
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
            role?: string | null;
        }
    }

    interface User {
        id: string;
        role?: string | null;
        passwordChangedAt?: Date | null;
        activeSessionId?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role?: string | null;
        passwordChangedAt?: Date | null;
        activeSessionId?: string | null;
    }
}

export const authOptions: AuthOptions = {
    debug: true,
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        maxAge: 15 * 60, // 15 minutes
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

                // Normalise email — DB stores lowercase; without this the
                // user typing "Adminnyx@gmail.com" fails the unique lookup
                // and gets "Invalid credentials" even when the password
                // is right.
                const email = credentials.email.trim().toLowerCase();
                const ip = req?.headers?.['x-forwarded-for'] || 'unknown';

                // Brute-force protection: check rate limit (5 attempts per 15 min per IP)
                const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
                const attempts = await prisma.loginAttempt.findUnique({
                    where: { ip_email: { ip: String(ip), email } }
                });

                if (attempts && attempts.count >= 5 && attempts.lastAttempt > fifteenMinsAgo) {
                    throw new Error('Too many attempts. Please try again later.');
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email }
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
                            where: { ip_email: { ip: String(ip), email } },
                            update: { count: { increment: 1 }, lastAttempt: new Date() },
                            create: { ip: String(ip), email, count: 1 }
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
                        where: { ip: String(ip), email }
                    });

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        passwordChangedAt: user.passwordChangedAt,
                        activeSessionId: user.activeSessionId
                    };
                } catch (error: unknown) {
                    console.error("AUTH_Authorize_CRASH:", (error as Error).message);
                    throw error;
                }
            }
        })
    ],
    pages: {
        // Default sign-in page for NextAuth-driven redirects (e.g.
        // /api/auth/signin direct hits, error-fallback, signOut without
        // callbackUrl). We default to /portal/login because:
        //   • most signed-out www visitors are brand partners,
        //   • /portal/login is NOT subject to the /automate/* → subdomain
        //     redirect, so the user stays on the host they came from,
        //   • Operator (Automate) users still reach /automate/login via
        //     the explicit "Operator Login" link in the landing nav.
        signIn: '/portal/login',
    },
    // Share the session cookie across nyxstudio.tech subdomains in production
    // (so signing in on www.nyxstudio.tech keeps you signed in on
    // automate.nyxstudio.tech and vice versa). In dev/preview the cookie
    // stays host-only, which is what we want.
    cookies:
        process.env.NODE_ENV === 'production'
            ? {
                sessionToken: {
                    name: '__Secure-next-auth.session-token',
                    options: {
                        httpOnly: true,
                        sameSite: 'lax',
                        path: '/',
                        secure: true,
                        domain: '.nyxstudio.tech',
                    },
                },
            }
            : undefined,
    callbacks: {
        async signIn({ user, account }) {
            console.log("AUTH_SignIn_Callback:", { userEmail: user.email, provider: account?.provider });
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.image;
                token.role = user.role;
                token.passwordChangedAt = user.passwordChangedAt;
                token.activeSessionId = user.activeSessionId;
            }

            // Session Hardening: Check if token is blacklisted.
            // `jti` is undefined on first login (NextAuth hasn't issued the
            // JWT yet), so skip the lookup for the initial sign-in pass.
            if (token.jti) {
                const isBlacklisted = await prisma.revokedToken.findUnique({
                    where: { token: token.jti as string }
                });
                if (isBlacklisted) return null as unknown as JWT;
            }

            // Session Hardening: Invalidate if password changed after token issuance.
            // Skip when token has no id yet (e.g. mid-OAuth callback before user is hydrated).
            if (!token.id) return token;

            const dbUser = await prisma.user.findUnique({
                where: { id: token.id as string },
                select: { passwordChangedAt: true, activeSessionId: true, role: true }
            });

            if (!dbUser) return null as unknown as JWT;

            if (dbUser.passwordChangedAt && token.iat) {
                const tokenIssuanceTime = new Date((token.iat as number) * 1000);
                if (dbUser.passwordChangedAt > tokenIssuanceTime) {
                    return null as unknown as JWT;
                }
            }

            // Concurrent Session Limiting: enforced only for credentials-based
            // logins where authorize() has populated activeSessionId on both
            // the User row and the JWT. Google OAuth users never set this
            // field, so skip the check for them.
            if (
                dbUser.role !== 'admin' &&
                dbUser.activeSessionId &&
                token.activeSessionId &&
                dbUser.activeSessionId !== token.activeSessionId
            ) {
                return null as unknown as JWT;
            }

            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
                session.user.role = token.role;
            }
            return session;
        },
    },
    events: {
        async signOut({ token }) {
            if (token.jti) {
                await prisma.revokedToken.create({
                    data: {
                        token: token.jti as string,
                        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // Match maxAge
                    }
                });
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretmockkey",
}
