"use client";

import { useState } from "react";

export function LeadForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) return;
        
        setIsLoading(true);
        setStatus("idle");
        
        try {
            const res = await fetch("/api/lead", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });
            
            if (!res.ok) {
                throw new Error("Failed to submit");
            }
            
            setStatus("success");
            setEmail("");
        } catch (error) {
            console.error(error);
            setStatus("error");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "success") {
        return (
            <div className="w-full max-w-2xl bg-[#E8441A] text-white p-6 border-4 border-black font-headline font-bold text-center uppercase tracking-wider">
                TRANSMISSION SUCCESSFUL. WE WILL BE IN TOUCH.
            </div>
        );
    }

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
            <button className="bg-black text-white font-headline font-bold px-10 py-5 uppercase border-4 border-black border-l-0 hover:bg-secondary hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50" type="submit" disabled={isLoading}>
                {isLoading ? "PROCESSING..." : "Let's Talk"} {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
        </form>
    );
}
