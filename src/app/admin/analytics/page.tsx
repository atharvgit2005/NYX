'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { TrendingUp, TrendingDown, Users, DollarSign, Mic, Video, Download } from 'lucide-react';

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-1.5 h-36">
            {data.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] text-gray-600 opacity-0 group-hover:opacity-100 transition">{v}</span>
                    <div className="w-full rounded-t-sm transition-all hover:opacity-80 cursor-default" style={{ height: `${(v / max) * 100}%`, minHeight: 2, background: color }} />
                    <span className="text-[9px] text-gray-600 truncate w-full text-center">{labels[i]}</span>
                </div>
            ))}
        </div>
    );
}

function LineChart({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const W = 400;
    const H = 100;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - min) / range) * H * 0.85;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 100 }}>
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline points={`0,${H} ${pts} ${W},${H}`} fill={`url(#grad-${color.replace('#', '')})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const SUB_GROWTH = [4, 7, 6, 11, 14, 12, 17, 19, 23, 21, 28, 31];
const CHURN = [2, 1, 3, 1, 0, 2, 1, 1, 2, 3, 1, 0];
const VOICE_USAGE = [12000, 18000, 15000, 22000, 28000, 25000, 35000, 38000, 42000, 39000, 48000, 53000];
const VIDEO_USAGE = [40, 65, 55, 80, 110, 95, 130, 140, 160, 150, 180, 200];
const REVENUE_BY_TIER = [
    { tier: 'Free', mrr: 0, users: 2, color: '#6b7280' },
    { tier: 'Pro', mrr: 145, users: 5, color: '#9333ea' },
    { tier: 'Enterprise', mrr: 597, users: 3, color: '#f59e0b' },
];

export default function AnalyticsPage() {
    const { users, subscriptions, tiers } = useAdmin();
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'daily'>('monthly');

    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const totalMRR = REVENUE_BY_TIER.reduce((s, t) => s + t.mrr, 0);
    const churnRate = ((CHURN.reduce((a, b) => a + b, 0) / SUB_GROWTH.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
    const arpu = activeCount ? Math.round(totalMRR / activeCount) : 0;

    const exportCSV = () => {
        const rows = [['Month', 'New Subs', 'Churn', 'Voice Calls', 'Video Mins'], ...MONTHS.map((m, i) => [m, SUB_GROWTH[i], CHURN[i], VOICE_USAGE[i], VIDEO_USAGE[i]])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = 'analytics.csv';
        a.click();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Analytics</h1>
                    <p className="text-gray-500 mt-1">Platform usage and revenue insights</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-white/5 rounded-xl p-1">
                        {(['daily', 'weekly', 'monthly'] as const).map(p => (
                            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${period === p ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{p}</button>
                        ))}
                    </div>
                    <button onClick={exportCSV} className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition">
                        <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total MRR', value: `$${totalMRR}`, trend: '+12%', up: true, icon: DollarSign, color: '#10b981' },
                    { label: 'Active Subs', value: activeCount, trend: '+3', up: true, icon: Users, color: '#a855f7' },
                    { label: 'Churn Rate', value: `${churnRate}%`, trend: '-0.5%', up: false, icon: TrendingDown, color: '#f59e0b' },
                    { label: 'ARPU', value: `$${arpu}`, trend: '+$4', up: true, icon: TrendingUp, color: '#06b6d4' },
                ].map(({ label, value, trend, up, icon: Icon, color }) => (
                    <div key={label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                                <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>{trend}</span>
                        </div>
                        <p className="text-2xl font-black text-white">{value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-sm font-bold text-white">Subscription Growth</p>
                            <p className="text-xs text-gray-500">New subscribers per month</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                    </div>
                    <LineChart data={SUB_GROWTH} color="#a855f7" />
                    <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                        <span>{MONTHS[0]}</span><span>{MONTHS[MONTHS.length - 1]}</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-sm font-bold text-white">Churn Rate</p>
                            <p className="text-xs text-gray-500">Cancellations per month</p>
                        </div>
                    </div>
                    <BarChart data={CHURN} labels={MONTHS} color="#f59e0b" />
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-sm font-bold text-white">Voice Generation Usage</p>
                            <p className="text-xs text-gray-500">Characters synthesized</p>
                        </div>
                        <Mic className="w-4 h-4 text-purple-400" />
                    </div>
                    <LineChart data={VOICE_USAGE} color="#a855f7" />
                    <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                        <span>{MONTHS[0]}</span><span>{MONTHS[MONTHS.length - 1]}</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-sm font-bold text-white">Video Generation Usage</p>
                            <p className="text-xs text-gray-500">Minutes generated</p>
                        </div>
                        <Video className="w-4 h-4 text-cyan-400" />
                    </div>
                    <LineChart data={VIDEO_USAGE} color="#06b6d4" />
                    <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                        <span>{MONTHS[0]}</span><span>{MONTHS[MONTHS.length - 1]}</span>
                    </div>
                </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <p className="text-sm font-bold text-white mb-4">Revenue by Tier</p>
                <div className="space-y-4">
                    {REVENUE_BY_TIER.map(({ tier, mrr, users: uc, color }) => {
                        const pct = totalMRR ? Math.round((mrr / totalMRR) * 100) : 0;
                        return (
                            <div key={tier} className="flex items-center gap-4">
                                <div className="w-16 text-sm font-bold" style={{ color }}>{tier}</div>
                                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                                </div>
                                <div className="w-20 text-right">
                                    <p className="text-sm font-bold text-white">${mrr}/mo</p>
                                    <p className="text-xs text-gray-600">{uc} users</p>
                                </div>
                                <div className="w-12 text-right text-xs font-bold" style={{ color }}>{pct}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
