"use client";

import { useRef, useState } from "react";

type FieldErrors = {
    name?: string;
    email?: string;
    message?: string;
};

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [objective, setObjective] = useState("BRAND_IDENTITY");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errors, setErrors] = useState<FieldErrors>({});

    const formRef = useRef<HTMLFormElement>(null);

    const objectiveOptions = [
        "BRAND_IDENTITY",
        "DIGITAL_MANIFESTO",
        "VISUAL_SABOTAGE",
        "GENERAL_INTEL",
    ];
    const nameFieldId = "contact-name";
    const emailFieldId = "contact-email";
    const objectiveFieldId = "contact-objective";
    const messageFieldId = "contact-message";

    function validate(): FieldErrors {
        const next: FieldErrors = {};
        if (!name.trim()) next.name = "Operator name is required.";
        if (!email.trim()) {
            next.email = "A comms frequency (email) is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            next.email = "Enter a valid email address.";
        }
        if (!message.trim()) next.message = "Message payload cannot be empty.";
        return next;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const nextErrors = validate();
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            // Move focus to the first invalid field so the failure is obvious.
            const firstInvalid = (["name", "email", "message"] as const).find(
                (k) => nextErrors[k],
            );
            const idMap: Record<string, string> = {
                name: nameFieldId,
                email: emailFieldId,
                message: messageFieldId,
            };
            if (firstInvalid) {
                document.getElementById(idMap[firstInvalid])?.focus();
            }
            return;
        }

        setErrors({});
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
            <div className="w-full bg-[#D83C14] text-white p-8 border-4 border-black font-headline text-center uppercase tracking-wider" aria-live="polite">
                <h3 className="text-2xl md:text-4xl font-black mb-4">TRANSMISSION RECEIVED</h3>
                <p className="font-bold">YOUR DATA HAS BEEN SECURELY LOGGED. OPERATIVES WILL BE IN TOUCH SHORTLY.</p>
            </div>
        );
    }

    const errorText =
        "block text-xs font-headline font-black uppercase tracking-widest text-[#D83C14] mt-2";

    return (
        <form className="space-y-8" onSubmit={handleSubmit} ref={formRef} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="form-element group">
                    <label className="block text-xs font-headline font-black uppercase tracking-widest text-black mb-2" htmlFor={nameFieldId}>* OPERATOR_NAME</label>
                    <div className="relative">
                        <div className="form-border-draw"></div>
                        <input
                            id={nameFieldId}
                            className="w-full bg-transparent border-4 border-black p-4 text-black font-bold focus:ring-0 focus:border-[#D83C14] transition-colors placeholder:text-gray-400 focus:outline-none"
                            placeholder="WHO ARE YOU?"
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            aria-invalid={errors.name ? true : undefined}
                            aria-describedby={errors.name ? `${nameFieldId}-error` : undefined}
                            required
                        />
                    </div>
                    {errors.name && (
                        <span id={`${nameFieldId}-error`} className={errorText}>{errors.name}</span>
                    )}
                </div>
                <div className="form-element group">
                    <label className="block text-xs font-headline font-black uppercase tracking-widest text-black mb-2" htmlFor={emailFieldId}>* COMMS_FREQUENCY</label>
                    <div className="relative">
                        <div className="form-border-draw"></div>
                        <input
                            id={emailFieldId}
                            className="w-full bg-transparent border-4 border-black p-4 text-black font-bold focus:ring-0 focus:border-[#D83C14] transition-colors placeholder:text-gray-400 focus:outline-none"
                            placeholder="EMAIL@DOMAIN.COM"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-invalid={errors.email ? true : undefined}
                            aria-describedby={errors.email ? `${emailFieldId}-error` : undefined}
                            required
                        />
                    </div>
                    {errors.email && (
                        <span id={`${emailFieldId}-error`} className={errorText}>{errors.email}</span>
                    )}
                </div>
            </div>
            <div className="form-element">
                <label className="block text-xs font-headline font-black uppercase tracking-widest text-black mb-2" htmlFor={objectiveFieldId}>* MISSION_OBJECTIVE</label>
                <div className="relative">
                    <div className="form-border-draw"></div>
                    <select
                        id={objectiveFieldId}
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="w-full appearance-none bg-white border-4 border-black p-4 pr-12 text-black font-bold focus:ring-0 focus:border-[#D83C14] focus:outline-none transition-colors cursor-pointer"
                    >
                        {objectiveOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            <div className="form-element">
                <label className="block text-xs font-headline font-black uppercase tracking-widest text-black mb-2" htmlFor={messageFieldId}>* MESSAGE_PAYLOAD</label>
                <div className="relative">
                    <div className="form-border-draw"></div>
                    <textarea
                        id={messageFieldId}
                        className="w-full bg-transparent border-4 border-black p-4 text-black font-bold focus:ring-0 focus:border-[#D83C14] transition-colors placeholder:text-gray-400 focus:outline-none resize-none"
                        placeholder="WHAT'S THE SCOPE?"
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        aria-invalid={errors.message ? true : undefined}
                        aria-describedby={errors.message ? `${messageFieldId}-error` : undefined}
                        required
                    ></textarea>
                </div>
                {errors.message && (
                    <span id={`${messageFieldId}-error`} className={errorText}>{errors.message}</span>
                )}
            </div>
            <div className="form-element pt-4">
                <button className="glitch-btn w-full md:w-auto bg-[#D83C14] text-white px-4 md:px-12 py-4 md:py-6 font-headline font-black text-base md:text-2xl uppercase tracking-tighter border-4 border-black transition-all duration-150 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:active:scale-100" id="submit-btn" type="submit" disabled={isLoading}>
                    {isLoading ? "PROCESSING..." : "INITIALIZE_TRANSFER →"}
                </button>
            </div>
            <p className="sr-only" role="status" aria-live="polite">
                {status === "error" ? "There was a problem submitting the contact form. Please try again." : ""}
            </p>
        </form>
    );
}
