'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Plus, Edit2, Trash2, Users, Mic, Video, Code2, Zap, X } from 'lucide-react';
import type { Tier } from '@/context/AdminContext';

const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { voice: Mic, video: Video, api: Code2, priority: Zap };

const defaultTier: Omit<Tier, 'id'> = {
    name: '', price: 0, billingCycle: 'monthly', trialDays: 0, maxUsers: 100,
    features: { voice: false, video: false, api: false, priority: false },
    quotas: { voiceCharsPerDay: 0, videoMinsPerMonth: 0, apiCallsPerDay: 0, storageMB: 0 },
    approvalMode: 'auto', color: '#f97316',
};

export default function TiersPage() {
    const { tiers, users, updateTier, addTier, deleteTier, addAudit, addNotification } = useAdmin();
    const [modal, setModal] = useState<{ mode: 'create' | 'edit'; data: Omit<Tier, 'id'> & { id?: string } } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const openCreate = () => setModal({ mode: 'create', data: { ...defaultTier } });
    const openEdit = (tier: Tier) => setModal({ mode: 'edit', data: { ...tier } });

    const save = async () => {
        if (!modal) return;
        if (!modal.data.name.trim()) return;
        
        try {
            if (modal.mode === 'create') {
                const { id: _id, ...newTierData } = modal.data;
                await addTier(newTierData as unknown as Tier);
                addAudit({ admin: 'admin@nyx.ai', action: 'Tier created', target: modal.data.name, details: `Price: $${modal.data.price}/${modal.data.billingCycle}`, category: 'tier' });
                addNotification(`✅ Tier "${modal.data.name}" created`, 'success');
            } else if (modal.data.id) {
                const { id, ...patch } = modal.data;
                await updateTier(id, patch);
                addAudit({ admin: 'admin@nyx.ai', action: 'Tier edited', target: modal.data.name, details: 'Configuration updated', category: 'tier' });
                addNotification(`✅ Tier "${modal.data.name}" updated`, 'success');
            }
            setModal(null);
        } catch (error) {
            console.error('Error saving tier:', error);
            addNotification('❌ Failed to save tier', 'error');
        }
    };

    const confirmDelete = (id: string) => {
        const usersOnTier = users.filter(u => u.subscription?.tier === tiers.find(t => t.id === id)?.name).length;
        if (usersOnTier > 0) {
            addNotification(`⚠️ Cannot delete — ${usersOnTier} users on this tier. Migrate them first.`, 'error');
            return;
        }
        deleteTier(id);
        addAudit({ admin: 'admin@nyx.ai', action: 'Tier deleted', target: id, details: 'Tier removed', category: 'tier' });
        addNotification('✅ Tier deleted', 'success');
        setDeleteConfirm(null);
    };

    const patch = (path: string[], value: unknown) => {
        if (!modal) return;
        const updated = { ...modal.data };
        let obj: Record<string, unknown> = updated as unknown as Record<string, unknown>;
        for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]] as Record<string, unknown>;
        obj[path[path.length - 1]] = value;
        setModal({ ...modal, data: updated });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-theme-primary">Subscription Tiers</h1>
                    <p className="text-gray-500 mt-1">{tiers.length} tiers configured</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:scale-105 transition-all  text-sm font-bold hover:opacity-90 transition shadow-lg">
                    <Plus className="w-4 h-4" /> New Tier
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tiers.map(tier => {
                    const userCount = users.filter(u => u.subscription?.tier === tier.name).length;
                    return (
                        <div key={tier.id} className="rounded-2xl border border-theme bg-card-theme p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-theme-primary" style={{ background: `${tier.color}33`, border: `1px solid ${tier.color}44` }}>
                                        {tier.name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-theme-primary">{tier.name}</h2>
                                        <p className="text-sm" style={{ color: tier.color }}>
                                            {tier.price === 0 ? 'Free' : `$${tier.price}/${tier.billingCycle}`}
                                            {tier.trialDays > 0 && <span className="text-gray-500 ml-2">· {tier.trialDays} day trial</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-card-theme px-3 py-1.5 rounded-lg">
                                        <Users className="w-3.5 h-3.5" /> {userCount} users
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-bold capitalize ${tier.approvalMode === 'auto' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                        {tier.approvalMode} approve
                                    </span>
                                    <button onClick={() => openEdit(tier)} className="p-2 rounded-lg bg-card-theme hover:bg-card-theme text-theme-secondary hover:text-theme-primary transition"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => setDeleteConfirm(tier.id)} className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-500/50 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-3">Features</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {(['voice', 'video', 'api', 'priority'] as const).map((f) => {
                                            const v = tier.features[f];
                                            const Icon = FEATURE_ICONS[f] || Zap;
                                            return (
                                                <div key={f} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold capitalize border ${v ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' : 'bg-white/3 text-gray-600 border-theme'}`}>
                                                    <Icon className="w-3 h-3" /> {f}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-3">Quotas</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {[
                                            ['Voice chars/day', tier.quotas.voiceCharsPerDay.toLocaleString()],
                                            ['Video mins/mo', tier.quotas.videoMinsPerMonth],
                                            ['API calls/day', tier.quotas.apiCallsPerDay.toLocaleString()],
                                            ['Storage', `${tier.quotas.storageMB >= 1024 ? `${tier.quotas.storageMB / 1024}GB` : `${tier.quotas.storageMB}MB`}`],
                                        ].map(([label, val]) => (
                                            <div key={label as string} className="flex flex-col gap-0.5">
                                                <span className="text-gray-600">{label}</span>
                                                <span className="text-theme-primary font-bold">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create/Edit Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 backdrop-blur-sm overflow-y-auto py-8">
                    <div className="w-full max-w-2xl bg-gray-900 border border-theme rounded-2xl p-7 shadow-2xl mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-theme-primary">{modal.mode === 'create' ? 'Create New Tier' : 'Edit Tier'}</h2>
                            <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-bold mb-1.5 block">Tier Name</label>
                                    <input value={modal.data.name} onChange={e => patch(['name'], e.target.value)} placeholder="e.g. Pro" className="w-full bg-page/30 border border-theme rounded-xl px-4 py-2.5 text-sm text-theme-primary focus:outline-none focus:border-orange-500/50" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-bold mb-1.5 block">Color</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={modal.data.color} onChange={e => patch(['color'], e.target.value)} className="w-12 h-10 rounded-lg border border-theme bg-transparent cursor-pointer" />
                                        <input value={modal.data.color} onChange={e => patch(['color'], e.target.value)} className="flex-1 bg-page/30 border border-theme rounded-xl px-3 py-2.5 text-sm text-theme-primary focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-bold mb-1.5 block">Price ($)</label>
                                    <input type="number" value={modal.data.price} onChange={e => patch(['price'], +e.target.value)} min={0} className="w-full bg-page/30 border border-theme rounded-xl px-4 py-2.5 text-sm text-theme-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-bold mb-1.5 block">Billing Cycle</label>
                                    <select value={modal.data.billingCycle} onChange={e => patch(['billingCycle'], e.target.value)} className="w-full bg-page/30 border border-theme rounded-xl px-4 py-2.5 text-sm text-theme-secondary focus:outline-none">
                                        <option value="monthly" className="bg-gray-900">Monthly</option>
                                        <option value="annual" className="bg-gray-900">Annual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-bold mb-1.5 block">Trial Days</label>
                                    <input type="number" value={modal.data.trialDays} onChange={e => patch(['trialDays'], +e.target.value)} min={0} className="w-full bg-page/30 border border-theme rounded-xl px-4 py-2.5 text-sm text-theme-primary focus:outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 font-bold mb-2 block">Included Features</label>
                                <div className="flex flex-wrap gap-3">
                                    {Object.keys(modal.data.features).map(f => {
                                        const Icon = FEATURE_ICONS[f] || Zap;
                                        const enabled = modal.data.features[f as keyof typeof modal.data.features];
                                        return (
                                            <button key={f} onClick={() => patch(['features', f], !enabled)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold capitalize transition ${enabled ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-card-theme border-theme text-gray-500 hover:text-theme-secondary'}`}>
                                                <Icon className="w-3.5 h-3.5" /> {f}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 font-bold mb-2 block">Approval Mode</label>
                                <div className="flex gap-3">
                                    {(['auto', 'manual'] as const).map(m => (
                                        <button key={m} onClick={() => patch(['approvalMode'], m)}
                                            className={`flex-1 py-2 rounded-xl border text-sm font-bold capitalize transition ${modal.data.approvalMode === m ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-card-theme border-theme text-gray-500'}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Voice Chars/Day', path: ['quotas', 'voiceCharsPerDay'] },
                                    { label: 'Video Mins/Month', path: ['quotas', 'videoMinsPerMonth'] },
                                    { label: 'API Calls/Day', path: ['quotas', 'apiCallsPerDay'] },
                                    { label: 'Storage (MB)', path: ['quotas', 'storageMB'] },
                                ].map(({ label, path }) => (
                                    <div key={label}>
                                        <label className="text-xs text-gray-500 font-bold mb-1.5 block">{label}</label>
                                        <input type="number" value={(modal.data as unknown as Record<string, Record<string, number>>)[path[0]][path[1]]} onChange={e => patch(path, +e.target.value)} min={0}
                                            className="w-full bg-page/30 border border-theme rounded-xl px-4 py-2.5 text-sm text-theme-primary focus:outline-none" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-5 border-t border-theme">
                            <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl bg-card-theme border border-theme text-theme-secondary text-sm font-bold hover:text-theme-primary transition">Cancel</button>
                            <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:scale-105 transition-all  text-sm font-black hover:opacity-90 transition">Save Tier</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-gray-900 border border-red-500/20 rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-lg font-black text-theme-primary mb-2">Delete Tier?</h2>
                        <p className="text-sm text-theme-secondary mb-6">This action cannot be undone. All users on this tier must be migrated first.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-card-theme border border-theme text-theme-secondary text-sm font-bold">Cancel</button>
                            <button onClick={() => confirmDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500  text-sm font-black transition">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
