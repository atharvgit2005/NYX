'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GlobalAnimations() {
    useEffect(() => {
        // Hero Text Fade-Slide
        gsap.utils.toArray('h1').forEach((el: any) => {
            gsap.fromTo(el,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // Subheadings
        gsap.utils.toArray('h2, h3').forEach((el: any) => {
            gsap.fromTo(el,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                    }
                }
            );
        });

        // Card Stagger Animations (targeting common card classes)
        const cards = gsap.utils.toArray('.bg-white\\/5, .rounded-2xl, .rounded-3xl') as Element[];
        if (cards.length > 0) {
            ScrollTrigger.batch(cards, {
                onEnter: (batch) => {
                    gsap.fromTo(batch,
                        { opacity: 0, y: 30, scale: 0.95 },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            stagger: 0.1,
                            duration: 0.6,
                            ease: 'back.out(1.2)',
                            overwrite: true
                        }
                    );
                },
                start: 'top 90%',
            });
        }

        // Button Hover Micro-interactions
        const buttons = document.querySelectorAll('button');
        buttons.forEach((btn) => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, { scale: 1.05, duration: 0.2, ease: 'power1.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power1.out' });
            });
        });

        // Sidebar Icon Pops
        const icons = document.querySelectorAll('nav svg, .sidebar svg');
        icons.forEach((icon) => {
            icon.addEventListener('mouseenter', () => {
                gsap.to(icon, { rotation: 15, scale: 1.2, duration: 0.3, ease: 'back.out(1.7)' });
            });
            icon.addEventListener('mouseleave', () => {
                gsap.to(icon, { rotation: 0, scale: 1, duration: 0.3 });
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return null; // This component renders nothing, just attaches animations
}
