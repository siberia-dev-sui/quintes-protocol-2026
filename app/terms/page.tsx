import type { Metadata } from 'next'
import { PageShell, Section } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Terms of Service | Quintes Protocol',
  description: 'Terms and conditions for using the Quintes Protocol website and services.',
  alternates: { canonical: 'https://quintes.org/terms' },
}

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      subtitle="Last updated: May 2025"
    >
      <Section title="Acceptance">
        <p>
          By accessing quintes.org you agree to these Terms of Service. If you do not agree, do not use the site. Quintes Protocol reserves the right to modify these terms at any time. Continued use after changes constitutes acceptance.
        </p>
      </Section>

      <Section title="Nature of the Site">
        <p>
          This website is an informational landing page for the Quintes Protocol project. It does not constitute the protocol itself. No financial transactions, token purchases, or yield-generating activities occur through this website.
        </p>
        <p>
          The whitelist form collects email addresses for the purpose of notifying interested users when the protocol launches. Joining the whitelist does not guarantee access, allocation, or returns of any kind.
        </p>
      </Section>

      <Section title="Not Financial Advice">
        <p>
          All content on this website — including yield projections, APY targets, performance comparisons, and protocol descriptions — is provided for informational purposes only. Nothing on this site constitutes financial advice, investment advice, or a solicitation to buy, sell, or hold any digital asset.
        </p>
        <p>
          The 33% APY figure is a <strong>target</strong>, not a guarantee. Past projections or simulated results do not guarantee future performance. Crypto assets are highly volatile. You may lose some or all of your capital.
        </p>
      </Section>

      <Section title="Eligibility">
        <p>
          Use of this website is prohibited in jurisdictions where DeFi protocols, crypto assets, or related activities are restricted or prohibited by law. It is your responsibility to ensure that your use of this site complies with the laws of your jurisdiction.
        </p>
      </Section>

      <Section title="Intellectual Property">
        <p>
          All content, trademarks, logos, and materials on quintes.org are the property of Quintes Protocol. Reproduction, distribution, or modification without prior written consent is prohibited.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          Quintes Protocol is not liable for any direct, indirect, incidental, or consequential damages arising from your use of, or inability to use, this website. The website is provided &ldquo;as is&rdquo; without warranties of any kind.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These terms are governed by applicable international commercial law. Any disputes shall be resolved through binding arbitration.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions: <a href="mailto:Rand@quintes.org" className="text-primary hover:text-primary/80 transition-colors">Rand@quintes.org</a>
        </p>
      </Section>
    </PageShell>
  )
}
