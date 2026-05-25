"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ isOnDark = false }: { isOnDark?: boolean }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isDark = theme === "dark";
    const textClass = isOnDark
        ? "text-white/60 hover:text-white"
        : "text-foreground/60 hover:text-foreground";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            className={`max-lg:hidden flex items-center gap-1.5 font-mono text-xs uppercase transition-colors duration-150 ${textClass}`}
        >
            {isDark ? (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5" strokeWidth="2" />
                        <path strokeWidth="2" strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                    Light
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                    Dark
                </>
            )}
        </button>
    );
}
