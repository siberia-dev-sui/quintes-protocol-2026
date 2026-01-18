"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { useEffect, useState } from "react";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Assets", href: "#assets" },
  { label: "FAQ", href: "#faq" },
  { label: "Whitelist", href: "#whitelist" },
];

export const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`fixed z-50 pt-8 md:pt-14 top-0 left-0 w-full transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      <header className="flex items-center justify-between container">
        <Link href="/">
          <Logo className="w-[31px] h-[31px] md:w-[40px] md:h-[40px]" />
        </Link>
        <nav className="flex max-lg:hidden absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-10">
          {navItems.map((item) => (
            <Link
              className="uppercase inline-block font-mono text-foreground/60 hover:text-foreground/100 duration-150 transition-colors ease-out"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          className="uppercase max-lg:hidden transition-colors ease-out duration-150 font-mono text-primary hover:text-primary/80"
          href="https://quintes.gitbook.io/quintes"
          target="_blank"
        >
          Docs
        </Link>
        <MobileMenu />
      </header>
    </div>
  );
};
