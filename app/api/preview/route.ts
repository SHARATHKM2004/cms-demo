/**
 * GET /api/preview?token=SECRET&key=CONTENT_KEY&ver=VERSION&loc=LOCALE
 *
 * Called by Optimizely CMS Live Preview when an editor opens a page.
 * Enables Next.js Draft Mode then redirects to the content URL.
 */
import { draftMode } from 'next/headers'
import { redirect }  from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getContentById } from '@/lib/optimizely/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const key   = searchParams.get('key')     // Optimizely content key / id
  const ver   = searchParams.get('ver')     // version workId
  const path  = searchParams.get('path')   // fallback explicit path

  if (token !== process.env.OPTIMIZELY_PREVIEW_SECRET) {
    return new Response('Invalid preview token', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  // If a direct path was given, use it
  if (path) {
    redirect(path)
  }

  // Resolve content URL from key/ver
  if (key) {
    const ref = ver ? `${key}_${ver}` : key
    const content = await getContentById(ref, true)
    const contentUrl = content?.url

    if (contentUrl) {
      // Strip the site origin so we redirect to a local path
      try {
        const u = new URL(contentUrl)
        redirect(u.pathname)
      } catch {
        redirect(contentUrl)
      }
    }
  }

  // Fallback: go to homepage in draft mode
  redirect('/')
}
