"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
    const pathname = usePathname() || "";

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-[72px] bg-[#0E0E0E] border-t-4 border-black flex z-[60]">
            <Link href="/" className={`flex-1 flex flex-col items-center justify-center ${pathname === '/' ? 'text-[#E8441A]' : 'text-white/60 hover:text-white'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/' ? "'FILL' 1" : "'FILL' 0" }}>grid_view</span>
                <span className="font-headline font-bold text-[10px] mt-1 tracking-widest">HOME</span>
            </Link>
            <Link href="/services" className={`flex-1 flex flex-col items-center justify-center ${pathname === '/services' ? 'text-[#E8441A]' : 'text-white/60 hover:text-white'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/services' ? "'FILL' 1" : "'FILL' 0" }}>bolt</span>
                <span className="font-headline font-bold text-[10px] mt-1 tracking-widest">SERVICES</span>
            </Link>
            <Link href="/work" className={`flex-1 flex flex-col items-center justify-center ${pathname === '/work' ? 'text-[#E8441A]' : 'text-white/60 hover:text-white'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/work' ? "'FILL' 1" : "'FILL' 0" }}>layers</span>
                <span className="font-headline font-bold text-[10px] mt-1 tracking-widest">WORK</span>
            </Link>
            <Link href="/contact" className={`flex-1 flex flex-col items-center justify-center ${pathname === '/contact' ? 'text-[#E8441A]' : 'text-white/60 hover:text-white'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/contact' ? "'FILL' 1" : "'FILL' 0" }}>alternate_email</span>
                <span className="font-headline font-bold text-[10px] mt-1 tracking-widest">CONTACT</span>
            </Link>
        </nav>
    );
}
