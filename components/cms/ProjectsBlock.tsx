import type { BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

interface ProjectCard {
  title?: string
  description?: string
  stack?: string
  liveUrl?: string
  githubUrl?: string
}

export default function ProjectsBlock({ content }: Props) {
  const c = content as BaseContent & { headline?: string; body?: string; _properties?: Record<string, { value?: unknown }> }

  // Parse cards from CMS properties or use demo projects
  const demoProjects: ProjectCard[] = [
    { title: 'Portfolio CMS', description: 'Full-stack portfolio powered by Optimizely SaaS CMS + Next.js 16 with Visual Builder and live preview.', stack: 'Next.js · TypeScript · Optimizely', liveUrl: '#', githubUrl: '#' },
    { title: 'E-Commerce App', description: 'Modern shopping experience with real-time inventory, Stripe payments, and server-side rendering.', stack: 'React · Node.js · PostgreSQL', liveUrl: '#', githubUrl: '#' },
    { title: 'Analytics Dashboard', description: 'Real-time data visualization with interactive charts, filters, and exportable reports.', stack: 'Next.js · D3.js · Prisma', liveUrl: '#', githubUrl: '#' },
    { title: 'Mobile Banking App', description: 'Secure banking interface with biometric auth, transaction history, and budget tracking.', stack: 'React Native · Firebase · TypeScript', liveUrl: '#', githubUrl: '#' },
  ]

  const heading = c.headline ?? 'Featured Projects'

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <span className="w-8 h-px" style={{ background: 'var(--accent)' }} />
          <span className="text-sm font-medium tracking-widest uppercase" style={{ color: 'var(--accent-2)' }}>Work</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-16" style={{ color: 'var(--text)' }}>{heading}</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {demoProjects.map((p, i) => (
            <article
              key={i}
              className="group rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
            >
              {/* number */}
              <div className="text-5xl font-bold mb-4 opacity-20 select-none" style={{ color: 'var(--accent)' }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>{p.title}</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>{p.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-card-hover)', color: 'var(--accent-2)', border: '1px solid var(--border)' }}>
                  {p.stack}
                </span>
                <div className="flex gap-3">
                  {p.githubUrl && <a href={p.githubUrl} className="text-xs font-medium transition-colors" style={{ color: 'var(--text-muted)' }}>GitHub ↗</a>}
                  {p.liveUrl   && <a href={p.liveUrl}   className="text-xs font-semibold transition-colors" style={{ color: 'var(--accent-2)' }}>Live ↗</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
