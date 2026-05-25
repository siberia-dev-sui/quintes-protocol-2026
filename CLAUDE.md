# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
npm start        # Start production server (after build)
```

No test suite is configured in this project.

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-only, used in /api/whitelist/save
NEXT_PUBLIC_CHAIN_ID=42161        # 42161=Arbitrum One, 421614=Arbitrum Sepolia, 134=iExec Bellecour
SPONSOR_PRIVATE_KEY=              # Server wallet that pays all iExec gas/RLC fees
```

The app uses `lib/env.ts` (Zod validation) for `NEXT_PUBLIC_*` vars and falls back to placeholder values at build time so Vercel can build without live credentials.

## Architecture

### Landing Page Structure (`app/page.tsx`)
Single-page app with sections rendered in order: Hero → PartnersCarousel → FeaturesSection → AssetsSection → CollaboratorsCarousel → FAQSection → WhitelistSectionWrapper → Footer. The `Header` is in the root layout with auto-hide scroll behavior.

### Whitelist Flow — Two Modes
The whitelist section (`components/whitelist-section.tsx`) has two tabs:

**FREE** — email only → `POST /api/whitelist/free` → saves to Supabase `whitelist_free` table.

**PREMIUM (iExec)** — wallet + email → `POST /api/whitelist/iexec-execute` (server-side) → `POST /api/whitelist/save`:
1. Server wallet (`SPONSOR_PRIVATE_KEY`) calls `IExecDataProtectorCore.protectData()` to encrypt the email on-chain (Arbitrum One).
2. Server grants access to the Web3Mail app whitelist (`0xD5054a18565c4a9E5c1aa3cEB53258bd59d4c78C`).
3. Server checks/deposits RLC into iExec escrow.
4. Server sends welcome email via `IExecWeb3mail.sendEmail()`.
5. `protectedDataAddress` returned → saved to Supabase `whitelist_participants` table.

The user signs **nothing** — the backend wallet pays all gas and RLC fees (gasless UX).

### Network Configuration
Network mode is controlled by `NETWORK_MODE` constant at the top of `components/whitelist-section.tsx` (hardcoded to `'mainnet'`). The `lib/network-config.ts` and `lib/env.ts` also read `NEXT_PUBLIC_CHAIN_ID`. These two sources must stay in sync when switching networks.

Supported chains:
- `42161` — Arbitrum One (mainnet, current default)
- `421614` — Arbitrum Sepolia (testnet)
- `134` — iExec Bellecour (legacy sidechain)

### Admin Panel
`/admin/*` routes are protected by middleware (`middleware.ts`) using Supabase Auth (cookie-based SSR session). `/admin/login` is the only public admin route. Dashboard reads from the `whitelist_participants` Supabase table.

### Wallet Detection
`components/whitelist-section.tsx` implements EIP-6963 provider discovery first, then falls back to legacy `window.ethereum`. This handles multi-wallet environments (MetaMask + Coinbase + Rabby coexisting).

### 3D Hero
`components/gl/` contains Three.js/React Three Fiber particle simulation with custom GLSL shaders (`pointMaterial.ts`, `simulationMaterial.ts`). The simulation runs in a WebGL FBO (framebuffer object) for GPU-side particle physics.

### Design Tokens
Brand color: `#EBB800` / `#FFC700` (gold). Chamfered corners throughout via `clip-path: polygon(12px 0, ...)`. Font: Geist Mono (monospace) + Sentient (serif italic for headings). Design system in `app/globals.css` and `styles/globals.css`.

## Key Files

| File | Purpose |
|------|---------|
| `components/whitelist-section.tsx` | All whitelist logic + wallet connection + iExec client config |
| `app/api/whitelist/iexec-execute/route.ts` | Server-side iExec: protectData → grantAccess → deposit → sendEmail |
| `app/api/whitelist/save/route.ts` | Supabase insert with service-role key (bypasses RLS) |
| `lib/env.ts` | Zod env validation + chain helper functions |
| `components/gl/` | WebGL particle system (Three.js + GLSL shaders) |
| `middleware.ts` | Supabase Auth guard for `/admin/*` routes |

## Known Issues / Tech Debt

- `components/performance-chart.tsx.bak` and `.bak2` are manual backup files — not used, safe to delete.
- `react-native`, `expo`, and related packages in `package.json` appear unused in this web-only project.
- `NETWORK_MODE` in `whitelist-section.tsx` is hardcoded; switching networks requires editing source code rather than just an env var.
