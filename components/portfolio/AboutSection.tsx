import type { BaseContent } from '@/lib/optimizely/types'

interface Props { content?: BaseContent }

export default function AboutSection({ content }: Props) {
  const c = content as Record<string, unknown> | undefined
  const body = (c?.body as string) || ''

  return (
    <section id="about" className="section bg-white">
      <div className="container">
        <SectionLabel>About Me</SectionLabel>
        <div className="flex flex-col md:flex-row gap-12 items-start mt-10">

          {/* Avatar card */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg shadow-blue-100">
              SK
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-slate-900">Sharath Kori</p>
              <p className="text-blue-600 text-sm font-medium">Full Stack Developer</p>
            </div>
            <div className="flex gap-3 mt-1">
              <a href="https://github.com/SHARATHKM2004" target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition">GitHub</a>
              <a href="https://www.linkedin.com/in/sharath-km-422707296/" target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition">LinkedIn</a>
            </div>
          </div>

          {/* Bio */}
          <div className="flex-1">
            {body
              ? <div className="prose" dangerouslySetInnerHTML={{ __html: body }} />
              : (
                <div className="prose">
                  <p>I am a passionate Web Developer Intern specializing in building modern applications using <strong>React</strong>, <strong>Next.js</strong>, and <strong>Tailwind CSS</strong>.</p>
                  <p>I have hands-on experience integrating CMS platforms like <strong>Optimizely</strong> and creating dynamic, real-time content-driven websites. I enjoy solving real-world problems through scalable solutions and continuously improving my skills with practical, production-level projects.</p>
                </div>
              )
            }

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { value: '10+', label: 'Projects' },
                { value: '3+', label: 'Technologies' },
                { value: '1+', label: 'Years Experience' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-extrabold gradient-text">{s.value}</p>
                  <p className="text-slate-500 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase">{children}</span>
      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">{children}</h2>
      <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mt-3" />
    </div>
  )
}
