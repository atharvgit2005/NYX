'use client';

import { useAdmin } from '@/context/AdminContext';
import { Mic, Video, Code2, Zap, AlertTriangle, Info, Shield } from 'lucide-react';

const FEATURE_DEFS = [
    { key: 'voice', label: 'Voice Generation', icon: Mic, color: '#f97316' },
    { key: 'video', label: 'Video Generation', icon: Video, color: '#06b6d4' },
    { key: 'api', label: 'API Access', icon: Code2, color: '#10b981' },
    { key: 'priority', label: 'Priority Queue', icon: Zap, color: '#f59e0b' },
];

export default function GatesPage() {
    const { voiceService, videoService, setVoiceService, setVideoService, featureGates, setFeatureGates, tiers, subscriptions } = useAdmin();

    const affectedVoice = subscriptions.filter(s => s.features.voice && s.status !== 'cancelled').length;
    const affectedVideo = subscriptions.filter(s => s.features.video && s.status !== 'cancelled').length;

    const toggleGlobal = (service: 'voice' | 'video') => {
        if (service === 'voice') setVoiceService(voiceService === 'UP' ? 'DOWN' : 'UP');
        else setVideoService(videoService === 'UP' ? 'DOWN' : 'UP');
    };

    const toggleTierFeature = (tierId: string, feature: string, value: boolean) => {
        const current = featureGates.perTier[tierId] || { voice: false, video: false, api: false, priority: false };
        setFeatureGates({
            ...featureGates,
            perTier: {
                ...featureGates.perTier,
                [tierId]: { ...current, [feature]: value },
            },
        });
    };

    const isServiceDown = voiceService === 'DOWN' || videoService === 'DOWN';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-theme-primary">Feature Gate Control</h1>
                <p className="text-gray-500 mt-1">Global service switches and per-tier feature permissions</p>
            </div>

            {/* AND Gate Rule Explainer */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 flex items-start gap-4">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-bold text-blue-300 mb-1">Access Gate Rule (AND logic)</p>
                    <p className="text-blue-400/80">A subscription grants <strong>full access only when</strong>: Voice is <strong>UP</strong> AND Video is <strong>UP</strong> AND the user's tier includes both AND the subscription is approved and active. Any condition failing = restricted access.</p>
                </div>
            </div>

            {isServiceDown && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-sm">
                        <p className="font-bold text-red-300 mb-1">Service Restriction Active</p>
                        <p className="text-red-400/80">
                            {voiceService === 'DOWN' && `Voice Generation is DOWN — ${affectedVoice} subscriptions auto-restricted. `}
                            {videoService === 'DOWN' && `Video Generation is DOWN — ${affectedVideo} subscriptions auto-restricted. `}
                            Users have been notified automatically. Restore the service to re-activate subscriptions.
                        </p>
                    </div>
                </div>
            )}

            {/* Global Toggles */}
            <div>
                <h2 className="text-sm font-black text-theme-secondary uppercase tracking-wider mb-4">Global Service Toggles</h2>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { key: 'voice', label: 'Voice Generation', desc: 'Controls voice synthesis for ALL users globally', status: voiceService, icon: Mic, affected: affectedVoice, color: '#f97316' },
                        { key: 'video', label: 'Video Generation', desc: 'Controls video creation for ALL users globally', status: videoService, icon: Video, affected: affectedVideo, color: '#06b6d4' },
                    ].map(({ key, label, desc, status, icon: Icon, affected, color }) => (
                        <div key={key} className={`rounded-2xl border p-6 ${status === 'UP' ? 'border-theme bg-card-theme' : 'border-red-500/20 bg-red-500/5'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                                        <Icon className="w-5 h-5" style={{ color }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-theme-primary">{label}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`w-2 h-2 rounded-full ${status === 'UP' ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
                                            <span className={`text-xs font-bold ${status === 'UP' ? 'text-green-400' : 'text-red-400'}`}>{status}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => toggleGlobal(key as 'voice' | 'video')}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${status === 'UP' ? 'bg-green-500' : 'bg-gray-700'}`}>
                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${status === 'UP' ? 'left-8' : 'left-1'}`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">{desc}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-card-theme rounded-lg px-3 py-2">
                                <Shield className="w-3.5 h-3.5" />
                                <span>{affected} subscriptions {status === 'DOWN' ? 'currently restricted' : 'would be affected if toggled OFF'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Per-Tier Feature Matrix */}
            <div>
                <h2 className="text-sm font-black text-theme-secondary uppercase tracking-wider mb-4">Per-Tier Feature Matrix</h2>
                <p className="text-xs text-gray-600 mb-4">Global toggles above override this matrix. Even if a tier has a feature enabled here, if the global toggle is OFF, users won't have access.</p>

                <div className="rounded-2xl border border-theme overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-theme bg-card-theme">
                                <th className="text-left p-4 pl-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Tier</th>
                                {FEATURE_DEFS.map(f => (
                                    <th key={f.key} className="text-center p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <div className="flex flex-col items-center gap-1">
                                            <f.icon className="w-4 h-4" style={{ color: f.color }} />
                                            {f.label}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tiers.map(tier => {
                                const gates = featureGates.perTier[tier.id] || { voice: false, video: false, api: false, priority: false };
                                return (
                                    <tr key={tier.id} className="border-b border-theme hover:bg-card-theme transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-theme-primary" style={{ background: `${tier.color}33` }}>
                                                    {tier.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-theme-primary">{tier.name}</p>
                                                    <p className="text-xs text-gray-600">${tier.price}/{tier.billingCycle}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {FEATURE_DEFS.map(f => {
                                            const enabled = gates[f.key as keyof typeof gates];
                                            const globalDown = (f.key === 'voice' && voiceService === 'DOWN') || (f.key === 'video' && videoService === 'DOWN');
                                            return (
                                                <td key={f.key} className="p-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <button
                                                            onClick={() => toggleTierFeature(tier.id, f.key, !enabled)}
                                                            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-green-500' : 'bg-gray-700'} ${globalDown ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                            disabled={globalDown}
                                                        >
                                                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${enabled ? 'left-5' : 'left-0.5'}`} />
                                                        </button>
                                                        {globalDown && <span className="text-[9px] text-red-500 font-bold">GLOBAL OFF</span>}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
