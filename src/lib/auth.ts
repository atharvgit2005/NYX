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
        // 30 days. Was 15 min, which logged users out aggressively
        // through the day. JWT cookie inherits this maxAge.
        maxAge: 30 * 24 * 60 * 60,
        // Refresh-rotate the JWT on each request that's at least a day
        // old, so an active user's session keeps extending without ever
        // hitting the hard expiry boundary.
        updateAge: 24 * 60 * 60,
    },
    jwt: {
        // Match the cookie / session lifetime so the signed token
        // doesn't expire before the session does.
        maxAge: 30 * 24 * 60 * 60,
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
            // Force Google to show the account picker on every sign-in.
            // Without this, signing out of NYX (which clears OUR session
            // cookie) leaves Google's own session intact, so the next
            // sign-in silently re-uses the same Google account — users
            // can't switch accounts. `prompt=select_account` makes
            // Google always render the chooser.
            authorization: {
                params: {
                    prompt: 'select_account',
                },
            },
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
                        // 30-day persistent cookie — match session.maxAge.
                        // Without this NextAuth defaults the cookie to a
                        // session-cookie (cleared on browser close), so
                        // closing the tab also signed users out.
                        maxAge: 30 * 24 * 60 * 60,
                    },
                },
            }
            : undefined,
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("AUTH_SignIn_Callback:", { userEmail: user.email, provider: account?.provider });

            // Defensive Google ↔ existing-user linking.
            //
            // `allowDangerousEmailAccountLinking: true` on the GoogleProvider
            // is supposed to auto-link Google sign-ins to an existing User row
            // that shares the same email — but it has edge cases when the
            // User row was created OUTSIDE NextAuth (e.g. by our admin-seed
            // script `prisma/setup-admin-user.ts`, or by the credentials
            // signup endpoint), because in those cases there's no Account
            // row at all and the adapter's linkAccount path can still throw
            // OAuthAccountNotLinked.
            //
            // Fix: when Google returns a verified email and we have a User
            // row already (credentials user or earlier OAuth), make sure
            // there's a matching Account row. If not, create it ourselves.
            // This is safe because we're only linking when the email matches
            // a row we already trust, and Google's `email_verified` proves
            // the caller controls the inbox.
            if (account?.provider === 'google' && user.email) {
                const verifiedEmail =
                    (profile as { email_verified?: boolean } | undefined)?.email_verified ?? true;
                if (!verifiedEmail) return true;

                try {
                    const existing = await prisma.user.findUnique({
                        where: { email: user.email },
                        include: { accounts: true },
                    });

                    if (existing) {
                        const alreadyLinked = existing.accounts.some(
                            (a) =>
                                a.provider === 'google' &&
                                a.providerAccountId === account.providerAccountId,
                        );

                        if (!alreadyLinked) {
                            await prisma.account.create({
                                data: {
                                    userId: existing.id,
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token,
                                    refresh_token: account.refresh_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    session_state:
                                        typeof account.session_state === 'string'
                                            ? account.session_state
                                            : null,
                                },
                            });
                            console.log("AUTH_Linked_Google_To_Existing_User:", {
                                userId: existing.id,
                                email: user.email,
                            });
                        }

                        // Make sure the JWT id reflects the EXISTING user row,
                        // not a freshly-created shadow row from the adapter.
                        user.id = existing.id;
                        user.role = existing.role;
                        user.passwordChangedAt = existing.passwordChangedAt;
                        user.activeSessionId = existing.activeSessionId;
                    }
                } catch (err) {
                    console.error("AUTH_GoogleLink_Error:", err);
                    // Don't block sign-in on link error — fall through and
                    // let the adapter try its own path.
                }
            }

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

            // Session Hardening: invalidate if password changed AFTER the
            // token was issued. Compare with a 5-second slop so a stale
            // millisecond on `passwordChangedAt` (set at user creation /
            // password reset) doesn't immediately kill the freshly-minted
            // token sitting in the same second.
            if (dbUser.passwordChangedAt && token.iat) {
                const tokenIssuanceMs = (token.iat as number) * 1000;
                const passwordChangedMs = dbUser.passwordChangedAt.getTime();
                if (passwordChangedMs - tokenIssuanceMs > 5_000) {
                    return null as unknown as JWT;
                }
            }

            // Concurrent Session Limiting: previously killed any older JWT
            // when the same user signed in elsewhere — but that's also what
            // bumped users out when they opened the portal in a second tab,
            // or when the dev server restarted and re-auth'd. Disabled by
            // default; keep the schema field for a future "force sign-out
            // everywhere" admin action.

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
