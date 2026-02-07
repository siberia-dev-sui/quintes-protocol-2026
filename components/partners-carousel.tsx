"use client";

// Partners according to provided image - procedurally aligned with current design
const partners = [
    { name: "OKX Exchange", logo: "/logos/okx-premium.svg" },
    { name: "Arbitrum", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/Gemini_Generated_Image_five1cfive1cfive.svg" },
    { name: "Optimism", logo: "/logos/optimism.svg" },
    { name: "iExec", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/iexec.svg" },
    { name: "Republic", logo: "/logos/republic.svg" },
];

export function PartnersCarousel() {
    return (
        <section className="relative pt-12">
            {/* Top border with integrated text */}
            <div className="relative border-t border-border">
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-background z-50">
                    <span className="font-mono text-xs uppercase tracking-widest text-foreground/40">
                        Partners
                    </span>
                </div>
            </div>

            {/* Carousel content */}
            <div className="py-7 relative border-b border-border overflow-hidden">
                {/* Gradient overlays */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                {/* Marquee Container */}
                <div className="marquee-container">
                    <div className="marquee-content">
                        {/* Duplicate partners array 3 times for seamless loop */}
                        {[...partners, ...partners, ...partners].map((partner, i) => (
                            <div
                                key={`${partner.name}-${i}`}
                                className="flex items-center justify-center min-w-[110px] md:min-w-[145px] mx-4 md:mx-7 h-[42px] md:h-[58px]"
                            >
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="max-h-[42px] md:max-h-[54px] w-auto max-w-[135px] md:max-w-[162px] opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 object-contain"
                                    onError={(e) => {
                                        // Fallback to text if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        const textEl = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (textEl) textEl.style.display = 'block';
                                    }}
                                />
                                <span className="hidden font-mono text-xs text-foreground/40">{partner.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inline CSS for guaranteed animation */}
                <style jsx>{`
                    .marquee-container {
                        display: flex;
                        width: 100%;
                    }
                    
                    .marquee-content {
                        display: flex;
                        width: max-content;
                        animation: scroll-marquee 60s linear infinite;
                        will-change: transform;
                    }
                    
                    @keyframes scroll-marquee {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-33.333%);
                        }
                    }
                    
                    .marquee-content:hover {
                        animation-play-state: paused;
                    }
                `}</style>
            </div>
        </section>
    );
}
