/**
 * GET /api/cms-debug
 * Diagnoses the CMS SaaS REST API connection.
 * Remove after debugging.
 */
import crypto from 'crypto'

const CLIENT_ID     = process.env.OPTIMIZELY_CMS_CLIENT_ID    ?? ''
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET ?? ''
// CMS SaaS REST API uses a GLOBAL token endpoint, not instance-specific
const TOKEN_URL     = 'https://api.cms.optimizely.com/oauth/token'
const API_BASE      = 'https://api.cms.optimizely.com/v1'
// Content Graph (separate credentials — received during onboarding)
const GRAPH_URL     = 'https://cg.optimizely.com/content/v2'

function hmacHeaders(body: string) {
  const ts    = new Date().toISOString()
  const nonce = crypto.randomBytes(8).toString('hex')
  const hash  = crypto.createHash('md5').update(body).digest('base64')
  const msg   = `POST\n${hash}\napplication/json\n${ts}\n${nonce}\n/content/v2`
  const sig   = crypto.createHmac('sha256', CLIENT_SECRET).update(msg).digest('base64')
  return { Authorization: `epi-hmac ${CLIENT_ID}:${ts}:${nonce}:${sig}` }
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {
    clientId:  CLIENT_ID ? CLIENT_ID.slice(0, 8) + '...' : 'MISSING',
    tokenUrl:  TOKEN_URL,
    apiBase:   API_BASE,
  }

  // Test 1: Get OAuth2 token from GLOBAL endpoint
  let token = ''
  try {
    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      cache: 'no-store',
    })
    results['tokenStatus'] = r.status
    const body = await r.json().catch(() => null)
    results['tokenBody'] = body
    token = (body as Record<string, string>)?.access_token ?? ''
    results['gotToken'] = !!token
  } catch (e) { results['tokenError'] = String(e) }

  // Test 2: List published content versions — show raw composition
  if (token) {
    try {
      const r = await fetch(`${API_BASE}/content/versions?statuses=Published&pageSize=10&locales=en`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      })
      results['listStatus'] = r.status
      const data = await r.json().catch(() => null) as { items?: unknown[] } | null
      results['itemCount'] = data?.items?.length ?? 0
      // Show full first item so we can see contentType + composition + properties
      results['firstItem'] = data?.items?.[0] ?? null
      results['allRouteSegments'] = (data?.items as Array<{routeSegment?: string; displayName?: string; contentType?: string}> ?? [])
        .map(i => ({ name: i.displayName, type: i.contentType, route: i.routeSegment }))
    } catch (e) { results['listError'] = String(e) }
  }

  // Test 3: Graph with HMAC (just to show it's a separate credential)
  const gBody = JSON.stringify({ query: '{ __typename }' })
  try {
    const r = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...hmacHeaders(gBody) },
      body: gBody,
      cache: 'no-store',
    })
    results['graphStatus'] = r.status
    results['graphBody'] = (await r.text()).slice(0, 300)
  } catch (e) { results['graphError'] = String(e) }

  return Response.json(results, { status: 200 })
}
