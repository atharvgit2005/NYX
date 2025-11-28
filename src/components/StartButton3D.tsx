'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

function ButtonMesh({ onClick }: { onClick: () => void }) {
    const mesh = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);

    useFrame((state) => {
        if (mesh.current) {
            // Gentle rotation
            mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, hovered ? 0.2 : 0, 0.1);
            mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, hovered ? 0.2 : 0, 0.1);

            // Pulse scale on hover
            const scale = hovered ? 1.1 : 1;
            mesh.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh
                ref={mesh}
                onClick={() => {
                    setActive(true);
                    onClick();
                }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <capsuleGeometry args={[0.8, 2.5, 4, 16]} />
                <MeshDistortMaterial
                    color={hovered ? "#a855f7" : "#9333ea"}
                    distort={active ? 0.6 : 0.3}
                    speed={active ? 5 : 2}
                    roughness={0.2}
                    metalness={0.8}
                />
                <Text
                    position={[0, 0, 0.9]}
                    fontSize={0.35}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/Inter-Bold.ttf" // Fallback to default if not found
                >
                    {active ? "LOADING..." : "START FREE"}
                </Text>
            </mesh>
        </Float>
    );
}

export default function StartButton3D() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        setLoading(true);
        setTimeout(() => {
            router.push('/signup');
        }, 1500);
    };

    return (
        <div className="w-64 h-32 cursor-pointer relative z-20">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} color="purple" intensity={0.5} />
                <ButtonMesh onClick={handleClick} />
            </Canvas>
        </div>
    );
}
