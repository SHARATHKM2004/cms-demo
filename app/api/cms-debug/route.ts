/**
 * GET /api/cms-debug
 * Shows exactly what the CMS API returns for a given URL.
 * Remove this file after debugging.
 */
import type { NextRequest } from 'next/server'

const CMS_URL = (process.env.OPTIMIZELY_CMS_URL ?? '').replace(/\/$/, '')
const CLIENT_ID = process.env.OPTIMIZELY_CMS_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET ?? ''
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')

async function getToken() {
  const res = await fetch(`${CMS_URL}/api/episerver/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
    cache: 'no-store',
  })
  const d = await res.json()
  return d.access_token as string
}

export async function GET(request: NextRequest) {
  const token = await getToken()
  const testUrl = `${SITE_URL}/`

  // Try fetching by URL
  const byUrl = await fetch(
    `${CMS_URL}/api/episerver/v3.0/content?contentUrl=${encodeURIComponent(testUrl)}&expand=*`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: 'no-store' }
  )
  const byUrlData = await byUrl.json().catch(() => byUrl.text())

  // Try fetching root children
  const rootChildren = await fetch(
    `${CMS_URL}/api/episerver/v3.0/content/root/children?expand=*`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, cache: 'no-store' }
  )
  const rootData = await rootChildren.json().catch(() => rootChildren.text())

  return Response.json({
    siteUrl: SITE_URL,
    testUrl,
    byUrlStatus: byUrl.status,
    byUrlData,
    rootChildrenStatus: rootChildren.status,
    rootChildrenData: rootData,
  }, { status: 200 })
}
