/**
 * POST /api/revalidate?token=SECRET
 * GET  /api/revalidate?token=SECRET&path=/about   (quick manual test)
 *
 * On-demand cache invalidation — called by Optimizely CMS Webhook on publish.
 * Register this URL as a Webhook in CMS › Settings › Webhooks:
 *   https://<your-domain>/api/revalidate?token=demo-revalidate-secret-2026
 *
 * Optional JSON body:  { "path": "/about" }
 * Without a path, all pages are revalidated (layout-level purge).
 */
import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { clearConfigCache } from '@/lib/optimizely/config'

const REVALIDATE_SECRET = process.env.OPTIMIZELY_REVALIDATE_SECRET

function unauthorized() {
  return Response.json({ error: 'Invalid token' }, { status: 401 })
}

export async function POST(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token')
  if (token !== REVALIDATE_SECRET) return unauthorized()

  try {
    const body = await request.json().catch(() => ({})) as { path?: string }
    clearConfigCache()
    if (body.path && typeof body.path === 'string') {
      revalidatePath(body.path)
    } else {
      revalidatePath('/', 'layout')
    }
    return Response.json({ revalidated: true, at: new Date().toISOString() })
  } catch {
    return Response.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (token !== REVALIDATE_SECRET) return unauthorized()

  const path = searchParams.get('path')
  clearConfigCache()
  if (path) {
    revalidatePath(path)
  } else {
    revalidatePath('/', 'layout')
  }
  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
