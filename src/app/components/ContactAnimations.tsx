'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import * as THREE from 'three';
import { usePathname } from 'next/navigation';

export function ContactAnimations() {
    const pathname = usePathname();

    useEffect(() => {

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            // 1. Character-level Headline Entrance
            const heroHeadline = document.getElementById('hero-headline');
            if (heroHeadline) {
                const text = heroHeadline.innerText;
                heroHeadline.innerHTML = text.split('').map((char: string) => 
                    `<span class="headline-char">${char === ' ' ? '&nbsp;' : char}</span>`
                ).join('');

                gsap.to(".headline-char", {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.03,
                    ease: "expo.out",
                    delay: 0.5
                });
            }

            // 3. Form Border Draw Animations & 4. Staggered Entrance
            const manifestoForm = document.getElementById('manifesto-form-container');
            if (manifestoForm) {
                const tlForm = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#manifesto-form-container",
                        start: "top 75%"
                    }
                });

                tlForm.to("#manifesto-form-container .form-border-draw", {
                    clipPath: "inset(0 0 0 0)",
                    duration: 1,
                    ease: "power4.inOut"
                })
                .to(".form-element", {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out"
                }, "-=0.5")
                .to("#manifesto-form-container .form-element .form-border-draw", {
                    clipPath: "inset(0 0 0 0)",
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.inOut"
                }, "-=0.8");
            }

            // Border draw for intel box
            gsap.to("#intel-container .form-border-draw", {
                clipPath: "inset(0 0 0 0)",
                duration: 1,
                ease: "power4.inOut",
                scrollTrigger: {
                    trigger: "#intel-container",
                    start: "top 80%"
                }
            });

            // 5. Glitch/Pulse Effect on Submit Button
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.addEventListener('mouseenter', () => {
                    gsap.to(submitBtn, {
                        duration: 0.1,
                        x: "random(-2, 2)",
                        y: "random(-2, 2)",
                        repeat: 5,
                        yoyo: true,
                        ease: "none"
                    });
                    gsap.to(submitBtn, {
                        boxShadow: "0 0 20px rgba(232, 68, 26, 0.8)",
                        duration: 0.2
                    });
                });

                submitBtn.addEventListener('mouseleave', () => {
                    gsap.set(submitBtn, { x: 0, y: 0 });
                    gsap.to(submitBtn, {
                        boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
                        duration: 0.2
                    });
                });
            }

            // Existing Scramble Text Logic
            const scrambleElements = document.querySelectorAll('.scramble-text');
            const chars = '!@#$%^&*()_+{}[]|:;<>?,./';
            scrambleElements.forEach(el => {
                const originalText = el.getAttribute('data-original');
                if (!originalText) return;
                ScrollTrigger.create({
                    trigger: el,
                    start: "top 90%",
                    onEnter: () => {
                        let iteration = 0;
                        const interval = setInterval(() => {
                            (el as HTMLElement).innerText = originalText.split("").map((char, index) => {
                                if(index < iteration) return originalText[index];
                                return chars[Math.floor(Math.random() * chars.length)]
                            }).join("");
                            if(iteration >= originalText.length) clearInterval(interval);
                            iteration += 1 / 3;
                        }, 30);
                    }
                });
            });
        });

        // 2. Three.js: Dark-mode starfield/noise background
        const canvas = document.getElementById('background-canvas') as HTMLCanvasElement;
        let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, animationId: number;
        
        if (canvas) {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;

            let mouseX = 0, mouseY = 0;
            const handleMouseMove = (e: MouseEvent) => {
                mouseX = (e.clientX - window.innerWidth / 2) * 0.0001;
                mouseY = (e.clientY - window.innerHeight / 2) * 0.0001;
            };
            document.addEventListener('mousemove', handleMouseMove);

            const resize = () => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            };
            window.addEventListener('resize', resize);
            resize();

            const starCount = 2000;
            const starGeo = new THREE.BufferGeometry();
            const starPos = new Float32Array(starCount * 3);
            for(let i=0; i<starCount*3; i++) starPos[i] = (Math.random() - 0.5) * 20;
            starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
            const starMat = new THREE.PointsMaterial({ color: 0x444444, size: 0.015, transparent: true, opacity: 0.8 });
            const stars = new THREE.Points(starGeo, starMat);
            scene.add(stars);

            const animateThree = () => {
                animationId = requestAnimationFrame(animateThree);
                stars.rotation.y += 0.0005 + mouseX;
                stars.rotation.x += 0.0002 + mouseY;
                renderer.render(scene, camera);
            };
            animateThree();

            return () => {
                ctx.revert();
                cancelAnimationFrame(animationId);
                window.removeEventListener('resize', resize);
                document.removeEventListener('mousemove', handleMouseMove);
                renderer.dispose();
            };
        }

        return () => ctx.revert();
    }, [pathname]);

    return null;
}
