"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Pill } from './pill';
import { useEffect, useState, useRef } from 'react';

// Data for the performance comparison chart
const performanceData = [
    { month: 'Jan', QNT: 100, ETH: 100, BTC: 100, SP500: 100, Gold: 100 },
    { month: 'Feb', QNT: 115, ETH: 95, BTC: 105, SP500: 101, Gold: 100 },
    { month: 'Mar', QNT: 135, ETH: 110, BTC: 115, SP500: 102, Gold: 101 },
    { month: 'Apr', QNT: 165, ETH: 105, BTC: 110, SP500: 103, Gold: 102 },
    { month: 'May', QNT: 195, ETH: 125, BTC: 125, SP500: 104, Gold: 102 },
    { month: 'Jun', QNT: 235, ETH: 115, BTC: 120, SP500: 105, Gold: 103 },
    { month: 'Jul', QNT: 285, ETH: 135, BTC: 135, SP500: 106, Gold: 103 },
    { month: 'Aug', QNT: 335, ETH: 130, BTC: 130, SP500: 107, Gold: 104 },
    { month: 'Sep', QNT: 385, ETH: 145, BTC: 140, SP500: 108, Gold: 104 },
    { month: 'Oct', QNT: 425, ETH: 160, BTC: 155, SP500: 109, Gold: 105 },
    { month: 'Nov', QNT: 450, ETH: 185, BTC: 165, SP500: 110, Gold: 105 },
];

const stats = [
    { label: 'QNT', value: 33, suffix: '%', color: 'text-primary' }, // Dorado
    { label: 'ETH (Avg)', value: 85, suffix: '%', color: 'text-[#E5E7EB]' }, // Gris muy claro
    { label: 'BTC (Avg)', value: 65, suffix: '%', color: 'text-[#9CA3AF]' }, // Gris medio
    { label: 'S&P 500', value: 10, suffix: '%', color: 'text-[#6B7280]' }, // Gris oscuro
    { label: 'Gold', value: 5, suffix: '%', color: 'text-[#4B5563]' }, // Gris más oscuro
];

// Animated Counter Component
function AnimatedCounter({ value, suffix = '', isVisible }: { value: number; suffix?: string; isVisible: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) return;

        let start = 0;
        const end = value;
        const duration = 2000; // 2 seconds
        const increment = end / (duration / 16); // 60fps

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, isVisible]);

    return <>{count >= 0 ? '+' : ''}{Math.floor(count)}{suffix}</>;
}

export function PerformanceChart() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="relative min-h-screen w-full flex items-center justify-center px-6 py-20">
            <div className="container max-w-6xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <Pill className="mb-6">Performance Comparison</Pill>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-sentient mb-6">
                        Why <span className="text-primary animate-pulse-subtle">QNT</span> Outperforms in <i className="font-light">All Markets</i>
                    </h2>
                    <p className="font-mono text-sm md:text-base text-foreground/60 max-w-2xl mx-auto">
                        While crypto markets swing wildly and traditional assets barely keep pace with inflation,
                        QNT delivers consistent, engineered growth regardless of market conditions.
                    </p>
                </div>

                {/* Chart Container */}
                <div className={`relative border border-border bg-background/50 backdrop-blur-sm p-6 md:p-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{
                        clipPath: "polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)"
                    }}
                >
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                {/* QNT Gradient with shimmer effect */}
                                <linearGradient id="colorQNT" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EBB800" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#EBB800" stopOpacity={0} />
                                </linearGradient>
                                {/* Grayscale gradients for others */}
                                <linearGradient id="colorETH" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#E5E7EB" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#E5E7EB" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBTC" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                            <XAxis
                                dataKey="month"
                                stroke="#666"
                                style={{ fontSize: '12px', fontFamily: 'monospace' }}
                            />
                            <YAxis
                                stroke="#666"
                                style={{ fontSize: '12px', fontFamily: 'monospace' }}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#000',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend
                                wrapperStyle={{
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    paddingTop: '20px'
                                }}
                            />
                            {/* Grayscale lines */}
                            <Area
                                type="monotone"
                                dataKey="Gold"
                                stroke="#4B5563"
                                strokeWidth={2}
                                fill="transparent"
                                name="Gold"
                            />
                            <Area
                                type="monotone"
                                dataKey="SP500"
                                stroke="#6B7280"
                                strokeWidth={2}
                                fill="transparent"
                                name="S&P 500"
                            />
                            <Area
                                type="monotone"
                                dataKey="BTC"
                                stroke="#9CA3AF"
                                strokeWidth={2}
                                fill="url(#colorBTC)"
                                name="Bitcoin (BTC)"
                            />
                            <Area
                                type="monotone"
                                dataKey="ETH"
                                stroke="#E5E7EB"
                                strokeWidth={2}
                                fill="url(#colorETH)"
                                name="Ethereum (ETH)"
                            />
                            {/* QNT - Golden hero line */}
                            <Area
                                type="monotone"
                                dataKey="QNT"
                                stroke="#EBB800"
                                strokeWidth={3}
                                fill="url(#colorQNT)"
                                name="QNT (Target 33% APY)"
                                className="animate-draw-line"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Stats Cards with Animated Counters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`border border-border bg-background/30 backdrop-blur-sm p-4 text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                            style={{
                                clipPath: "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)",
                                transitionDelay: `${i * 100}ms`
                            }}
                        >
                            <div className="font-mono text-xs text-foreground/60 uppercase mb-2">
                                {stat.label}
                            </div>
                            <div className={`font-mono text-lg md:text-xl font-bold ${stat.color} ${i === 0 ? 'animate-shimmer' : ''}`}>
                                <AnimatedCounter value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.85; }
                }
                
                @keyframes shimmer {
                    0% { filter: brightness(1); }
                    50% { filter: brightness(1.3); }
                    100% { filter: brightness(1); }
                }
                
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s ease-in-out infinite;
                }
                
                .animate-shimmer {
                    animation: shimmer 2s ease-in-out infinite;
                }
            `}</style>

            {/* Bottom divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>
    );
}
