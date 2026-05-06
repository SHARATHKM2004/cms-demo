import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-32 px-6">
      <div className="text-center max-w-lg">
        <div
          className="text-8xl font-bold mb-6 bg-clip-text"
          style={{
            backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>Page not found</h1>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          This page doesn&apos;t exist yet. Create it in Optimizely CMS and publish it — it will appear here automatically.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          ← Back Home
        </Link>
      </div>
    </div>
  )
}

