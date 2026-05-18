import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (
        pathname.startsWith('/portal') &&
        !pathname.startsWith('/portal/login') &&
        !pathname.startsWith('/portal/signup')
    ) {
        const token = await getToken({ req });
        if (!token) {
            const url = new URL('/portal/login', req.url);
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/portal/:path*'],
};
