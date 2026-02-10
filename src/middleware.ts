import { withAuth } from "next-auth/middleware"

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            // Protect all dashboard routes
            if (req.nextUrl.pathname.startsWith('/dashboard')) {
                // TEMPORARY: Disable login check
                return true;
                // return token !== null
            }
            return true
        },
    },
})

export const config = {
    matcher: ['/dashboard/:path*'],
}
