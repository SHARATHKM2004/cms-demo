/**
 * CmsPage
 *
 * Handles two page shapes returned by Optimizely CMS:
 *  1. StandardPage — classic ContentArea (`mainContentArea`)
 *  2. ExperiencePage — Visual Builder composition tree
 */

import type {
  AnyContent,
  StandardPage,
  ExperiencePage,
  CompositionNode,
  BaseContent,
  ExpandedContentReference,
} from '@/lib/optimizely/types'
import ComponentFactory from './ComponentFactory'
import PortfolioHome    from '@/components/portfolio/PortfolioHome'

interface Props {
  content:  AnyContent
  isDraft?: boolean
}

// ─── Visual Builder tree renderer ─────────────────────────────────────────────

function RenderNode({ node }: { node: CompositionNode }) {
  if (!node) return null

  if (node.nodeType === 'component' && node.component) {
    return <ComponentFactory content={node.component as BaseContent} />
  }

  if (!node.nodes?.length) return null

  const children = node.nodes.map((child, i) => (
    <RenderNode key={child.key ?? i} node={child} />
  ))

  switch (node.nodeType) {
    case 'experience':
      return <div className="cms-experience">{children}</div>
    case 'section':
      return <section className="cms-section w-full">{children}</section>
    case 'row':
      return <div className="cms-row flex flex-wrap gap-4">{children}</div>
    case 'column':
      return <div className="cms-column flex-1 min-w-0">{children}</div>
    default:
      return <>{children}</>
  }
}

// ─── Type guards ──────────────────────────────────────────────────────────────

function isExperiencePage(c: AnyContent): c is ExperiencePage {
  return (
    Array.isArray(c.contentType) &&
    (c.contentType.includes('ExperiencePage') ||
      c.contentType.includes('VisualBuilderPage') ||
      c.contentType.includes('BlankExperience') ||
      c.contentType.includes('Blank Experience') ||
      c.contentType.includes('SeoExperience') ||
      c.contentType.includes('SEO Experience')) &&
    'composition' in c
  )
}

function isStandardPage(c: AnyContent): c is StandardPage {
  return (
    'mainContentArea' in c ||
    (Array.isArray(c.contentType) &&
      c.contentType.some(t =>
        t.endsWith('Page') ||
        t === 'CMS Page'  ||
        t === 'Start Page' ||
        t === 'StandardPage'
      ))
  )
}

/** True when the routeSegment is the homepage */
function isHomePage(c: AnyContent): boolean {
  const rs = (c as Record<string, unknown>).routeSegment as string | undefined
  return !rs || rs === '' || rs === 'home' || rs === 'demo-site' || rs === 'demosite'
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CmsPage({ content }: Props) {
  const id = content.contentLink?.id

  // ── Homepage: always render the full portfolio layout ──────────────────────
  if (isHomePage(content)) {
    return <PortfolioHome content={content} />
  }

  // ── Visual Builder / Experience page ──────────────────────────────────────
  if (isExperiencePage(content) && content.composition) {
    return (
      <div className="cms-page" data-content-link={id}>
        <RenderNode node={content.composition} />
      </div>
    )
  }

  // ── Traditional ContentArea page ──────────────────────────────────────────
  if (isStandardPage(content)) {
    const page  = content as StandardPage
    const items = page.mainContentArea ?? []

    if (items.length === 0) {
      return (
        <div className="cms-page py-20 text-center" data-content-link={id}>
          <p className="text-slate-400 text-sm">
            This page has no content blocks yet. Add them in Optimizely CMS.
          </p>
        </div>
      )
    }

    return (
      <div className="cms-page" data-content-link={id}>
        {items.map((ref: ExpandedContentReference, i: number) =>
          (ref.expandedValue ?? []).map((block: BaseContent, j: number) => (
            <ComponentFactory key={`${i}-${j}`} content={block} />
          )),
        )}
      </div>
    )
  }

  // ── Unknown page type ─────────────────────────────────────────────────────
  return (
    <div className="cms-page py-20 text-center" data-content-link={id}>
      <p className="text-slate-400 text-sm">
        Page type <code>{content.contentType?.join('/')}</code> is not yet mapped.
      </p>
    </div>
  )
}

