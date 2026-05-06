/**
 * Site Config — reads a special "site-config" page from CMS.
 *
 * HOW TO SET UP IN CMS:
 *  1. Create a new Blank Experience page
 *  2. Set the route segment (Simple Address) to:  site-config
 *  3. Add paragraph/text blocks, setting each block's DISPLAY NAME to the key below
 *  4. The block's text content becomes the value
 *
 * Supported display names (case-insensitive):
 *   hero-name        → Your full name
 *   hero-title       → Your job title / role
 *   hero-bio         → Short tagline in the hero
 *   about-bio        → Full bio paragraph(s) for the About section
 *   github-url       → https://github.com/yourhandle
 *   linkedin-url     → https://linkedin.com/in/yourprofile
 *   email            → your@email.com
 *   profile-image    → Full URL of your profile photo
 *   cta-primary-text → Text for the first hero button (default: "View My Work")
 *   cta-primary-url  → URL for the first hero button (default: /projects)
 *   cta-secondary-text → Text for the second hero button (default: "Contact Me")
 */

import { fetchAllPublished } from './client'

export interface SiteConfig {
  name:             string
  title:            string
  heroBio:          string
  aboutBio:         string
  githubUrl:        string
  linkedinUrl:      string
  email:            string
  profileImage:     string
  ctaPrimaryText:   string
  ctaPrimaryUrl:    string
  ctaSecondaryText: string
}

const DEFAULTS: SiteConfig = {
  name:             'Sharath Kori',
  title:            'Full Stack Developer',
  heroBio:          'I build modern, performant web apps using <strong>React</strong>, <strong>Next.js</strong>, and <strong>TypeScript</strong> — with real-time CMS integrations and clean UIs.',
  aboutBio:         'I am a passionate Web Developer Intern specializing in building modern applications using React, Next.js, and Tailwind CSS. I have hands-on experience integrating CMS platforms like Optimizely and creating dynamic, real-time content-driven websites.',
  githubUrl:        'https://github.com/SHARATHKM2004',
  linkedinUrl:      'https://www.linkedin.com/in/sharath-km-422707296/',
  email:            'kmsharath@ieee.org',
  profileImage:     '',
  ctaPrimaryText:   'View My Work',
  ctaPrimaryUrl:    '#projects',
  ctaSecondaryText: 'Contact Me',
}

/** Strip HTML tags and return plain text */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/** Extract text from a block's body HTML */
function blockText(html: string | undefined): string {
  if (!html) return ''
  return stripHtml(html)
}

type RestItem = {
  routeSegment?: string
  displayName:   string
  composition?:  RestNode
}
type RestNode = {
  displayName?: string
  nodeType:     string
  component?:   { contentType: string; properties?: Record<string, { value?: unknown }> }
  nodes?:       RestNode[]
}

/** Walk composition tree and collect { displayName → html } */
function collectByName(node: RestNode | undefined, out: Record<string, string> = {}): Record<string, string> {
  if (!node) return out
  if (node.nodeType === 'component' && node.component && node.displayName) {
    const p = node.component.properties ?? {}
    // grab HTML from any property
    for (const prop of Object.values(p)) {
      const v = prop?.value
      const html =
        (v && typeof v === 'object' && 'html' in v ? (v as { html: string }).html : null) ??
        (typeof v === 'string' ? v : null)
      if (html) {
        out[node.displayName.toLowerCase().trim()] = html
        break
      }
    }
  }
  for (const child of node.nodes ?? []) collectByName(child, out)
  return out
}

let _configCache: { config: SiteConfig; cachedAt: number } | null = null
const CONFIG_TTL = 60 * 1000 // 1 minute

export async function getSiteConfig(): Promise<SiteConfig> {
  if (_configCache && Date.now() - _configCache.cachedAt < CONFIG_TTL) {
    return _configCache.config
  }

  try {
    const items = await fetchAllPublished() as RestItem[]
    const configPage = items.find(i =>
      i.routeSegment === 'site-config' ||
      i.routeSegment === 'siteconfig'  ||
      i.displayName.toLowerCase() === 'site config' ||
      i.displayName.toLowerCase() === 'site-config'
    )

    if (!configPage?.composition) {
      return DEFAULTS
    }

    const map = collectByName(configPage.composition as RestNode)
    const get = (key: string, fallback: string) => {
      const raw = map[key.toLowerCase()] ?? ''
      return raw ? blockText(raw) : fallback
    }
    const getHtml = (key: string, fallback: string) => map[key.toLowerCase()] ?? fallback

    const config: SiteConfig = {
      name:             get('hero-name',          DEFAULTS.name),
      title:            get('hero-title',         DEFAULTS.title),
      heroBio:          getHtml('hero-bio',        DEFAULTS.heroBio),
      aboutBio:         getHtml('about-bio',       DEFAULTS.aboutBio),
      githubUrl:        get('github-url',          DEFAULTS.githubUrl),
      linkedinUrl:      get('linkedin-url',        DEFAULTS.linkedinUrl),
      email:            get('email',               DEFAULTS.email),
      profileImage:     get('profile-image',       DEFAULTS.profileImage),
      ctaPrimaryText:   get('cta-primary-text',    DEFAULTS.ctaPrimaryText),
      ctaPrimaryUrl:    get('cta-primary-url',     DEFAULTS.ctaPrimaryUrl),
      ctaSecondaryText: get('cta-secondary-text',  DEFAULTS.ctaSecondaryText),
    }

    _configCache = { config, cachedAt: Date.now() }
    return config
  } catch (err) {
    console.error('[Config] failed to load site config:', err)
    return DEFAULTS
  }
}

/** Call this from the revalidate webhook to clear the config cache */
export function clearConfigCache() {
  _configCache = null
}
