import Link from 'next/link'
import { getNavPages } from '@/lib/optimizely/client'

export default async function Header() {
  const cmsPages = await getNavPages().catch(() => [])

  // Always include Home; add CMS pages on top
  const homeEntry = { href: '/', label: 'Home' }
  const extraPages = cmsPages.filter(p => p.href !== '/')
  const nav = [homeEntry, ...extraPages]

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-extrabold">
            SK
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition">
            Sharath<span className="text-blue-600">.</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(({ href, label }) => (
            <Link key={href} href={href}
              className="px-4 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium text-sm transition">
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <a href="mailto:kmsharath@ieee.org"
          className="hidden md:inline-flex px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-200">
          Hire Me
        </a>
      </div>
    </header>
  )
}
