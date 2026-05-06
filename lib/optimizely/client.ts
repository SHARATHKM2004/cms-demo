/**
 * Optimizely SaaS CMS — REST API v1 client
 *
 * Auth:  OAuth2 client_credentials → POST https://api.cms.optimizely.com/oauth/token
 * Data:  GET  https://api.cms.optimizely.com/v1/content/versions
 *
 * The composition tree (Visual Builder) and all block properties are returned
 * inline in the versions response — no separate content-delivery fetch needed.
 */

import type { AnyContent, BaseContent, CompositionNode } from './types'

const CLIENT_ID     = process.env.OPTIMIZELY_CMS_CLIENT_ID     ?? ''
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET ?? ''
const TOKEN_URL     = 'https://api.cms.optimizely.com/oauth/token'
const API_BASE      = 'https://api.cms.optimizely.com/v1'

// ─── Token cache (in-process, ~5 min TTL) ─────────────────────────────────────

let _tokenCache: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) return _tokenCache.token
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`CMS token ${res.status}: ${await res.text()}`)
  const data = await res.json() as { access_token: string; expires_in: number }
  _tokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 30) * 1000 }
  return _tokenCache.token
}

// ─── REST API types (inline from versions endpoint) ───────────────────────────

type RestProp = { value?: unknown }
type RestComponent = {
  contentType: string
  properties?: Record<string, RestProp>
}
type RestNode = {
  id?: string
  displayName?: string
  nodeType: string
  layoutType?: string
  component?: RestComponent
  nodes?: RestNode[]
}
type RestItem = {
  key:           string
  locale:        string
  version:       string
  contentType:   string
  displayName:   string
  published?:    string
  status:        string
  routeSegment?: string
  composition?:  RestNode
}

// ─── Normalisation ────────────────────────────────────────────────────────────

function normalizeComponent(comp: RestComponent): BaseContent {
  const p = comp.properties ?? {}

  // Scan ALL properties for an HTML value — works regardless of property name
  let html: string | undefined
  for (const prop of Object.values(p)) {
    const v = prop?.value
    if (v && typeof v === 'object' && 'html' in v && typeof (v as Record<string,unknown>).html === 'string') {
      html = (v as { html: string }).html
      break
    }
    // plain string with HTML tags
    if (typeof v === 'string' && v.includes('<')) {
      html = v
      break
    }
  }

  // Scalar value helper
  const str = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = p[k]?.value
      if (typeof v === 'string' && v) return v
    }
    return undefined
  }

  // Image URL from common property names
  const imgVal = (p.Image?.value ?? p.BackgroundImage?.value) as
    { url?: string; src?: string; altText?: string } | null | undefined

  return {
    contentType:  [comp.contentType],
    name:         comp.contentType,
    contentLink:  { id: 0, workId: 0, guidValue: '' },
    body:         html,
    headingText:  str(['HeadingText', 'Heading']),
    headline:     str(['Headline', 'Heading', 'Title']),
    subheadline:  str(['Subheading', 'SubHeading', 'Subtitle']),
    ctaText:      str(['ButtonText', 'CtaText', 'LinkText']),
    ctaUrl:       str(['ButtonUrl', 'CtaUrl', 'LinkUrl']),
    image:        imgVal ? { id: '', url: imgVal.url ?? imgVal.src ?? '', alt: imgVal.altText } : undefined,
    // expose all raw properties for future use
    _properties:  p,
  } as unknown as BaseContent
}

function normalizeNode(node: RestNode): CompositionNode {
  if (node.nodeType === 'component' && node.component) {
    return {
      nodeType:    'component',
      key:         node.id,
      displayName: node.displayName,
      component:   normalizeComponent(node.component),
    }
  }
  const type = node.nodeType as CompositionNode['nodeType']
  return {
    nodeType:    type,
    key:         node.id,
    displayName: node.displayName,
    // sections may carry a component (e.g. BlankSection)
    component:   node.component ? normalizeComponent(node.component) : undefined,
    nodes:       (node.nodes ?? []).map(normalizeNode),
  }
}

function normalizeItem(item: RestItem): AnyContent {
  return {
    contentType:  [item.contentType],
    name:         item.displayName,
    contentLink:  { id: 0, workId: 0, guidValue: item.key },
    status:       item.status,
    routeSegment: item.routeSegment,
    composition:  item.composition ? normalizeNode(item.composition) : undefined,
  } as unknown as AnyContent
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchAllPublished(): Promise<RestItem[]> {
  try {
    const token = await getAccessToken()
    const res = await fetch(
      `${API_BASE}/content/versions?statuses=Published&pageSize=200&locales=en`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: 'no-store' },
    )
    if (!res.ok) {
      console.error(`[CMS] list ${res.status}: ${(await res.text()).slice(0, 200)}`)
      return []
    }
    const data = await res.json() as { items?: RestItem[] }
    return data.items ?? []
  } catch (err) {
    console.error('[CMS] fetchAllPublished error:', err)
    return []
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getPageByUrl(fullUrl: string, _isDraft = false): Promise<AnyContent | null> {
  const items = await fetchAllPublished()
  if (!items.length) return null

  // Extract the last meaningful path segment as routeSegment
  let pathname = '/'
  try { pathname = new URL(fullUrl).pathname } catch { /* ignore */ }
  const segments = pathname.split('/').filter(s => s && s !== 'en')
  const slug = segments[segments.length - 1] ?? ''

  if (!slug) {
    // Homepage: prefer item with routeSegment matching "home" / "" / start page key env var
    const startKey = (process.env.OPTIMIZELY_START_PAGE_ID ?? '').replace(/-/g, '')
    const home = items.find(i =>
      i.key.replace(/-/g, '') === startKey ||
      i.routeSegment === 'home' ||
      i.routeSegment === ''
    ) ?? items.find(i => i.contentType === 'BlankExperience' || i.contentType === 'SeoExperience')
    return home ? normalizeItem(home) : null
  }

  const match = items.find(i => i.routeSegment === slug || i.key.replace(/-/g, '') === slug)
  return match ? normalizeItem(match) : null
}

export async function getContentById(id: string | number, _isDraft = false): Promise<AnyContent | null> {
  const items = await fetchAllPublished()
  if (!items.length) return null

  const needle = String(id).replace(/-/g, '')
  const match = items.find(i => i.key.replace(/-/g, '') === needle)
  if (match) return normalizeItem(match)

  // id didn't match any GUID → return the start page (first published Experience)
  const fallback = items.find(i => i.contentType === 'BlankExperience' || i.contentType === 'SeoExperience')
  return fallback ? normalizeItem(fallback) : null
}

