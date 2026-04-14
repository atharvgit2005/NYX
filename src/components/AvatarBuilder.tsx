'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Check, Loader2, Sparkles, RotateCcw } from 'lucide-react';

// ─── Config Type ──────────────────────────────────────────────────────────────

export interface AvatarConfig {
    skinColor: string;
    eyeColor: string;
    hairStyle: 'none' | 'short' | 'spiky' | 'bun';
    hairColor: string;
    outfitColor: string;
    accentColor: string;
    accessory: 'none' | 'glasses' | 'headset' | 'crown';
}

const DEFAULT_CONFIG: AvatarConfig = {
    skinColor: '#c8a882',
    eyeColor: '#f97316',
    hairStyle: 'short',
    hairColor: '#1a0e05',
    outfitColor: '#1e1040',
    accentColor: '#f97316',
    accessory: 'none',
};

// ─── Preset themes ────────────────────────────────────────────────────────────

const PRESETS: { label: string; config: AvatarConfig }[] = [
    { label: 'Neon', config: { skinColor: '#c8a882', eyeColor: '#f97316', hairStyle: 'spiky', hairColor: '#ea580c', outfitColor: '#0f0720', accentColor: '#f97316', accessory: 'none' } },
    { label: 'Cyber', config: { skinColor: '#b5ccd8', eyeColor: '#00fff7', hairStyle: 'bun', hairColor: '#334155', outfitColor: '#0c1a2e', accentColor: '#06b6d4', accessory: 'headset' } },
    { label: 'Gold', config: { skinColor: '#d4a96a', eyeColor: '#f59e0b', hairStyle: 'short', hairColor: '#78350f', outfitColor: '#1c1008', accentColor: '#f59e0b', accessory: 'crown' } },
    { label: 'Reaper', config: { skinColor: '#8c9eb5', eyeColor: '#ef4444', hairStyle: 'none', hairColor: '#1c1c1c', outfitColor: '#0a0a0a', accentColor: '#ef4444', accessory: 'glasses' } },
];

// ─── 3D Avatar Model ──────────────────────────────────────────────────────────

