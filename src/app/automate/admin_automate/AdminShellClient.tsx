'use client';

import { AdminProvider, useAdmin } from '@/context/AdminContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { X, AlertTriangle } from 'lucide-react';

function AdminShell({ children }: { children: React.ReactNode }) {
    const { voiceService, videoService, notifications, dismissNotification } = useAdmin();
    const hasDown = voiceService === 'DOWN' || videoService === 'DOWN';
    const downServices = [voiceService === 'DOWN' ? 'Voice' : '', videoService === 'DOWN' ? 'Video' : ''].filter(Boolean);

    return (
        <div className="min-h-screen bg-page text-theme-primary">
            <AdminSidebar />

            <div className="ml-64 transition-all duration-300">
                {hasDown && (
                    <div className="sticky top-0 z-40 bg-gradient-to-r from-red-900/80 to-orange-900/80 border-b border-red-500/30 backdrop-blur-sm px-6 py-3 flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 animate-pulse" />
                        <p className="text-sm text-orange-200 font-medium flex-1">
                            <span className="font-bold text-orange-300">{downServices.join(' & ')} Generation {downServices.length > 1 ? 'are' : 'is'} DOWN</span>
                            {' - '}All affected subscriptions have been automatically restricted. Users have been notified.
                        </p>
                    </div>
                )}

                <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
                    {notifications.slice(0, 3).map(n => (
                        <div
                            key={n.id}
                            className={`flex items-start gap-3 p-4 rounded-xl border text-sm shadow-2xl animate-fade-in backdrop-blur-sm ${n.type === 'warning' ? 'bg-orange-900/80 border-orange-500/30 text-orange-200' :
                                n.type === 'error' ? 'bg-red-900/80 border-red-500/30 text-red-200' :
                                    n.type === 'success' ? 'bg-green-900/80 border-green-500/30 text-green-200' :
                                        'bg-card-theme border-theme text-theme-primary'
                                }`}
                        >
                            <p className="flex-1 leading-snug">{n.message}</p>
                            <button onClick={() => dismissNotification(n.id)} className="opacity-50 hover:opacity-100 transition flex-shrink-0 mt-0.5">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminShellClient({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            <AdminShell>{children}</AdminShell>
        </AdminProvider>
    );
}

