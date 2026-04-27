import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Allow SVGs from DiceBear (avatar generator returns image/svg+xml)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
      // Google OAuth avatars
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // GitHub OAuth avatars
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Twitter/X OAuth avatars
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      // Custom avatars (if any, used in remote sources)
      {
        protocol: 'https',
        hostname: '*.dicebear.com',
      }
    ],
  },
};

export default nextConfig;
