# 🌟 Quintes Protocol - Official Website

> Institutional Grade Yield. Engineered for Consistent 33% APY Growth.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📖 Overview

Quintes Protocol is a next-generation DeFi protocol offering sustainable, engineered crypto yields through a mathematically sound, overcollateralized stable asset: **QNT**.

This repository contains the official landing page showcasing:
- 🎯 **33% APY Target** - Consistent, predictable returns
- 🔒 **200% Overcollateralization** - Maximum security with Automated Proof of Collateral (APoC)
- ✅ **Shariah-Compliant** - Reviewed by Islamic scholars
- 📊 **Performance Charts** - Real-time market comparisons
- 🌐 **Multi-Asset Support** - BTC, ETH, USDC, USDT deposits

---

## 🚀 Features

### Core Sections

- **Hero Section** - 3D particle background with WebGL animations
- **Partners Carousel** - Infinite scrolling banner showcasing strategic partners (OKX, Arbitrum, iExec, Saudi Ministry, etc.)
- **Features Grid** - Key protocol advantages (Overcollateralized, Sustainable APY, Multi-Asset Support, Shariah-Compliant)
- **Assets Section** - Supported deposit assets (BTC, ETH, USDC, USDT)
- **Collaborators Banner** - Team background institutions (Chainlink, Binance, King's College, Consensys, Metamask, etc.)
- **Performance Chart** - Interactive animated chart comparing QNT vs ETH, BTC, S&P 500, and Gold
- **FAQ Section** - Comprehensive answers to common questions
- **Whitelist Form** - Email capture with iExec Web3Mail integration

### Design System

- ✨ **Procedural Aesthetic** - Chamfered corners, monospace typography
- 🎨 **Gold Primary** - `#EBB800` brand color
- 🌑 **Dark Theme** - Optimized for crypto audiences
- 📱 **Fully Responsive** - Mobile-first design
- ⚡ **Smooth Animations** - Intersection Observer triggers, CSS transitions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Utility-first styling |
| **Three.js + React Three Fiber** | 3D particle animations |
| **Recharts** | Performance chart visualizations |
| **iExec** | Decentralized email encryption |
| **Ethers.js v6** | Blockchain interactions |
| **Sonner** | Toast notifications |

---

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/siberia-dev-sui/quintes-protocol-2026.git
cd quintes-protocol-2026

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## 🎨 Key Components

### Performance Chart (`components/performance-chart.tsx`)
- **Animated counters** - Numbers count up on scroll
- **Minimalista color scheme** - Gold QNT vs grayscale competitors
- **Intersection Observer** - Triggers animations when visible
- **Responsive design** - Adapts to all screen sizes

### Collaborators Carousel (`components/collaborators-carousel.tsx`)
- **Infinite scroll** - Left-to-right animation (reverse of partners)
- **Institutional logos** - Team background credentials
- **Hover effects** - Grayscale to color on hover

### FAQ Section (`components/faq-section.tsx`)
- **5 Comprehensive Questions** - Covers earning, QNT definition, safety, Shariah compliance, Luna/UST comparison
- **Accordion UI** - Expandable/collapsible answers
- **Monospace typography** - Consistent with brand

### Auto-Hide Navbar (`components/header.tsx`)
- **Scroll detection** - Hides when scrolling down, shows when scrolling up
- **Smooth transitions** - 300ms ease-in-out animation
- **Always visible at top** - Ensures navigation access

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Create `.env.local`:

```env
# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# iExec (for whitelist email encryption)
NEXT_PUBLIC_IEXEC_APP_ADDRESS=0x...
NEXT_PUBLIC_WEB3MAIL_APP=your_web3mail_app
```

---

## 📄 Project Structure

```
quintes-minimal-v2/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/
│   ├── hero.tsx            # Hero section with 3D particles
│   ├── partners-carousel.tsx
│   ├── features-section.tsx
│   ├── assets-section.tsx
│   ├── collaborators-carousel.tsx
│   ├── performance-chart.tsx  # Animated market comparison
│   ├── faq-section.tsx
│   ├── whitelist-section.tsx
│   ├── footer.tsx
│   └── header.tsx          # Auto-hide navbar
├── public/
│   └── logos/              # Partner & collaborator logos
└── styles/
    └── globals.css         # Design system tokens
```

---

## 🎯 Recent Updates (Jan 2026)

### ✅ Completed
- ✨ **Performance Chart** - Added animated comparison chart with gold QNT vs grayscale competitors
- 🏢 **Collaborators Banner** - New infinite carousel with institutional logos (Chainlink, Binance, etc.)
- 📝 **FAQ Refinement** - Reduced from 6 to 5 most essential questions
- 🎨 **Color Scheme** - Applied "Minimalista Brand" palette (gold hero, grayscale competition)
- 🔄 **Auto-Hide Navbar** - Implemented smooth scroll-based navbar visibility
- 🌊 **Animations** - Added intersection observer triggers, animated counters, shimmer effects
- 🧹 **Code Cleanup** - Removed Mission section, optimized components

### 🎨 Design Philosophy
- **Procedural** - Chamfered corners, monospace fonts, grid-based layouts
- **Minimal** - Only essential information, no clutter
- **Premium** - Gold accents, smooth animations, high-quality imagery
- **Engineered** - Reflects QNT's predictable, mathematical approach

---

## 🤝 Contributing

This is a private repository for Quintes Protocol. For inquiries:

- 🐦 **Twitter**: [@QuintesProtocol](https://x.com/QuintesProtocol)
- 📚 **Docs**: [quintes.gitbook.io](https://quintes.gitbook.io/quintes)
- 💬 **Telegram**: [t.me/QuintesProtocol](https://t.me/QuintesProtocol)
- 💬 **Discord**: [discord.gg/quintes](https://discord.gg/quintes)

---

## 📜 License

© 2026 Quintes Protocol. All rights reserved.

---

## 🙏 Acknowledgments

Built with contributions from:
- **Chainlink** - Oracle infrastructure
- **Binance** - Exchange partnerships
- **iExec** - Decentralized computing
- **Arbitrum** - L2 scaling solution
- Academic collaborators from **King's College London**, **UCL**
- Financial expertise from **Morgan Stanley**, **Consensys**

**Powered by**: Arbitrum & iExec

---

<p align="center">
  <strong>Deposit your crypto. Mint QNT. Watch it grow. 🚀</strong>
</p>
