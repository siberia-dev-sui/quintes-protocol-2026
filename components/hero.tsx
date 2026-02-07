"use client";

import Link from "next/link";
import { GL } from "./gl";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { useState } from "react";

export function Hero() {
  const [hovering, setHovering] = useState(false);
  return (
    <section className="relative h-svh overflow-hidden">
      {/* 3D Background - contained within this section */}
      <GL hovering={hovering} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center h-full justify-end pb-16 text-center">
        <Pill className="mb-6">APY TARGET: 33%</Pill>
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-sentient px-4">
          Institutional Grade <br />
          <i className="font-light">Yield</i>
        </h1>
        <p className="font-mono text-sm sm:text-base text-foreground/60 text-balance mt-8 max-w-[500px] mx-auto px-6">
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

        <p className="font-mono text-xs text-foreground/40 mt-4">
          Powered by Arbitrum & iExec
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-5 pointer-events-none" />
    </section>
  );
}
