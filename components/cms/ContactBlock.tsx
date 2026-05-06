import type { BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function ContactBlock({ content }: Props) {
  const c = content as BaseContent & { headline?: string; subheadline?: string; body?: string }
  const heading = c.headline ?? "Let's Work Together"
  const sub     = c.subheadline ?? "I'm currently available for freelance and full-time opportunities."

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="w-8 h-px" style={{ background: 'var(--accent)' }} />
          <span className="text-sm font-medium tracking-widest uppercase" style={{ color: 'var(--accent-2)' }}>Contact</span>
          <span className="w-8 h-px" style={{ background: 'var(--accent)' }} />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text)' }}>{heading}</h2>
        <p className="text-lg mb-12" style={{ color: 'var(--text-muted)' }}>{sub}</p>

        {/* CTA card */}
        <div
          className="rounded-2xl p-10 mb-10"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <a
            href="mailto:you@example.com"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ background: 'var(--accent)' }}
          >
            <span>✉</span> Say Hello
          </a>

          <div className="flex items-center justify-center gap-8 mt-10">
            {[
              { label: 'GitHub',   href: 'https://github.com' },
              { label: 'LinkedIn', href: 'https://linkedin.com' },
              { label: 'Twitter',  href: 'https://twitter.com' },
            ].map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'}
              >
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
