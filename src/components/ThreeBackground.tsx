'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
    const mountRef = useRef<HTMLDivElement>(null);

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

        const material = new THREE.PointsMaterial({
            size: 0.005,
            color: 0x9333ea, // Purple
            transparent: true,
            opacity: 0.8,
        });

        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);

        // Camera position
        camera.position.z = 3;

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;

        const animateParticles = (event: MouseEvent) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        };

        document.addEventListener('mousemove', animateParticles);

        // Animation Loop
        const clock = new THREE.Clock();

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();

            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = elapsedTime * 0.02;

            if (mouseX > 0) {
                particlesMesh.rotation.x += (mouseY * 0.00001);
                particlesMesh.rotation.y += (mouseX * 0.00001);
            }

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
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
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousemove', animateParticles);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            particlesGeometry.dispose();
            material.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, #1a0b2e 0%, #000000 100%)' }}
        />
    );
}
