import { Pill } from "./pill";

const assets = [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "USDC", name: "USD Coin" },
    { symbol: "USDT", name: "Tether" },
];

export function AssetsSection() {
    return (
        <section id="assets" className="section-with-guides py-32 px-6">
            {/* Guide lines */}
            <div className="guide-lines" />

            <div className="container mx-auto max-w-4xl text-center relative z-10">
                <Pill className="mb-6">DEPOSIT ASSETS</Pill>
                <h2 className="text-4xl md:text-5xl font-sentient mb-6">
                    Your Crypto, <i className="font-light">Growing</i>
                </h2>
                <p className="font-mono text-foreground/60 max-w-xl mx-auto mb-16">
                    Deposit your assets to mint QNT — our yield-bearing stable asset
                    engineered for consistent value growth.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {assets.map((asset) => (
                        <div
                            key={asset.symbol}
                            className="group px-8 py-6 bg-background border border-border hover:border-primary/50 transition-all duration-300"
                            style={{
                                clipPath: "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)"
                            }}
                        >
                            <div className="font-mono text-2xl text-primary mb-1">{asset.symbol}</div>
                            <div className="font-mono text-xs text-foreground/40 uppercase">{asset.name}</div>
                        </div>
                    ))}
                </div>

                <div
                    className="inline-flex items-center gap-3 px-6 py-3 border border-primary/50 bg-primary/5"
                    style={{
                        clipPath: "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)"
                    }}
                >
                    <span className="inline-block size-2 rounded-full bg-primary shadow-glow shadow-primary/50" />
                    <span className="font-mono text-primary">EARN UP TO 33% APY</span>
                </div>
            </div>

            {/* Bottom divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>
    );
}
