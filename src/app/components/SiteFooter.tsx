import Link from 'next/link';
import Image from 'next/image';

const SOCIAL = [
  { href: 'https://www.instagram.com/nyxstudio.in/', label: 'INSTAGRAM', external: true },
  { href: 'https://www.linkedin.com/company/nyx-studio-ai/', label: 'LINKEDIN', external: true },
  { href: 'https://twitter.com/nyxstudiosai', label: 'TWITTER', external: true },
  { href: '/work', label: 'ARCHIVE', external: false },
  { href: '/contact', label: 'CONTACT', external: false },
];

/**
 * Canonical site footer for all marketing pages. Replaces the per-page footers
 * that drifted (2-col vs 1-row layouts, gray-500 links that failed contrast,
 * and a missing footer on /glossary). Links use gray-400 (AA on near-black).
 */
export function SiteFooter() {
  return (
    <footer className="w-full flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 md:px-8 py-10 md:py-12 gap-6 bg-[#0E0E0E] border-t-4 border-black relative z-10">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 relative">
          <Image
            src="/logo/NYX-Logo.png"
            alt="NYX Studio logo"
            fill
            unoptimized
            className="object-contain"
            sizes="32px"
          />
        </div>
        <div className="text-xl font-bold text-white font-headline uppercase">NYX STUDIO</div>
      </Link>

      <nav className="flex flex-wrap justify-center gap-4 md:gap-8" aria-label="Footer">
        {SOCIAL.map((item) =>
          item.external ? (
            <a
              key={item.label}
              className="font-body text-xs uppercase tracking-widest text-gray-400 hover:text-[#F5C518] transition-colors"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              className="font-body text-xs uppercase tracking-widest text-gray-400 hover:text-[#F5C518] transition-colors"
              href={item.href}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>

      <p className="font-headline text-[0.75rem] uppercase tracking-wider text-white/60">
        © 2026 NYX Studio
      </p>
    </footer>
  );
}
