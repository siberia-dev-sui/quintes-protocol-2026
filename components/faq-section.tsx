"use client";

import { useState } from "react";
import { Pill } from "./pill";

const faqs = [
    {
        q: "How do I earn with Quintes using my BTC, ETH, or Stablecoins?",
        a: "You securely deposit your assets to mint QNT, our innovative yield-bearing stable asset. Your deposited collateral is then partially deployed into sophisticated, Shariah-compliant trading strategies that generate real revenue. You benefit from QNT's engineered value growth and can earn additional QTS rewards for participating."
    },
    {
        q: "What is QNT?",
        a: "QNT is a yield-bearing, stable asset you mint against your deposited collateral. It's overcollateralized and engineered for consistent value growth through unique, patented cryptoeconomic mechanisms, supported by yields from deployed collateral. The goal is to provide a reliable way for your crypto holdings to grow steadily."
    },
    {
        q: "Is my deposited collateral always safe?",
        a: "Security is paramount. For every $1 of QNT, we maintain at least $2 of collateral. If collateral values drop, automated partial liquidation restores this ratio. Additionally, reserve funds and our QTS treasury act as backstops. This Automated Proof of Collateral (APoC) system is designed to ensure QNT is always fully backed and redeemable."
    },
    {
        q: "How is Quintes Shariah-compliant?",
        a: "Our trading strategies, investment policies, and mechanisms are reviewed by Shariah scholars to ensure they align with Islamic financial principles, avoiding interest (Riba) and excessive uncertainty (Gharar)."
    },
    {
        q: "How is Quintes different from past yield protocols like Luna/UST?",
        a: "The difference is fundamental. Quintes is built on full 200% over-collateralization with diverse assets like BTC, ETH, and stablecoins. Luna/UST was an undercollateralized, algorithmic model reliant on its sister token's price. Our system is designed for long-term stability and solvency, a lesson learned from the failures of past protocols."
    },
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="section-with-guides py-32 px-6">
            {/* Guide lines */}
            <div className="guide-lines" />

            <div className="container mx-auto max-w-3xl relative z-10">
                <div className="text-center mb-16">
                    <Pill className="mb-6">Questions?</Pill>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-sentient">
                        Your Quintes Queries, <i className="font-light">Answered.</i>
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="border border-border hover:border-primary/30 transition-colors bg-background"
                            style={{
                                clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                            }}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-mono text-foreground uppercase text-sm pr-4">
                                    {faq.q}
                                </span>
                                <span className="font-mono text-primary text-xl shrink-0">
                                    {openIndex === i ? "−" : "+"}
                                </span>
                            </button>

                            {openIndex === i && (
                                <div className="px-6 pb-6 pt-0">
                                    <p className="font-mono text-sm text-foreground/60">{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>
    );
}
