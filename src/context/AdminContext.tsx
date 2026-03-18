'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Types (unchanged) ────────────────────────────────────────────────────────

export type ServiceStatus = 'UP' | 'DOWN';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'rejected';
export type SubscriptionStatus = 'active' | 'pending' | 'paused' | 'cancelled' | 'restricted';
export type PaymentStatus = 'paid' | 'failed' | 'pending' | 'refunded';
export type BillingCycle = 'monthly' | 'annual';
export type ApprovalMode = 'auto' | 'manual';

export interface AdminUser {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    country: string | null;
    createdAt: string;
    subscription?: {
        tier: string;
        status: string;
        paymentStatus: string;
        features: { voice: boolean; video: boolean; api: boolean; priority: boolean };
        renewalDate: string;
        startDate: string;
    } | null;
}

export interface AdminSubscription {
    id: string;
    userId: string;
    tier: string;
    status: string;
    paymentStatus: string;
    features: { voice: boolean; video: boolean; api: boolean; priority: boolean };
    startDate: string;
    renewalDate: string;
    user: { name: string | null; email: string };
}

export interface Tier {
    id: string;
    name: string;
    price: number;
    billingCycle: BillingCycle;
    trialDays: number;
    maxUsers: number;
    features: { voice: boolean; video: boolean; api: boolean; priority: boolean };
    quotas: { voiceCharsPerDay: number; videoMinsPerMonth: number; apiCallsPerDay: number; storageMB: number };
    approvalMode: ApprovalMode;
    color: string;
}

export interface AuditEntry {
    id: string;
    createdAt: string;
    admin: string;
    action: string;
    target: string;
    details: string;
    category: string;
}

export interface AlertConfig {
    id: string;
    label: string;
    enabled: boolean;
    channels: { email: boolean; slack: boolean; inApp: boolean };
    threshold?: string;
}

export interface FeatureGates {
    voiceGlobal: boolean;
    videoGlobal: boolean;
    perTier: Record<string, { voice: boolean; video: boolean; api: boolean; priority: boolean }>;
}

// ─── Default tiers (config-driven, not DB) ───────────────────────────────────

const DEFAULT_TIERS: Tier[] = [
    { id: 't1', name: 'Free', price: 0, billingCycle: 'monthly', trialDays: 0, maxUsers: 1000, features: { voice: true, video: false, api: false, priority: false }, quotas: { voiceCharsPerDay: 500, videoMinsPerMonth: 0, apiCallsPerDay: 0, storageMB: 100 }, approvalMode: 'auto', color: '#6b7280' },
    { id: 't2', name: 'Pro', price: 29, billingCycle: 'monthly', trialDays: 14, maxUsers: 500, features: { voice: true, video: true, api: false, priority: true }, quotas: { voiceCharsPerDay: 10000, videoMinsPerMonth: 60, apiCallsPerDay: 0, storageMB: 5120 }, approvalMode: 'auto', color: '#9333ea' },
    { id: 't3', name: 'Enterprise', price: 199, billingCycle: 'annual', trialDays: 30, maxUsers: 50, features: { voice: true, video: true, api: true, priority: true }, quotas: { voiceCharsPerDay: 100000, videoMinsPerMonth: 600, apiCallsPerDay: 10000, storageMB: 51200 }, approvalMode: 'manual', color: '#f59e0b' },
];

