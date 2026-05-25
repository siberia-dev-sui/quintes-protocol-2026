"use client";

import Link from "next/link";
import { GL } from "./gl";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { CopyDesignButton } from "./copy-design-button";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function Hero() {
  const [hovering, setHovering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  // Default to dark until mounted — keeps server and first-client render in sync
  const isDark = !mounted || resolvedTheme !== "light";

  // hero section bg matches the WebGL canvas bg to avoid flash during hydration
  const heroBg = isDark ? "bg-black" : "bg-[#f8f7f2]";

  return (
    <section className={`relative h-svh overflow-hidden transition-colors duration-700 ${heroBg}`}>
      {/* 3D Background */}
      <GL hovering={hovering} isDark={isDark} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center h-full justify-end pb-28 sm:pb-16 text-center">
        <Pill className={`mb-6 sm:mb-8 ${isDark ? "!text-white/50 !border-white/20" : "!text-black/50 !border-black/20"}`}>APY TARGET: 33%</Pill>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sentient px-4 leading-tight transition-colors duration-700 ${isDark ? "text-white" : "text-black"}`}>
          Institutional Grade <br />
          <i className="font-light">Yield</i>
        </h1>
        <p className={`font-mono text-[15px] sm:text-base text-balance mt-6 sm:mt-8 max-w-[500px] mx-auto px-6 transition-colors duration-700 ${isDark ? "text-white/60" : "text-black/75"}`}>
          Scale your Bitcoin and Stablecoins with a mathematically engineered 33% APY target.
          Backed by Automated Proof of Collateral.
        </p>

        <Link className="max-sm:hidden" href="https://quintes.gitbook.io/quintes" target="_blank">
          <Button
            className="mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            [Read Docs]
          </Button>
        </Link>
        <Link className="sm:hidden" href="https://quintes.gitbook.io/quintes" target="_blank">
          <Button
            size="sm"
            className="mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            [Read Docs]
          </Button>
        </Link>

        <p className={`font-mono text-xs mt-4 transition-colors duration-700 ${isDark ? "text-white/40" : "text-black/55"}`}>
          Powered by Arbitrum
        </p>

        <div className="mt-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <CopyDesignButton isDark={isDark} />
        </div>
      </div>

      {/* Bottom gradient — dark mode only. Light mode: hero bg === page bg, no gradient needed */}
      {isDark && (
        <div className="absolute bottom-0 left-0 right-0 h-40 z-5 pointer-events-none bg-gradient-to-t from-black to-transparent" />
      )}
    </section>
  );
}
