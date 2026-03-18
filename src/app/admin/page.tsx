'use client';

import { useAdmin } from '@/context/AdminContext';
import { Users, CreditCard, DollarSign, Clock, AlertTriangle, Mic, Video, TrendingUp, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: `${color}22` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
            </div>
            <p className="text-3xl font-black text-white mb-1">{value}</p>
            <p className="text-sm text-gray-400 font-medium">{label}</p>
            {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
        </div>
    );
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 160;
    const h = 48;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h * 0.85;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 48 }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}18`} strokeWidth="0" />
        </svg>
    );
}

const growthData = [12, 19, 15, 25, 31, 28, 40, 44, 52, 49, 61, 70];
const usageData = [40, 55, 48, 60, 72, 65, 80, 78, 90, 85, 95, 100];

export default function AdminDashboard() {
    const { voiceService, videoService, users, subscriptions, tiers, auditLog } = useAdmin();
    const { setVoiceService, setVideoService, addNotification, addAudit } = useAdmin();

    const totalUsers = users.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const pendingCount = subscriptions.filter(s => s.status === 'pending').length;
    const mrr = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
            const tier = tiers.find(t => t.name === s.tier);
            return sum + (tier?.price || 0);
        }, 0);

    const toggleVoice = () => {
        setVoiceService(voiceService === 'UP' ? 'DOWN' : 'UP');
    };
    const toggleVideo = () => {
        setVideoService(videoService === 'UP' ? 'DOWN' : 'UP');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Platform health overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/subscriptions" className="text-xs px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition flex items-center gap-2">
                        Pending Approvals <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pendingCount}</span>
                    </Link>
                </div>
            </div>

            {/* Service Health */}
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Voice Generation', status: voiceService, icon: Mic, toggle: toggleVoice },
                    { label: 'Video Generation', status: videoService, icon: Video, toggle: toggleVideo },
                ].map(({ label, status, icon: Icon, toggle }) => (
                    <div key={label} className={`rounded-2xl border p-5 flex items-center justify-between ${status === 'UP' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'UP' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                <Icon className={`w-5 h-5 ${status === 'UP' ? 'text-green-400' : 'text-red-400'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{label}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${status === 'UP' ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
                                    <span className={`text-xs font-bold ${status === 'UP' ? 'text-green-400' : 'text-red-400'}`}>{status === 'UP' ? 'Operational' : 'Down — Subscriptions Restricted'}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={toggle}
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${status === 'UP' ? 'bg-green-500' : 'bg-gray-700'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${status === 'UP' ? 'left-6' : 'left-0.5'}`} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard label="Total Users" value={totalUsers} icon={Users} color="#a855f7" sub="+3 this week" />
                <StatCard label="Active Subscriptions" value={activeSubscriptions} icon={CreditCard} color="#06b6d4" sub={`${pendingCount} pending`} />
                <StatCard label="MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSign} color="#10b981" sub="Based on active subs" />
                <StatCard label="Pending Approvals" value={pendingCount} icon={Clock} color="#f59e0b" sub="Awaiting review" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-bold text-white">Subscription Growth</p>
                            <p className="text-xs text-gray-500">Last 12 months</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                    </div>
                    <MiniChart data={growthData} color="#a855f7" />
                    <div className="flex justify-between mt-2 text-xs text-gray-600">
                        <span>Apr '25</span><span>Mar '26</span>
                    </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-bold text-white">Feature Usage</p>
                            <p className="text-xs text-gray-500">Voice + Video calls this month</p>
                        </div>
                    </div>
                    <MiniChart data={usageData} color="#06b6d4" />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        {[
                            { label: 'Voice Calls', value: '48.2K', color: '#a855f7' },
                            { label: 'Video Mins', value: '1,240', color: '#06b6d4' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                <span className="text-xs text-gray-400">{label}</span>
                                <span className="text-xs font-bold text-white ml-auto">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Links + Recent Audit */}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 space-y-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Quick Actions</p>
                    {[
                        { label: 'Review Pending Approvals', href: '/admin/subscriptions', badge: pendingCount, color: '#f59e0b' },
                        { label: 'Feature Gate Control', href: '/admin/gates', badge: null, color: '#a855f7' },
                        { label: 'View Audit Log', href: '/admin/audit', badge: null, color: '#06b6d4' },
                        { label: 'Configure Alerts', href: '/admin/alerts', badge: null, color: '#10b981' },
                    ].map(({ label, href, badge, color }) => (
                        <Link key={href} href={href}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-sm text-gray-300 hover:text-white group transition-all">
                            <span>{label}</span>
                            <div className="flex items-center gap-2">
                                {badge && badge > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ background: color }}>{badge}</span>}
                                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition" />
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="col-span-2 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4">Recent Audit Activity</p>
                    <div className="space-y-3">
                        {auditLog.slice(0, 5).map(entry => (
                            <div key={entry.id} className="flex items-start gap-3 text-sm">
                                <span className="text-[10px] text-gray-600 font-mono mt-0.5 flex-shrink-0 w-20">
                                    {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-gray-400 flex-1">{entry.action} · <span className="text-gray-500">{entry.target}</span></span>
                            </div>
                        ))}
                    </div>
                    <Link href="/admin/audit" className="mt-4 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition">View full log <ChevronRight className="w-3 h-3" /></Link>
                </div>
            </div>
        </div>
    );
}
