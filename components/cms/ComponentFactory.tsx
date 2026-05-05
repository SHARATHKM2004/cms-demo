/**
 * ComponentFactory
 *
 * Maps a CMS content type to its React component.
 * Unknown types render a visible warning in dev and are silently skipped in prod.
 * This is the single place to register new block types.
 */

import type { ComponentType } from 'react'
import type { BaseContent }   from '@/lib/optimizely/types'

import Hero       from './Hero'
import RichText   from './RichText'
import CtaBlock   from './CtaBlock'
import CardGrid   from './CardGrid'
import ImageBlock from './ImageBlock'

interface Props { content: BaseContent }

type BlockComponent = ComponentType<Props>

// Add new block registrations here — key = CMS content type name or GraphQL type
const COMPONENT_MAP: Record<string, BlockComponent> = {
  // Hero
  'HeroBlock':          Hero,
  'Hero Block':         Hero,

  // Rich text / paragraph (Content Graph type names)
  'RichTextBlock':      RichText,
  'RichTextElement':    RichText,
  'Rich Text Element':  RichText,
  'TextBlock':          RichText,
  'TextElement':        RichText,
  'ParagraphElement':   RichText,
  'PoorTextElement':    RichText,
  'Poor Text Element':  RichText,
  'Story Block':        RichText,
  'StoryBlock':         RichText,

  // Headings
  'Heading':            RichText,
  'HeadingElement':     RichText,

  // CTA
  'CtaBlock':           CtaBlock,
  'CTABlock':           CtaBlock,
  'CTAElement':         CtaBlock,
  'Contact Block':      CtaBlock,
  'ContactBlock':       CtaBlock,

  // Cards / grids
  'CardGridBlock':      CardGrid,
  'Services Block':     CardGrid,
  'ServicesBlock':      CardGrid,
  'Portfolio Grid Block': CardGrid,
  'PortfolioGridBlock': CardGrid,
  'Logos Block':        CardGrid,
  'LogosBlock':         CardGrid,
  'Testimonials Block': CardGrid,
  'TestimonialsBlock':  CardGrid,

  // Images
  'ImageBlock':         ImageBlock,
  'ImageElement':       ImageBlock,
  'MediaBlock':         ImageBlock,
  'Image':              ImageBlock,
  'Generic media':      ImageBlock,
}

/** Returns the most-specific type name from a contentType array like ['Block','HeroBlock'] */
function resolveType(contentType: string[] | undefined): string | undefined {
  if (!contentType?.length) return undefined
  return [...contentType]
    .reverse()
    .find(t => !['Block', 'Page', 'Content', 'Media'].includes(t))
}

export default function ComponentFactory({ content }: Props) {
  if (!content) return null

  const typeName  = resolveType(content.contentType)
  const Component = typeName ? COMPONENT_MAP[typeName] : undefined

  if (!Component) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="border-2 border-dashed border-amber-400 bg-amber-50 rounded-xl p-5 m-4 text-sm text-amber-800">
          <strong>Unmapped block:</strong>{' '}
          <code>{typeName ?? content.contentType?.join(' / ')}</code>
          {' — '}<em>{content.name}</em>
          <br />
          <span className="text-xs text-amber-600">
            Add it to COMPONENT_MAP in components/cms/ComponentFactory.tsx
          </span>
        </div>
      )
    }
    return null
  }

  return <Component content={content} />
}