function AvatarModel({ config }: { config: AvatarConfig }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
        }
    });

    const skin = new THREE.MeshStandardMaterial({ color: config.skinColor, roughness: 0.6, metalness: 0.1 });
    const outfit = new THREE.MeshStandardMaterial({ color: config.outfitColor, roughness: 0.4, metalness: 0.3 });
    const accent = new THREE.MeshStandardMaterial({ color: config.accentColor, roughness: 0.2, metalness: 0.8, emissive: config.accentColor, emissiveIntensity: 0.3 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: config.eyeColor, emissive: config.eyeColor, emissiveIntensity: 1.2, roughness: 0, metalness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: config.hairColor, roughness: 0.8, metalness: 0 });
    const white = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.1 });
    const dark = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.6 });
    const gold = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 1, roughness: 0.1, emissive: '#f59e0b', emissiveIntensity: 0.2 });

    return (
        <group ref={groupRef} position={[0, -0.8, 0]}>

            {/* ── Torso ── */}
            <mesh material={outfit} position={[0, 0, 0]}>
                <cylinderGeometry args={[0.42, 0.38, 0.85, 16]} />
            </mesh>
            {/* Chest panel */}
            <mesh material={accent} position={[0, 0.1, 0.42]}>
                <boxGeometry args={[0.32, 0.3, 0.04]} />
            </mesh>
            {/* Chest panel glow strip */}
            <mesh material={eyeMat} position={[0, 0.1, 0.455]}>
                <boxGeometry args={[0.08, 0.22, 0.02]} />
            </mesh>

            {/* ── Shoulders ── */}
            {([-0.55, 0.55] as const).map((x, i) => (
                <group key={i}>
                    <mesh material={outfit} position={[x, 0.3, 0]}>
                        <sphereGeometry args={[0.18, 12, 12]} />
                    </mesh>
                    {/* Accent ring on shoulder */}
                    <mesh material={accent} position={[x, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.18, 0.025, 8, 20]} />
                    </mesh>
                </group>
            ))}

            {/* ── Arms ── */}
            {([-0.62, 0.62] as const).map((x, i) => (
                <group key={i} position={[x, -0.1, 0]} rotation={[0, 0, (i === 0 ? 1 : -1) * 0.12]}>
                    <mesh material={outfit}>
                        <cylinderGeometry args={[0.11, 0.09, 0.65, 12]} />
                    </mesh>
                    {/* Hand */}
                    <mesh material={skin} position={[0, -0.42, 0]}>
                        <sphereGeometry args={[0.1, 12, 12]} />
                    </mesh>
                </group>
            ))}

            {/* ── Neck ── */}
            <mesh material={skin} position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.14, 0.16, 0.22, 12]} />
            </mesh>

            {/* ── Head ── */}
            <group position={[0, 0.92, 0]}>
                {/* Head shape */}
                <mesh material={skin}>
                    <sphereGeometry args={[0.44, 32, 32]} />
                </mesh>
                {/* Jaw slight widening */}
                <mesh material={skin} position={[0, -0.12, 0]}>
                    <sphereGeometry args={[0.38, 32, 32]} />
                </mesh>

                {/* ── Eyes ── */}
                {([-0.16, 0.16] as const).map((x, i) => (
                    <group key={i} position={[x, 0.06, 0.39]}>
                        {/* Eye white */}
                        <mesh material={white}>
                            <sphereGeometry args={[0.085, 16, 16]} />
                        </mesh>
                        {/* Iris */}
                        <mesh material={eyeMat} position={[0, 0, 0.05]}>
                            <sphereGeometry args={[0.055, 16, 16]} />
                        </mesh>
                        {/* Pupil */}
                        <mesh material={dark} position={[0, 0, 0.08]}>
                            <sphereGeometry args={[0.025, 12, 12]} />
                        </mesh>
                    </group>
                ))}

                {/* ── Nose ── */}
                <mesh material={skin} position={[0, -0.04, 0.43]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                </mesh>

                {/* ── Mouth smile ── */}
                <mesh material={dark} position={[0, -0.16, 0.42]} rotation={[0.2, 0, 0]}>
                    <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
                </mesh>

                {/* ── Ears ── */}
                {([-0.44, 0.44] as const).map((x, i) => (
                    <mesh key={i} material={skin} position={[x, 0, 0]}>
                        <sphereGeometry args={[0.09, 12, 12]} />
                    </mesh>
                ))}

                {/* ── Hair ── */}
                {config.hairStyle === 'short' && (
                    <group position={[0, 0.2, 0]}>
                        <mesh material={hairMat} position={[0, 0.06, 0]}>
                            <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                        </mesh>
                        {/* Side/back coverage */}
                        <mesh material={hairMat} position={[0, -0.12, -0.05]}>
                            <sphereGeometry args={[0.46, 32, 16, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.25]} />
                        </mesh>
                    </group>
                )}
                {config.hairStyle === 'spiky' && (
                    <group>
                        {/* Base */}
                        <mesh material={hairMat} position={[0, 0.26, 0]}>
                            <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                        </mesh>
                        {/* Spikes */}
                        {[
                            [0, 0.78, 0, 0],
                            [-0.18, 0.72, 0.1, -0.3],
                            [0.18, 0.72, 0.1, 0.3],
                            [-0.1, 0.72, -0.1, 0.1],
                            [0.1, 0.72, -0.1, -0.1],
                        ].map(([x, y, z, rx], i) => (
                            <mesh key={i} material={hairMat} position={[x as number, y as number, z as number]} rotation={[rx as number, 0, x as number * 0.5]}>
                                <coneGeometry args={[0.07, 0.32, 8]} />
                            </mesh>
                        ))}
                    </group>
                )}
                {config.hairStyle === 'bun' && (
                    <group>
                        <mesh material={hairMat} position={[0, 0.26, 0]}>
                            <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                        </mesh>
                        {/* Bun on top */}
                        <mesh material={hairMat} position={[0, 0.7, -0.1]}>
                            <sphereGeometry args={[0.16, 16, 16]} />
                        </mesh>
                    </group>
                )}
                {/* hairStyle === 'none' → bald (no hair mesh) */}

                {/* ── Accessories ── */}
                {config.accessory === 'glasses' && (
                    <group position={[0, 0.06, 0.42]}>
                        {/* Left lens */}
                        <mesh material={accent} position={[-0.16, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.08, 0.015, 8, 24]} />
                        </mesh>
                        {/* Right lens */}
                        <mesh material={accent} position={[0.16, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.08, 0.015, 8, 24]} />
                        </mesh>
                        {/* Bridge */}
                        <mesh material={accent} position={[0, 0, 0]}>
                            <boxGeometry args={[0.08, 0.015, 0.015]} />
                        </mesh>
                        {/* Arms (to ears) */}
                        <mesh material={accent} position={[-0.28, 0, -0.05]} rotation={[0, 0.2, 0]}>
                            <boxGeometry args={[0.12, 0.01, 0.01]} />
                        </mesh>
                        <mesh material={accent} position={[0.28, 0, -0.05]} rotation={[0, -0.2, 0]}>
                            <boxGeometry args={[0.12, 0.01, 0.01]} />
                        </mesh>
                    </group>
                )}
                {config.accessory === 'headset' && (
                    <group>
                        {/* Headband */}
                        <mesh material={dark} position={[0, 0.44, 0]} rotation={[0, 0, 0]}>
                            <torusGeometry args={[0.46, 0.03, 8, 32, Math.PI]} />
                        </mesh>
                        {/* Ear cups */}
                        {([-0.48, 0.48] as const).map((x, i) => (
                            <mesh key={i} material={accent} position={[x, 0, 0]}>
                                <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
                            </mesh>
                        ))}
                        {/* Mic arm */}
                        <mesh material={dark} position={[0.5, -0.1, 0.2]} rotation={[0.3, 0, -0.4]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
                        </mesh>
                        <mesh material={eyeMat} position={[0.52, -0.22, 0.32]}>
                            <sphereGeometry args={[0.03, 8, 8]} />
                        </mesh>
                    </group>
                )}
                {config.accessory === 'crown' && (
                    <group position={[0, 0.5, 0]}>
                        {/* Crown band */}
                        <mesh material={gold} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.42, 0.045, 8, 32]} />
                        </mesh>
                        {/* Crown points */}
                        {[0, 1, 2, 3, 4].map(i => {
                            const angle = (i / 5) * Math.PI * 2;
                            return (
                                <mesh key={i} material={gold} position={[Math.sin(angle) * 0.42, 0.12, Math.cos(angle) * 0.42]}>
                                    <coneGeometry args={[0.06, 0.22, 6]} />
                                </mesh>
                            );
                        })}
                    </group>
                )}
            </group>

        </group>
    );
}

