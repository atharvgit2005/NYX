'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/context/SidebarContext';
import Image from 'next/image';
import {
    LayoutDashboard,
    Link as LinkIcon,
    BrainCircuit,
    Lightbulb,
    FileText,
    User,
    Video,
    MoreHorizontal,
    Home
} from 'lucide-react';

export const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Connect Socials', href: '/dashboard/connect', icon: LinkIcon },
    { name: 'Brand Analysis', href: '/dashboard/analysis', icon: BrainCircuit },
    { name: 'Idea Generator', href: '/dashboard/ideas', icon: Lightbulb },
    { name: 'Script Editor', href: '/dashboard/scripts', icon: FileText },
    { name: 'Avatar & Voice', href: '/dashboard/avatar', icon: User },
    { name: 'Video Generation', href: '/dashboard/video', icon: Video },
    { name: 'Back to Home', href: '/', icon: Home },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { collapsed } = useSidebar();
    const { data: session } = useSession();

    // Derive initials from name
    const name = session?.user?.name || 'User';
    const email = session?.user?.email || '';
    const avatar = session?.user?.image || null;
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div
            className={`hidden md:flex md:flex-col md:fixed md:left-0 md:bottom-0 md:top-20 header-bg-theme backdrop-blur-xl z-40 transition-all duration-300 border-r border-theme rounded-r-3xl ${collapsed ? 'md:w-20' : 'md:w-56'
                }`}
        >
            <div className={`flex-1 flex flex-col overflow-y-auto ${collapsed ? 'py-4' : 'py-8'}`}>

                <nav className={`flex-1 px-4 mt-4 ${collapsed ? 'space-y-6' : 'space-y-4'}`}>

                    {navigation.filter(item => item.name !== 'Back to Home').map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : ''}
                                className={`group flex items-center transition-all duration-300 relative overflow-hidden ${collapsed
                                    ? 'w-12 h-12 justify-center mx-auto rounded-xl'
                                    : 'px-4 py-3.5 mx-2 rounded-2xl'
                                    } ${isActive
                                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 border border-orange-400/20'
                                        : 'text-theme-secondary hover:bg-orange-500/5 hover:text-orange-500 border border-transparent hover:border-orange-500/20'
                                    }`}
                            >
                                <Icon className={`transition-all duration-300 ${collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-4'} ${isActive ? 'text-white scale-110' : 'text-theme-secondary group-hover:text-orange-500 group-hover:scale-110'}`} />
                                {!collapsed && (
                                    <span className="truncate font-bold tracking-wide">{item.name}</span>
                                )}
                                {isActive && !collapsed && (
                                    <div className="absolute inset-y-0 right-0 w-1 bg-white/20 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Links */}
            <div className={`px-4 pb-4 ${collapsed ? 'mt-auto' : ''}`}>
                <Link
                    href="/"
                    title={collapsed ? 'Back to Home' : ''}
                    className={`group flex items-center transition-all duration-300 text-theme-secondary hover:bg-orange-500/10 hover:text-orange-500 border border-transparent hover:border-orange-500/20 hover:scale-[1.02] ${collapsed
                        ? 'w-12 h-12 justify-center mx-auto rounded-xl'
                        : 'px-4 py-3.5 mx-2 rounded-2xl font-semibold'
                        }`}
                >
                    <Home className={`transition-all duration-300 text-theme-secondary group-hover:text-orange-500 group-hover:scale-110 ${collapsed ? 'h-6 w-6' : 'h-5 w-5 mr-4'}`} />
                    {!collapsed && (
                        <span className="truncate">Back to Home</span>
                    )}
                </Link>
            </div>

            {/* User Tab */}
            <div className={`px-4 ${collapsed ? 'pb-4' : 'pb-8'}`}>
                <Link href="/dashboard/profile">
                    <div className={`flex items-center transition-all duration-300 cursor-pointer group relative ${collapsed
                        ? 'w-12 h-12 justify-center mx-auto rounded-xl bg-secondary/30'
                        : 'p-3 mx-2 bg-secondary/50 backdrop-blur-md rounded-3xl border border-theme hover:border-orange-500/30 shadow-inner'
                        }`}>
                        {/* Avatar: image or initials */}
                        <div className={`rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border border-white/10 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform duration-300 ${collapsed ? 'h-8 w-8' : 'h-10 w-10'}`}>
                            {avatar ? (
                                <Image src={avatar} alt={name} fill className="object-cover" sizes="40px" />
                            ) : (
                                <span className={collapsed ? 'text-[10px]' : 'text-sm shadow-sm'}>{initials}</span>
                            )}
                        </div>
                        {!collapsed && (
                            <>
                                <div className="ml-3 flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-theme-primary truncate group-hover:text-orange-500 transition-colors">{name}</p>
                                    <p className="text-[10px] text-theme-secondary truncate uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">NYX MEMBER</p>
                                </div>
                                <MoreHorizontal className="h-5 w-5 text-theme-secondary group-hover:text-theme-primary transition-colors ml-2" />
                            </>
                        )}
                    </div>
                </Link>
            </div>
        </div>
    );
}
