/**
 * Optimizely SaaS CMS — Content Delivery API v3 client
 *
 * Auth:    OAuth2 client_credentials  →  token is cached in-process
 * Fetch:   Next.js fetch with revalidation tags so on-demand revalidation works
 * Draft:   Pass isDraft=true to include the Bearer token and bypass cache
 */

import type { AnyContent } from './types'

const CMS_URL   = (process.env.OPTIMIZELY_CMS_URL   ?? '').replace(/\/$/, '')
const CLIENT_ID = process.env.OPTIMIZELY_CMS_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET ?? ''
const API_BASE  = `${CMS_URL}/api/episerver/v3.0`

// ─── OAuth2 token (server-side in-memory cache) ────────────────────────────────

type TokenCache = { token: string; expiresAt: number } | null
let _tokenCache: TokenCache = null

async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.token
  }
  const res = await fetch(`${CMS_URL}/api/episerver/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`CMS token error ${res.status}: ${await res.text()}`)
  }
  const data = await res.json() as { access_token: string; expires_in: number }
  _tokenCache = {
    token:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return _tokenCache.token
}

// ─── Core fetch helper ─────────────────────────────────────────────────────────

interface FetchOpts {
  isDraft?:  boolean
  expand?:   string
  language?: string
}

async function cmsGet<T = AnyContent>(
  endpoint:    string,
  queryParams: Record<string, string> = {},
  opts:        FetchOpts = {},
): Promise<T | null> {
  const { isDraft = false, expand = '*', language = 'en' } = opts

  const url = new URL(`${API_BASE}${endpoint}`)
  url.searchParams.set('expand', expand)
  for (const [k, v] of Object.entries(queryParams)) url.searchParams.set(k, v)

  // Always include auth token — Optimizely SaaS CMS requires it even for published content
  let authHeader: string | undefined
  try {
    authHeader = `Bearer ${await getAccessToken()}`
  } catch (err) {
    console.error('[CMS] token error:', err)
  }

  const headers: HeadersInit = {
    Accept:            'application/json',
    'Accept-Language': language,
    ...(authHeader ? { Authorization: authHeader } : {}),
  }

  try {
    const res = await fetch(url.toString(), {
      headers,
      next: isDraft
        ? { revalidate: 0 }
        : { revalidate: 60, tags: ['cms-content'] },
    })

    if (res.status === 404) return null
    if (!res.ok) {
      console.error(`[CMS] ${res.status} ${res.statusText} — ${url}`)
      return null
    }
    return res.json() as Promise<T>
  } catch (err) {
    console.error('[CMS] fetch error:', err)
    return null
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch a CMS page by its full public URL.
 *
 * Requires the site's base URL to be registered in
 * Optimizely CMS › Settings › Sites (must match NEXT_PUBLIC_SITE_URL).
 *
 * The API may return a single object or a single-item array.
 */
export async function getPageByUrl(
  fullUrl: string,
  isDraft = false,
): Promise<AnyContent | null> {
  // Try exact URL first
  let result = await cmsGet<AnyContent | AnyContent[]>(
    '/content',
    { contentUrl: fullUrl },
    { isDraft },
  )
  if (!result) {
    // Try with /en/ language prefix (Optimizely SaaS CMS default)
    const withLang = fullUrl.replace(/\/$/, '') + '/en/'
    result = await cmsGet<AnyContent | AnyContent[]>(
      '/content',
      { contentUrl: withLang },
      { isDraft },
    )
  }
  if (!result) return null
  return Array.isArray(result) ? (result[0] ?? null) : result
}

/** Fetch a single content item by its numeric ID (or "id_workId" draft ref). */
export async function getContentById(
  id: string | number,
  isDraft = false,
): Promise<AnyContent | null> {
  return cmsGet<AnyContent>(`/content/${id}`, {}, { isDraft })
}

/** Fetch the direct children of a content item (e.g. blog listing). */
export async function getContentChildren(
  id: string | number,
  isDraft = false,
): Promise<AnyContent[]> {
  return (await cmsGet<AnyContent[]>(`/content/${id}/children`, {}, { isDraft })) ?? []
}
