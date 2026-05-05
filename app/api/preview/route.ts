/**
 * GET /api/preview?token=SECRET&path=/about&contentLink=5_42
 *
 * Enables Next.js Draft Mode and redirects to the requested CMS page.
 * Register this URL as "Preview URL" in Optimizely CMS › Settings › Sites:
 *   https://<your-domain>/api/preview?token=demo-preview-secret-2026&path={previewPath}
 */
import { draftMode } from 'next/headers'
import { redirect }  from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token       = searchParams.get('token')
  const path        = searchParams.get('path') ?? '/'
  const contentLink = searchParams.get('contentLink')

  if (token !== process.env.OPTIMIZELY_PREVIEW_SECRET) {
    return new Response('Invalid preview token', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  // Append contentLink so the page can request the specific draft version if needed
  const dest = contentLink ? `${path}?contentLink=${contentLink}` : path
  redirect(dest)
}
