'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ServiceStatus = 'UP' | 'DOWN';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'rejected';
export type SubscriptionStatus = 'active' | 'pending' | 'paused' | 'cancelled' | 'restricted';
export type PaymentStatus = 'paid' | 'failed' | 'pending' | 'refunded';
export type BillingCycle = 'monthly' | 'annual';
export type ApprovalMode = 'auto' | 'manual';

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  tier: string;
  joinDate: string;
  country: string;
  voiceAccess: boolean;
  videoAccess: boolean;
  avatar: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  tier: string;
  startDate: string;
  renewalDate: string;
  paymentStatus: PaymentStatus;
  status: SubscriptionStatus;
  features: { voice: boolean; video: boolean; api: boolean; priority: boolean };
  history: { date: string; action: string; by: string }[];
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
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  details: string;
  category: 'subscription' | 'user' | 'tier' | 'gate' | 'alert';
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const USERS: User[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah@techcorp.com', status: 'active', tier: 'Pro', joinDate: '2025-11-12', country: 'US', voiceAccess: true, videoAccess: true, avatar: 'SC' },
  { id: 'u2', name: 'Marcus Rivera', email: 'marcus@studio.io', status: 'active', tier: 'Enterprise', joinDate: '2025-10-03', country: 'BR', voiceAccess: true, videoAccess: true, avatar: 'MR' },
  { id: 'u3', name: 'Priya Kapoor', email: 'priya@startupx.in', status: 'pending', tier: 'Pro', joinDate: '2026-03-15', country: 'IN', voiceAccess: false, videoAccess: false, avatar: 'PK' },
  { id: 'u4', name: 'Jake Thompson', email: 'jake@freelance.net', status: 'suspended', tier: 'Free', joinDate: '2025-08-21', country: 'UK', voiceAccess: false, videoAccess: false, avatar: 'JT' },
  { id: 'u5', name: 'Aisha Nwosu', email: 'aisha@media.ng', status: 'active', tier: 'Pro', joinDate: '2025-12-01', country: 'NG', voiceAccess: true, videoAccess: true, avatar: 'AN' },
  { id: 'u6', name: 'Lena Schmidt', email: 'lena@creative.de', status: 'pending', tier: 'Enterprise', joinDate: '2026-03-17', country: 'DE', voiceAccess: false, videoAccess: false, avatar: 'LS' },
  { id: 'u7', name: 'Ryo Tanaka', email: 'ryo@media.jp', status: 'active', tier: 'Free', joinDate: '2026-01-08', country: 'JP', voiceAccess: true, videoAccess: false, avatar: 'RT' },
  { id: 'u8', name: 'Omar Al-Farsi', email: 'omar@content.ae', status: 'rejected', tier: 'Pro', joinDate: '2026-02-20', country: 'AE', voiceAccess: false, videoAccess: false, avatar: 'OA' },
  { id: 'u9', name: 'Elena Vasquez', email: 'elena@vid.mx', status: 'active', tier: 'Enterprise', joinDate: '2025-09-15', country: 'MX', voiceAccess: true, videoAccess: true, avatar: 'EV' },
  { id: 'u10', name: 'Daniel Park', email: 'daniel@creator.kr', status: 'active', tier: 'Pro', joinDate: '2026-01-28', country: 'KR', voiceAccess: true, videoAccess: true, avatar: 'DP' },
];

const SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', userId: 'u1', userName: 'Sarah Chen', userEmail: 'sarah@techcorp.com', tier: 'Pro', startDate: '2025-11-12', renewalDate: '2026-04-12', paymentStatus: 'paid', status: 'active', features: { voice: true, video: true, api: false, priority: true }, history: [{ date: '2025-11-12', action: 'Subscription created', by: 'System' }, { date: '2025-12-12', action: 'Renewed', by: 'System' }] },
  { id: 's2', userId: 'u2', userName: 'Marcus Rivera', userEmail: 'marcus@studio.io', tier: 'Enterprise', startDate: '2025-10-03', renewalDate: '2026-10-03', paymentStatus: 'paid', status: 'active', features: { voice: true, video: true, api: true, priority: true }, history: [{ date: '2025-10-03', action: 'Subscription created', by: 'Admin' }] },
  { id: 's3', userId: 'u3', userName: 'Priya Kapoor', userEmail: 'priya@startupx.in', tier: 'Pro', startDate: '2026-03-15', renewalDate: '2026-04-15', paymentStatus: 'pending', status: 'pending', features: { voice: false, video: false, api: false, priority: false }, history: [{ date: '2026-03-15', action: 'Subscription request submitted', by: 'User' }] },
  { id: 's4', userId: 'u5', userName: 'Aisha Nwosu', userEmail: 'aisha@media.ng', tier: 'Pro', startDate: '2025-12-01', renewalDate: '2026-04-01', paymentStatus: 'paid', status: 'active', features: { voice: true, video: true, api: false, priority: false }, history: [{ date: '2025-12-01', action: 'Subscription created', by: 'System' }] },
  { id: 's5', userId: 'u6', userName: 'Lena Schmidt', userEmail: 'lena@creative.de', tier: 'Enterprise', startDate: '2026-03-17', renewalDate: '2027-03-17', paymentStatus: 'pending', status: 'pending', features: { voice: false, video: false, api: false, priority: false }, history: [{ date: '2026-03-17', action: 'Enterprise subscription request', by: 'User' }] },
  { id: 's6', userId: 'u9', userName: 'Elena Vasquez', userEmail: 'elena@vid.mx', tier: 'Enterprise', startDate: '2025-09-15', renewalDate: '2026-09-15', paymentStatus: 'paid', status: 'active', features: { voice: true, video: true, api: true, priority: true }, history: [{ date: '2025-09-15', action: 'Subscription created', by: 'Admin' }] },
  { id: 's7', userId: 'u10', userName: 'Daniel Park', userEmail: 'daniel@creator.kr', tier: 'Pro', startDate: '2026-01-28', renewalDate: '2026-04-28', paymentStatus: 'failed', status: 'restricted', features: { voice: true, video: true, api: false, priority: false }, history: [{ date: '2026-01-28', action: 'Subscription created', by: 'System' }, { date: '2026-03-28', action: 'Payment failed — restricted', by: 'System' }] },
];

const TIERS: Tier[] = [
  { id: 't1', name: 'Free', price: 0, billingCycle: 'monthly', trialDays: 0, maxUsers: 1000, features: { voice: true, video: false, api: false, priority: false }, quotas: { voiceCharsPerDay: 500, videoMinsPerMonth: 0, apiCallsPerDay: 0, storageMB: 100 }, approvalMode: 'auto', color: '#6b7280' },
  { id: 't2', name: 'Pro', price: 29, billingCycle: 'monthly', trialDays: 14, maxUsers: 500, features: { voice: true, video: true, api: false, priority: true }, quotas: { voiceCharsPerDay: 10000, videoMinsPerMonth: 60, apiCallsPerDay: 0, storageMB: 5120 }, approvalMode: 'auto', color: '#9333ea' },
  { id: 't3', name: 'Enterprise', price: 199, billingCycle: 'annual', trialDays: 30, maxUsers: 50, features: { voice: true, video: true, api: true, priority: true }, quotas: { voiceCharsPerDay: 100000, videoMinsPerMonth: 600, apiCallsPerDay: 10000, storageMB: 51200 }, approvalMode: 'manual', color: '#f59e0b' },
];

