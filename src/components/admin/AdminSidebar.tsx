'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Users, CreditCard, Layers, Shield,
    BarChart3, ScrollText, Bell, ChevronLeft, ChevronRight,
    Zap, LogOut, AlertTriangle
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Tiers', href: '/admin/tiers', icon: Layers },
    { name: 'Feature Gates', href: '/admin/gates', icon: Shield },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Audit Log', href: '/admin/audit', icon: ScrollText },
    { name: 'Alerts', href: '/admin/alerts', icon: Bell },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { voiceService, videoService, notifications } = useAdmin();
    const hasIssue = voiceService === 'DOWN' || videoService === 'DOWN';
    const unreadCount = notifications.length;

    return (
        <div className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}
            style={{ background: 'rgba(8, 8, 16, 0.97)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Logo */}
            <div className={`flex items-center gap-3 px-5 py-5 border-b border-theme ${collapsed ? 'justify-center px-0' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <p className="text-sm font-black text-theme-primary tracking-tight">NYX Admin</p>
                        <p className="text-[10px] text-gray-500 font-medium">Control Panel</p>
                    </div>
                )}
            </div>

            {/* Service Status Bar */}
            {!collapsed && (
                <div className="mx-3 my-3 p-3 rounded-xl bg-card-theme border border-theme">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold mb-2">Service Health</p>
                    <div className="flex flex-col gap-1.5">
                        {[
                            { label: 'Voice', status: voiceService },
                            { label: 'Video', status: videoService },
                        ].map(({ label, status }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-xs text-theme-secondary">{label}</span>
                                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${status === 'UP' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'UP' ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
                                    {status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {navItems.map(({ name, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    const isAlerts = name === 'Alerts';
                    const isGates = name === 'Feature Gates';
                    return (
                        <Link key={href} href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${collapsed ? 'justify-center' : ''} ${isActive
                                ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                            title={collapsed ? name : ''}
                        >
                            <div className="relative flex-shrink-0">
                                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`} style={{ width: '18px', height: '18px' }} />
                                {isAlerts && unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-theme-primary flex items-center justify-center font-bold">{unreadCount}</span>
                                )}
                                {isGates && hasIssue && (
                                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                                )}
                            </div>
                            {!collapsed && <span>{name}</span>}
                            {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="px-3 pb-4 space-y-2 border-t border-theme pt-3">
                <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-theme-primary hover:bg-card-theme transition-all ${collapsed ? 'justify-center' : ''}`}>
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>Back to App</span>}
                </Link>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-theme-secondary hover:bg-white/3 transition-all ${collapsed ? 'justify-center' : ''}`}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
                </button>
            </div>
        </div>
    );
}
