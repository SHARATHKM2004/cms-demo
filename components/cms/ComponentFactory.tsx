import type { ComponentType } from 'react'
import type { BaseContent }   from '@/lib/optimizely/types'

import Hero          from './Hero'
import RichText      from './RichText'
import CtaBlock      from './CtaBlock'
import CardGrid      from './CardGrid'
import ImageBlock    from './ImageBlock'
import AboutBlock    from './AboutBlock'
import ProjectsBlock from './ProjectsBlock'
import ContactBlock  from './ContactBlock'

interface Props { content: BaseContent }
type BlockComponent = ComponentType<Props>

const COMPONENT_MAP: Record<string, BlockComponent> = {
  // ── Hero ──────────────────────────────────────────────────
  'HeroBlock':              Hero,
  'Hero Block':             Hero,
  'HeroSection':            Hero,
  'Hero':                   Hero,

  // ── Rich text / paragraph ─────────────────────────────────
  'RichTextBlock':          RichText,
  'RichTextElement':        RichText,
  'Rich Text Element':      RichText,
  'ParagraphElement':       RichText,
  'Paragraph of text':      RichText,
  'PoorTextElement':        RichText,
  'TextBlock':              RichText,
  'TextElement':            RichText,
  'StoryBlock':             RichText,
  'HeadingElement':         RichText,
  'Heading':                RichText,

  // ── About ────────────────────────────────────────────────
  'AboutBlock':             AboutBlock,
  'About Block':            AboutBlock,
  'AboutSection':           AboutBlock,
  'AboutMe':                AboutBlock,

  // ── Projects ─────────────────────────────────────────────
  'ProjectsBlock':          ProjectsBlock,
  'Projects Block':         ProjectsBlock,
  'CardGridBlock':          ProjectsBlock,
  'Services Block':         ProjectsBlock,
  'Portfolio Grid Block':   ProjectsBlock,
  'PortfolioGridBlock':     ProjectsBlock,

  // ── Contact ───────────────────────────────────────────────
  'ContactBlock':           ContactBlock,
  'Contact Block':          ContactBlock,
  'ContactSection':         ContactBlock,

  // ── CTA ──────────────────────────────────────────────────
  'CtaBlock':               CtaBlock,
  'CTABlock':               CtaBlock,
  'CTAElement':             CtaBlock,

  // ── Images ────────────────────────────────────────────────
  'ImageBlock':             ImageBlock,
  'ImageElement':           ImageBlock,
  'Image':                  ImageBlock,
  'MediaBlock':             ImageBlock,
}

function resolveType(contentType: string[] | undefined): string | undefined {
  if (!contentType?.length) return undefined
  return [...contentType].reverse().find(t => !['Block','Page','Content','Media'].includes(t))
}

export default function ComponentFactory({ content }: Props) {
  if (!content) return null
  // Catch-all: any content with a body renders as RichText
  if (!COMPONENT_MAP[resolveType(content.contentType as string[]) ?? ''] && content.body) {
    return <RichText content={content} />
  }

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
