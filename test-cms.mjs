/**
 * Run: node test-cms.mjs
 * Tests every possible Optimizely SaaS CMS Content Graph endpoint.
 */
import crypto from 'crypto'

const APP_KEY    = '31ddf530893a49e88ada87c5d3d8c5fd'
const APP_SECRET = 'MgnhX03OTgSgNYnlVMK4RxWtCiTgrAnDT5UhCryOgyaq4ofU'

// Possible Content Graph base URLs for Optimizely SaaS CMS
// The instance alias is derived from the CMS UI URL
const ALIAS = 'wipf02saastp45ent001'
const CG_URLS = [
  `https://${ALIAS}.cg01.optimizely.com/content/v2`,
  `https://${ALIAS}.cg.optimizely.com/content/v2`,
  `https://cg.optimizely.com/content/v2`,
  `https://cg01.optimizely.com/content/v2`,
  `https://${ALIAS}.cms.optimizely.com/content/v2`,
  `https://app-${ALIAS}.cg01.optimizely.com/content/v2`,
]

// HMAC-SHA256 signing for Content Graph
function makeHmacHeaders(body) {
  const ts    = new Date().toUTCString()
  const nonce = crypto.randomBytes(8).toString('hex')
  const md5   = crypto.createHash('md5').update(body).digest('base64')
  const msg   = `POST\n${md5}\napplication/json\n${ts}\n${nonce}\n/content/v2`
  const sig   = crypto.createHmac('sha256', APP_SECRET).update(msg).digest('base64')
  return {
    'Content-Type':  'application/json',
    'Authorization': `epi-hmac ${APP_KEY}:${ts}:${nonce}:${sig}`,
  }
}

const SIMPLE_QUERY = JSON.stringify({ query: '{ __typename }' })

console.log('\n🔍 Testing Optimizely SaaS CMS Content Graph endpoints...\n')

for (const url of CG_URLS) {
  process.stdout.write(`${url} ... `)
  try {
    // Try with HMAC auth
    const res1 = await fetch(url, {
      method:  'POST',
      headers: makeHmacHeaders(SIMPLE_QUERY),
      body:    SIMPLE_QUERY,
    })
    const text1 = await res1.text()
    if (res1.ok || res1.status === 400) {
      console.log(`✅ ${res1.status} WITH HMAC — ${text1.slice(0, 100)}`)
      continue
    }

    // Try without auth
    const res2 = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    SIMPLE_QUERY,
    })
    const text2 = await res2.text()
    if (res2.ok || res2.status === 400 || res2.status === 401) {
      console.log(`⚠️  ${res2.status} WITHOUT AUTH — ${text2.slice(0, 100)}`)
    } else {
      console.log(`❌ ${res2.status}`)
    }
  } catch (e) {
    console.log(`❌ ${e.message}`)
  }
}

// Also test: what does the CMS UI domain return on known paths?
console.log('\n─── Probing CMS UI domain for API discovery ───\n')
const PROBE_URLS = [
  'https://app-wipf02saastp45ent001.cms.optimizely.com/api',
  'https://app-wipf02saastp45ent001.cms.optimizely.com/content',
  'https://app-wipf02saastp45ent001.cms.optimizely.com/.well-known/openid-configuration',
]
for (const url of PROBE_URLS) {
  process.stdout.write(`${url.split('.com')[1]} ... `)
  try {
    const res  = await fetch(url)
    const text = await res.text()
    console.log(`${res.status} — ${text.slice(0, 120).replace(/\s+/g, ' ')}`)
  } catch (e) {
    console.log(`ERROR — ${e.message}`)
  }
}

console.log('\nDone. Paste the full output above.\n')


console.log('\n🔍 Testing Optimizely CMS API endpoints...\n')

// ─── 1. Test token endpoints ───────────────────────────────────────────────────

const tokenEndpoints = [
  `${CMS_URL}/api/episerver/connect/token`,
  `${CMS_URL}/connect/token`,
  `${CMS_URL}/api/token`,
  `${CMS_URL}/oauth/token`,
]

let accessToken = null
let workingTokenUrl = null

for (const url of tokenEndpoints) {
  process.stdout.write(`Testing token: ${url} ... `)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    })
    const text = await res.text()
    if (res.ok) {
      const data = JSON.parse(text)
      accessToken    = data.access_token
      workingTokenUrl = url
      console.log(`✅ ${res.status} — Token obtained!`)
      break
    } else {
      console.log(`❌ ${res.status} — ${text.slice(0, 100)}`)
    }
  } catch (e) {
    console.log(`❌ ERROR — ${e.message}`)
  }
}

if (!accessToken) {
  console.log('\n⚠️  No token endpoint worked. Trying unauthenticated requests...\n')
}

// ─── 2. Test content endpoints ─────────────────────────────────────────────────

const headers = {
  Accept: 'application/json',
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
}

const contentTests = [
  // REST API variants
  `${CMS_URL}/api/episerver/v3.0/content?contentUrl=${encodeURIComponent(SITE_URL + '/')}&expand=*`,
  `${CMS_URL}/api/episerver/v3.0/content/17?expand=*`,
  `${CMS_URL}/api/episerver/v3.0/content?contentUrl=${encodeURIComponent(SITE_URL + '/en/')}&expand=*`,
  `${CMS_URL}/api/episerver/v2.0/content?contentUrl=${encodeURIComponent(SITE_URL + '/')}&expand=*`,
  // GraphQL
  `${CMS_URL}/content/v2`,
  // Other
  `${CMS_URL}/api/episerver/v3.0/site`,
]

console.log('\n─── Content API Tests ───\n')

for (const url of contentTests) {
  process.stdout.write(`Testing: ${url.replace(CMS_URL, '').slice(0, 60)} ... `)
  try {
    const isGraphQL = url.includes('/content/v2')
    const fetchOpts = isGraphQL
      ? {
          method:  'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body:    JSON.stringify({ query: '{ __typename }' }),
        }
      : { headers }

    const res  = await fetch(url, fetchOpts)
    const text = await res.text()

    if (res.ok) {
      const preview = text.slice(0, 150).replace(/\n/g, ' ')
      console.log(`✅ ${res.status} — ${preview}`)
    } else {
      console.log(`❌ ${res.status} — ${text.slice(0, 100).replace(/\n/g, ' ')}`)
    }
  } catch (e) {
    console.log(`❌ ERROR — ${e.message}`)
  }
}

console.log('\n─── Summary ───')
console.log(`Token endpoint: ${workingTokenUrl ?? 'NONE WORKED'}`)
console.log(`Access token:   ${accessToken ? accessToken.slice(0, 20) + '...' : 'NONE'}`)
console.log('\nCopy the ✅ lines above and share them — that tells us exactly which API to use.\n')
