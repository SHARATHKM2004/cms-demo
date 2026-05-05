// ─── Primitive CMS types ───────────────────────────────────────────────────────

export interface ContentLink {
  id: number
  workId: number
  guidValue: string
  url?: string
}

export interface CmsImage {
  id: string
  url: string
  alt?: string
}

// Base shape every content item shares
export interface BaseContent {
  contentLink: ContentLink
  name: string
  contentType: string[]
  status?: string
  url?: string
  language?: { name: string; displayName: string }
  changed?: string
  created?: string
  [key: string]: unknown
}

// A ContentArea slot — expandedValue is populated when expand=* is used
export interface ExpandedContentReference {
  contentLink: ContentLink
  displayOption?: string
  tag?: string
  expandedValue?: BaseContent[]
}

// ─── Block / component types ───────────────────────────────────────────────────

export interface HeroBlock extends BaseContent {
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaUrl?: string
  backgroundImage?: CmsImage
}

export interface RichTextBlock extends BaseContent {
  body?: string // XhtmlString rendered as HTML
}

export interface CtaBlock extends BaseContent {
  heading?: string
  text?: string
  buttonText?: string
  buttonUrl?: string
  variant?: string // 'primary' | 'secondary' | 'dark'
}

export interface CardItem extends BaseContent {
  title?: string
  description?: string
  linkUrl?: string
  image?: CmsImage
}

export interface CardGridBlock extends BaseContent {
  heading?: string
  cards?: ExpandedContentReference[]
}

export interface ImageBlock extends BaseContent {
  image?: CmsImage
  caption?: string
  altText?: string
}

// ─── Page types ────────────────────────────────────────────────────────────────

export interface StandardPage extends BaseContent {
  title?: string
  metaDescription?: string
  mainContentArea?: ExpandedContentReference[]
}

// Visual Builder "Experience" page — content is a composition tree
export interface CompositionNode {
  nodeType: 'experience' | 'section' | 'row' | 'column' | 'component'
  key?: string
  displayName?: string
  displaySettings?: Array<{ key: string; value: string }>
  nodes?: CompositionNode[]
  component?: BaseContent
}

export interface ExperiencePage extends BaseContent {
  title?: string
  metaDescription?: string
  composition?: CompositionNode
}

// Union of everything the app may encounter
export type AnyContent =
  | StandardPage
  | ExperiencePage
  | HeroBlock
  | RichTextBlock
  | CtaBlock
  | CardGridBlock
  | ImageBlock
  | BaseContent
