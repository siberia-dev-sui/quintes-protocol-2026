import { Pill } from "./pill";

const features = [
    {
        title: "Overcollateralized",
        description: "For every $1 of QNT, we maintain at least $2 of collateral. Automated Proof of Collateral (APoC) ensures maximum security.",
    },
    {
        title: "Shariah-Compliant",
        description: "Strategies reviewed by Shariah scholars, avoiding interest (Riba) and excessive uncertainty (Gharar).",
    },
    {
        title: "Sustainable 33% APY",
        description: "Market-neutral hedging strategies generate sustainable yields without exposure to market volatility.",
    },
    {
        title: "Multi-Asset Support",
        description: "Deposit BTC, ETH, USDC, or USDT to mint QNT — our yield-bearing stable asset.",
    },
];

export function FeaturesSection() {
    return (
        <section id="about" className="section-with-guides py-32 px-6">
            {/* Guide lines */}
            <div className="guide-lines" />

            <div className="container mx-auto max-w-5xl relative z-10">
                <div className="text-center mb-16">
                    <Pill className="mb-6">ABOUT QUINTES</Pill>
                    <h2 className="text-4xl md:text-5xl font-sentient mb-6">
                        The S&P of <i className="font-light">Web3</i>
                    </h2>
                    <p className="font-mono text-foreground/70 max-w-2xl mx-auto">
                        Next-generation financial infrastructure built to solve the core failures
                        of DeFi and traditional finance: volatility, unsound incentives, and inaccessible yield.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="group p-6 bg-background border border-border hover:border-primary/50 transition-all duration-300 relative"
                            style={{
                                clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)"
                            }}
                        >
                            {/* Corner accents */}
                            <span className="absolute top-1 left-1 w-4 h-px bg-border group-hover:bg-primary/50 transition-colors -rotate-45 origin-left" />
                            <span className="absolute top-1 right-1 w-4 h-px bg-border group-hover:bg-primary/50 transition-colors rotate-45 origin-right" />
                            <span className="absolute bottom-1 left-1 w-4 h-px bg-border group-hover:bg-primary/50 transition-colors rotate-45 origin-left" />
                            <span className="absolute bottom-1 right-1 w-4 h-px bg-border group-hover:bg-primary/50 transition-colors -rotate-45 origin-right" />

                            <div className="flex items-start gap-4">
                                <span className="inline-block size-2 rounded-full bg-primary mt-2 shadow-glow shadow-primary/50 shrink-0" />
                                <div>
                                    <h3 className="font-mono text-lg text-foreground mb-2 uppercase">
                                        {feature.title}
                                    </h3>
                                    <p className="font-mono text-sm text-foreground/70">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>
    );
}
