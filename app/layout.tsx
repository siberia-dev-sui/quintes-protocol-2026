import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/header";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { NoiseOverlay } from "@/components/noise-overlay";
import { JsonLd } from "@/components/json-ld";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quintes.org"),
  title: {
    default: "Quintes Protocol | Shariah-Compliant DeFi Yield — 33% APY",
    template: "%s | Quintes Protocol",
  },
  description: "Earn up to 33% APY on BTC, ETH, USDC, and USDT through Quintes Protocol — the first 200% overcollateralized, Shariah-compliant DeFi yield protocol on Arbitrum. Riba-free, halal investment for Muslim investors globally.",
  keywords: [
    "Shariah-compliant DeFi", "Islamic DeFi", "halal crypto yield", "halal investment",
    "Islamic finance blockchain", "halal staking", "Islamic crypto", "riba-free investment",
    "Saudi Arabia DeFi", "MENA DeFi", "GCC crypto", "Middle East DeFi", "UAE DeFi",
    "Gulf crypto investment", "halal finance", "Shariah compliant yield",
    "Quintes Protocol", "QNT token", "crypto yield", "DeFi yield",
    "33% APY", "stablecoin yield", "BTC yield", "ETH yield",
    "overcollateralized DeFi", "Arbitrum DeFi", "yield farming",
    "sustainable yield", "yield bearing asset", "crypto passive income",
  ],
  authors: [{ name: "Quintes Protocol", url: "https://quintes.org" }],
  creator: "Quintes Protocol",
  publisher: "Quintes Protocol",
  category: "Finance",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://quintes.org",
  },
  openGraph: {
    title: "Quintes Protocol | Shariah-Compliant DeFi Yield — 33% APY",
    description: "Earn up to 33% APY on BTC, ETH, USDC, and USDT. 200% overcollateralized, Shariah-compliant DeFi protocol on Arbitrum. Riba-free yield for Muslim investors worldwide.",
    url: "https://quintes.org",
    siteName: "Quintes Protocol",
    images: [
      {
        url: "https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/og%20imagen%20quintes.png",
        width: 1200,
        height: 630,
        alt: "Quintes Protocol — Shariah-Compliant DeFi Yield Protocol",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quintes Protocol | Shariah-Compliant DeFi Yield — 33% APY",
    description: "Earn up to 33% APY on BTC, ETH, USDC, USDT. 200% overcollateralized, Shariah-compliant DeFi on Arbitrum.",
    images: ["https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/og%20imagen%20quintes.png"],
    site: "@QuintesProtocol",
    creator: "@QuintesProtocol",
  },
  other: {
    "geo.region": "SA",
    "geo.country": "SA",
    "geo.placename": "Saudi Arabia",
    "DC.Language": "en",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <JsonLd />
          <NoiseOverlay />
          <Header />
          <SmoothScroll>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </SmoothScroll>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
