/**
 * PortfolioHome — full portfolio layout driven by CMS Site Config + composition blocks
 */
import HeroSection     from '@/components/portfolio/HeroSection'
import AboutSection    from '@/components/portfolio/AboutSection'
import SkillsSection   from '@/components/portfolio/SkillsSection'
import ProjectsSection from '@/components/portfolio/ProjectsSection'
import ContactSection  from '@/components/portfolio/ContactSection'
import { getSiteConfig } from '@/lib/optimizely/config'
import type { AnyContent, BaseContent } from '@/lib/optimizely/types'
import type { CompositionNode } from '@/lib/optimizely/types'

interface Props { content: AnyContent }

function collectBlocks(node: CompositionNode | undefined): Record<string, BaseContent> {
  const map: Record<string, BaseContent> = {}
  if (!node) return map
  if (node.nodeType === 'component' && node.component) {
    const type = (node.component.contentType as string[] | undefined)?.[0] ?? ''
    map[type] = node.component as BaseContent
  }
  for (const child of node.nodes ?? []) Object.assign(map, collectBlocks(child))
  return map
}

export default async function PortfolioHome({ content }: Props) {
  const c      = content as AnyContent & { composition?: CompositionNode }
  const blocks = collectBlocks(c.composition)
  const config = await getSiteConfig()

  const heroBlock     = blocks['HeroSection']     || blocks['HeroBlock']     || undefined
  const aboutBlock    = blocks['AboutSection']    || blocks['AboutBlock']    || undefined
  const skillsBlock   = blocks['SkillsSection']   || blocks['SkillsBlock']   || undefined
  const projectsBlock = blocks['ProjectsSection'] || blocks['ProjectsBlock'] || undefined
  const contactBlock  = blocks['ContactSection']  || blocks['ContactBlock']  || undefined

  return (
    <>
      <HeroSection     content={heroBlock}     config={config} />
      <AboutSection    content={aboutBlock}    config={config} />
      <SkillsSection   content={skillsBlock}   config={config} />
      <ProjectsSection content={projectsBlock} config={config} />
      <ContactSection  content={contactBlock}  config={config} />
    </>
  )
}
