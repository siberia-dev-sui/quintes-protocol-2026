import Link from "next/link";
import type { ReactElement } from "react";

const articles = [
    {
        title: "The Quintillionaires Ambassador Program Is Now LIVE",
        excerpt: "A community-driven initiative designed to empower passionate supporters and expand our global reach.",
        date: "Nov 27, 2024",
        href: "https://paragraph.xyz/@quintes/the-quintillionaires-ambassador-program-is-now-live",
        icon: "users"
    },
    {
        title: "QTS and Its Role In The Quintes Ecosystem",
        excerpt: "Understanding the utility token that powers governance, staking rewards, and value accrual in Quintes.",
        date: "Nov 16, 2024",
        href: "https://paragraph.xyz/@quintes/qts-and-its-role-in-the-quintes-ecosystem",
        icon: "token"
    },
    {
        title: "Quintes Ecosystem Unveiled: The Next Generation",
        excerpt: "A comprehensive look at the infrastructure powering sustainable yield and capital preservation.",
        date: "Nov 16, 2024",
        href: "https://paragraph.xyz/@quintes/quintes-ecosystem-unveiled",
        icon: "layers"
    },
    {
        title: "Quintes Protocol: Frequently Asked Questions",
        excerpt: "Everything you need to know about QNT, staking, yields, and the security behind Quintes.",
        date: "Nov 16, 2024",
        href: "https://paragraph.xyz/@quintes/quintes-protocol-frequently-asked-questions",
        icon: "help"
    },
    {
        title: "Why Quintes Incorporates High-Frequency Trading",
        excerpt: "How our market-neutral strategies generate sustainable yields without exposure to market volatility.",
        date: "Nov 16, 2024",
        href: "https://paragraph.xyz/@quintes/why-quintes-incorporates-high-frequency-trading",
        icon: "chart"
    },
    {
        title: "Quintes Manifesto",
        excerpt: "Shaking the finance world to historic crypto proportions. Our vision for the future of DeFi.",
        date: "Nov 14, 2024",
        href: "https://paragraph.xyz/@quintes/quintes-manifesto",
        icon: "document"
    }
];

function ArticleIcon({ type }: { type: string }) {
    const icons: Record<string, ReactElement> = {
        users: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 opacity-50">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        token: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 opacity-50">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
        layers: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 opacity-50">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        ),
        help: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 opacity-50">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        chart: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 opacity-50">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        document: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 opacity-50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        )
    };
    return icons[type] || icons.document;
}

export function ArticlesSection() {
    return (
        <section className="section-container">
            <div className="container mx-auto px-6">
                {/* Badge */}
                <div className="text-center mb-8">
                    <span className="badge-cyan">From Our Blog</span>
                </div>

                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-sentient text-center mb-12">
                    <span className="gradient-text">Deep Dive Into </span>
                    <span className="text-[#00E0FF]">Quintes</span>
                </h2>

                {/* Articles Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <Link
                            key={article.title}
                            href={article.href}
                            target="_blank"
                            className="glass rounded-2xl overflow-hidden hover:border-[#00E0FF]/40 hover:shadow-[0_0_30px_rgba(0,224,255,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                            {/* Placeholder Image */}
                            <div className="h-44 bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center gap-3">
                                <ArticleIcon type={article.icon} />
                                <span className="text-white/25 text-xl font-semibold">QUINTES</span>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="text-white/50 text-xs mb-2">{article.date}</div>
                                <h3 className="text-white font-semibold text-lg mb-3 line-clamp-2">{article.title}</h3>
                                <p className="text-white/60 text-sm flex-1">{article.excerpt}</p>
                                <div className="flex items-center gap-2 mt-4 text-[#00E0FF] text-sm">
                                    Read Article
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View All Button */}
                <div className="flex justify-center mt-10">
                    <Link
                        href="https://paragraph.xyz/@quintes"
                        target="_blank"
                        className="btn-primary-cyan px-8 py-3 rounded-lg"
                    >
                        View All Articles on Paragraph
                    </Link>
                </div>
            </div>

            {/* Decorative line */}
            <div className="line-horizontal mt-20" />
        </section>
    );
}
