/**
 * Optimizely SaaS CMS — Content Graph (GraphQL) client
 *
 * Auth:  HMAC-SHA256 using APP_KEY + APP_SECRET from Settings → API Clients
 * API:   POST https://{instance}.cms.optimizely.com/content/v2
 */

import crypto from 'crypto'
import type { AnyContent, BaseContent, CompositionNode } from './types'

const APP_KEY    = process.env.OPTIMIZELY_CMS_CLIENT_ID ?? ''
const APP_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET ?? ''
// Content Graph lives at a separate global endpoint, not the CMS UI domain
const GRAPH_URL  = 'https://cg.optimizely.com/content/v2'

// ─── HMAC auth ────────────────────────────────────────────────────────────────

function hmacHeaders(body: string): Record<string, string> {
  const ts    = new Date().toISOString()
  const nonce = crypto.randomBytes(8).toString('hex')
  const hash  = crypto.createHash('md5').update(body).digest('base64')
  const msg   = `POST\n${hash}\napplication/json\n${ts}\n${nonce}\n/content/v2`
  const sig   = crypto.createHmac('sha256', APP_SECRET).update(msg).digest('base64')
  // Full format: epi-hmac {AppKey}:{Timestamp}:{Nonce}:{Signature}
  return { Authorization: `epi-hmac ${APP_KEY}:${ts}:${nonce}:${sig}` }
}

function singleKeyHeaders(): Record<string, string> {
  return { Authorization: `epi-single ${APP_KEY}` }
}

// ─── Core GraphQL fetch ───────────────────────────────────────────────────────

async function gql<T>(
  query: string,
  vars:    Record<string, unknown> = {},
  preview = false,
): Promise<T | null> {
  const body = JSON.stringify({ query, variables: vars })
  // Use HMAC for draft/preview (needs all-content access); single key for published
  const authHeaders = preview ? hmacHeaders(body) : singleKeyHeaders()
  const url  = preview ? `${GRAPH_URL}?preview=true` : GRAPH_URL
  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body,
      cache:   'no-store',
    })
    if (!res.ok) {
      console.error(`[CMS] GraphQL ${res.status}: ${(await res.text()).slice(0, 300)}`)
      return null
    }
    const json = await res.json() as { data?: T; errors?: unknown[] }
    if (json.errors) console.error('[CMS] errors:', JSON.stringify(json.errors).slice(0, 300))
    return json.data ?? null
  } catch (err) {
    console.error('[CMS] fetch error:', err)
    return null
  }
}

// ─── GraphQL queries ──────────────────────────────────────────────────────────

// Element fields — covers all known block types in this CMS instance
const ELEMENT_FIELDS = `
  _metadata { key types displayName }
  ... on ParagraphElement { text { html } }
  ... on RichTextElement  { text { html } }
  ... on TextElement      { text { html } }
  ... on PoorTextElement  { text { html } }
  ... on HeadingElement   { headingText }
  ... on Heading          { headingText }
  ... on HeroBlock        { heading subheading backgroundImage { url { default } altText } }
  ... on CTAElement       { text linkUrl }
  ... on ImageElement     { image { url { default } altText } }
  ... on Image            { imageUrl { default } altText }
`

// 4-level deep composition tree (section → row → column → element)
const COMP = `
  composition {
    key nodeType displayName
    nodes {
      key nodeType displayName
      ... on CompositionStructureNode {
        nodes {
          key nodeType displayName
          ... on CompositionStructureNode {
            nodes {
              key nodeType displayName
              ... on CompositionStructureNode {
                nodes {
                  key nodeType
                  ... on CompositionElementNode { element { ${ELEMENT_FIELDS} } }
                }
              }
              ... on CompositionElementNode { element { ${ELEMENT_FIELDS} } }
            }
          }
          ... on CompositionElementNode { element { ${ELEMENT_FIELDS} } }
        }
      }
      ... on CompositionElementNode { element { ${ELEMENT_FIELDS} } }
    }
  }
`

const META = `_metadata { key version types displayName url { default hierarchical } }`

