import Link from 'next/link'

export default function DraftBanner() {
  return (
    <div className="bg-amber-400 text-amber-900 px-6 py-2 flex items-center justify-between text-sm font-medium sticky top-16 z-40">
      <span>
        ✏️ <strong>Preview Mode</strong> — viewing unpublished draft content.
      </span>
      <Link
        href="/api/exit-preview"
        className="ml-4 text-xs underline hover:text-amber-700 shrink-0"
      >
        Exit preview
      </Link>
    </div>
  )
}
