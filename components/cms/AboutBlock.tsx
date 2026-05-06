import type { BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function AboutBlock({ content }: Props) {
  const c = content as BaseContent & { body?: string; headline?: string; subheadline?: string }
  const heading = c.headline ?? 'About Me'
  const sub     = c.subheadline ?? ''
  const html    = c.body ?? ''

  const skills = ['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker']

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* section label */}
        <div className="flex items-center gap-3 mb-12">
          <span className="w-8 h-px" style={{ background: 'var(--accent)' }} />
          <span className="text-sm font-medium tracking-widest uppercase" style={{ color: 'var(--accent-2)' }}>About</span>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* text */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text)' }}>
              {heading}
            </h2>
            {sub && <p className="text-lg mb-6" style={{ color: 'var(--accent-2)' }}>{sub}</p>}
            {html
              ? <div className="cms-prose" dangerouslySetInnerHTML={{ __html: html }} />
              : <p style={{ color: 'var(--text-muted)' }} className="leading-relaxed">
                  I&apos;m a full-stack developer passionate about building beautiful, performant web experiences.
                  I love working at the intersection of design and engineering, crafting products that are both
                  functional and delightful to use.
                </p>
            }
            <div className="flex gap-4 mt-8">
              <a href="#projects" className="px-6 py-3 rounded-xl font-semibold text-white text-sm" style={{ background: 'var(--accent)' }}>
                My Projects
              </a>
              <a href="#contact" className="px-6 py-3 rounded-xl font-semibold text-sm" style={{ border: '1px solid var(--border)', color: 'var(--text)', background: 'var(--bg-card)' }}>
                Contact Me
              </a>
            </div>
          </div>

          {/* skills grid */}
          <div>
            <p className="text-sm font-medium mb-6 tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Tech Stack</p>
            <div className="grid grid-cols-2 gap-3">
              {skills.map(skill => (
                <div
                  key={skill}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
