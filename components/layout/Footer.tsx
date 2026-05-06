export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }} className="py-10 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <p style={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} &mdash; Built with{' '}
          <span style={{ color: 'var(--accent-2)' }} className="font-medium">Optimizely CMS</span>
          {' '}+{' '}
          <span style={{ color: 'var(--accent-2)' }} className="font-medium">Next.js</span>
        </p>
        <div className="flex items-center gap-6" style={{ color: 'var(--text-muted)' }}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="mailto:you@example.com" className="hover:text-white transition-colors">Email</a>
        </div>
      </div>
    </footer>
  )
}

