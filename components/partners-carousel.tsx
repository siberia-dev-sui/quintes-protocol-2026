"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Partners according to provided image - procedurally aligned with current design
const partners = [
    { name: "OKX Exchange", logo: "/logos/okx-premium.svg" },
    { name: "Arbitrum", logo: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/Gemini_Generated_Image_five1cfive1cfive.svg" },
    { name: "Optimism", logo: "/logos/optimism.svg" },
    { name: "Republic", logo: "/logos/republic.svg" },
];

export function PartnersCarousel() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isLight = mounted && resolvedTheme === "light";
    const logoFilter = isLight
        ? "brightness(0)"            // black logos on light bg
        : "brightness(0) invert(1)"; // white logos on dark bg
    const logoOpacity = isLight ? "opacity-70" : "opacity-50";

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
                {/* Gradient overlays — use oklch-compatible stops to avoid black interpolation bug */}
                <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
                <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />

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
                                    style={{ filter: logoFilter }}
                                    className={`max-h-[42px] md:max-h-[54px] w-auto max-w-[135px] md:max-w-[162px] ${logoOpacity} hover:opacity-100 transition-all duration-300 object-contain`}
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
