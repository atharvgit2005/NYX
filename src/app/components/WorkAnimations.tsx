'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

export function WorkAnimations() {
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            // Text Reveal for Headlines
            document.querySelectorAll('.reveal-text span.block').forEach((span, i) => {
                gsap.fromTo(span, 
                    { y: "110%" },
                    {
                        y: "0%",
                        duration: 1.2,
                        ease: "expo.out",
                        delay: i * 0.1,
                        scrollTrigger: {
                            trigger: span,
                            start: "top 95%",
                        }
                    }
                );
            });

            // Bento Cards Animation
            gsap.utils.toArray('.bento-card').forEach((card: any, i) => {
                gsap.fromTo(card,
                    { y: 150, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power4.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "top 90%",
                        },
                        delay: (i % 2) * 0.1
                    }
                );
            });

            // Image Parallax or Hover Triggers (Optional, can just use the provided Tailwinds)
        });

        return () => ctx.revert();
    }, []);

    return null;
}
