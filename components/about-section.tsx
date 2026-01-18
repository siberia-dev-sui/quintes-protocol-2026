const assets = [
    { name: "Bitcoin", symbol: "BTC", icon: "https://cdn.prod.website-files.com/661fa8c48456bfac79f572d5/661fa8c48456bfac79f572fd_Coin-6.svg" },
    {
        name: "Ethereum",
        symbol: "ETH",
        iconSvg: (
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#627EEA" />
                <path d="M24 8L23.8 8.68V30.14L24 30.34L33.6 24.68L24 8Z" fill="#C0CBF6" />
                <path d="M24 8L14.4 24.68L24 30.34V19.96V8Z" fill="white" />
                <path d="M24 32.44L23.88 32.58V40.02L24 40.36L33.6 26.8L24 32.44Z" fill="#C0CBF6" />
                <path d="M24 40.36V32.44L14.4 26.8L24 40.36Z" fill="white" />
            </svg>
        )
    },
    {
        name: "USD Coin",
        symbol: "USDC",
        iconSvg: (
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#2775CA" />
                <path d="M30.5 26.5C30.5 23.5 28.5 22.5 24.5 22C21.5 21.5 21 20.5 21 19C21 17.5 22 16.5 24 16.5C25.8 16.5 26.8 17.2 27.2 18.8C27.3 19.2 27.6 19.5 28 19.5H29.5C30 19.5 30.4 19.1 30.3 18.6C29.8 16.3 28 14.5 25.5 14.1V12.5C25.5 12 25.1 11.5 24.5 11.5H23.5C22.9 11.5 22.5 12 22.5 12.5V14C19.5 14.5 17.5 16.5 17.5 19.2C17.5 22.2 19.5 23.2 23.5 23.7C26.5 24.2 27 25.2 27 26.7C27 28.2 25.7 29.3 24 29.3C21.7 29.3 20.8 28.3 20.5 26.7C20.4 26.3 20.1 26 19.7 26H18.1C17.6 26 17.2 26.4 17.3 26.9C17.8 29.6 19.8 31.3 22.5 31.8V33.5C22.5 34 22.9 34.5 23.5 34.5H24.5C25.1 34.5 25.5 34 25.5 33.5V31.8C28.5 31.2 30.5 29.2 30.5 26.5Z" fill="white" />
            </svg>
        )
    },
    {
        name: "Tether",
        symbol: "USDT",
        iconSvg: (
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#26A17B" />
                <path d="M26.5 24.5V27C30.5 26.7 33.5 25.7 33.5 24.5C33.5 23.3 30.5 22.3 26.5 22V24.5Z" fill="white" />
                <path d="M21.5 24.5V22C17.5 22.3 14.5 23.3 14.5 24.5C14.5 25.7 17.5 26.7 21.5 27V24.5Z" fill="white" />
                <path d="M26.5 21V18H31.5V14H16.5V18H21.5V21C16.3 21.3 12.5 22.8 12.5 24.5C12.5 26.2 16.3 27.7 21.5 28V35H26.5V28C31.7 27.7 35.5 26.2 35.5 24.5C35.5 22.8 31.7 21.3 26.5 21Z" fill="white" />
            </svg>
        )
    }
];

export function AboutSection() {
    return (
        <section className="section-container">
            <div className="container mx-auto px-6">
                {/* Badge */}
                <div className="text-center mb-8">
                    <span className="badge-cyan">About Quintes</span>
                </div>

                {/* Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-sentient text-center mb-6">
                    <span className="gradient-text">The S&P of Web3. But </span>
                    <span className="text-[#00E0FF]">Safer, Smarter,</span>
                    <span className="gradient-text"> and </span>
                    <span className="text-[#00E0FF]">Collateralized.</span>
                </h2>

                {/* Description */}
                <p className="text-foreground/60 text-center max-w-3xl mx-auto mb-16 leading-relaxed">
                    Quintes Protocol is a next-generation financial infrastructure built to solve the core
                    failures of DeFi and traditional finance: volatility, unsound incentives, and
                    inaccessible yield. We provide a sophisticated yet simple platform for you to securely
                    stake your BTC, ETH, and stablecoins and earn superior, sustainable returns.
                </p>

                {/* Assets Grid */}
                <div className="text-center mb-8">
                    <span className="text-sm uppercase tracking-widest text-foreground/40">Deposit Your Assets</span>
                </div>

                <div className="flex flex-wrap justify-center gap-6 mb-8">
                    {assets.map((asset) => (
                        <div
                            key={asset.symbol}
                            className="glass flex flex-col items-center gap-3 px-10 py-6 rounded-2xl hover:border-[#00E0FF]/40 hover:shadow-[0_0_20px_rgba(0,224,255,0.15)] hover:-translate-y-1 transition-all duration-300"
                        >
                            {asset.icon ? (
                                <img src={asset.icon} alt={asset.name} className="w-12 h-12" />
                            ) : (
                                asset.iconSvg
                            )}
                            <div className="text-white font-semibold">{asset.name}</div>
                            <div className="text-white/50 text-sm">{asset.symbol}</div>
                        </div>
                    ))}
                </div>

                {/* APY Badge */}
                <div className="flex justify-center">
                    <div className="px-8 py-3 rounded-full bg-gradient-to-r from-[#00E0FF]/20 to-[#00E0FF]/10 border border-[#00E0FF]/40">
                        <span className="text-[#00E0FF] font-semibold text-lg">Earn up to 33% APY</span>
                    </div>
                </div>
            </div>

            {/* Decorative line */}
            <div className="line-horizontal mt-20" />
        </section>
    );
}
