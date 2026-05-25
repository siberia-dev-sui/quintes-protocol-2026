"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Assets", href: "#assets" },
  { label: "FAQ", href: "#faq" },
  { label: "Whitelist", href: "#whitelist" },
];

export const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Track if we're at the top for glassmorphism
      setIsAtTop(currentScrollY < 10);

      // Show navbar when at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        clearTimeout(scrollTimeout);
        setIsVisible(false);
      }
      // Delayed reappearance when scrolling up (300ms delay)
      else if (currentScrollY < lastScrollY) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsVisible(true);
        }, 300);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [lastScrollY]);

  const isDark = !mounted || resolvedTheme !== "light";
  // White logo in dark mode (dark hero + dark backdrop). Black logo in light mode (cream hero + cream backdrop).
  const logoFilter = isDark ? "brightness(0) invert(1)" : "brightness(0)";

  // White text only when floating over the dark hero. In light mode the hero is cream, so use foreground.
  const navTextClass = (isAtTop && isDark)
    ? "text-white/60 hover:text-white"
    : "text-foreground/60 hover:text-foreground";

  const docsTextClass = "text-primary hover:text-primary/80";

  return (
    <div
      className={`fixed z-50 top-0 left-0 w-full transition-all duration-300 ease-in-out ${isVisible ? "translate-y-0" : "-translate-y-full"
        } ${!isAtTop && isVisible ? "backdrop-blur-xl bg-background/80 border-b border-border/30" : "bg-transparent"
        }`}
    >
      <header className="flex items-center justify-between container py-5 md:py-6">
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <Logo className="h-[28px] md:h-[35px] w-auto object-contain" style={{ filter: logoFilter }} />
          <img
            src="https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/Layer_1.svg"
            alt="QUINTES"
            className="h-[18px] md:h-[22px] w-auto"
            style={{ filter: logoFilter }}
          />
        </Link>
        <nav className="flex max-lg:hidden absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-10">
          {navItems.map((item) => (
            <Link
              className={`uppercase inline-block font-mono duration-150 transition-colors ease-out ${navTextClass}`}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <ThemeToggle isOnDark={isAtTop && isDark} />
          <Link
            className={`uppercase max-lg:hidden transition-colors ease-out duration-150 font-mono ${docsTextClass}`}
            href="https://quintes.gitbook.io/quintes"
            target="_blank"
          >
            Docs
          </Link>
        </div>
        <MobileMenu />
      </header>
    </div>
  );
};
