"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
    const pathname = usePathname() || "";

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full min-h-[72px] pb-[env(safe-area-inset-bottom)] bg-[#0E0E0E] border-t-4 border-black flex z-[60]">
            <Link href="/" aria-label="Home" className={`flex-1 flex flex-col items-center justify-center py-2 active:bg-white/5 ${pathname === '/' ? 'text-[#D83C14]' : 'text-white/60 hover:text-white'}`}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/' ? "'FILL' 1" : "'FILL' 0" }}>grid_view</span>
                <span className="font-headline font-bold text-[10px] mt-1 tracking-widest">HOME</span>
            </Link>
            <Link href="/services" aria-label="Services" className={`flex-1 flex flex-col items-center justify-center py-2 active:bg-white/5 ${pathname === '/services' ? 'text-[#D83C14]' : 'text-white/60 hover:text-white'}`}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/services' ? "'FILL' 1" : "'FILL' 0" }}>bolt</span>
                <span className="font-headline font-bold text-[10px] mt-1 tracking-widest">SERVICES</span>
            </Link>
            <Link href="/work" aria-label="Work" className={`flex-1 flex flex-col items-center justify-center py-2 active:bg-white/5 ${pathname === '/work' ? 'text-[#D83C14]' : 'text-white/60 hover:text-white'}`}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/work' ? "'FILL' 1" : "'FILL' 0" }}>layers</span>
                <span className="font-headline font-bold text-[10px] mt-1 tracking-widest">WORK</span>
            </Link>
            <Link href="/contact" aria-label="Contact" className={`flex-1 flex flex-col items-center justify-center py-2 active:bg-white/5 ${pathname === '/contact' ? 'text-[#D83C14]' : 'text-white/60 hover:text-white'}`}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/contact' ? "'FILL' 1" : "'FILL' 0" }}>alternate_email</span>
                <span className="font-headline font-bold text-[10px] mt-1 tracking-widest">CONTACT</span>
            </Link>
            <Link href="/portal" aria-label="Portal" className={`flex-1 flex flex-col items-center justify-center py-2 active:bg-white/5 ${pathname.startsWith('/portal') ? 'text-[#D83C14]' : 'text-white/60 hover:text-white'}`}>
                <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: pathname.startsWith('/portal') ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
                <span className="font-headline font-bold text-[10px] mt-1 tracking-widest">PORTAL</span>
            </Link>
        </nav>
    );
}
