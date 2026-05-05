export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <p>
          &copy; {new Date().getFullYear()} DemoSite &mdash; powered by{' '}
          <span className="text-white font-medium">Optimizely CMS</span> +{' '}
          <span className="text-white font-medium">Next.js</span>
        </p>
        <p className="text-xs text-gray-600">Demo build — not for production</p>
      </div>
    </footer>
  )
}