const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', timestamp: '2026-03-18T10:30:00Z', admin: 'admin@nyx.ai', action: 'Subscription approved', target: 'Sarah Chen (u1)', details: 'Pro plan approved — auto', category: 'subscription' },
  { id: 'a2', timestamp: '2026-03-18T09:15:00Z', admin: 'admin@nyx.ai', action: 'Feature gate toggled', target: 'Video Generation', details: 'Toggled OFF — service maintenance', category: 'gate' },
  { id: 'a3', timestamp: '2026-03-17T22:00:00Z', admin: 'admin@nyx.ai', action: 'User suspended', target: 'Jake Thompson (u4)', details: 'Violation of TOS section 4.2', category: 'user' },
  { id: 'a4', timestamp: '2026-03-17T18:45:00Z', admin: 'admin@nyx.ai', action: 'Tier created', target: 'Enterprise tier', details: 'New Enterprise tier with API access', category: 'tier' },
  { id: 'a5', timestamp: '2026-03-17T14:20:00Z', admin: 'admin@nyx.ai', action: 'Subscription rejected', target: 'Omar Al-Farsi (u8)', details: 'High-risk account detected', category: 'subscription' },
  { id: 'a6', timestamp: '2026-03-16T11:30:00Z', admin: 'admin@nyx.ai', action: 'Alert config changed', target: 'Payment failure alert', details: 'Enabled Slack channel notification', category: 'alert' },
  { id: 'a7', timestamp: '2026-03-15T09:00:00Z', admin: 'admin@nyx.ai', action: 'Tier edited', target: 'Pro tier', details: 'Increased video minutes from 30 to 60/month', category: 'tier' },
  { id: 'a8', timestamp: '2026-03-14T16:10:00Z', admin: 'admin@nyx.ai', action: 'Manual tier override', target: 'Marcus Rivera (u2)', details: 'Upgraded from Pro to Enterprise', category: 'subscription' },
];