// ─── Swatch ───────────────────────────────────────────────────────────────────

function ColorSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            title={color}
            style={{
                width: 28, height: 28, borderRadius: '50%',
                background: color,
                border: selected ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.1)',
                boxShadow: selected ? `0 0 12px ${color}88` : 'none',
                transition: 'all 0.15s',
                cursor: 'pointer',
                flexShrink: 0,
            }}
        />
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SKIN_TONES = ['#fde8d0', '#f2d0a9', '#c8a882', '#a07850', '#7a4f28', '#4a2912'];
const EYE_COLORS = ['#f97316', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ffffff'];
const HAIR_COLORS = ['#1a0e05', '#3d2b1f', '#5c3317', '#8b6914', '#c4a35a', '#d4d4d4', '#e879f9', '#1e40af'];
const OUTFIT_COLORS = ['#1e1040', '#0c1a2e', '#0a0a0a', '#0f2b1a', '#1a0a0a', '#0a1a2a', '#1a1a00', '#200a20'];
const ACCENT_COLORS = ['#f97316', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#fb923c', '#3b82f6', '#ffffff'];

export default function AvatarBuilder({ onSave }: { onSave?: (config: AvatarConfig) => void }) {
    const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load existing config
    useEffect(() => {
        fetch('/api/user/avatar-config')
            .then(r => r.json())
            .then(({ avatarConfig }) => {
                if (avatarConfig) setConfig({ ...DEFAULT_CONFIG, ...avatarConfig });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const patch = useCallback((key: keyof AvatarConfig, val: string) => {
        setConfig(c => ({ ...c, [key]: val }));
        setSaved(false);
    }, []);

    const applyPreset = useCallback((p: AvatarConfig) => {
        setConfig(p);
        setSaved(false);
    }, []);

    const resetToDefault = useCallback(() => {
        setConfig(DEFAULT_CONFIG);
        setSaved(false);
    }, []);

    const saveConfig = useCallback(async () => {
        setSaving(true);
        try {
            await fetch('/api/user/avatar-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarConfig: config }),
            });
            setSaved(true);
            onSave?.(config);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error('Failed to save avatar config', e);
        } finally {
            setSaving(false);
        }
    }, [config, onSave]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 rounded-3xl border border-theme bg-white/5">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/50 backdrop-blur-2xl shadow-2xl">

            {/* Top neon accent */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex flex-col lg:flex-row">

                {/* ── 3D Canvas ── */}
                <div className="relative lg:w-[55%] bg-gradient-to-b" style={{ background: 'linear-gradient(180deg, #0a0515 0%, #050210 100%)', minHeight: 'clamp(320px, 50vh, 420px)' }}>
                    {/* Ambient glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl opacity-20"
                            style={{ background: `radial-gradient(circle, ${config.accentColor}, transparent)` }} />
                    </div>
                    {/* Floor reflection */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                        style={{ background: `linear-gradient(0deg, ${config.accentColor}18, transparent)` }} />

                    <Canvas
                        camera={{ position: [0, 0.5, 3.2], fov: 42 }}
                        style={{ height: 'clamp(320px, 50vh, 420px)' }}
                        gl={{ alpha: true, antialias: true }}
                    >
                        <color attach="background" args={['transparent']} />
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[2, 4, 3]} intensity={1.2} />
                        <directionalLight position={[-2, 1, -2]} intensity={0.3} color="#8b5cf6" />
                        <pointLight position={[0, 2, 2]} intensity={0.8} color={config.accentColor} />
                        <pointLight position={[0, -1, 2]} intensity={0.4} color={config.eyeColor} />

                        <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
                            <Suspense fallback={null}>
                                <AvatarModel config={config} />
                            </Suspense>
                        </Float>

                        <OrbitControls
                            enableZoom={true}
                            enablePan={false}
                            minDistance={1.8}
                            maxDistance={5}
                            maxPolarAngle={Math.PI * 0.75}
                            minPolarAngle={Math.PI * 0.2}
                        />
                    </Canvas>

                    {/* Hint */}
                    <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-theme-primary/20 pointer-events-none">
                        Drag to rotate · Scroll to zoom
                    </p>
                </div>

                {/* ── Customization Panel ── */}
                <div className="lg:w-[45%] p-6 space-y-6 overflow-y-auto lg:max-h-[500px]" style={{ borderLeft: '1px solid rgba(255,255,255,0.04)' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-sm font-black text-theme-primary">Customise Avatar</span>
                        </div>
                        <button onClick={resetToDefault} className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-theme-secondary transition px-2 py-1 rounded-lg hover:bg-card-theme">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    {/* Presets */}
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Quick Themes</p>
                        <div className="flex gap-2 flex-wrap">
                            {PRESETS.map(p => (
                                <button key={p.label} onClick={() => applyPreset(p.config)}
                                    className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        color: '#ffffff',
                                    }}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Skin tone */}
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Skin Tone</p>
                        <div className="flex gap-2 flex-wrap">
                            {SKIN_TONES.map(c => <ColorSwatch key={c} color={c} selected={config.skinColor === c} onClick={() => patch('skinColor', c)} />)}
                            <input type="color" value={config.skinColor} onChange={e => patch('skinColor', e.target.value)}
                                className="w-7 h-7 rounded-full border border-theme bg-transparent cursor-pointer" title="Custom" />
                        </div>
                    </div>

                    {/* Eye color */}
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Eye Glow</p>
                        <div className="flex gap-2 flex-wrap">
                            {EYE_COLORS.map(c => <ColorSwatch key={c} color={c} selected={config.eyeColor === c} onClick={() => patch('eyeColor', c)} />)}
                            <input type="color" value={config.eyeColor} onChange={e => patch('eyeColor', e.target.value)}
                                className="w-7 h-7 rounded-full border border-theme bg-transparent cursor-pointer" title="Custom" />
                        </div>
                    </div>

                    {/* Hair style */}
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Hair Style</p>
                        <div className="flex gap-2 flex-wrap">
                            {(['none', 'short', 'spiky', 'bun'] as const).map(s => (
                                <button key={s} onClick={() => patch('hairStyle', s)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all"
                                    style={{
                                        background: config.hairStyle === s ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                        borderColor: config.hairStyle === s ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                                        color: config.hairStyle === s ? '#ffffff' : '#6b7280',
                                    }}>
                                    {s === 'none' ? 'Bald' : s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hair color */}
                    {config.hairStyle !== 'none' && (
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Hair Color</p>
                            <div className="flex gap-2 flex-wrap">
                                {HAIR_COLORS.map(c => <ColorSwatch key={c} color={c} selected={config.hairColor === c} onClick={() => patch('hairColor', c)} />)}
                                <input type="color" value={config.hairColor} onChange={e => patch('hairColor', e.target.value)}
                                    className="w-7 h-7 rounded-full border border-theme bg-transparent cursor-pointer" title="Custom" />
                            </div>
                        </div>
                    )}

                    {/* Outfit */}
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Outfit Color</p>
                        <div className="flex gap-2 flex-wrap">
                            {OUTFIT_COLORS.map(c => <ColorSwatch key={c} color={c} selected={config.outfitColor === c} onClick={() => patch('outfitColor', c)} />)}
                            <input type="color" value={config.outfitColor} onChange={e => patch('outfitColor', e.target.value)}
                                className="w-7 h-7 rounded-full border border-theme bg-transparent cursor-pointer" title="Custom" />
                        </div>
                    </div>

                    {/* Accent */}
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Accent / Glow Color</p>
                        <div className="flex gap-2 flex-wrap">
                            {ACCENT_COLORS.map(c => <ColorSwatch key={c} color={c} selected={config.accentColor === c} onClick={() => patch('accentColor', c)} />)}
                            <input type="color" value={config.accentColor} onChange={e => patch('accentColor', e.target.value)}
                                className="w-7 h-7 rounded-full border border-theme bg-transparent cursor-pointer" title="Custom" />
                        </div>
                    </div>

                    {/* Accessory */}
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Accessory</p>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { val: 'none', label: '—' },
                                { val: 'glasses', label: '👓 Glasses' },
                                { val: 'headset', label: '🎧 Headset' },
                                { val: 'crown', label: '👑 Crown' },
                            ].map(({ val, label }) => (
                                <button key={val} onClick={() => patch('accessory', val)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                                    style={{
                                        background: config.accessory === val ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                        borderColor: config.accessory === val ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                                        color: config.accessory === val ? '#ffffff' : '#6b7280',
                                    }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Save */}
                    <button onClick={saveConfig} disabled={saving}
                        className="w-full py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 mt-2"
                        style={{
                            background: saved ? 'rgba(16,185,129,0.1)' : 'white',
                            border: saved ? '1px solid rgba(16,185,129,0.3)' : '1px solid white',
                            color: saved ? '#4ade80' : 'black',
                            boxShadow: saved ? 'none' : '0 4px 15px rgba(255,255,255,0.1)',
                        }}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-green-400" /> : <Sparkles className="w-4 h-4" />}
                        {saving ? 'Saving…' : saved ? 'Avatar Saved!' : 'Save Avatar'}
                    </button>
                </div>
            </div>

            {/* Bottom neon accent */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
}
