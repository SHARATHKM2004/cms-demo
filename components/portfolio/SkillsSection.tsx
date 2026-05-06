import type { BaseContent } from '@/lib/optimizely/types'

const DEFAULT_SKILLS = [
  { name: 'React',        level: 90, color: 'bg-cyan-500' },
  { name: 'Next.js',      level: 85, color: 'bg-slate-800' },
  { name: 'TypeScript',   level: 80, color: 'bg-blue-600' },
  { name: 'Tailwind CSS', level: 90, color: 'bg-teal-500' },
  { name: 'GraphQL',      level: 70, color: 'bg-pink-600' },
  { name: 'Optimizely CMS', level: 75, color: 'bg-violet-600' },
  { name: 'API Integration', level: 80, color: 'bg-orange-500' },
  { name: 'Node.js',      level: 65, color: 'bg-green-600' },
]

interface Props { content?: BaseContent }

export default function SkillsSection({ content }: Props) {
  const c = content as Record<string, unknown> | undefined
  const body = (c?.body as string) || ''

  return (
    <section id="skills" className="section bg-slate-50">
      <div className="container">
        <div className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase">What I Know</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Skills & Technologies</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mt-3 mx-auto" />
        </div>

        {body
          ? <div className="prose mx-auto text-center mb-10" dangerouslySetInnerHTML={{ __html: body }} />
          : null
        }

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {DEFAULT_SKILLS.map(skill => (
            <div key={skill.name} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-800 text-sm">{skill.name}</span>
                <span className="text-slate-400 text-xs font-medium">{skill.level}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${skill.color} transition-all duration-700`}
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-3 justify-center mt-12">
          {['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Optimizely', 'REST APIs', 'Git', 'Vercel', 'Node.js'].map(t => (
            <span key={t} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-sm">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
