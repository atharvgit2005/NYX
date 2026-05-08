import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // ── Canonical: nyxstudio.tech → www.nyxstudio.tech ────────────────
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'nyxstudio.tech' }],
        destination: 'https://www.nyxstudio.tech/:path*',
        permanent: true,
      },

      // ── /automate/* on main domain → automate subdomain (TEMPORARY) ──
      // Legacy SaaS lives at automate.nyxstudio.tech. Anyone hitting the
      // legacy path on the marketing domain gets bounced to the subdomain.
      // The /automate prefix is kept on the subdomain to avoid rewriting
      // every internal link in the legacy code.
      //
      // Marked `permanent: false` (307) on purpose — Phase-4 era found
      // browsers caching the old 308 even after we changed surrounding
      // routing. Stay flexible while the auth + admin migration is hot.
      {
        source: '/automate/:path*',
        has: [{ type: 'host', value: 'www.nyxstudio.tech' }],
        destination: 'https://automate.nyxstudio.tech/automate/:path*',
        permanent: false,
      },
      {
        source: '/automate',
        has: [{ type: 'host', value: 'www.nyxstudio.tech' }],
        destination: 'https://automate.nyxstudio.tech/automate',
        permanent: false,
      },

      // ── Block /portal and /clients on automate subdomain ──────────────
      // They belong on the marketing domain. Bounce back without losing path.
      {
        source: '/portal/:path*',
        has: [{ type: 'host', value: 'automate.nyxstudio.tech' }],
        destination: 'https://www.nyxstudio.tech/portal/:path*',
        permanent: false,
      },
      {
        source: '/portal',
        has: [{ type: 'host', value: 'automate.nyxstudio.tech' }],
        destination: 'https://www.nyxstudio.tech/portal',
        permanent: false,
      },
      {
        source: '/clients/:path*',
        has: [{ type: 'host', value: 'automate.nyxstudio.tech' }],
        destination: 'https://www.nyxstudio.tech/clients/:path*',
        permanent: false,
      },

      // ── Marketing pages don't exist on automate subdomain ────────────
      // Redirect / · /work · /services · /contact back to www.
      // Bare root on the subdomain is handled by the rewrite below — it
      // serves the /automate landing instead of redirecting.
      {
        source: '/work/:path*',
        has: [{ type: 'host', value: 'automate.nyxstudio.tech' }],
        destination: 'https://www.nyxstudio.tech/work/:path*',
        permanent: false,
      },
      {
        source: '/services/:path*',
        has: [{ type: 'host', value: 'automate.nyxstudio.tech' }],
        destination: 'https://www.nyxstudio.tech/services/:path*',
        permanent: false,
      },
      {
        source: '/contact/:path*',
        has: [{ type: 'host', value: 'automate.nyxstudio.tech' }],
        destination: 'https://www.nyxstudio.tech/contact/:path*',
        permanent: false,
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Bare root on automate.nyxstudio.tech serves the legacy SaaS landing
        // (which lives at /automate). URL bar stays clean ("automate.nyxstudio.tech/").
        {
          source: '/',
          has: [{ type: 'host', value: 'automate.nyxstudio.tech' }],
          destination: '/automate',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  /* config options here */
  outputFileTracingRoot: __dirname,
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
