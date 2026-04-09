'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Search, ChevronDown, Download, Filter } from 'lucide-react';
import type { AuditEntry } from '@/context/AdminContext';

const CATEGORY_STYLES: Record<string, string> = {
    subscription: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    user: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    tier: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    gate: 'bg-red-500/10 text-red-400 border-red-500/20',
    alert: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const CATEGORY_ICONS: Record<string, string> = {
    subscription: '💳',
    user: '👤',
    tier: '🏷',
    gate: '🔒',
    alert: '🔔',
};

function timeAgo(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function AuditPage() {
    const { auditLog } = useAdmin();
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [adminFilter, setAdminFilter] = useState('all');

    const admins = [...new Set(auditLog.map(e => e.admin))];

    const filtered = auditLog.filter(e => {
        const matchSearch = e.action.toLowerCase().includes(search.toLowerCase()) || e.target.toLowerCase().includes(search.toLowerCase()) || e.details.toLowerCase().includes(search.toLowerCase());
        const matchCat = catFilter === 'all' || e.category === catFilter;
        const matchAdmin = adminFilter === 'all' || e.admin === adminFilter;
        return matchSearch && matchCat && matchAdmin;
    });

    const exportCSV = () => {
        const rows = [['Timestamp', 'Admin', 'Action', 'Target', 'Details', 'Category'],
        ...filtered.map(e => [e.createdAt, e.admin, e.action, e.target, e.details, e.category])];
        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = 'audit-log.csv';
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-theme-primary">Audit Log</h1>
                    <p className="text-gray-500 mt-1">{filtered.length} entries · tamper-evident record of all admin actions</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl bg-card-theme border border-theme text-theme-secondary hover:text-theme-primary transition">
                    <Download className="w-3.5 h-3.5" /> Export Log
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actions, targets..." className="w-full bg-card-theme border border-theme rounded-xl pl-10 pr-4 py-2.5 text-sm text-theme-primary placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
                </div>
                <div className="relative">
                    <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="appearance-none bg-card-theme border border-theme rounded-xl px-4 py-2.5 pr-9 text-sm text-theme-secondary focus:outline-none cursor-pointer">
                        {['all', 'subscription', 'user', 'tier', 'gate', 'alert'].map(o => <option key={o} value={o} className="bg-card-theme">{o === 'all' ? 'All Categories' : o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>
                <div className="relative">
                    <select value={adminFilter} onChange={e => setAdminFilter(e.target.value)} className="appearance-none bg-card-theme border border-theme rounded-xl px-4 py-2.5 pr-9 text-sm text-theme-secondary focus:outline-none cursor-pointer">
                        <option value="all" className="bg-gray-900">All Admins</option>
                        {admins.map(a => <option key={a} value={a} className="bg-card-theme">{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
                {filtered.map((entry, idx) => (
                    <div key={entry.id} className="flex gap-4 items-start">
                        {/* Time + line */}
                        <div className="flex flex-col items-center flex-shrink-0 w-16">
                            <span className="text-[10px] text-gray-600 font-mono">{timeAgo(entry.createdAt)}</span>
                            {idx < filtered.length - 1 && <div className="w-px flex-1 bg-card-theme mt-1" style={{ minHeight: 24 }} />}
                        </div>

                        {/* Icon */}
                        <div className="w-8 h-8 rounded-lg bg-card-theme border border-theme flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                            {CATEGORY_ICONS[entry.category]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 py-1">
                            <div className="flex items-start gap-3 flex-wrap">
                                <p className="text-sm font-bold text-theme-primary">{entry.action}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${CATEGORY_STYLES[entry.category]}`}>{entry.category}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                <span className="text-theme-secondary">Target:</span> {entry.target}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">{entry.details}</p>
                            <p className="text-[10px] text-gray-700 mt-1 font-mono">{entry.admin} · {new Date(entry.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-gray-600">
                        <Filter className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p>No audit entries match your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
