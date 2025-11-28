'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Stars, PerspectiveCamera, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function ProfileCard({ name, role }: { name: string; role: string }) {
    const mesh = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, hovered ? 0.5 : 0, 0.1);
            mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, hovered ? -0.2 : 0, 0.1);
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group
                ref={mesh}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                {/* Card Background */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[4, 5, 0.2]} />
                    <meshPhysicalMaterial
                        color="#1a1a1a"
                        metalness={0.8}
                        roughness={0.2}
                        clearcoat={1}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* Border Glow */}
                <mesh position={[0, 0, -0.1]}>
                    <boxGeometry args={[4.1, 5.1, 0.1]} />
                    <meshBasicMaterial color={hovered ? "#a855f7" : "#581c87"} />
                </mesh>

                {/* Avatar Placeholder (Sphere) */}
                <mesh position={[0, 1, 0.2]}>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshStandardMaterial color="#c084fc" metalness={0.6} roughness={0.2} />
                </mesh>

                {/* Text Info */}
                <Text position={[0, -0.5, 0.2]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" font="/fonts/Inter-Bold.ttf">
                    {name}
                </Text>
                <Text position={[0, -1, 0.2]} fontSize={0.15} color="#a855f7" anchorX="center" anchorY="middle" font="/fonts/Inter-Bold.ttf">
                    {role}
                </Text>

                {/* Stats */}
                <group position={[0, -2, 0.2]}>
                    <Text position={[-1, 0.3, 0]} fontSize={0.12} color="gray">VIDEOS</Text>
                    <Text position={[-1, 0, 0]} fontSize={0.2} color="white">12</Text>

                    <Text position={[1, 0.3, 0]} fontSize={0.12} color="gray">CLONES</Text>
                    <Text position={[1, 0, 0]} fontSize={0.2} color="white">2</Text>
                </group>
            </group>
        </Float>
    );
}

export default function UserProfile3D() {
    return (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-black/50 relative">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <span className="text-xs font-bold text-purple-400">INTERACTIVE 3D PROFILE</span>
            </div>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={5} size={2} speed={0.4} opacity={0.5} color="#c084fc" />

                <ProfileCard name="Atharv Paharia" role="PRO CREATOR" />
            </Canvas>
        </div>
    );
}
