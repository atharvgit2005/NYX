'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { CheckCircle, XCircle, PauseCircle, ChevronDown, Search, ChevronRight, Clock, X } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    paused: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    restricted: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PAY_STYLES: Record<string, string> = {
    paid: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    refunded: 'text-gray-400',
};

export default function SubscriptionsPage() {
    const { subscriptions, updateSubscription, addAudit, addNotification, tiers } = useAdmin();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<{ id: string; action: 'approve' | 'reject' | 'pause' | 'cancel' | 'extend' } | null>(null);
    const [reason, setReason] = useState('');
    const [extendDays, setExtendDays] = useState(30);

    const filtered = subscriptions.filter(s => {
        const matchSearch = s.userName.toLowerCase().includes(search.toLowerCase()) || s.userEmail.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const pendingCount = subscriptions.filter(s => s.status === 'pending').length;

    const executeAction = () => {
        if (!showModal) return;
        const { id, action } = showModal;
        const sub = subscriptions.find(s => s.id === id)!;
        const now = new Date().toLocaleDateString();

        let newStatus = sub.status;
        let historyEntry = '';

        switch (action) {
            case 'approve': newStatus = 'active'; historyEntry = `Approved by admin`; break;
            case 'reject': newStatus = 'cancelled'; historyEntry = `Rejected: ${reason || 'No reason given'}`; break;
            case 'pause': newStatus = 'paused'; historyEntry = `Paused: ${reason || 'Maintenance'}`; break;
            case 'cancel': newStatus = 'cancelled'; historyEntry = `Cancelled: ${reason || 'Admin cancelled'}`; break;
            case 'extend':
                const renewal = new Date(sub.renewalDate);
                renewal.setDate(renewal.getDate() + extendDays);
                updateSubscription(id, { renewalDate: renewal.toISOString().split('T')[0] });
                historyEntry = `Extended by ${extendDays} days`;
                break;
        }

        updateSubscription(id, {
            status: newStatus as any,
            history: [...sub.history, { date: now, action: historyEntry, by: 'admin@nyx.ai' }],
        });

        addAudit({
            admin: 'admin@nyx.ai',
            action: `Subscription ${action}d`,
            target: `${sub.userName} (${id})`,
            details: historyEntry,
            category: 'subscription',
        });
        addNotification(`✅ Subscription for ${sub.userName} ${action}d`, 'success');
        setShowModal(null);
        setReason('');
    };

    const openModal = (id: string, action: 'approve' | 'reject' | 'pause' | 'cancel' | 'extend') => setShowModal({ id, action });

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Subscriptions</h1>
                    <p className="text-gray-500 mt-1">{subscriptions.length} total · <span className="text-yellow-400 font-medium">{pendingCount} pending approval</span></p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user..." className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="relative">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 pr-9 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer">
                        {['all', 'active', 'pending', 'paused', 'restricted', 'cancelled'].map(o => <option key={o} value={o} className="bg-gray-900">{o === 'all' ? 'All Statuses' : o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Subscription Cards */}
            <div className="space-y-3">
                {filtered.map(sub => {
                    const isExpanded = expanded === sub.id;
                    const tier = tiers.find(t => t.name === sub.tier);
                    return (
                        <div key={sub.id} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                            <div className="p-5 flex items-center gap-4">
                                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                                    <div>
                                        <p className="text-sm font-bold text-white">{sub.userName}</p>
                                        <p className="text-xs text-gray-500">{sub.userEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-0.5">Plan</p>
                                        <p className="text-sm font-bold" style={{ color: tier?.color || '#9ca3af' }}>{sub.tier}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-0.5">Renewal</p>
                                        <p className="text-sm text-gray-300">{new Date(sub.renewalDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-0.5">Payment</p>
                                        <p className={`text-sm font-bold capitalize ${PAY_STYLES[sub.paymentStatus]}`}>{sub.paymentStatus}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize w-fit ${STATUS_STYLES[sub.status]}`}>{sub.status}</span>
                                </div>
                                <div className="flex gap-2">
                                    {sub.status === 'pending' && (
                                        <>
                                            <button onClick={() => openModal(sub.id, 'approve')} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition">Approve</button>
                                            <button onClick={() => openModal(sub.id, 'reject')} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition">Reject</button>
                                        </>
                                    )}
                                    {sub.status === 'active' && (
                                        <>
                                            <button onClick={() => openModal(sub.id, 'pause')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition">Pause</button>
                                            <button onClick={() => openModal(sub.id, 'extend')} className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition">Extend</button>
                                        </>
                                    )}
                                    {(sub.status === 'paused' || sub.status === 'restricted') && (
                                        <button onClick={() => openModal(sub.id, 'approve')} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition">Restore</button>
                                    )}
                                    <button onClick={() => setExpanded(isExpanded ? null : sub.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition">
                                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-white/5 p-5 bg-white/[0.01]">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-3">Features Included</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(sub.features).map(([f, v]) => (
                                                    <span key={f} className={`text-xs px-2.5 py-1 rounded-full border capitalize ${v ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-600 border-white/5'}`}>
                                                        {v ? '✓' : '✗'} {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-3">History</p>
                                            <div className="space-y-2">
                                                {sub.history.map((h, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-xs">
                                                        <span className="text-gray-600 flex-shrink-0 w-20">{h.date}</span>
                                                        <span className="text-gray-400">{h.action}</span>
                                                        <span className="text-gray-600 ml-auto">by {h.by}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Action Modal */}
            {showModal && (() => {
                const sub = subscriptions.find(s => s.id === showModal.id)!;
                const needsReason = ['reject', 'pause', 'cancel'].includes(showModal.action);
                const needsDays = showModal.action === 'extend';
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-black text-white capitalize">{showModal.action} Subscription</h2>
                                <button onClick={() => setShowModal(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">For <span className="text-white font-bold">{sub.userName}</span> ({sub.tier} plan)</p>
                            {needsReason && (
                                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (optional)" rows={3}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none mb-4" />
                            )}
                            {needsDays && (
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 font-bold mb-2 block">Extend by (days)</label>
                                    <input type="number" value={extendDays} onChange={e => setExtendDays(+e.target.value)} min={1} max={365}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50" />
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setShowModal(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm font-bold transition">Cancel</button>
                                <button onClick={executeAction}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-black text-white transition ${showModal.action === 'approve' ? 'bg-green-600 hover:bg-green-500' : showModal.action === 'reject' || showModal.action === 'cancel' ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-600 hover:bg-purple-500'}`}>
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
