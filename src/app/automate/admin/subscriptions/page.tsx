'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { ChevronDown, Search, ChevronRight, X, RefreshCw, Loader2, PauseCircle } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    paused: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    cancelled: 'bg-gray-500/10 text-theme-secondary border-gray-500/20',
    restricted: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PAY_STYLES: Record<string, string> = {
    paid: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    refunded: 'text-theme-secondary',
};

export default function SubscriptionsPage() {
    const { subscriptions, updateSubscriptionRemote, addAudit, addNotification, tiers, refreshSubscriptions, loadingSubscriptions } = useAdmin();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<{ id: string; action: 'approve' | 'reject' | 'pause' | 'cancel' | 'extend' } | null>(null);
    const [reason, setReason] = useState('');
    const [extendDays, setExtendDays] = useState(30);
    const [loadingAction, setLoadingAction] = useState(false);

    const filtered = subscriptions.filter(s => {
        const userName = s.user?.name || s.user?.email || '';
        const matchSearch = userName.toLowerCase().includes(search.toLowerCase()) || (s.user?.email || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const pendingCount = subscriptions.filter(s => s.status === 'pending').length;

    const executeAction = async () => {
        if (!showModal) return;
        const { id, action } = showModal;
        const sub = subscriptions.find(s => s.id === id)!;
        const userName = sub.user?.name || sub.user?.email || 'Unknown';

        let patch: Record<string, unknown> = {};

        switch (action) {
            case 'approve': patch = { status: 'active' }; break;
            case 'reject':  patch = { status: 'cancelled' }; break;
            case 'pause':   patch = { status: 'paused' }; break;
            case 'cancel':  patch = { status: 'cancelled' }; break;
            case 'extend':
                const renewal = new Date(sub.renewalDate || Date.now());
                renewal.setDate(renewal.getDate() + extendDays);
                patch = { renewalDate: renewal.toISOString() };
                break;
        }

        setLoadingAction(true);
        try {
            await updateSubscriptionRemote(id, patch);
            await addAudit({
                admin: 'admin@nyx.ai',
                action: `Subscription ${action}d`,
                target: `${userName} (${id})`,
                details: reason || `Action: ${action}`,
                category: 'subscription',
            });
            addNotification(`✅ Subscription for ${userName} ${action}d`, 'success');
        } catch (e) {
            addNotification(`❌ Failed to ${action} subscription`, 'error');
        } finally {
            setLoadingAction(false);
            setShowModal(null);
            setReason('');
        }
    };

    const openModal = (id: string, action: 'approve' | 'reject' | 'pause' | 'cancel' | 'extend') => setShowModal({ id, action });

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-theme-primary">Subscriptions</h1>
                    <p className="text-gray-500 mt-1">
                        {subscriptions.length} total · <span className="text-yellow-400 font-medium">{pendingCount} pending approval</span>
                    </p>
                </div>
                <button onClick={refreshSubscriptions} className="text-xs px-4 py-2 rounded-lg bg-card-theme border border-theme text-theme-secondary hover:text-theme-primary transition flex items-center gap-2">
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSubscriptions ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by user name or email..."
                        className="w-full bg-card-theme border border-theme rounded-xl pl-10 pr-4 py-2.5 text-sm text-theme-primary placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                </div>
                <div className="relative">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="appearance-none bg-card-theme border border-theme rounded-xl px-4 py-2.5 pr-9 text-sm text-theme-secondary focus:outline-none focus:border-orange-500/50 cursor-pointer">
                        {['all', 'active', 'pending', 'paused', 'restricted', 'cancelled'].map(o =>
                            <option key={o} value={o} className="bg-card-theme">{o === 'all' ? 'All Statuses' : o}</option>
                        )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Subscription Cards */}
            {loadingSubscriptions ? (
                <div className="text-center py-16 text-gray-600">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                    <p>Loading subscriptions...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(sub => {
                        const isExpanded = expanded === sub.id;
                        const tier = tiers.find(t => t.name === sub.tier);
                        const userName = sub.user?.name || '(No name)';
                        const userEmail = sub.user?.email || '';
                        return (
                            <div key={sub.id} className="rounded-2xl border border-theme bg-card-theme overflow-hidden">
                                <div className="p-5 flex items-center gap-4">
                                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                                        <div>
                                            <p className="text-sm font-bold text-theme-primary">{userName}</p>
                                            <p className="text-xs text-gray-500">{userEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-0.5">Plan</p>
                                            <p className="text-sm font-bold" style={{ color: tier?.color || '#9ca3af' }}>{sub.tier}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-0.5">Renewal</p>
                                            <p className="text-sm text-theme-secondary">
                                                {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-0.5">Payment</p>
                                            <p className={`text-sm font-bold capitalize ${PAY_STYLES[sub.paymentStatus] || 'text-theme-secondary'}`}>{sub.paymentStatus}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize w-fit ${STATUS_STYLES[sub.status] || ''}`}>{sub.status}</span>
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
                                                <button onClick={() => openModal(sub.id, 'extend')} className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500/20 transition">Extend</button>
                                            </>
                                        )}
                                        {(sub.status === 'paused' || sub.status === 'restricted') && (
                                            <button onClick={() => openModal(sub.id, 'approve')} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition">Restore</button>
                                        )}
                                        <button onClick={() => setExpanded(isExpanded ? null : sub.id)} className="p-1.5 rounded-lg hover:bg-card-hover text-gray-500 hover:text-theme-primary transition">
                                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-theme p-5 bg-card-hover">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-3">Features Included</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {sub.features && Object.entries(sub.features).map(([f, v]) => (
                                                        <span key={f} className={`text-xs px-2.5 py-1 rounded-full border capitalize ${v ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-card-theme text-gray-600 border-theme'}`}>
                                                            {v ? '✓' : '✗'} {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-3">Subscription Details</p>
                                                <div className="space-y-1.5 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Start Date</span>
                                                        <span className="text-theme-secondary">{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Renewal Date</span>
                                                        <span className="text-theme-secondary">{sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : '—'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Subscription ID</span>
                                                        <span className="text-theme-secondary font-mono text-[10px]">{sub.id.slice(0, 16)}…</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-gray-600 rounded-2xl border border-theme bg-card-theme">
                            <PauseCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p>No subscriptions match your filters</p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Modal */}
            {showModal && (() => {
                const sub = subscriptions.find(s => s.id === showModal.id)!;
                const userName = sub?.user?.name || sub?.user?.email || 'Unknown';
                const needsReason = ['reject', 'pause', 'cancel'].includes(showModal.action);
                const needsDays = showModal.action === 'extend';
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 backdrop-blur-sm">
                        <div className="w-full max-w-md bg-card-theme border border-theme rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-black text-theme-primary capitalize">{showModal.action} Subscription</h2>
                                <button onClick={() => setShowModal(null)} className="text-gray-500 hover:text-theme-primary"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-sm text-theme-secondary mb-4">For <span className="text-theme-primary font-bold">{userName}</span> ({sub?.tier} plan)</p>
                            {needsReason && (
                                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (optional)" rows={3}
                                    className="w-full bg-page border border-theme rounded-xl px-4 py-3 text-sm text-theme-primary placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none mb-4" />
                            )}
                            {needsDays && (
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 font-bold mb-2 block">Extend by (days)</label>
                                    <input type="number" value={extendDays} onChange={e => setExtendDays(+e.target.value)} min={1} max={365}
                                        className="w-full bg-page border border-theme rounded-xl px-4 py-3 text-sm text-theme-primary focus:outline-none focus:border-orange-500/50" />
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setShowModal(null)} className="flex-1 py-2.5 rounded-xl bg-card-hover border border-theme text-theme-secondary hover:text-theme-primary text-sm font-bold transition">Cancel</button>
                                <button
                                    onClick={executeAction}
                                    disabled={loadingAction}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-black text-white transition flex items-center justify-center gap-2 ${showModal.action === 'approve' ? 'bg-green-600 hover:bg-green-500' : showModal.action === 'reject' || showModal.action === 'cancel' ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'} disabled:opacity-50`}
                                >
                                    {loadingAction ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
