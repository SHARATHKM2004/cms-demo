import type { Metadata } from 'next'
import CmsRoutePage, { generateCmsMetadata } from '../_components/CmsRoutePage'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return generateCmsMetadata(slug)
}

export default async function CmsSlugPage({ params }: Props) {
  const { slug } = await params
  return <CmsRoutePage slug={slug} />
}
