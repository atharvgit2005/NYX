import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        // ── Admin route guard ──────────────────────────────────────────
        // Must be logged in AND be the designated admin email
        if (pathname.startsWith('/automate/admin')) {
            const adminEmail = process.env.ADMIN_EMAIL;

            // No admin email configured → block everyone
            if (!adminEmail) {
                return NextResponse.redirect(new URL('/automate/dashboard', req.url));
            }

            // Not the admin → redirect silently to dashboard (don't reveal /admin exists)
            if (token?.email !== adminEmail) {
                return NextResponse.redirect(new URL('/automate/dashboard', req.url));
            }
        }

        // ── Dashboard route guard ──────────────────────────────────────
        // Must be logged in (token check handled by withAuth's authorized callback)
        return NextResponse.next();
    },
    {
        pages: {
            signIn: '/automate/login',
        },
        callbacks: {
            authorized: ({ req, token }) => {
                // /admin and /dashboard both require authentication
                if (req.nextUrl.pathname.startsWith('/automate/admin') || req.nextUrl.pathname.startsWith('/automate/dashboard')) {
                    return token !== null;
                }
                return true;
            },
        },
    }
)

export const config = {
    matcher: ['/automate/dashboard/:path*', '/automate/admin/:path*'],
}
