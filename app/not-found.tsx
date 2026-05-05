import Link from 'next/link'

export default function NotFound() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'NOT SET'
  const cmsUrl  = process.env.OPTIMIZELY_CMS_URL ?? 'NOT SET'

  return (
    <div className="flex-1 flex items-center justify-center py-32 px-8">
      <div className="text-center max-w-xl">
        <p className="text-6xl font-bold text-blue-600 mb-4">404</p>
        <h1 className="text-2xl font-semibold mb-3 text-gray-900">Page not found in CMS</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          No content was found at this URL.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-xs font-mono mb-6 text-gray-600">
          <p><strong>NEXT_PUBLIC_SITE_URL:</strong> {siteUrl}</p>
          <p><strong>OPTIMIZELY_CMS_URL:</strong> {cmsUrl}</p>
          <p><strong>Queried URL:</strong> {siteUrl}/</p>
        </div>
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
