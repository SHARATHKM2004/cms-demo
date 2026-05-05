import type { Metadata } from 'next'
import CmsRoutePage, { generateCmsMetadata } from './_components/CmsRoutePage'

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata()
}

export default function HomePage() {
  return <CmsRoutePage />
}
