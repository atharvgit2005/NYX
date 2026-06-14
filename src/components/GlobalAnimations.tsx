'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide scroll reveal animations.
 *
 * Robustness contract:
 * - Content is ALWAYS visible by default (no CSS `opacity:0`). These tweens are
 *   progressive enhancement driven by `gsap.from`, so if JS never runs the page
 *   renders fully visible.
 * - Honors `prefers-reduced-motion`: when set, we bail out entirely and leave
 *   every element in its natural, visible state.
 * - Elements already within the viewport on mount animate immediately, so nothing
 *   can get "stuck" at opacity 0 waiting for a scroll trigger that won't fire.
 * - All inline props are cleared on completion, and the whole context is reverted
 *   on unmount (no leaking listeners / ScrollTriggers across client navigation).
 */
export default function GlobalAnimations() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Respect the user's motion preference — leave content untouched & visible.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const ctx = gsap.context(() => {
            const reveal = (
                selector: string,
                fromVars: gsap.TweenVars,
                duration: number,
            ) => {
                gsap.utils.toArray<HTMLElement>(selector).forEach((element) => {
                    const inView =
                        element.getBoundingClientRect().top < window.innerHeight * 0.9;

                    gsap.from(element, {
                        ...fromVars,
                        duration,
                        ease: 'power3.out',
                        clearProps: 'opacity,transform',
                        // In-view elements animate now; below-fold wait for scroll.
                        scrollTrigger: inView
                            ? undefined
                            : { trigger: element, start: 'top 88%', once: true },
                    });
                });
            };

            // Hero text + subheadings.
            reveal('h1', { opacity: 0, y: 30 }, 1);
            reveal('h2, h3', { opacity: 0, y: 20 }, 0.8);

            // Card stagger (common card classes).
            const cards = gsap.utils.toArray<Element>(
                '.bg-white\\/5, .bg-card-theme, .rounded-2xl, .rounded-3xl',
            );
            if (cards.length > 0) {
                ScrollTrigger.batch(cards, {
                    onEnter: (batch) => {
                        gsap.from(batch, {
                            opacity: 0,
                            y: 30,
                            scale: 0.95,
                            stagger: 0.1,
                            duration: 0.6,
                            ease: 'back.out(1.2)',
                            overwrite: true,
                            clearProps: 'opacity,transform',
                        });
                    },
                    start: 'top 90%',
                    once: true,
                });
            }
        });

        // Reverts every tween, ScrollTrigger, and listener created in the context.
        return () => ctx.revert();
    }, []);

    return null; // Renders nothing; only attaches animations.
}