const ALERT_CONFIGS: AlertConfig[] = [
  { id: 'al1', label: 'Service goes DOWN (Voice or Video)', enabled: true, channels: { email: true, slack: true, inApp: true } },
  { id: 'al2', label: 'New subscription pending approval', enabled: true, channels: { email: true, slack: false, inApp: true }, threshold: '2 hours' },
  { id: 'al3', label: 'Payment failure', enabled: true, channels: { email: true, slack: true, inApp: true } },
  { id: 'al4', label: 'Unusual usage spike (3x normal in 1hr)', enabled: false, channels: { email: false, slack: false, inApp: true }, threshold: '3x' },
  { id: 'al5', label: 'Subscription expiring soon', enabled: true, channels: { email: true, slack: false, inApp: false }, threshold: '7 days' },
  { id: 'al6', label: 'New Enterprise tier signup', enabled: true, channels: { email: true, slack: true, inApp: true } },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface AdminStore {
  voiceService: ServiceStatus;
  videoService: ServiceStatus;
  setVoiceService: (s: ServiceStatus) => void;
  setVideoService: (s: ServiceStatus) => void;
  users: User[];
  updateUser: (id: string, patch: Partial<User>) => void;
  subscriptions: Subscription[];
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  tiers: Tier[];
  updateTier: (id: string, patch: Partial<Tier>) => void;
  addTier: (t: Tier) => void;
  deleteTier: (id: string) => void;
  auditLog: AuditEntry[];
  addAudit: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  alertConfigs: AlertConfig[];
  updateAlert: (id: string, patch: Partial<AlertConfig>) => void;
  featureGates: FeatureGates;
  setFeatureGates: (fg: FeatureGates) => void;
  notifications: { id: string; message: string; type: 'info' | 'warning' | 'success' | 'error' }[];
  addNotification: (msg: string, type: 'info' | 'warning' | 'success' | 'error') => void;
  dismissNotification: (id: string) => void;
}

const AdminContext = createContext<AdminStore | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [voiceService, setVoiceServiceRaw] = useState<ServiceStatus>('UP');
  const [videoService, setVideoServiceRaw] = useState<ServiceStatus>('DOWN'); // Demo: video is down
  const [users, setUsers] = useState<User[]>(USERS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(SUBSCRIPTIONS);
  const [tiers, setTiers] = useState<Tier[]>(TIERS);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(AUDIT_LOG);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>(ALERT_CONFIGS);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'warning' | 'success' | 'error' }[]>([
    { id: 'n0', message: '⚠️ Video Generation is DOWN — subscriptions requiring video are restricted.', type: 'warning' },
  ]);
  const [featureGates, setFeatureGates] = useState<FeatureGates>({
    voiceGlobal: true,
    videoGlobal: false,
    perTier: {
      't1': { voice: true, video: false, api: false, priority: false },
      't2': { voice: true, video: true, api: false, priority: true },
      't3': { voice: true, video: true, api: true, priority: true },
    },
  });

  const addNotification = useCallback((message: string, type: 'info' | 'warning' | 'success' | 'error') => {
    const id = `n${Date.now()}`;
    setNotifications(prev => [{ id, message, type }, ...prev].slice(0, 8));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addAudit = useCallback((entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    setAuditLog(prev => [{
      ...entry,
      id: `a${Date.now()}`,
      timestamp: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const setVoiceService = useCallback((s: ServiceStatus) => {
    setVoiceServiceRaw(s);
    setFeatureGates(fg => ({ ...fg, voiceGlobal: s === 'UP' }));
    if (s === 'DOWN') {
      setSubscriptions(sub => sub.map(s2 =>
        s2.features.voice && s2.status === 'active' ? { ...s2, status: 'restricted' } : s2
      ));
      addNotification('🔴 Voice Generation went DOWN — affected subscriptions restricted', 'warning');
      addAudit({ admin: 'admin@nyx.ai', action: 'Feature gate toggled', target: 'Voice Generation', details: 'Turned OFF — auto-restricting affected subscriptions', category: 'gate' });
    } else {
      setSubscriptions(sub => sub.map(s2 =>
        s2.status === 'restricted' ? { ...s2, status: 'active' } : s2
      ));
      addNotification('✅ Voice Generation restored — subscriptions re-activated', 'success');
      addAudit({ admin: 'admin@nyx.ai', action: 'Feature gate toggled', target: 'Voice Generation', details: 'Turned ON — subscriptions restored', category: 'gate' });
    }
  }, [addNotification, addAudit]);

  const setVideoService = useCallback((s: ServiceStatus) => {
    setVideoServiceRaw(s);
    setFeatureGates(fg => ({ ...fg, videoGlobal: s === 'UP' }));
    if (s === 'DOWN') {
      setSubscriptions(sub => sub.map(s2 =>
        s2.features.video && s2.status === 'active' ? { ...s2, status: 'restricted' } : s2
      ));
      addNotification('🔴 Video Generation went DOWN — affected subscriptions restricted', 'warning');
      addAudit({ admin: 'admin@nyx.ai', action: 'Feature gate toggled', target: 'Video Generation', details: 'Turned OFF — auto-restricting affected subscriptions', category: 'gate' });
    } else {
      setSubscriptions(sub => sub.map(s2 =>
        s2.status === 'restricted' ? { ...s2, status: 'active' } : s2
      ));
      addNotification('✅ Video Generation restored — subscriptions re-activated', 'success');
      addAudit({ admin: 'admin@nyx.ai', action: 'Feature gate toggled', target: 'Video Generation', details: 'Turned ON — subscriptions restored', category: 'gate' });
    }
  }, [addNotification, addAudit]);

  const updateUser = useCallback((id: string, patch: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  }, []);

  const updateSubscription = useCallback((id: string, patch: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, []);

  const updateTier = useCallback((id: string, patch: Partial<Tier>) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const addTier = useCallback((t: Tier) => {
    setTiers(prev => [...prev, t]);
  }, []);

  const deleteTier = useCallback((id: string) => {
    setTiers(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateAlert = useCallback((id: string, patch: Partial<AlertConfig>) => {
    setAlertConfigs(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }, []);

  return (
    <AdminContext.Provider value={{
      voiceService, videoService, setVoiceService, setVideoService,
      users, updateUser,
      subscriptions, updateSubscription,
      tiers, updateTier, addTier, deleteTier,
      auditLog, addAudit,
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
