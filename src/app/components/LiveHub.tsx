'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

export function LiveHub() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    
    const [formData, setFormData] = useState({
        brandName: '',
        brief: '',
        goal: '',
        contact: ''
    });

    const steps = [
        {
            question: "I'm the NYX Brain. Let's build your manifesto. What's your brand called?",
            placeholder: "Brand Name...",
            key: "brandName"
        },
        {
            question: (name: string) => `Got it. Tell me the soul of ${name}—what do you do and who is it for?`,
            placeholder: "The brief...",
            key: "brief"
        },
        {
            question: "What's the #1 goal we need to hit together in Q3 2026?",
            placeholder: "Your primary goal...",
            key: "goal"
        },
        {
            question: "Where should I send the strategy? (Email or WhatsApp)",
            placeholder: "Contact info...",
            key: "contact"
        }
    ];

    useEffect(() => {
        if (isOpen && modalRef.current) {
            gsap.fromTo(modalRef.current, 
                { opacity: 0, scale: 0.9, y: 20 }, 
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out" }
            );
        }
    }, [isOpen]);

    const handleNext = () => {
        if (formData[steps[step].key as keyof typeof formData]) {
            if (step < steps.length - 1) {
                setStep(step + 1);
            } else {
                submitBrief();
            }
        }
    };

    const submitBrief = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.brandName,
                    email: formData.contact.includes('@') ? formData.contact : 'whatsapp@user.com', // Fallback for contact
                    objective: "BRAND_BRIEFING",
                    message: `BRIEF: ${formData.brief}\n\nGOAL: ${formData.goal}\n\nCONTACT_METHOD: ${formData.contact}`
                })
            });

            if (response.ok) {
                setIsComplete(true);
            }
        } catch (error) {
            console.error("Error submitting brief:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* The Trigger Button */}
            <button 
                onClick={() => setIsOpen(true)}
                className="group flex items-center gap-2 text-[#E8441A] border-2 border-[#E8441A] px-2 md:px-4 py-1 hover:bg-[#E8441A] hover:text-black transition-all font-headline font-bold uppercase tracking-tighter text-[0.75rem] md:text-[1.1rem]"
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8441A] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8441A]"></span>
                </span>
                *LIVE_NOW
            </button>

            {/* The Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div 
                        ref={modalRef}
                        className="w-full max-w-2xl bg-[#0E0E0E] border-4 border-[#E8441A] p-8 md:p-12 relative overflow-hidden"
                    >
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-[#E8441A] transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="noise-texture absolute inset-0 opacity-10 pointer-events-none"></div>

                        {!isComplete ? (
                            <div className="relative z-10">
                                <div className="mb-8">
                                    <span className="text-[#E8441A] font-label text-xs uppercase tracking-[0.3em] font-bold block mb-2">* SESSION_ACTIVE</span>
                                    <h2 className="text-white font-headline text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">
                                        {typeof steps[step].question === 'function' 
                                            ? (steps[step].question as (name: string) => string)(formData.brandName) 
                                            : steps[step].question as string}
                                    </h2>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <input 
                                        autoFocus
                                        type="text"
                                        value={formData[steps[step].key as keyof typeof formData]}
                                        onChange={(e) => setFormData({...formData, [steps[step].key]: e.target.value})}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                        placeholder={steps[step].placeholder}
                                        className="flex-grow bg-white/5 border-2 border-white/10 p-4 text-white font-body text-xl focus:border-[#E8441A] outline-none transition-all placeholder:text-white/20"
                                    />
                                    <button 
                                        onClick={handleNext}
                                        disabled={isSubmitting || !formData[steps[step].key as keyof typeof formData]}
                                        className="bg-[#E8441A] text-black font-headline font-bold uppercase px-8 py-4 flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                                    >
                                        {step === steps.length - 1 ? 'TRANSMIT' : 'NEXT'} <ArrowRight size={20} />
                                    </button>
                                </div>

                                <div className="mt-8 flex gap-2">
                                    {steps.map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1 flex-grow transition-all duration-500 ${i <= step ? 'bg-[#E8441A]' : 'bg-white/10'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 text-center py-12">
                                <div className="flex justify-center mb-8">
                                    <CheckCircle2 size={80} className="text-[#E8441A] animate-bounce" />
                                </div>
                                <h2 className="text-white font-headline text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                                    BRIEF_LOCKED.
                                </h2>
                                <p className="text-white/60 font-body text-lg mb-12 max-w-md mx-auto">
                                    Your brand soul is now in our system. The founders have been notified. Sync with our bot for immediate momentum.
                                </p>
                                <a 
                                    href={`https://wa.me/919098344807?text=Hi, I've just submitted a brand brief for ${formData.brandName}. Let's discuss the strategy.`} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 bg-[#25D366] text-black font-headline font-bold uppercase px-12 py-6 text-2xl hover:scale-105 transition-transform zine-shadow"
                                >
                                    OPEN WHATSAPP <MessageSquare size={28} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
