'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { usePathname } from 'next/navigation';

export function AdAnimations() {
    const pathname = usePathname();

    useEffect(() => {

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            // Text Reveal for Headlines
            document.querySelectorAll('.reveal-text span.block').forEach(span => {
                gsap.fromTo(span,
                    { y: "110%" },
                    {
                        y: "0%",
                        duration: 1.2,
                        ease: "expo.out",
                        scrollTrigger: {
                            trigger: span,
                            start: "top 95%",
                        }
                    }
                );
            });

            // Hero Visual Entrance
            if (document.querySelector('.hero-visual')) {
                gsap.fromTo('.hero-visual',
                    { scale: 0.8, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        duration: 1.5,
                        ease: "expo.out",
                        delay: 0.5
                    }
                );
            }

            // Floating Icons in Hero
            if (document.querySelector('.star-icon')) {
                gsap.to('.star-icon', {
                    y: 20,
                    duration: 3,
                    repeat: -1,
                    yoyo: true,
                    ease: "power1.inOut"
                });
            }

            if (document.querySelector('.secondary-icon')) {
                gsap.to('.secondary-icon', {
                    rotation: 360,
                    duration: 20,
                    repeat: -1,
                    ease: "none"
                });
            }

            // Note: The Marquee animation is handled purely via CSS in page.css. 
            // GSAP marquee removal preserves system stability against React mounting.

            // Bento Cards Animation
            const bentoCards = gsap.utils.toArray('.bento-card') as HTMLElement[];
            if (bentoCards.length > 0) {
                bentoCards.forEach((card, i) => {
                    gsap.fromTo(card,
                        { y: 100, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            ease: "power4.out",
                            scrollTrigger: {
                                trigger: card,
                                start: "top 90%",
                            },
                            delay: (i % 2) * 0.1
                        }
                    );
                });
            }

            // Manifesto Elements
            if (document.querySelector('.manifesto-pills')) {
                gsap.fromTo('.manifesto-pills > div',
                    { scale: 0, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.2,
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: '.manifesto-pills',
                            start: "top 85%"
                        }
                    }
                );
            }

            if (document.querySelector('.manifesto-glow')) {
                gsap.fromTo('.manifesto-glow',
                    { opacity: 0, scale: 0.5 },
                    {
                        opacity: 0.2,
                        scale: 1,
                        duration: 2,
                        scrollTrigger: {
                            trigger: '.manifesto-glow',
                            start: "top 80%",
                            scrub: 1
                        }
                    }
                );
            }


            // CTA Form reveal
            if (document.querySelector('.cta-form')) {
                gsap.fromTo('.cta-form',
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "expo.out",
                        scrollTrigger: {
                            trigger: '.cta-form',
                            start: "top 95%"
                        }
                    }
                );
            }
        });

        return () => ctx.revert(); // clean up all GSAP animations
    }, [pathname]);

    return null;
}
