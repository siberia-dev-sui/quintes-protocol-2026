import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function PageShell({ title, subtitle, children }: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen pt-28 pb-24 px-6">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-foreground/40 hover:text-primary transition-colors mb-16 uppercase tracking-widest"
        >
          <ArrowLeft className="w-3 h-3" /> Quintes Protocol
        </Link>
        <h1 className="font-sentient text-4xl md:text-5xl mb-4 text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="font-mono text-sm text-foreground/50 mb-14">{subtitle}</p>
        )}
        <div className="mt-10 space-y-10 font-mono text-sm text-foreground/70 leading-relaxed">
          {children}
        </div>
      </div>
    </main>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
