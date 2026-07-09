/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth"
import { authOptions } from '@/lib/auth'

function getCookieDomain(host: string): string | undefined {
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname.endsWith("nyxstudio.in")) {
    return ".nyxstudio.in";
  }
  if (hostname.endsWith("nyxstudio.tech")) {
    return ".nyxstudio.tech";
  }
  return undefined;
}

async function authHandler(req: any, ctx: any) {
  const host = req.headers.get("host") || "";
  const dynamicDomain = getCookieDomain(host);

  // Clone authOptions to prevent side-effects across requests
  const dynamicAuthOptions = {
    ...authOptions,
    cookies: {
      ...authOptions.cookies,
      sessionToken: {
        ...authOptions.cookies?.sessionToken,
        options: {
          ...authOptions.cookies?.sessionToken?.options,
          ...(dynamicDomain ? { domain: dynamicDomain } : {}),
        }
      }
    }
  };

  // If dynamicDomain is undefined (e.g. localhost or vercel preview),
  // delete the domain property to default to standard host-only cookies.
  if (!dynamicDomain && dynamicAuthOptions.cookies?.sessionToken?.options) {
    delete (dynamicAuthOptions.cookies.sessionToken.options as any).domain;
  }

  const handler = NextAuth(dynamicAuthOptions as any);
  return handler(req, ctx);
}

export { authHandler as GET, authHandler as POST }
