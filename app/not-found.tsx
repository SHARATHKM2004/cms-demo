import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-32 px-8 bg-slate-50 min-h-[70vh]">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Page Not Found</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          This page doesn&apos;t exist yet. Create it in Optimizely CMS and it will automatically appear here.
        </p>
        <Link href="/"
          className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-200">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
