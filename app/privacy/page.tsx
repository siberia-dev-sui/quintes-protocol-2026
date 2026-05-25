import type { Metadata } from 'next'
import { PageShell, Section } from '@/components/page-shell'

export const metadata: Metadata = {
  title: 'Privacy Policy | Quintes Protocol',
  description: 'Privacy policy for Quintes Protocol — how we collect, use, and protect your data.',
  alternates: { canonical: 'https://quintes.org/privacy' },
}

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      subtitle="Last updated: May 2025"
    >
      <Section title="Overview">
        <p>
          Quintes Protocol (&ldquo;Quintes,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) respects your privacy. This policy explains what data we collect when you visit quintes.org, how we use it, and your rights.
        </p>
      </Section>

      <Section title="Data We Collect">
        <p><strong className="text-foreground/90">Whitelist registration:</strong> If you submit your email address to join the early access whitelist, we store that email in our secure database (Supabase) to notify you at launch. We do not share, sell, or use it for marketing without your consent.</p>
        <p><strong className="text-foreground/90">Analytics:</strong> We use Vercel Analytics to collect anonymous, aggregated usage data (page views, country, device type). No personally identifiable information is collected or linked to individual users.</p>
        <p><strong className="text-foreground/90">Server logs:</strong> Our hosting infrastructure may log IP addresses and request metadata for security and debugging purposes. These logs are not used for profiling and are retained for a maximum of 30 days.</p>
      </Section>

      <Section title="Cookies">
        <p>
          We use only a single functional cookie to remember your dark/light mode preference. We do not use tracking cookies, advertising cookies, or third-party analytics cookies that profile your behavior across sites.
        </p>
      </Section>

      <Section title="Third-Party Services">
        <ul className="list-none space-y-2 pl-4 border-l border-primary/20">
          <li><span className="text-primary mr-2">—</span><strong className="text-foreground/90">Vercel</strong> — Hosting and analytics. Privacy policy: vercel.com/legal/privacy-policy</li>
          <li><span className="text-primary mr-2">—</span><strong className="text-foreground/90">Supabase</strong> — Email storage for whitelist. Privacy policy: supabase.com/privacy</li>
          <li><span className="text-primary mr-2">—</span><strong className="text-foreground/90">Cloudflare R2</strong> — Asset delivery (images, fonts). Privacy policy: cloudflare.com/privacypolicy</li>
        </ul>
      </Section>

      <Section title="Your Rights">
        <p>
          You may request access to, correction of, or deletion of any personal data we hold about you (specifically, your whitelist email) by contacting us at{' '}
          <a href="mailto:Rand@quintes.org" className="text-primary hover:text-primary/80 transition-colors">
            Rand@quintes.org
          </a>. We will respond within 30 days.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>Whitelist email addresses are retained until launch or until you request deletion. Anonymous analytics data is retained in aggregated form indefinitely.</p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy: <a href="mailto:Rand@quintes.org" className="text-primary hover:text-primary/80 transition-colors">Rand@quintes.org</a>
        </p>
      </Section>
    </PageShell>
  )
}
