"use client";

import { useState } from "react";
import { Pill } from "./pill";
import { Button } from "./ui/button";

export function CTASection() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubmitted(true);
            console.log("Whitelist signup:", email);
        }
    };

    return (
        <section id="whitelist" className="section-with-guides py-32 px-6">
            {/* Guide lines */}
            <div className="guide-lines" />

            <div className="container mx-auto max-w-2xl text-center relative z-10">
                <Pill className="mb-6">EARLY ACCESS</Pill>
                <h2 className="text-4xl md:text-5xl font-sentient mb-6">
                    Join the <i className="font-light">Whitelist</i>
                </h2>
                <p className="font-mono text-foreground/60 mb-12">
                    Be among the first to access Quintes Protocol and start earning sustainable yields.
                </p>

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
                            className="w-full sm:w-auto min-w-[280px] px-6 py-4 bg-background border border-border font-mono text-foreground placeholder:text-foreground/40 focus:border-primary/50 focus:outline-none transition-colors"
                            style={{
                                clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                            }}
                        />
                        <Button type="submit" size="sm">
                            [Subscribe]
                        </Button>
                    </form>
                )}

                <p className="font-mono text-xs text-foreground/40 mt-8">
                    Powered by Arbitrum & iExec
                </p>
            </div>
        </section>
    );
}
