import Link from 'next/link'
import { getNavPages } from '@/lib/optimizely/client'

// Fallback nav shown if CMS has no pages yet
const FALLBACK_NAV = [
  { href: '/', label: 'Home' },
]

export default async function Header() {
  const cmsPages = await getNavPages().catch(() => [])
  const nav = cmsPages.length ? cmsPages : FALLBACK_NAV

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
          DemoSite
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
