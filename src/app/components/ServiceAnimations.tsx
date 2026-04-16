'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import * as THREE from 'three';

export function ServiceAnimations() {
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        // --- GSAP Animations ---
        gsap.registerPlugin(ScrollTrigger);
        
        const ctx = gsap.context(() => {
            // 1. Ink Reveal for Headlines
            document.querySelectorAll('.js-ink-reveal').forEach(el => {
                gsap.to(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        once: true
                    },
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                    duration: 1.2,
                    ease: "power4.inOut"
                });
            });

            // 2. Border Drawing Animation
            document.querySelectorAll('.js-border').forEach(border => {
                gsap.to(border, {
                    scrollTrigger: {
                        trigger: border,
                        start: "top 95%",
                        once: true
                    },
                    scaleX: 1,
                    duration: 1.5,
                    ease: "expo.out"
                });
            });

            // 3. Sequential Service Card Reveals
            gsap.utils.toArray('.js-card').forEach((card: any, i) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%",
                        once: true
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    delay: 0.1,
                    ease: "power3.out"
                });
            });

            // 4. Staggered reveal for small text/buttons
            document.querySelectorAll('.animate-reveal').forEach(el => {
                gsap.from(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 92%",
                        once: true
                    },
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out"
                });
            });
        });

        // --- Three.js Noise Effect ---
        let scene: THREE.Scene, camera: THREE.OrthographicCamera, renderer: THREE.WebGLRenderer;
        let material: THREE.ShaderMaterial;
        let animationId: number;

        const container = document.getElementById('three-container');
        if (container) {
            scene = new THREE.Scene();
            camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(renderer.domElement);

            const vertexShader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `;

            const fragmentShader = `
                precision highp float;
                uniform float uTime;
                uniform vec2 uResolution;
                varying vec2 vUv;

                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }

                void main() {
                    vec2 uv = vUv;
                    
                    // Static noise
                    float n = random(uv + fract(uTime));
                    
                    // Glitch lines
                    float line = step(0.98, random(vec2(0.0, uv.y + uTime * 0.5)));
                    float glitch = random(vec2(uTime, floor(uv.y * 20.0)));
                    
                    float finalColor = n * 0.15;
                    if (line > 0.5) finalColor += 0.2;
                    
                    // Scanlines
                    finalColor *= 0.8 + 0.2 * sin(uv.y * 800.0);
                    
                    gl_FragColor = vec4(vec3(finalColor), 1.0);
                }
            `;

            material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
                },
                vertexShader,
                fragmentShader
            });

            const geometry = new THREE.PlaneGeometry(2, 2);
            const plane = new THREE.Mesh(geometry, material);
            scene.add(plane);

            const animate = (time: number) => {
                material.uniforms.uTime.value = time * 0.001;
                renderer.render(scene, camera);
                animationId = requestAnimationFrame(animate);
            };

            animationId = requestAnimationFrame(animate);

            // Resize handler
            const handleResize = () => {
                if (container) {
                    renderer.setSize(container.clientWidth, container.clientHeight);
                    material.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
                }
            };
            window.addEventListener('resize', handleResize);
        }

        return () => {
            ctx.revert();
            if (animationId) cancelAnimationFrame(animationId);
            if (renderer) renderer.dispose();
            // Optional: container.innerHTML = '';
        };
    }, []);

    return null;
}
