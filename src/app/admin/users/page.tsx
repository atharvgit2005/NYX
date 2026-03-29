'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Search, Filter, CheckCircle, XCircle, PauseCircle, MoreHorizontal, Download, ChevronDown, Mic, Video, UserCheck, UserX, User } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    rejected: 'bg-gray-500/10 text-theme-secondary border-gray-500/20',
};

const TIER_COLORS: Record<string, string> = {
    Free: 'text-theme-secondary',
    Pro: 'text-orange-500',
    Enterprise: 'text-amber-400',
};

export default function UsersPage() {
    const { users, updateUser, addAudit, addNotification, subscriptions } = useAdmin();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [tierFilter, setTierFilter] = useState('all');
    const [selected, setSelected] = useState<string[]>([]);
    const [actionMenu, setActionMenu] = useState<string | null>(null);

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        const matchTier = tierFilter === 'all' || u.tier === tierFilter;
        return matchSearch && matchStatus && matchTier;
    });

    const doAction = (userId: string, action: 'approve' | 'reject' | 'suspend' | 'restore') => {
        const user = users.find(u => u.id === userId)!;
        const newStatus = action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : action === 'suspend' ? 'suspended' : 'active';
        updateUser(userId, { status: newStatus as any });
        addAudit({
            admin: 'admin@nyx.ai',
            action: action === 'approve' ? 'User approved' : action === 'reject' ? 'User rejected' : action === 'suspend' ? 'User suspended' : 'User restored',
            target: `${user.name} (${userId})`,
            details: `Status changed to ${newStatus}`,
            category: 'user',
        });
        addNotification(`✅ ${user.name} ${action}d`, 'success');
        setActionMenu(null);
    };

    const exportCSV = () => {
        const rows = [['Name', 'Email', 'Status', 'Tier', 'Country', 'Join Date'], ...filtered.map(u => [u.name, u.email, u.status, u.tier, u.country, u.joinDate])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = 'users.csv';
        a.click();
    };

    const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const allSelected = filtered.length > 0 && filtered.every(u => selected.includes(u.id));

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-theme-primary">User Management</h1>
                    <p className="text-gray-500 mt-1">{users.length} total users · {users.filter(u => u.status === 'pending').length} pending</p>
                </div>
                <div className="flex gap-3">
                    {selected.length > 0 && (
                        <div className="flex gap-2">
                            <button onClick={() => selected.forEach(id => doAction(id, 'approve'))} className="text-xs px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition">Approve Selected ({selected.length})</button>
                        </div>
                    )}
                    <button onClick={exportCSV} className="text-xs px-4 py-2 rounded-lg bg-card-theme border border-theme text-theme-secondary hover:text-theme-primary transition flex items-center gap-2">
                        <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-card-theme border border-theme rounded-xl pl-10 pr-4 py-2.5 text-sm text-theme-primary placeholder-gray-600 focus:outline-none focus:border-orange-500/50" />
                </div>
                {[
                    { label: 'Status', value: statusFilter, set: setStatusFilter, opts: ['all', 'active', 'pending', 'suspended', 'rejected'] },
                    { label: 'Tier', value: tierFilter, set: setTierFilter, opts: ['all', 'Free', 'Pro', 'Enterprise'] },
                ].map(({ label, value, set, opts }) => (
                    <div key={label} className="relative">
                        <select value={value} onChange={e => set(e.target.value)}
                            className="appearance-none bg-card-theme border border-theme rounded-xl px-4 py-2.5 pr-9 text-sm text-theme-secondary focus:outline-none focus:border-orange-500/50 cursor-pointer">
                            {opts.map(o => <option key={o} value={o} className="bg-gray-900">{o === 'all' ? `All ${label}s` : o}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-theme overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-theme bg-card-theme">
                            <th className="text-left p-4 w-8">
                                <input type="checkbox" checked={allSelected} onChange={e => setSelected(e.target.checked ? filtered.map(u => u.id) : [])} className="accent-orange-500" />
                            </th>
                            {['User', 'Status', 'Tier', 'Access', 'Country', 'Joined', 'Actions'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(user => (
                            <tr key={user.id} className="border-b border-theme hover:bg-card-theme transition-colors">
                                <td className="p-4">
                                    <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleSelect(user.id)} className="accent-orange-500" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-[11px] font-bold  flex-shrink-0">{user.avatar}</div>
                                        <div>
                                            <p className="text-sm font-bold text-theme-primary">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[user.status]}`}>{user.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-bold ${TIER_COLORS[user.tier] || 'text-theme-secondary'}`}>{user.tier}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <span title="Voice" className={`w-6 h-6 rounded flex items-center justify-center ${user.voiceAccess ? 'bg-orange-500/10 text-orange-500' : 'bg-card-theme text-gray-700'}`}>
                                            <Mic className="w-3 h-3" />
                                        </span>
                                        <span title="Video" className={`w-6 h-6 rounded flex items-center justify-center ${user.videoAccess ? 'bg-cyan-500/10 text-cyan-400' : 'bg-card-theme text-gray-700'}`}>
                                            <Video className="w-3 h-3" />
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">{user.country}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{new Date(user.joinDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <div className="relative">
                                        <button onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)} className="p-1.5 rounded-lg hover:bg-card-theme text-gray-500 hover:text-theme-primary transition">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                        {actionMenu === user.id && (
                                            <div className="absolute right-0 top-8 z-20 w-44 bg-gray-900 border border-theme rounded-xl shadow-2xl overflow-hidden">
                                                {user.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => doAction(user.id, 'approve')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-400 hover:bg-card-theme transition">
                                                            <UserCheck className="w-3.5 h-3.5" /> Approve
                                                        </button>
                                                        <button onClick={() => doAction(user.id, 'reject')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-card-theme transition">
                                                            <UserX className="w-3.5 h-3.5" /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {user.status === 'active' && (
                                                    <button onClick={() => doAction(user.id, 'suspend')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-orange-400 hover:bg-card-theme transition">
                                                        <PauseCircle className="w-3.5 h-3.5" /> Suspend
                                                    </button>
                                                )}
                                                {user.status === 'suspended' && (
                                                    <button onClick={() => doAction(user.id, 'restore')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-400 hover:bg-card-theme transition">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Restore
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="text-center py-16 text-gray-600">
                        <User className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p>No users match your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
