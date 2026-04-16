"use client";

import { useState } from "react";

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [objective, setObjective] = useState("BRAND_IDENTITY");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = `New NYX Studio Lead: ${objective} from ${name}`;
        const body = `Name: ${name}\nEmail: ${email}\nObjective: ${objective}\n\nMessage Payload:\n${message}`;
        
        const mailtoLink = `mailto:nyx.studios.ai@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

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
            <div className="form-element opacity-0">
                <label className="block text-xs font-headline font-black uppercase tracking-widest text-black mb-2">* MISSION_OBJECTIVE</label>
                <div className="relative">
                    <div className="form-border-draw"></div>
                    <select 
                        className="w-full bg-transparent border-4 border-black p-4 text-black font-bold focus:ring-0 focus:border-[#E8441A] transition-colors focus:outline-none appearance-none"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                    >
                        <option value="BRAND_IDENTITY">BRAND_IDENTITY</option>
                        <option value="DIGITAL_MANIFESTO">DIGITAL_MANIFESTO</option>
                        <option value="VISUAL_SABOTAGE">VISUAL_SABOTAGE</option>
                        <option value="GENERAL_INTEL">GENERAL_INTEL</option>
                    </select>
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
                <button className="glitch-btn w-full md:w-auto bg-[#E8441A] text-white px-12 py-6 font-headline font-black text-2xl uppercase tracking-tighter border-4 border-black transition-all duration-150 active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" id="submit-btn" type="submit">
                    INITIALIZE_TRANSFER →
                </button>
            </div>
        </form>
    );
}
