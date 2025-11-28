'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Link as LinkIcon,
    BrainCircuit,
    Lightbulb,
    FileText,
    User,
    Video,
    LogOut,
    MoreHorizontal
} from 'lucide-react';

const navigation = [
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

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-black/90 backdrop-blur-xl border-r border-white/10 z-50">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center h-20 flex-shrink-0 px-6 border-b border-white/10">
                    <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent tracking-tight">
                        NYX
                    </Link>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto py-6">
                    <nav className="flex-1 px-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-purple-600/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-white'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Tab */}
                <Link href="/dashboard/profile">
                    <div className="flex-shrink-0 border-t border-white/10 p-4 m-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group relative">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                AP
                            </div>
                            <div className="ml-3 flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">Atharv Paharia</p>
                                <p className="text-xs text-gray-500 truncate">Pro Plan</p>
                            </div>
                            <MoreHorizontal className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
