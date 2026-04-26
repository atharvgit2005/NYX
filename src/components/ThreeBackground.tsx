'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useTheme } from './ThemeProvider';

export default function ThreeBackground() {
    const mountRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2000;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 15; // Spread particles
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Dynamic Color based on theme
        const particleColor = theme === 'light' ? 0xf97316 : 0xffffff; // Orange in light mode, White in dark mode

        const material = new THREE.PointsMaterial({
            size: 0.005,
            color: particleColor,
            transparent: true,
            opacity: 0.8,
        });

        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);

        // ... (rest of animation logic remains same)

        // Camera position
        camera.position.z = 3;

        // Animation Loop
        const clock = new THREE.Clock();
        let animationId: number;

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = elapsedTime * 0.02;

            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        const currentMount = mountRef.current;
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationId) cancelAnimationFrame(animationId);
            if (currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
            particlesGeometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [theme]); // Re-run effect when theme changes to update colors

    // Dynamic Background Gradient
    const backgroundStyle = theme === 'light'
        ? 'radial-gradient(circle at center, #fff7ed 0%, #ffffff 100%)' // Light orange tint in light mode
        : 'radial-gradient(circle at center, #2e0d00 0%, #000000 100%)'; // Dark orange-black in dark mode

    return (
        <div
            ref={mountRef}
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none transition-all duration-500"
            style={{ background: backgroundStyle }}
        />
    );
}
