import Link from 'next/link'
import { getNavPages } from '@/lib/optimizely/client'

export default async function Header() {
  const cmsPages = await getNavPages().catch(() => [])
  const nav = cmsPages.length ? cmsPages : [{ href: '/', label: 'Home' }]

  return (
    <header
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight" style={{ color: 'var(--accent-2)' }}>
          &lt;Portfolio /&gt;
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <a
          href="#contact"
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Hire Me
        </a>
      </div>
    </header>
  )
}
