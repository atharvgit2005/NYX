'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useSidebar } from '@/context/SidebarContext';

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const { collapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-page text-theme-primary transition-colors duration-300">
            <Header />
            <Sidebar />
            <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 pt-20 ${collapsed ? 'md:pl-24' : 'md:pl-64'}`}>
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
