/**
 * Shared CMS page rendering logic used by both:
 *   app/page.tsx            (homepage /)
 *   app/[[...slug]]/page.tsx (all other CMS routes)
 */

import { draftMode } from 'next/headers'
import { notFound }  from 'next/navigation'
import type { Metadata } from 'next'

import { getPageByUrl, getContentById } from '@/lib/optimizely/client'
import type { StandardPage, ExperiencePage } from '@/lib/optimizely/types'
import CmsPage      from '@/components/cms/CmsPage'
import DraftBanner  from '@/components/DraftBanner'

const SITE_BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export function buildSiteUrl(slug?: string[]): string {
  if (!slug || slug.length === 0) return `${SITE_BASE}/`
  // Strip 'en' language prefix if present in slug (CMS adds it, we don't want it in path)
  const cleanSlug = slug.filter(s => s !== 'en')
  return `${SITE_BASE}/${cleanSlug.join('/')}`
}

export async function generateCmsMetadata(slug?: string[]): Promise<Metadata> {
  const { isEnabled } = await draftMode()
  const url  = buildSiteUrl(slug)
  const page = await getPageByUrl(url, isEnabled) as (StandardPage & ExperiencePage) | null
  if (!page) return { title: 'Not Found' }
  return {
    title:       page.title ?? page.name,
    description: page.metaDescription ?? '',
  }
}

export default async function CmsRoutePage({ slug }: { slug?: string[] }) {
  const { isEnabled: isDraft } = await draftMode()
  const url  = buildSiteUrl(slug)
  let page = await getPageByUrl(url, isDraft)

  // For homepage, also try fetching by START_PAGE_ID env var if set
  if (!page && (!slug || slug.length === 0)) {
    const startId = process.env.OPTIMIZELY_START_PAGE_ID
    if (startId) {
      page = await getContentById(startId, isDraft)
    }
  }

  if (!page) {
    notFound()
  }

  return (
    <>
      {isDraft && <DraftBanner />}
      <CmsPage content={page} isDraft={isDraft} />
    </>
  )
}
