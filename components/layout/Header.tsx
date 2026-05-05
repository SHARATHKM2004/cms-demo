import Link from 'next/link'

const NAV = [
  { href: '/',         label: 'Home'     },
  { href: '/about',    label: 'About'    },
  { href: '/services', label: 'Services' },
  { href: '/blog',     label: 'Blog'     },
]

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
          DemoSite
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map(({ href, label }) => (
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
