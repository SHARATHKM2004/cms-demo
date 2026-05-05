import type { Metadata } from 'next'
import CmsRoutePage, { generateCmsMetadata } from './_components/CmsRoutePage'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata()
}

export default function HomePage() {
  return <CmsRoutePage />
}
