import type { ComponentType } from 'react'
import type { BaseContent }   from '@/lib/optimizely/types'

import Hero           from './Hero'
import RichText       from './RichText'
import CtaBlock       from './CtaBlock'
import CardGrid       from './CardGrid'
import ImageBlock     from './ImageBlock'
import HeroSection     from '@/components/portfolio/HeroSection'
import AboutSection    from '@/components/portfolio/AboutSection'
import SkillsSection   from '@/components/portfolio/SkillsSection'
import ProjectsSection from '@/components/portfolio/ProjectsSection'
import ContactSection  from '@/components/portfolio/ContactSection'

interface Props { content: BaseContent }
type BlockComponent = ComponentType<Props>

const COMPONENT_MAP: Record<string, BlockComponent> = {
  // ── Portfolio sections (created in CMS Visual Builder) ────────────────────
  'HeroSection':        HeroSection,
  'HeroBlock':          HeroSection,
  'Hero Block':         HeroSection,
  'AboutSection':       AboutSection,
  'AboutBlock':         AboutSection,
  'SkillsSection':      SkillsSection,
  'SkillsBlock':        SkillsSection,
  'ProjectsSection':    ProjectsSection,
  'ProjectsBlock':      ProjectsSection,
  'ContactSection':     ContactSection,
  'ContactBlock':       ContactSection,

  // ── Rich text / paragraph ─────────────────────────────────────────────────
  'RichTextBlock':      RichText,
  'RichTextElement':    RichText,
  'Rich Text Element':  RichText,
  'TextBlock':          RichText,
  'TextElement':        RichText,
  'ParagraphElement':   RichText,
  'Pragraph of text':   RichText,
  'PoorTextElement':    RichText,
  'Poor Text Element':  RichText,
  'StoryBlock':         RichText,
  'Story Block':        RichText,
  'Heading':            RichText,
  'HeadingElement':     RichText,

  // ── CTA ───────────────────────────────────────────────────────────────────
  'CtaBlock':           CtaBlock,
  'CTABlock':           CtaBlock,
  'CTAElement':         CtaBlock,
  'ContactBlock_CTA':   CtaBlock,

  // ── Cards / grids ─────────────────────────────────────────────────────────
  'CardGridBlock':      CardGrid,
  'ServicesBlock':      CardGrid,
  'Services Block':     CardGrid,
  'PortfolioGridBlock': CardGrid,
  'Portfolio Grid Block': CardGrid,
  'TestimonialsBlock':  CardGrid,

  // ── Images ────────────────────────────────────────────────────────────────
  'ImageBlock':         ImageBlock,
  'ImageElement':       ImageBlock,
  'Image':              ImageBlock,
  'MediaBlock':         ImageBlock,
  'Generic media':      ImageBlock,

  // ── Legacy Hero ───────────────────────────────────────────────────────────
  'Hero':               Hero,
}

function resolveType(contentType: string[] | undefined): string | undefined {
  if (!contentType?.length) return undefined
  return [...contentType].reverse().find(t => !['Block', 'Page', 'Content', 'Media'].includes(t))
}

export default function ComponentFactory({ content }: Props) {
  if (!content) return null

  const typeName  = resolveType(content.contentType as string[])
  const Component = typeName ? COMPONENT_MAP[typeName] : undefined

  // Catch-all: anything with HTML body → RichText
  if (!Component && content.body) return <RichText content={content} />

  if (!Component) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="border-2 border-dashed border-amber-400 bg-amber-50 rounded-xl p-5 m-4 text-sm text-amber-800">
          <strong>Unmapped block:</strong>{' '}
          <code>{typeName ?? (content.contentType as string[] | undefined)?.join(' / ')}</code>
          {' — '}<em>{content.name}</em>
        </div>
      )
    }
    return null
  }

  return <Component content={content} />
}

