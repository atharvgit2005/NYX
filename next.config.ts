import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  // @ts-ignore - turbopack option is valid in Next.js 15+ but types might lag
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
};

export default nextConfig;
