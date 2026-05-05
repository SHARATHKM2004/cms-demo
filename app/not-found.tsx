import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-32 px-8">
      <div className="text-center max-w-lg">
        <p className="text-6xl font-bold text-blue-600 mb-4">404</p>
        <h1 className="text-2xl font-semibold mb-3 text-gray-900">Page not found in CMS</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          No content was found at this URL. Make sure the page exists in Optimizely CMS
          and that <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SITE_URL</code> matches
          the site URL registered in CMS.
        </p>
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
