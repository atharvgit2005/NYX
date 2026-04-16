"use client";

import { useState } from "react";

export function LeadForm() {
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mailtoLink = `mailto:nyx.studios.ai@gmail.com?subject=${encodeURIComponent("New NYX Studio Lead")}&body=${encodeURIComponent(`I am ready to grow. My email is: ${email}`)}`;
        window.location.href = mailtoLink;
    };

    return (
        <form className="w-full max-w-2xl flex flex-col md:flex-row gap-0" onSubmit={handleSubmit}>
            <input 
                className="flex-grow bg-surface-container-lowest border-4 border-black px-6 py-5 font-headline font-bold text-white focus:outline-none focus:border-black placeholder:text-surface-variant" 
                placeholder="ENTER YOUR EMAIL" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button className="bg-black text-white font-headline font-bold px-10 py-5 uppercase border-4 border-black border-l-0 hover:bg-secondary hover:text-black transition-colors flex items-center justify-center gap-2" type="submit">
                Let's Talk <span className="material-symbols-outlined">arrow_forward</span>
            </button>
        </form>
    );
}
