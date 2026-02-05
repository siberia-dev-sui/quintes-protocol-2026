import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/header";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quintes Protocol | Sustainable Crypto Yields up to 33% APY",
  description: "Deposit BTC, ETH, or stablecoins to mint QNT — a yield-bearing asset engineered for consistent value growth. 200% overcollateralized, Shariah-compliant, and built for long-term capital preservation.",
  openGraph: {
    title: "Quintes Protocol | Sustainable Crypto Yields up to 33% APY",
    description: "Deposit BTC, ETH, or stablecoins to mint QNT — a yield-bearing asset engineered for consistent value growth.",
    url: "https://quintes.org",
    siteName: "Quintes Protocol",
    images: ["https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/og%20imagen%20quintes.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quintes Protocol | Sustainable Crypto Yields up to 33% APY",
    description: "Deposit BTC, ETH, or stablecoins to mint QNT — a yield-bearing asset engineered for consistent value growth.",
    images: ["https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/og%20imagen%20quintes.png"],
    site: "@QuintesProtocol",
    creator: "@QuintesProtocol",
  },
  keywords: ["DeFi", "Yield", "Crypto", "BTC", "ETH", "Stablecoins", "QNT", "Staking", "Shariah-compliant", "Overcollateralized"],
  authors: [{ name: "Quintes Protocol" }],
  generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Header />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
