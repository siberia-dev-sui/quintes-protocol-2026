export function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Quintes Protocol',
    url: 'https://quintes.org',
    logo: 'https://quintes.org/logo.svg',
    description: 'Shariah-compliant DeFi yield protocol on Arbitrum. 200% overcollateralized, riba-free yield for Muslim investors globally.',
    sameAs: ['https://twitter.com/QuintesProtocol'],
    areaServed: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'GB', 'US'],
    knowsAbout: ['DeFi', 'Islamic Finance', 'Yield Farming', 'Blockchain', 'Shariah-compliant Investing', 'Halal Investment'],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Quintes Protocol',
    url: 'https://quintes.org',
  }

  const financialService = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Quintes Protocol',
    url: 'https://quintes.org',
    description: 'Shariah-compliant DeFi yield protocol on Arbitrum. Deposit BTC, ETH, USDC, or USDT to earn up to 33% APY with 200% overcollateralization. Riba-free, halal investment for Muslim investors.',
    areaServed: [
      { '@type': 'Country', name: 'Saudi Arabia' },
      { '@type': 'Country', name: 'United Arab Emirates' },
      { '@type': 'Country', name: 'Qatar' },
      { '@type': 'Country', name: 'Kuwait' },
      { '@type': 'Country', name: 'Bahrain' },
      { '@type': 'Country', name: 'Oman' },
    ],
    serviceType: 'Decentralized Finance — Shariah-Compliant Yield Protocol',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'QNT Yield',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'BTC Yield — up to 33% APY',
          description: 'Deposit Bitcoin and earn yield through Shariah-compliant strategies.',
        },
        {
          '@type': 'Offer',
          name: 'ETH Yield — up to 33% APY',
          description: 'Deposit Ethereum and earn yield through Shariah-compliant strategies.',
        },
        {
          '@type': 'Offer',
          name: 'Stablecoin Yield (USDC/USDT) — up to 33% APY',
          description: 'Deposit stablecoins and earn yield through Shariah-compliant strategies.',
        },
      ],
    },
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I earn with Quintes using my BTC, ETH, or Stablecoins?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You securely deposit your assets to mint QNT, our innovative yield-bearing stable asset. Your deposited collateral is then partially deployed into sophisticated, Shariah-compliant trading strategies that generate real revenue.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is QNT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QNT is a yield-bearing, stable asset you mint against your deposited collateral. It\'s overcollateralized and engineered for consistent value growth through unique cryptoeconomic mechanisms.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my deposited collateral always safe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For every $1 of QNT, we maintain at least $2 of collateral. Automated Proof of Collateral (APoC) ensures QNT is always fully backed and redeemable.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is Quintes Shariah-compliant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our trading strategies and mechanisms are reviewed by Shariah scholars to ensure they align with Islamic financial principles, avoiding interest (Riba) and excessive uncertainty (Gharar).',
        },
      },
      {
        '@type': 'Question',
        name: 'How is Quintes different from past yield protocols like Luna/UST?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Quintes is built on full 200% over-collateralization with diverse assets like BTC, ETH, and stablecoins. Luna/UST was an undercollateralized algorithmic model — our system is designed for long-term stability and solvency.',
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(financialService) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  )
}
