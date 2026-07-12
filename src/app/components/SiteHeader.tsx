import Link from 'next/link';
import Image from 'next/image';

export type NavKey = 'home' | 'work' | 'services' | 'about' | 'contact' | 'portal';

const NAV: Array<{ href: string; label: string; key: NavKey }> = [
  { href: '/', label: 'HOME', key: 'home' },
  { href: '/work', label: 'WORK', key: 'work' },
  { href: '/services', label: 'SERVICES', key: 'services' },
  { href: '/about', label: 'ABOUT', key: 'about' },
  { href: '/contact', label: 'CONTACT', key: 'contact' },
  { href: '/portal', label: 'PORTAL', key: 'portal' },
];

/**
 * Canonical site header for all marketing pages. Replaces the per-page
 * hand-rolled headers that had drifted (different logo colors, CTA colors,
 * hover styles, and a missing HOME link on inner pages).
 *
 * - `active` highlights the current page (orange + underline + aria-current).
 * - `rightSlot` overrides the default "LET'S TALK" CTA (home passes <LiveHub/>).
 *
 * `<MobileNav />` is rendered separately by each page (fixed bottom bar).
 */
export function SiteHeader({
  active,
  rightSlot,
}: {
  active?: NavKey;
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 md:py-6 bg-[#0E0E0E] border-b-4 border-black">
      <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 relative">
          <Image
            src="/logo/NYX-Logo.png"
            alt="NYX Studio logo"
            fill
            priority
            unoptimized
            className="object-contain"
            sizes="(max-width: 768px) 32px, 40px"
          />
        </div>
        <div className="text-xl md:text-3xl font-black tracking-tighter text-white font-headline uppercase whitespace-nowrap">
          NYX STUDIO
        </div>
      </Link>

      <nav className="hidden md:flex gap-8 items-center" aria-label="Primary">
        {NAV.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'font-headline uppercase tracking-tighter font-bold text-[#D83C14] border-b-4 border-[#D83C14] pb-1 px-2'
                  : 'font-headline uppercase tracking-tighter font-bold text-white hover:bg-[#D83C14] hover:text-black transition-all duration-75 px-2'
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {rightSlot ?? (
        <Link
          href="/contact"
          className="bg-[#D83C14] text-white px-3 md:px-6 py-1 md:py-2 font-headline uppercase tracking-tighter font-bold text-[0.75rem] md:text-base scale-100 active:scale-95 hover:bg-[#F5C518] hover:text-black transition-all duration-75 inline-block border-4 border-transparent hover:border-black whitespace-nowrap"
        >
          LET&apos;S TALK →
        </Link>
      )}
    </header>
  );
}
