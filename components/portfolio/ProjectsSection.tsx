import Link from 'next/link'
import type { BaseContent } from '@/lib/optimizely/types'
import type { SiteConfig } from '@/lib/optimizely/config'

const DEFAULT_PROJECTS = [
  {
    title: 'Optimizely CMS + Next.js Portfolio',
    desc: 'A full-stack portfolio site controlled by Optimizely SaaS CMS with Visual Builder, live preview, and on-demand revalidation.',
    tags: ['Next.js', 'Optimizely', 'TypeScript', 'Vercel'],
    github: 'https://github.com/SHARATHKM2004/cms-demo',
    live: 'https://cms-demo-ruddy.vercel.app',
    highlight: true,
  },
  {
    title: 'React Dashboard',
    desc: 'A data dashboard with charts, filters, and real-time updates using React and REST APIs.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
    github: 'https://github.com/SHARATHKM2004',
    live: '',
    highlight: false,
  },
  {
    title: 'GraphQL API Integration',
    desc: 'Built and consumed a GraphQL API for content management with HMAC authentication and live data sync.',
    tags: ['GraphQL', 'Node.js', 'HMAC Auth'],
    github: 'https://github.com/SHARATHKM2004',
    live: '',
    highlight: false,
  },
]

interface Props { content?: BaseContent; config?: SiteConfig }

export default function ProjectsSection({ content }: Props) {
  const c = content as Record<string, unknown> | undefined
  const body = (c?.body as string) || ''

  return (
    <section id="projects" className="section bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase">My Work</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Projects</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mt-3 mx-auto" />
        </div>

        {body
          ? <div className="prose mx-auto text-center mb-10" dangerouslySetInnerHTML={{ __html: body }} />
          : null
        }

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEFAULT_PROJECTS.map(project => (
            <div key={project.title}
              className={`rounded-2xl border p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow
                ${project.highlight ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50' : 'border-slate-100 bg-white'}`}>
              {project.highlight && (
                <span className="self-start px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">Featured</span>
              )}
              <h3 className="font-bold text-slate-900 text-lg leading-snug">{project.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed flex-1">{project.desc}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{tag}</span>
                ))}
              </div>
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <a href={project.github} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1">
                  ↗ GitHub
                </a>
                {project.live && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition flex items-center gap-1">
                    → Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="https://github.com/SHARATHKM2004" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:border-blue-400 hover:text-blue-600 transition">
            View All on GitHub →
          </a>
        </div>
      </div>
    </section>
  )
}
