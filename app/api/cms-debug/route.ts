/**
 * GET /api/cms-debug
 * Diagnoses the Content Graph connection.
 * Remove after debugging.
 */
import crypto from 'crypto'

const APP_KEY    = process.env.OPTIMIZELY_CMS_CLIENT_ID    ?? ''
const APP_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET ?? ''
const GRAPH_URL  = 'https://cg.optimizely.com/content/v2'

function hmacHeaders(body: string) {
  const ts    = new Date().toISOString()
  const nonce = crypto.randomBytes(8).toString('hex')
  const hash  = crypto.createHash('md5').update(body).digest('base64')
  const msg   = `POST\n${hash}\napplication/json\n${ts}\n${nonce}\n/content/v2`
  const sig   = crypto.createHmac('sha256', APP_SECRET).update(msg).digest('base64')
  return { Authorization: `epi-hmac ${APP_KEY}:${ts}:${nonce}:${sig}` }
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {
    appKey:    APP_KEY ? APP_KEY.slice(0, 8) + '...' : 'MISSING',
    appSecret: APP_SECRET ? APP_SECRET.slice(0, 8) + '...' : 'MISSING',
    graphUrl:  GRAPH_URL,
  }

  // Test 1: No auth (should return 401)
  try {
    const r = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
      cache: 'no-store',
    })
    results['noAuthStatus'] = r.status
    results['noAuthBody'] = (await r.text()).slice(0, 200)
  } catch (e) { results['noAuthError'] = String(e) }

  // Test 2: HMAC auth with simple introspection
  const body2 = JSON.stringify({ query: '{ __typename }' })
  try {
    const r = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...hmacHeaders(body2) },
      body: body2,
      cache: 'no-store',
    })
    results['hmacAuthStatus'] = r.status
    results['hmacAuthBody'] = (await r.text()).slice(0, 500)
  } catch (e) { results['hmacAuthError'] = String(e) }

  // Test 3: HMAC auth — list all content
  const body3 = JSON.stringify({ query: `{
    _Content(limit:5) { items { _metadata { key types displayName url { default } } } }
  }` })
  try {
    const r = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...hmacHeaders(body3) },
      body: body3,
      cache: 'no-store',
    })
    results['listContentStatus'] = r.status
    results['listContentBody'] = (await r.text()).slice(0, 1000)
  } catch (e) { results['listContentError'] = String(e) }

  return Response.json(results, { status: 200 })
}