const DEFAULT_ALERT_CONFIGS: AlertConfig[] = [
    { id: 'al1', label: 'Service goes DOWN (Voice or Video)', enabled: true, channels: { email: true, slack: true, inApp: true } },
    { id: 'al2', label: 'New subscription pending approval', enabled: true, channels: { email: true, slack: false, inApp: true }, threshold: '2 hours' },
    { id: 'al3', label: 'Payment failure', enabled: true, channels: { email: true, slack: true, inApp: true } },
    { id: 'al4', label: 'Unusual usage spike (3x normal in 1hr)', enabled: false, channels: { email: false, slack: false, inApp: true }, threshold: '3x' },
    { id: 'al5', label: 'Subscription expiring soon', enabled: true, channels: { email: true, slack: false, inApp: false }, threshold: '7 days' },
    { id: 'al6', label: 'New Enterprise tier signup', enabled: true, channels: { email: true, slack: true, inApp: true } },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface AdminStore {
    // Service state
    voiceService: ServiceStatus;
    videoService: ServiceStatus;
    setVoiceService: (s: ServiceStatus) => void;
    setVideoService: (s: ServiceStatus) => void;
    // Real data
    users: AdminUser[];
    subscriptions: AdminSubscription[];
    loadingUsers: boolean;
    loadingSubscriptions: boolean;
    refreshUsers: () => void;
    refreshSubscriptions: () => void;
    // User actions
    updateUserRemote: (userId: string, patch: Record<string, any>) => Promise<void>;
    updateSubscriptionRemote: (subscriptionId: string, patch: Record<string, any>) => Promise<void>;
    // Tiers (config-driven)
    tiers: Tier[];
    updateTier: (id: string, patch: Partial<Tier>) => void;
    addTier: (t: Tier) => void;
    deleteTier: (id: string) => void;
    // Audit
    auditLog: AuditEntry[];
    refreshAuditLog: () => void;
    addAudit: (entry: Omit<AuditEntry, 'id' | 'createdAt'>) => Promise<void>;
    // Alerts
    alertConfigs: AlertConfig[];
    updateAlert: (id: string, patch: Partial<AlertConfig>) => void;
    // Feature gates
    featureGates: FeatureGates;
    setFeatureGates: (fg: FeatureGates) => void;
    // Notifications
    notifications: { id: string; message: string; type: 'info' | 'warning' | 'success' | 'error' }[];
    addNotification: (msg: string, type: 'info' | 'warning' | 'success' | 'error') => void;
    dismissNotification: (id: string) => void;
}

const AdminContext = createContext<AdminStore | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    // Service health
    const [voiceService, setVoiceServiceRaw] = useState<ServiceStatus>('UP');
    const [videoService, setVideoServiceRaw] = useState<ServiceStatus>('UP');

    // Real data from API
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

    // Config-driven state
    const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
    const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>(DEFAULT_ALERT_CONFIGS);
    const [featureGates, setFeatureGatesState] = useState<FeatureGates>({
        voiceGlobal: true,
        videoGlobal: true,
        perTier: {
            't1': { voice: true, video: false, api: false, priority: false },
            't2': { voice: true, video: true, api: false, priority: true },
            't3': { voice: true, video: true, api: true, priority: true },
        },
    });
    const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'warning' | 'success' | 'error' }[]>([]);

    // ─── Notifications ──────────────────────────────────────────────────────

    const addNotification = useCallback((message: string, type: 'info' | 'warning' | 'success' | 'error') => {
        const id = `n${Date.now()}`;
        setNotifications(prev => [{ id, message, type }, ...prev].slice(0, 8));
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // ─── Audit ──────────────────────────────────────────────────────────────

    const addAudit = useCallback(async (entry: Omit<AuditEntry, 'id' | 'createdAt'>) => {
        try {
            const res = await fetch('/api/admin/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
            });
            if (res.ok) {
                const { log } = await res.json();
                setAuditLog(prev => [log, ...prev]);
            }
        } catch (e) {
            console.error('Failed to write audit log', e);
        }
    }, []);

    const refreshAuditLog = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/audit');
            if (res.ok) {
                const { logs } = await res.json();
                setAuditLog(logs || []);
            }
        } catch (e) { console.error('Failed to fetch audit log', e); }
    }, []);

    // ─── Users ──────────────────────────────────────────────────────────────

    const refreshUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const { users: data } = await res.json();
                setUsers(data || []);
            }
        } catch (e) { console.error('Failed to fetch users', e); }
        finally { setLoadingUsers(false); }
    }, []);

    const updateUserRemote = useCallback(async (userId: string, patch: Record<string, any>) => {
        const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, patch }),
        });
        if (!res.ok) throw new Error('Failed to update user');
        await refreshUsers();
    }, [refreshUsers]);

    // ─── Subscriptions ──────────────────────────────────────────────────────

    const refreshSubscriptions = useCallback(async () => {
        setLoadingSubscriptions(true);
        try {
            const res = await fetch('/api/admin/subscriptions');
            if (res.ok) {
                const { subscriptions: data } = await res.json();
                setSubscriptions(data || []);
            }
        } catch (e) { console.error('Failed to fetch subscriptions', e); }
        finally { setLoadingSubscriptions(false); }
    }, []);

    const updateSubscriptionRemote = useCallback(async (subscriptionId: string, patch: Record<string, any>) => {
        const res = await fetch('/api/admin/subscriptions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscriptionId, patch }),
        });
        if (!res.ok) throw new Error('Failed to update subscription');
        await refreshSubscriptions();
    }, [refreshSubscriptions]);

    // ─── Feature Gates ──────────────────────────────────────────────────────

    const setFeatureGates = useCallback(async (fg: FeatureGates) => {
        setFeatureGatesState(fg);
        // Persist to DB
        try {
            await fetch('/api/admin/gates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'voiceGlobal', value: fg.voiceGlobal }),
            });
            await fetch('/api/admin/gates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'videoGlobal', value: fg.videoGlobal }),
            });
            await fetch('/api/admin/gates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'tierMatrix', value: fg.perTier }),
            });
        } catch (e) { console.error('Failed to persist feature gates', e); }
    }, []);

    // Service toggles with subscription cascade
    const setVoiceService = useCallback((s: ServiceStatus) => {
        setVoiceServiceRaw(s);
        const fg = { ...featureGates, voiceGlobal: s === 'UP' };
        setFeatureGates(fg);
        if (s === 'DOWN') {
            addNotification('🔴 Voice Generation went DOWN — affected subscriptions restricted', 'warning');
            addAudit({ admin: 'admin', action: 'Feature gate toggled', target: 'Voice Generation', details: 'Turned OFF — auto-restricting affected subscriptions', category: 'gate' });
        } else {
            addNotification('✅ Voice Generation restored', 'success');
            addAudit({ admin: 'admin', action: 'Feature gate toggled', target: 'Voice Generation', details: 'Turned ON — subscriptions restored', category: 'gate' });
        }
    }, [featureGates, setFeatureGates, addNotification, addAudit]);

    const setVideoService = useCallback((s: ServiceStatus) => {
        setVideoServiceRaw(s);
        const fg = { ...featureGates, videoGlobal: s === 'UP' };
        setFeatureGates(fg);
        if (s === 'DOWN') {
            addNotification('🔴 Video Generation went DOWN — affected subscriptions restricted', 'warning');
            addAudit({ admin: 'admin', action: 'Feature gate toggled', target: 'Video Generation', details: 'Turned OFF — auto-restricting affected subscriptions', category: 'gate' });
        } else {
            addNotification('✅ Video Generation restored', 'success');
            addAudit({ admin: 'admin', action: 'Feature gate toggled', target: 'Video Generation', details: 'Turned ON — subscriptions restored', category: 'gate' });
        }
    }, [featureGates, setFeatureGates, addNotification, addAudit]);

    // ─── Tiers (config-driven) ──────────────────────────────────────────────
    const updateTier = useCallback((id: string, patch: Partial<Tier>) => setTiers(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t)), []);
    const addTier = useCallback((t: Tier) => setTiers(prev => [...prev, t]), []);
    const deleteTier = useCallback((id: string) => setTiers(prev => prev.filter(t => t.id !== id)), []);
    const updateAlert = useCallback((id: string, patch: Partial<AlertConfig>) => setAlertConfigs(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a)), []);

    // ─── Load initial data ──────────────────────────────────────────────────
    useEffect(() => {
        refreshUsers();
        refreshSubscriptions();
        refreshAuditLog();

        // Load feature gates from DB
        fetch('/api/admin/gates').then(r => r.json()).then(({ gates }) => {
            if (!gates) return;
            setFeatureGatesState(fg => ({
                voiceGlobal: gates.voiceGlobal ?? fg.voiceGlobal,
                videoGlobal: gates.videoGlobal ?? fg.videoGlobal,
                perTier: gates.tierMatrix ?? fg.perTier,
            }));
            setVoiceServiceRaw(gates.voiceGlobal === false ? 'DOWN' : 'UP');
            setVideoServiceRaw(gates.videoGlobal === false ? 'DOWN' : 'UP');
        }).catch(() => {});
    }, []);

    return (
        <AdminContext.Provider value={{
            voiceService, videoService, setVoiceService, setVideoService,
            users, subscriptions, loadingUsers, loadingSubscriptions,
            refreshUsers, refreshSubscriptions,
            updateUserRemote, updateSubscriptionRemote,
            tiers, updateTier, addTier, deleteTier,
            auditLog, refreshAuditLog, addAudit,
            alertConfigs, updateAlert,
            featureGates, setFeatureGates,
            notifications, addNotification, dismissNotification,
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
    return ctx;
}
