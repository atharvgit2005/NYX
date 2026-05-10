import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

// Hand-rolled middleware (replaces `withAuth`) so that /portal/* and
// /automate/* can route unauthenticated users to *different* sign-in pages.
//
// Why this matters: when /portal sent users to /automate/login, the
// next.config.ts `/automate/*` redirect bounced them onto
// automate.nyxstudio.tech — wrong subdomain for portal traffic.
export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = await getToken({ req });

    // ── /portal/* (excluding the public auth pages) ────────────────
    if (
        pathname.startsWith('/portal') &&
        !pathname.startsWith('/portal/login') &&
        !pathname.startsWith('/portal/signup')
    ) {
        if (!token) {
            const url = new URL('/portal/login', req.url);
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // ── /automate/admin_automate — must be admin ───────────────────
    // (Renamed from /automate/admin so it doesn't collide with future
    // /automate-app routes; the directory in src/app/automate/admin_automate
    // is the only thing that lives here.)
    if (pathname.startsWith('/automate/admin_automate')) {
        if (!token) {
            const url = new URL('/automate/login', req.url);
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail || token.email !== adminEmail) {
            return NextResponse.redirect(new URL('/automate/dashboard', req.url));
        }
        return NextResponse.next();
    }

    // ── /automate/dashboard — must be logged in ────────────────────
    if (pathname.startsWith('/automate/dashboard')) {
        if (!token) {
            const url = new URL('/automate/login', req.url);
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/automate/dashboard/:path*',
        '/automate/admin_automate/:path*',
        '/portal/:path*',
    ],
};
