"use client";

// Collaborators - team background institutions
const collaborators = [
    { name: "Chainlink", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/chainlink_logo%201.svg" },
    { name: "Binance", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/binance%201.svg" },
    { name: "Kings College London", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/kings-college-london%201.svg" },
    { name: "Consensys", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/consensys%201.svg" },
    { name: "Metamask", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/metamask_logo%201.svg" },
    { name: "Algorand", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/algorand%201.svg" },
    { name: "UCL", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/UCL%201.svg" },
    { name: "Morgan Stanley", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/Morgan_Stanley_Logo%201.svg" },
];

export function CollaboratorsCarousel() {
    return (
        <section className="relative">
            {/* Top border with integrated text */}
            <div className="relative border-t border-border">
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-background z-50">
                    <span className="font-mono text-xs uppercase tracking-widest text-foreground/40">
                        Contributes from
                    </span>
                </div>
            </div>

            {/* Carousel content */}
            <div className="py-7 relative border-b border-border overflow-hidden">
                {/* Gradient overlays */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                {/* Marquee Container - scrolling LEFT TO RIGHT (reverse direction) */}
                <div className="marquee-container">
                    <div className="marquee-content-reverse">
                        {/* Duplicate collaborators array 3 times for seamless loop */}
                        {[...collaborators, ...collaborators, ...collaborators].map((collaborator, i) => (
                            <div
                                key={`${collaborator.name}-${i}`}
                                className="flex items-center justify-center min-w-[110px] md:min-w-[145px] mx-4 md:mx-7 h-[42px] md:h-[58px]"
                            >
                                <img
                                    src={collaborator.logo}
                                    alt={collaborator.name}
                                    className="max-h-[42px] md:max-h-[54px] w-auto max-w-[135px] md:max-w-[162px] opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 object-contain"
                                    onError={(e) => {
                                        // Fallback to text if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        const textEl = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (textEl) textEl.style.display = 'block';
                                    }}
                                />
                                <span className="hidden font-mono text-xs text-foreground/40">{collaborator.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inline CSS for guaranteed animation - REVERSE DIRECTION */}
                <style jsx>{`
                    .marquee-container {
                        display: flex;
                        width: 100%;
                    }
                    
                    .marquee-content-reverse {
                        display: flex;
                        width: max-content;
                        animation: scroll-marquee-reverse 60s linear infinite;
                        will-change: transform;
                    }
                    
                    @keyframes scroll-marquee-reverse {
                        0% {
                            transform: translateX(-33.333%);
                        }
                        100% {
                            transform: translateX(0);
                        }
                    }
                    
                    .marquee-content-reverse:hover {
                        animation-play-state: paused;
                    }
                `}</style>
            </div>
        </section>
    );
}
