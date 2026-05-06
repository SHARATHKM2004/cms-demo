import type { HeroBlock, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function Hero({ content }: Props) {
  const b       = content as HeroBlock
  const heading = b.headline ?? b.title ?? 'Hello, World'
  const sub     = b.subheadline ?? b.subtitle ?? ''
  const cta1    = b.ctaText
  const cta1Url = b.ctaUrl ?? '#projects'

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      {/* glow blobs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ background: 'var(--accent)', top: '-100px', left: '-100px' }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 pointer-events-none"
        style={{ background: 'var(--accent-2)', bottom: '-80px', right: '-80px' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--accent-2)' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
          Available for work
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6" style={{ color: 'var(--text)' }}>
          {heading.split('|').map((part, i) =>
            i % 2 === 1
              ? <span key={i} style={{ color: 'var(--accent-2)' }}>{part}</span>
              : <span key={i}>{part}</span>
          )}
        </h1>

        {sub && (
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {sub}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          {cta1 && (
            <a
              href={cta1Url}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
              style={{ background: 'var(--accent)' }}
            >
              {cta1}
            </a>
          )}
          <a
            href="#projects"
            className="px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            style={{ border: '1px solid var(--border)', color: 'var(--text)', background: 'var(--bg-card)' }}
          >
            View Work ↓
          </a>
        </div>

        {/* tech stack badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-14">
          {['Next.js', 'TypeScript', 'Optimizely CMS', 'React', 'Tailwind'].map(t => (
            <span
              key={t}
              className="px-3 py-1 rounded-md text-xs font-medium"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

