"use client";

import { useState } from "react";

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [objective, setObjective] = useState("BRAND_IDENTITY");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const objectiveOptions = [
        "BRAND_IDENTITY",
        "DIGITAL_MANIFESTO",
        "VISUAL_SABOTAGE",
        "GENERAL_INTEL"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !email || !objective || !message) return;
        
        setIsLoading(true);
        setStatus("idle");
        
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, objective, message }),
            });
            
            if (!res.ok) {
                throw new Error("Failed to submit");
            }
            
            setStatus("success");
            setName("");
            setEmail("");
            setMessage("");
            setObjective("BRAND_IDENTITY");
        } catch (error) {
            console.error(error);
            setStatus("error");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "success") {
        return (
            <div className="w-full bg-[#E8441A] text-white p-8 border-4 border-black font-headline text-center uppercase tracking-wider">
                <h3 className="text-2xl md:text-4xl font-black mb-4">TRANSMISSION RECEIVED</h3>
                <p className="font-bold">YOUR DATA HAS BEEN SECURELY LOGGED. OPERATIVES WILL BE IN TOUCH SHORTLY.</p>
            </div>
        );
    }

    return (
                <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="form-element group opacity-0">
                    <label className="block text-xs font-headline font-black uppercase tracking-widest text-black mb-2">* OPERATOR_NAME</label>
                    <div className="relative">
                        <div className="form-border-draw"></div>
                        <input 
                            className="w-full bg-transparent border-4 border-black p-4 text-black font-bold focus:ring-0 focus:border-[#E8441A] transition-colors placeholder:text-gray-400 focus:outline-none" 
                            placeholder="WHO ARE YOU?" 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="form-element group opacity-0">
                    <label className="block text-xs font-headline font-black uppercase tracking-widest text-black mb-2">* COMMS_FREQUENCY</label>
                    <div className="relative">
                        <div className="form-border-draw"></div>
                        <input 
                            className="w-full bg-transparent border-4 border-black p-4 text-black font-bold focus:ring-0 focus:border-[#E8441A] transition-colors placeholder:text-gray-400 focus:outline-none" 
                            placeholder="EMAIL@DOMAIN.COM" 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
            <div className={`form-element opacity-0 ${isDropdownOpen ? 'relative z-50' : 'relative z-10'}`}>
                <label className="block text-xs font-headline font-black uppercase tracking-widest text-black mb-2">* MISSION_OBJECTIVE</label>
                <div className="relative">
                    <div className="form-border-draw"></div>
                    <div 
                        className="relative"
                        tabIndex={0}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setIsDropdownOpen(false);
                            }
                        }}
                    >
                        {/* Base Button (takes up space, invisible when open) */}
                        <button
                            type="button"
                            className={`w-full bg-white border-4 border-black p-4 text-black font-bold focus:ring-0 transition-colors focus:outline-none flex justify-between items-center ${isDropdownOpen ? 'opacity-0' : 'hover:border-[#E8441A]'}`}
                            onClick={() => setIsDropdownOpen(true)}
                        >
                            <span>{objective}</span>
                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        
                        {/* Absolute Overlay Dropdown Panel */}
                        {isDropdownOpen && (
                            <div className="absolute top-0 left-0 w-full bg-white border-4 border-[#E8441A] z-50 flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in origin-top">
                                {objectiveOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        className={`text-left font-bold p-4 hover:bg-[#E8441A] hover:text-white transition-colors border-b-4 border-black last:border-b-0 flex justify-between items-center ${objective === opt ? 'bg-black text-white' : 'text-black'}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setObjective(opt);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <span>{opt}</span>
                                        {objective === opt && (
                                            <svg className="w-5 h-5 rotate-180 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-element opacity-0">
                <label className="block text-xs font-headline font-black uppercase tracking-widest text-black mb-2">* MESSAGE_PAYLOAD</label>
                <div className="relative">
                    <div className="form-border-draw"></div>
                    <textarea 
                        className="w-full bg-transparent border-4 border-black p-4 text-black font-bold focus:ring-0 focus:border-[#E8441A] transition-colors placeholder:text-gray-400 focus:outline-none resize-none" 
                        placeholder="WHAT'S THE SCOPE?" 
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    ></textarea>
                </div>
            </div>
            <div className="form-element pt-4 opacity-0">
                <button className="glitch-btn w-full md:w-auto bg-[#E8441A] text-white px-2 md:px-12 py-4 md:py-6 font-headline font-black text-[1.05rem] md:text-2xl uppercase tracking-tighter border-4 border-black transition-all duration-150 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap overflow-hidden text-ellipsis disabled:opacity-50 disabled:active:scale-100" id="submit-btn" type="submit" disabled={isLoading}>
                    {isLoading ? "PROCESSING..." : "INITIALIZE_TRANSFER →"}
                </button>
            </div>
        </form>
    );
}
