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

    return (
        <div
            className={`hidden md:flex md:flex-col md:fixed md:left-0 md:bottom-0 md:top-20 header-bg-theme backdrop-blur-xl z-40 transition-all duration-300 border-r border-theme rounded-r-3xl ${collapsed ? 'md:w-20' : 'md:w-56'
                }`}
        >
            <div className="flex-1 flex flex-col overflow-y-auto py-8">

                <nav className="flex-1 px-4 space-y-4 mt-4">

                    {navigation.filter(item => item.name !== 'Back to Home').map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : ''}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'text-theme-secondary hover:bg-card-hover hover:text-theme-primary hover:translate-x-1'
                                    } ${collapsed ? 'justify-center' : ''}`}
                            >
                                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-theme-secondary group-hover:text-theme-primary'} ${collapsed ? '' : 'mr-3'}`} />
                                {!collapsed && (
                                    <span className="truncate">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Links */}
            <div className="px-4 pb-2">
                <Link
                    href="/"
                    title={collapsed ? 'Back to Home' : ''}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-theme-secondary hover:bg-card-hover hover:text-theme-primary hover:translate-x-1 ${collapsed ? 'justify-center' : ''}`}
                >
                    <Home className={`h-5 w-5 transition-colors text-theme-secondary group-hover:text-theme-primary ${collapsed ? '' : 'mr-3'}`} />
                    {!collapsed && (
                        <span className="truncate">Back to Home</span>
                    )}
                </Link>
            </div>

            {/* User Tab */}
            <div className="px-4 pb-6">
                <Link href="/dashboard/profile">
                    <div className={`flex-shrink-0 p-3 bg-card-theme rounded-2xl hover:bg-card-hover transition-colors cursor-pointer group relative ${collapsed ? 'flex justify-center' : ''}`}>
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                                AP
                            </div>
                            {!collapsed && (
                                <>
                                    <div className="ml-3 flex-1 overflow-hidden">
                                        <p className="text-sm font-bold text-theme-primary truncate group-hover:text-purple-400 transition-colors">Atharv Paharia</p>
                                        <p className="text-xs text-theme-secondary truncate">Pro Plan</p>
                                    </div>
                                    <MoreHorizontal className="h-5 w-5 text-theme-secondary group-hover:text-theme-primary transition-colors ml-2" />
                                </>
                            )}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
