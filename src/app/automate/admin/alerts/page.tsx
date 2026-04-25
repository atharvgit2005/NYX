'use client';

import { useAdmin } from '@/context/AdminContext';
import { Bell, Mail, Slack, Monitor } from 'lucide-react';

const TRIGGER_DESCRIPTIONS: Record<string, string> = {
    al1: 'Instantly alerts when Voice or Video service goes DOWN.',
    al2: 'Alerts when a subscription request has been pending for too long.',
    al3: 'Triggered immediately when a user payment fails.',
    al4: 'Triggered when an account shows 3x normal usage in a 1-hour window.',
    al5: 'Reminds admins before a subscription expires so they can act.',
    al6: 'Notifies when a new user requests an Enterprise plan.',
};

const CHANNEL_ICONS = { email: Mail, slack: ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg>, inApp: Monitor };

function Toggle2({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-700'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${checked ? 'left-5' : 'left-0.5'}`} />
        </button>
    );
}

export default function AlertsPage() {
    const { alertConfigs, updateAlert, addAudit, addNotification } = useAdmin();

    const toggleAlert = (id: string, field: string, value: boolean) => {
        const alert = alertConfigs.find(a => a.id === id)!;
        if (field === 'enabled') {
            updateAlert(id, { enabled: value });
            addAudit({ admin: 'admin@nyx.ai', action: 'Alert config changed', target: alert.label, details: `Alert ${value ? 'enabled' : 'disabled'}`, category: 'alert' });
        } else {
            const [, channel] = field.split('.');
            updateAlert(id, { channels: { ...alert.channels, [channel]: value } });
            addAudit({ admin: 'admin@nyx.ai', action: 'Alert config changed', target: alert.label, details: `${channel} channel ${value ? 'enabled' : 'disabled'}`, category: 'alert' });
        }
        addNotification(`⚙️ Alert setting updated`, 'info');
    };

    const enabledCount = alertConfigs.filter(a => a.enabled).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-theme-primary">Alerts & Notifications</h1>
                <p className="text-gray-500 mt-1">{enabledCount} of {alertConfigs.length} alert triggers active</p>
            </div>

            {/* Channel Legend */}
            <div className="rounded-2xl border border-theme bg-card-theme p-5">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4">Notification Channels</p>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { key: 'email', label: 'Email', desc: 'Sends to admin@nyx.ai', color: '#f97316', Icon: Mail },
                        { key: 'slack', label: 'Slack Webhook', desc: 'Posts to #alerts channel', color: '#f59e0b', Icon: CHANNEL_ICONS.slack },
                        { key: 'inApp', label: 'In-App Bell', desc: 'Shows in admin panel notification bar', color: '#06b6d4', Icon: Monitor },
                    ].map(({ key, label, desc, color, Icon }) => (
                        <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-card-theme border border-theme">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                                <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-theme-primary">{label}</p>
                                <p className="text-[10px] text-gray-500">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alert Triggers */}
            <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Trigger Rules</p>
                {alertConfigs.map(alert => (
                    <div key={alert.id} className={`rounded-2xl border p-5 transition-all ${alert.enabled ? 'border-theme bg-card-theme' : 'border-theme bg-card-theme opacity-60'}`}>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                <Bell className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <p className="text-sm font-bold text-theme-primary">{alert.label}</p>
                                    <Toggle2 checked={alert.enabled} onChange={() => toggleAlert(alert.id, 'enabled', !alert.enabled)} />
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{TRIGGER_DESCRIPTIONS[alert.id]}</p>
                                {alert.threshold && (
                                    <p className="text-xs text-orange-500/60 mb-3">Threshold: <span className="text-orange-500 font-bold">{alert.threshold}</span></p>
                                )}
                                <div className="flex items-center gap-4">
                                    <p className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">via:</p>
                                    {(Object.entries(alert.channels) as [keyof typeof alert.channels, boolean][]).map(([ch, val]) => {
                                        const Icon = CHANNEL_ICONS[ch];
                                        return (
                                            <button key={ch} onClick={() => toggleAlert(alert.id, `channels.${ch}`, !val)} disabled={!alert.enabled}
                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold capitalize transition ${val ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-card-theme border-theme text-gray-600'} disabled:cursor-not-allowed`}>
                                                <Icon className="w-3 h-3 flex-shrink-0" />
                                                {ch}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