const Q_BY_URL = `
  query GetByUrl($url: String!) {
    BlankExperience(where:{_metadata:{url:{default:{eq:$url}}}},limit:1) { items { ${META} ${COMP} } }
    SeoExperience(where:{_metadata:{url:{default:{eq:$url}}}},limit:1)   { items { ${META} ${COMP} } }
  }
`

const Q_FIRST = `
  query GetFirst {
    BlankExperience(limit:1,orderBy:{_metadata:{published:DESC}}) { items { ${META} ${COMP} } }
  }
`

// ─── Response normalisation ───────────────────────────────────────────────────

type GqlMeta = { key?: string; types?: string[]; displayName?: string; url?: { default?: string } }
type GqlNode = { key?: string; nodeType?: string; displayName?: string; nodes?: GqlNode[]; element?: Record<string, unknown> }

function normalizeElement(el: Record<string, unknown>): BaseContent {
  const meta  = (el._metadata ?? {}) as GqlMeta
  const types = meta.types ?? []
  // Collect raw HTML from any known text field
  const html  = (el.text as { html?: string } | undefined)?.html
              ?? (el.body as { html?: string } | undefined)?.html
              ?? undefined
  return {
    contentType:  types,
    name:         meta.displayName ?? '',
    contentLink:  { id: 0, workId: 0, guidValue: meta.key ?? '' },
    // RichText / PoorText / Text
    body:         html,
    // Hero / Heading
    headline:     (el.heading as string | undefined) ?? (el.headingText as string | undefined),
    subheadline:  el.subheading as string | undefined,
    // Image
    image:        el.image
                    ? { id: '', url: (el.image as { url: { default: string } }).url?.default, alt: (el.image as { altText: string }).altText }
                    : undefined,
    // CTA
    ctaText:      el.text as string | undefined,
    ctaUrl:       el.linkUrl as string | undefined,
    ...el,
  } as unknown as BaseContent
}

function normalizeNode(node: GqlNode): CompositionNode {
  if (node.element) {
    return {
      nodeType:  'component',
      key:       node.key,
      component: normalizeElement(node.element),
    }
  }
  return {
    nodeType:    (node.nodeType ?? 'section') as CompositionNode['nodeType'],
    key:         node.key,
    displayName: node.displayName,
    nodes:       (node.nodes ?? []).map(normalizeNode),
  }
}

function normalizeContent(raw: Record<string, unknown>): AnyContent {
  const meta = (raw._metadata ?? {}) as GqlMeta
  const comp = raw.composition as GqlNode | undefined
  return {
    contentType: meta.types ?? [],
    name:        meta.displayName ?? '',
    contentLink: { id: 0, workId: 0, guidValue: meta.key ?? '', url: meta.url?.default },
    url:         meta.url?.default,
    composition: comp ? normalizeNode(comp) : undefined,
    ...raw,
  } as unknown as AnyContent
}

type GqlResult = {
  BlankExperience?: { items: Record<string, unknown>[] }
  SeoExperience?:   { items: Record<string, unknown>[] }
}

function pick(data: GqlResult | null): AnyContent | null {
  if (!data) return null
  const raw = data.BlankExperience?.items?.[0] ?? data.SeoExperience?.items?.[0]
  return raw ? normalizeContent(raw) : null
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getPageByUrl(fullUrl: string, isDraft = false): Promise<AnyContent | null> {
  const base = fullUrl.replace(/\/$/, '')
  for (const u of [`${base}/`, base, `${base}/en/`, `${base}/en`]) {
    const page = pick(await gql<GqlResult>(Q_BY_URL, { url: u }, isDraft))
    if (page) return page
  }
  return null
}

export async function getContentById(_id: string | number, isDraft = false): Promise<AnyContent | null> {
  // Content Graph uses GUID keys, not integer IDs.
  // Fall back to returning the first published experience.
  return pick(await gql<GqlResult>(Q_FIRST, {}, isDraft))
}

export async function getContentChildren(_id: string | number, _isDraft = false): Promise<AnyContent[]> {
  return []
}
