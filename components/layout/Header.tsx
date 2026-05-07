import Link from 'next/link'
import { getNavPages } from '@/lib/optimizely/client'

export default async function Header() {
  const cmsPages = await getNavPages().catch(() => [])

  const homeEntry = { href: '/', label: 'Home' }
  const extraPages = cmsPages.filter(p => p.href !== '/')
  const nav = [homeEntry, ...extraPages]

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-6">
        <Link href="/" className="font-bold text-slate-900 text-lg hover:text-blue-600 transition">
          My CMS Site
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map(({ href, label }) => (
            <Link key={href} href={href}
              className="px-3 py-1.5 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium transition">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
