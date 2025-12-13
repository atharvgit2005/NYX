'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import {
    LayoutDashboard,
    Link as LinkIcon,
    BrainCircuit,
    Lightbulb,
    FileText,
    User,
    Video,
    MoreHorizontal
} from 'lucide-react';

export const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Connect Socials', href: '/dashboard/connect', icon: LinkIcon },
    { name: 'Brand Analysis', href: '/dashboard/analysis', icon: BrainCircuit },
    { name: 'Idea Generator', href: '/dashboard/ideas', icon: Lightbulb },
    { name: 'Script Editor', href: '/dashboard/scripts', icon: FileText },
    { name: 'Avatar & Voice', href: '/dashboard/avatar', icon: User },
    { name: 'Video Generation', href: '/dashboard/video', icon: Video },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { collapsed } = useSidebar();

    return (
        <div
            className={`hidden md:flex md:flex-col md:fixed md:left-0 md:bottom-0 md:top-20 bg-black/95 backdrop-blur-xl z-40 transition-all duration-300 ${collapsed ? 'md:w-20' : 'md:w-64'
                }`}
        >
            <div className="flex-1 flex flex-col overflow-y-auto pb-[150px]">

                <nav className="flex-1 px-4 space-y-2 mt-8" style={{ paddingTop: '35px' }}>

                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : ''}
                                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-purple-600/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                    } ${collapsed ? 'justify-center' : ''}`}
                            >
                                <Icon className={`h-6 w-6 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-white'} ${collapsed ? '' : 'mr-3'}`} />
                                {!collapsed && (
                                    <span className="truncate">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Tab */}
            <div className="mt-auto px-4 pb-6">
                <Link href="/dashboard/profile">
                    <div className={`flex-shrink-0 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group relative ${collapsed ? 'flex justify-center' : ''}`}>
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                                AP
                            </div>
                            {!collapsed && (
                                <>
                                    <div className="ml-3 flex-1 overflow-hidden">
                                        <p className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">Atharv Paharia</p>
                                        <p className="text-xs text-gray-500 truncate">Pro Plan</p>
                                    </div>
                                    <MoreHorizontal className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors ml-2" />
                                </>
                            )}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
