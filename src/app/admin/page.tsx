'use client';

import { useAdmin } from '@/context/AdminContext';
import { Users, CreditCard, DollarSign, Clock, AlertTriangle, Mic, Video, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function MiniChart({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const W = 160; const H = 48;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H * 0.85}`).join(' ');
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 48 }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            <polyline points={`0,${H} ${pts} ${W},${H}`} fill={`${color}18`} strokeWidth="0" />
        </svg>
    );
}

const growthData = [4, 7, 6, 11, 14, 12, 17, 19, 23, 21, 28, 31];
const usageData = [40, 55, 48, 60, 72, 65, 80, 78, 90, 85, 95, 100];

export default function AdminDashboard() {
    const { voiceService, videoService, users, subscriptions, tiers, auditLog, loadingUsers } = useAdmin();
    const { setVoiceService, setVideoService } = useAdmin();

    const totalUsers = users.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const pendingCount = subscriptions.filter(s => s.status === 'pending').length;
    const mrr = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
            const tier = tiers.find(t => t.name === s.tier);
            return sum + (tier?.price || 0);
        }, 0);

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-theme-primary">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Platform health overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <Link href="/admin/subscriptions" className="text-xs px-4 py-2 rounded-lg bg-card-theme border border-theme text-theme-secondary hover:text-theme-primary hover:bg-card-theme transition flex items-center gap-2">
                    Pending Approvals {pendingCount > 0 && <span className="bg-orange-500 text-theme-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pendingCount}</span>}
                </Link>
            </div>

            {/* Service Health */}
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Voice Generation', status: voiceService, icon: Mic, toggle: () => setVoiceService(voiceService === 'UP' ? 'DOWN' : 'UP') },
                    { label: 'Video Generation', status: videoService, icon: Video, toggle: () => setVideoService(videoService === 'UP' ? 'DOWN' : 'UP') },
                ].map(({ label, status, icon: Icon, toggle }) => (
                    <div key={label} className={`rounded-2xl border p-5 flex items-center justify-between ${status === 'UP' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'UP' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                <Icon className={`w-5 h-5 ${status === 'UP' ? 'text-green-400' : 'text-red-400'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-theme-primary">{label}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${status === 'UP' ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
                                    <span className={`text-xs font-bold ${status === 'UP' ? 'text-green-400' : 'text-red-400'}`}>{status === 'UP' ? 'Operational' : 'Down'}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={toggle} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${status === 'UP' ? 'bg-green-500' : 'bg-gray-700'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${status === 'UP' ? 'left-6' : 'left-0.5'}`} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: loadingUsers ? '…' : totalUsers, icon: Users, color: '#f97316' },
                    { label: 'Active Subscriptions', value: loadingUsers ? '…' : activeSubscriptions, icon: CreditCard, color: '#06b6d4' },
                    { label: 'MRR', value: `$${mrr}`, icon: DollarSign, color: '#10b981' },
                    { label: 'Pending Approvals', value: loadingUsers ? '…' : pendingCount, icon: Clock, color: '#f59e0b' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-2xl border border-theme bg-card-theme p-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}22` }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <p className="text-3xl font-black text-theme-primary mb-1">{value}</p>
                        <p className="text-sm text-theme-secondary">{label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
                <div className="rounded-2xl border border-theme bg-card-theme p-6">
                    <p className="text-sm font-bold text-theme-primary mb-1">Subscription Growth</p>
                    <p className="text-xs text-gray-500 mb-4">Last 12 months (projected)</p>
                    <MiniChart data={growthData} color="#f97316" />
                </div>
                <div className="rounded-2xl border border-theme bg-card-theme p-6">
                    <p className="text-sm font-bold text-theme-primary mb-1">Feature Usage</p>
                    <p className="text-xs text-gray-500 mb-4">Voice + Video this period</p>
                    <MiniChart data={usageData} color="#06b6d4" />
                </div>
            </div>

            {/* Recent Audit + Quick Actions */}
            <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Quick Actions</p>
                    {[
                        { label: 'Review Pending Approvals', href: '/admin/subscriptions', badge: pendingCount },
                        { label: 'Feature Gate Control', href: '/admin/gates', badge: 0 },
                        { label: 'View Audit Log', href: '/admin/audit', badge: 0 },
                        { label: 'Configure Alerts', href: '/admin/alerts', badge: 0 },
                    ].map(({ label, href, badge }) => (
                        <Link key={href} href={href} className="flex items-center justify-between p-3 rounded-xl bg-card-theme border border-theme hover:bg-card-theme text-sm text-theme-secondary hover:text-theme-primary group transition-all">
                            <span>{label}</span>
                            <div className="flex items-center gap-2">
                                {badge > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-theme-primary bg-orange-500">{badge}</span>}
                                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-theme-secondary" />
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="col-span-2 rounded-2xl border border-theme bg-card-theme p-5">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4">Recent Audit Activity</p>
                    {auditLog.length === 0 ? (
                        <p className="text-sm text-gray-600">No audit entries yet. Actions will appear here.</p>
                    ) : (
                        <div className="space-y-3">
                            {auditLog.slice(0, 5).map(entry => (
                                <div key={entry.id} className="flex items-start gap-3 text-sm">
                                    <span className="text-[10px] text-gray-600 font-mono mt-0.5 flex-shrink-0 w-20">
                                        {new Date(entry.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-theme-secondary flex-1">{entry.action} · <span className="text-gray-500">{entry.target}</span></span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link href="/admin/audit" className="mt-4 text-xs text-orange-500 hover:text-orange-300 flex items-center gap-1 transition">View full log <ChevronRight className="w-3 h-3" /></Link>
                </div>
            </div>
        </div>
    );
}
