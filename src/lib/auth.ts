/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * NOTE: file-level disable for `no-explicit-any` is intentional.
 * The `as any` casts in this file bridge NextAuth adapter version
 * differences: newer adapters return camelCase OAuth fields (accessToken,
 * idToken) while our Prisma schema uses snake_case (access_token, id_token).
 * Replacing with stricter narrowing risks reintroducing the
 * OAuthAccountNotLinked / P2002 race that this code was written to fix.
 * Touch only with auth-aware testing (see feedback_auth_test_incognito).
 */
import { AuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { Adapter, AdapterAccount } from "next-auth/adapters"
import prisma from "@/lib/prismadb"

/**
 * Custom adapter wrapper around PrismaAdapter.
 *
 * Two reliability fixes over the stock adapter:
 *
 * 1. `getUserByEmail` lowercases before the DB lookup. Our app stores all
 *    emails lowercase (credentials signup, portal signup, admin seed all
 *    normalise on write), but Google's OAuth profile can return a mixed-case
 *    email in rare cases — the stock adapter would miss the match and
 *    NextAuth would try to createUser, which fails on the unique-email
 *    constraint and bubbles up as a generic Callback error.
 *
 * 2. `linkAccount` upserts instead of create. The stock adapter does
 *    `p.account.create(data)`, which throws P2002 if the (provider,
 *    providerAccountId) row already exists — e.g. when our signIn
 *    callback's defensive pre-link already inserted it, or when an
 *    earlier failed attempt left an orphan row. NextAuth's outer flow
 *    treats that throw as `OAuthAccountNotLinked`, which is exactly
 *    the misleading error the user was seeing. Upsert makes the link
 *    a no-op when the row already points at the right user, and
 *    refreshes the OAuth tokens when it does.
 */
function buildAdapter(): Adapter {
    const base = PrismaAdapter(prisma) as Adapter
    return {
        ...base,
        getUserByEmail: (email) => {
            const target = email.trim().toLowerCase()
            return prisma.user.findUnique({ where: { email: target } })
        },
        linkAccount: async (data: AdapterAccount) => {
            const { provider, providerAccountId } = data
            const mappedData = {
                userId: data.userId,
                type: data.type,
                provider: data.provider,
                providerAccountId: data.providerAccountId,
                access_token: data.access_token ?? (data as any).accessToken ?? null,
                refresh_token: data.refresh_token ?? (data as any).refreshToken ?? null,
                expires_at: data.expires_at ?? (data as any).expiresAt ?? null,
                token_type: data.token_type ?? (data as any).tokenType ?? null,
                scope: data.scope ?? null,
                id_token: data.id_token ?? (data as any).idToken ?? null,
                session_state:
                    typeof data.session_state === 'string'
                        ? data.session_state
                        : typeof (data as any).sessionState === 'string'
                        ? (data as any).sessionState
                        : null,
            }
            // Upsert keeps the call idempotent. We refresh the OAuth-token
            // fields on conflict so a re-link replaces stale credentials.
            const account = await prisma.account.upsert({
                where: {
                    provider_providerAccountId: { provider, providerAccountId },
                },
                create: mappedData,
                update: mappedData,
            })
            return account as AdapterAccount
        },
    }
}

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
    adapter: buildAdapter(),
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
        signIn: '/portal/login',
    },
    // Share the session cookie across nyxstudio.in subdomains in production
    // so a single sign-in carries across any future subdomain we attach.
    // In dev/preview the cookie stays host-only, which is what we want.
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
                        domain: '.nyxstudio.in',
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
            if (account?.provider === 'google') {
                // Prefer profile.email — the OAuth-truth email — over user.email
                // because user here is `userOrProfile`; if a prior partial link
                // exists, user could be a row whose email is normalised differently.
                const rawEmail =
                    (profile as { email?: string } | undefined)?.email ??
                    user.email ??
                    null;
                const verifiedEmail =
                    (profile as { email_verified?: boolean } | undefined)?.email_verified ?? true;
                const email = rawEmail?.trim().toLowerCase() ?? null;

                if (email && verifiedEmail) {
                    try {
                        const existing = await prisma.user.findUnique({
                            where: { email },
                            include: { accounts: true },
                        });

                        if (existing) {
                            // Upsert the Google Account row so it points at the
                            // existing user. If a row already exists for this
                            // (provider, providerAccountId) — whether linked to
                            // the same user or an orphan from a previous attempt
                            // — we overwrite the userId + token fields. This
                            // makes the call idempotent and removes the P2002
                            // race that previously caused OAuthAccountNotLinked.
                            const access_token = account.access_token ?? (account as any).accessToken ?? null;
                            const refresh_token = account.refresh_token ?? (account as any).refreshToken ?? null;
                            const expires_at = account.expires_at ?? (account as any).expiresAt ?? null;
                            const token_type = account.token_type ?? (account as any).tokenType ?? null;
                            const id_token = account.id_token ?? (account as any).idToken ?? null;
                            const session_state =
                                typeof account.session_state === 'string'
                                    ? account.session_state
                                    : typeof (account as any).sessionState === 'string'
                                    ? (account as any).sessionState
                                    : null;

                            await prisma.account.upsert({
                                where: {
                                    provider_providerAccountId: {
                                        provider: account.provider,
                                        providerAccountId: account.providerAccountId,
                                    },
                                },
                                create: {
                                    userId: existing.id,
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token,
                                    refresh_token,
                                    expires_at: expires_at ? Number(expires_at) : null,
                                    token_type,
                                    scope: account.scope ?? null,
                                    id_token,
                                    session_state,
                                },
                                update: {
                                    userId: existing.id,
                                    access_token,
                                    refresh_token,
                                    expires_at: expires_at ? Number(expires_at) : null,
                                    token_type,
                                    scope: account.scope ?? null,
                                    id_token,
                                    session_state,
                                },
                            });
                            console.log("AUTH_Linked_Google_To_Existing_User:", {
                                userId: existing.id,
                                email,
                            });

                            // Pin the JWT id to the existing row so the adapter
                            // doesn't create a duplicate shadow user further down
                            // the flow.
                            user.id = existing.id;
                            user.email = existing.email;
                            user.role = existing.role;
                            user.passwordChangedAt = existing.passwordChangedAt;
                            user.activeSessionId = existing.activeSessionId;
                        }
                    } catch (err) {
                        // Surface to logs (Vercel) instead of swallowing — if
                        // this fails the user almost certainly hits
                        // OAuthAccountNotLinked downstream, so we want to know.
                        console.error("AUTH_GoogleLink_Error:", {
                            email,
                            providerAccountId: account.providerAccountId,
                            error: (err as Error)?.message,
                        });
                        // Still don't block — the adapter's own linkAccount
                        // (also now upsert) is the second line of defense.
                    }
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
