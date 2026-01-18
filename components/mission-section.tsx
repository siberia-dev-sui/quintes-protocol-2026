export function MissionSection() {
    return (
        <section className="section-container">
            <div className="container mx-auto px-6">
                {/* Badge */}
                <div className="text-center mb-8">
                    <span className="badge-cyan">Our Mission</span>
                </div>

                {/* Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-sentient text-center mb-6">
                    <span className="gradient-text">Redefining Value Accrual for the </span>
                    <span className="text-[#00E0FF]">Digital Age.</span>
                </h2>

                {/* Description */}
                <p className="text-foreground/60 text-center max-w-4xl mx-auto mb-16 leading-relaxed">
                    Quintes addresses a significant market demand for reliable, efficient, and sustainable
                    yield solutions in a financial world often characterized by volatility and uncertainty.
                    Our commitment is to create a robust autonomous protocol that delivers consistent
                    returns and capital preservation within a dynamic global market. We derive our name
                    from &quot;quintessence,&quot; reflecting our mission: to deliver the purest, most
                    concentrated form of capital efficiency and engineered financial stability.
                </p>

                {/* Experts Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mt-20">
                    <div>
                        <h3 className="text-3xl md:text-4xl font-sentient mb-6">
                            <span className="gradient-text">Built by a </span>
                            <span className="text-[#00E0FF]">Global Team</span>
                            <span className="gradient-text"> of Experts</span>
                        </h3>
                        <p className="text-foreground/70 leading-relaxed">
                            The Quintes Protocol is the product of over two years of intensive research and development by a global team of dedicated contributors, including renowned token engineers, data scientists, cryptoeconomic researchers, and financial veterans.
                            <br /><br />
                            Our collective experience spans leading institutions and projects across both decentralized and traditional finance, such as Binance, Morgan Stanley, and Chainlink. This deep expertise ensures Quintes is built on a foundation of innovation, rigor, and real-world financial acumen.
                            <br /><br />
                            Our mechanisms have been validated through extensive simulations and collaborations with independent research labs.
                            <br /><br />
                            Our innovative approach combines over-collateralization with sophisticated, CeFi trading strategies to deliver sustainable yields on your crypto assets. We&apos;ve built QNT to be a yield-bearing asset that grows steadily through our patented cryptoeconomic mechanisms, backed by automated proof of collateral (APoC) for maximum security.
                        </p>
                    </div>

                    {/* Video Card */}
                    <div className="glass rounded-3xl overflow-hidden">
                        <div className="aspect-video bg-black relative">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover mix-blend-lighten"
                            >
                                <source
                                    src="https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/quintes%20ed.mp4"
                                    type="video/mp4"
                                />
                            </video>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative line */}
            <div className="line-horizontal mt-20" />
        </section>
    );
}
