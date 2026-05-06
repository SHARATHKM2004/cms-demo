/**
 * PortfolioHome
 * 
 * The default homepage layout when the CMS page has minimal content.
 * Each section checks if a matching CMS block was passed in; if not, 
 * it renders hardcoded defaults so the page always looks great.
 */
import HeroSection     from '@/components/portfolio/HeroSection'
import AboutSection    from '@/components/portfolio/AboutSection'
import SkillsSection   from '@/components/portfolio/SkillsSection'
import ProjectsSection from '@/components/portfolio/ProjectsSection'
import ContactSection  from '@/components/portfolio/ContactSection'
import type { AnyContent, BaseContent } from '@/lib/optimizely/types'
import type { CompositionNode } from '@/lib/optimizely/types'

interface Props {
  content: AnyContent
}

/** Walk the composition tree and collect components by their contentType */
function collectBlocks(node: CompositionNode | undefined): Record<string, BaseContent> {
  const map: Record<string, BaseContent> = {}
  if (!node) return map

  if (node.nodeType === 'component' && node.component) {
    const type = (node.component.contentType as string[] | undefined)?.[0] ?? ''
    map[type] = node.component as BaseContent
  }
  for (const child of node.nodes ?? []) {
    Object.assign(map, collectBlocks(child))
  }
  return map
}

export default function PortfolioHome({ content }: Props) {
  const c = content as AnyContent & { composition?: CompositionNode }
  const blocks = collectBlocks(c.composition)

  // Match blocks by content type name (CMS type → section)
  const heroBlock     = blocks['HeroBlock']     || blocks['HeroSection']     || undefined
  const aboutBlock    = blocks['AboutBlock']    || blocks['AboutSection']    || undefined
  const skillsBlock   = blocks['SkillsBlock']   || blocks['SkillsSection']   || undefined
  const projectsBlock = blocks['ProjectsBlock'] || blocks['ProjectsSection'] || undefined
  const contactBlock  = blocks['ContactBlock']  || blocks['ContactSection']  || undefined

  return (
    <>
      <HeroSection     content={heroBlock} />
      <AboutSection    content={aboutBlock} />
      <SkillsSection   content={skillsBlock} />
      <ProjectsSection content={projectsBlock} />
      <ContactSection  content={contactBlock} />
    </>
  )
}
