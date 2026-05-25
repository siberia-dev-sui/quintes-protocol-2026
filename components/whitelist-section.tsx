"use client";

import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { logger, sanitizeForLog } from "@/utils/logger";

export function WhitelistSection() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);
        logger.info("Whitelist signup:", sanitizeForLog(email));

        try {
            const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;

            const response = await fetch("/api/whitelist/free", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, user_agent: userAgent }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                if (result.error === "Email already registered") {
                    toast.info("This email is already on the waitlist!");
                    setSubmitted(true);
                    return;
                }
                throw new Error(result.error || "Failed to save email");
            }

            setSubmitted(true);
            toast.success("Joined Whitelist", { description: "We'll be in touch soon!" });
        } catch (error) {
            logger.error("Whitelist Registration Error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="whitelist" className="section-with-guides py-32 px-6 relative overflow-hidden">
            {/* Subtle radial glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, rgba(255, 199, 0, 0.03) 0%, transparent 70%)" }}
            />

            <div className="guide-lines" />

            <div className="container mx-auto max-w-3xl text-center relative z-10">
                <Pill className="mb-6">EARLY ACCESS</Pill>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-sentient mb-6">
                    Join the <i className="font-light">Whitelist</i>
                </h2>

                <p className="font-mono text-foreground/60 mb-12">
                    Be among the first to access Quintes Protocol and start earning sustainable yields.
                </p>

                <div className="max-w-lg mx-auto">
                    {submitted ? (
                        <div
                            className="inline-flex items-center gap-3 px-8 py-4 border border-primary/50 bg-primary/10"
                            style={{
                                clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                            }}
                        >
                            <span className="inline-block size-2 rounded-full bg-primary shadow-glow shadow-primary/50" />
                            <span className="font-mono text-primary uppercase">Submission Received</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                disabled={isSubmitting}
                                className="w-full sm:w-auto min-w-[280px] px-6 py-4 bg-background border border-primary/30 font-mono text-foreground placeholder:text-foreground/40 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/20 focus:scale-[1.02] focus:outline-none transition-all duration-300 disabled:opacity-50"
                                style={{
                                    clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                                }}
                            />
                            <Button type="submit" size="sm" disabled={isSubmitting} className="hover:scale-105 hover:-translate-y-0.5 transition-transform duration-300">
                                {isSubmitting ? (
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                                    </svg>
                                ) : (
                                    "[Subscribe]"
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            {/* Bottom divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>
    );
}

export function WhitelistSectionWrapper() {
    return (
        <Suspense fallback={<div className="py-32 text-center font-mono text-foreground/40">Loading...</div>}>
            <WhitelistSection />
        </Suspense>
    );
}
