import type { Metadata } from 'next'
import { PageShell, Section } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'About Quintes Protocol | Shariah-Compliant DeFi Yield',
  description: 'Learn how Quintes Protocol delivers 33% APY through 200% overcollateralized, Shariah-compliant DeFi strategies on Arbitrum. Built by experts from Binance, Morgan Stanley, King\'s College London.',
  alternates: { canonical: 'https://quintes.org/about' },
}

export default function AboutPage() {
  return (
    <PageShell
      title="About Quintes"
      subtitle="The quintessence of engineered, sustainable yield — built for a new generation of investors."
    >
      <Section title="Our Mission">
        <p>
          Quintes Protocol addresses a significant gap in global finance: the absence of reliable, transparent, and halal-compliant yield instruments for crypto holders. In a market defined by volatility and opaque incentive structures, Quintes delivers a mathematically sound, overcollateralized alternative — engineered for consistency, not speculation.
        </p>
        <p>
          Our name derives from <em>quintessence</em> — the purest, most concentrated form of a substance. That is what we built: the purest form of capital efficiency and engineered financial stability on-chain.
        </p>
      </Section>

      <Section title="What is Quintes Protocol">
        <p>
          Quintes is a next-generation DeFi protocol running on Arbitrum. Users deposit BTC, ETH, USDC, or USDT to mint <strong>QNT</strong> — a yield-bearing stable asset engineered to grow at a target rate of 33% APY.
        </p>
        <p>
          Every dollar of QNT is backed by at least two dollars of collateral, enforced on-chain through <strong>Automated Proof of Collateral (APoC)</strong> — a proprietary mechanism that continuously verifies and rebalances collateral ratios without human intervention.
        </p>
        <p>
          Yield is generated through sophisticated, market-neutral trading strategies — including high-frequency trading and arbitrage — designed to produce returns regardless of market direction, without relying on inflationary token emissions or unsustainable incentives.
        </p>
      </Section>

      <Section title="Shariah Compliance">
        <p>
          Quintes is designed from the ground up for Muslim investors seeking halal exposure to crypto yield. Our strategies, investment policies, and mechanisms have been reviewed by qualified Shariah scholars to ensure full alignment with Islamic financial principles.
        </p>
        <p>
          Specifically, the protocol avoids:
        </p>
        <ul className="list-none space-y-2 pl-4 border-l border-primary/20">
          <li><span className="text-primary mr-2">—</span>Riba (interest) in any form</li>
          <li><span className="text-primary mr-2">—</span>Gharar (excessive uncertainty or speculation)</li>
          <li><span className="text-primary mr-2">—</span>Maysir (gambling-like mechanisms)</li>
          <li><span className="text-primary mr-2">—</span>Investments in haram industries</li>
        </ul>
        <p>
          This makes Quintes one of the first truly institutional-grade, Shariah-compliant DeFi yield protocols available to investors in Saudi Arabia, the UAE, Qatar, Kuwait, and across the MENA region.
        </p>
      </Section>

      <Section title="How It Works">
        <div className="space-y-4">
          <div className="border-l-2 border-primary/40 pl-4">
            <p className="text-foreground/90 mb-1">1. Deposit</p>
            <p>Connect and deposit BTC, ETH, USDC, or USDT. Your assets are secured in overcollateralized vaults on Arbitrum.</p>
          </div>
          <div className="border-l-2 border-primary/40 pl-4">
            <p className="text-foreground/90 mb-1">2. Mint QNT</p>
            <p>Receive QNT — a yield-bearing stable asset pegged to your deposit value and designed to appreciate at the 33% APY target rate.</p>
          </div>
          <div className="border-l-2 border-primary/40 pl-4">
            <p className="text-foreground/90 mb-1">3. Earn</p>
            <p>Collateral is deployed into market-neutral strategies. Yield accrues automatically. Redeem QNT for your original asset plus returns at any time.</p>
          </div>
        </div>
      </Section>

      <Section title="Security Model">
        <p>
          For every $1 of QNT in circulation, Quintes maintains a minimum of $2 in collateral — a 200% overcollateralization ratio. If collateral values decline, APoC triggers automated partial liquidation to restore the ratio. Reserve funds and a QTS treasury act as additional backstops.
        </p>
        <p>
          This model was validated after two years of intensive research, extensive market simulations, and review by independent research labs. It is fundamentally different from algorithmic stablecoins (such as Luna/UST) which relied on undercollateralized, circular token mechanics.
        </p>
      </Section>

      <Section title="Team Background">
        <p>
          Quintes was built by a global team of token engineers, data scientists, cryptoeconomic researchers, and financial veterans with backgrounds at:
        </p>
        <ul className="list-none space-y-2 pl-4 border-l border-primary/20">
          <li><span className="text-primary mr-2">—</span>Binance — exchange infrastructure and market-making</li>
          <li><span className="text-primary mr-2">—</span>Morgan Stanley — traditional finance and risk modeling</li>
          <li><span className="text-primary mr-2">—</span>Chainlink — decentralized oracle infrastructure</li>
          <li><span className="text-primary mr-2">—</span>Consensys — Ethereum protocol development</li>
          <li><span className="text-primary mr-2">—</span>King's College London — quantitative research</li>
          <li><span className="text-primary mr-2">—</span>University College London — cryptoeconomic modeling</li>
          <li><span className="text-primary mr-2">—</span>Algorand — Layer-1 blockchain architecture</li>
        </ul>
      </Section>

      <Section title="Technology">
        <p>
          Quintes is deployed on <strong>Arbitrum One</strong>, Ethereum's leading Layer-2 network, offering fast settlement, low transaction costs, and full EVM compatibility. The protocol's smart contracts implement the patented APoC mechanism and are designed for auditability and transparency.
        </p>
        <p>
          Off-chain infrastructure executes market-neutral strategies through institutional-grade execution venues, with on-chain proof of collateral updated continuously.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For institutional inquiries, partnership proposals, or Shariah compliance questions, contact us at{' '}
          <a href="mailto:Rand@quintes.org" className="text-primary hover:text-primary/80 transition-colors">
            Rand@quintes.org
          </a>
        </p>
      </Section>
    </PageShell>
  )
}
