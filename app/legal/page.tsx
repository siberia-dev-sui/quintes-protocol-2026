import type { Metadata } from 'next'
import { PageShell, Section } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Legal Disclaimer | Quintes Protocol',
  description: 'Legal disclaimer for Quintes Protocol including risk disclosures, regulatory notices, and investment warnings.',
  alternates: { canonical: 'https://quintes.org/legal' },
}

export default function LegalPage() {
  return (
    <PageShell
      title="Legal Disclaimer"
      subtitle="Please read carefully before engaging with Quintes Protocol."
    >
      <Section title="Risk Disclosure">
        <p>
          Participation in decentralized finance (DeFi) protocols involves substantial risk, including the possible loss of all capital invested. Digital assets are highly volatile and unregulated in many jurisdictions. The value of QNT and any associated assets may increase or decrease significantly.
        </p>
        <p>
          Smart contracts, while audited, may contain unforeseen vulnerabilities. No blockchain protocol can guarantee absolute security. Users interact with the Quintes Protocol at their own risk.
        </p>
      </Section>

      <Section title="No Investment Advice">
        <p>
          Nothing on this website, in our documentation, on our social media channels, or in any communications from Quintes Protocol constitutes financial, investment, tax, or legal advice. The 33% APY target is a projection based on modeled strategies and is not guaranteed.
        </p>
        <p>
          Before participating in any DeFi protocol, consult a qualified financial advisor familiar with digital assets and the regulatory requirements of your jurisdiction.
        </p>
      </Section>

      <Section title="Shariah Compliance Notice">
        <p>
          Quintes Protocol has engaged qualified Shariah scholars to review its mechanisms and strategies. However, individual religious interpretations may vary. Quintes Protocol does not guarantee that its operations will be deemed Shariah-compliant by all scholarly authorities or regulatory bodies in every jurisdiction.
        </p>
        <p>
          Users are encouraged to seek independent Shariah guidance from a qualified scholar before participating.
        </p>
      </Section>

      <Section title="Regulatory Notice — MENA Region">
        <p>
          <strong className="text-foreground/90">Saudi Arabia:</strong> Quintes Protocol is not licensed by the Saudi Capital Market Authority (CMA) or the Saudi Central Bank (SAMA). Residents of Saudi Arabia accessing this website do so at their own discretion and are solely responsible for compliance with applicable laws.
        </p>
        <p>
          <strong className="text-foreground/90">United Arab Emirates:</strong> Quintes Protocol is not registered with the Securities and Commodities Authority (SCA) or the Financial Services Regulatory Authority (FSRA) of ADGM, nor with the Dubai Financial Services Authority (DFSA).
        </p>
        <p>
          <strong className="text-foreground/90">General:</strong> The regulatory status of DeFi protocols varies by jurisdiction and is subject to rapid change. Access to Quintes Protocol may be restricted or prohibited in certain jurisdictions. It is your responsibility to verify local laws.
        </p>
      </Section>

      <Section title="Forward-Looking Statements">
        <p>
          This website contains forward-looking statements, including projections of yield, protocol performance, and market adoption. These statements are based on current assumptions and are subject to significant uncertainty. Actual results may differ materially from projections.
        </p>
      </Section>

      <Section title="Restricted Jurisdictions">
        <p>
          The information on this website is not directed at persons in any jurisdiction where the distribution or use of such information is contrary to law or regulation. This includes, but may not be limited to, the United States (in certain contexts) and other jurisdictions with specific crypto asset restrictions.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Legal inquiries: <a href="mailto:Rand@quintes.org" className="text-primary hover:text-primary/80 transition-colors">Rand@quintes.org</a>
        </p>
      </Section>
    </PageShell>
  )
}
