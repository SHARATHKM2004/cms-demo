# Optimizely SaaS CMS + Next.js — Complete Setup Guide

> This guide walks a beginner through building a complete marketing website
> where **Next.js is the frontend** and **Optimizely SaaS CMS manages all content**.
> Follow every step in order. Do not skip anything.

---

## What You Will Build

A small marketing website with:
- Pages: Home, About, Services, Blog
- All content managed in Optimizely CMS
- Live site deployed on Vercel (free)
- Site visible and editable inside CMS (Visual Builder)
- Publish in CMS → content updates on live site instantly

---

## Prerequisites

Before starting, make sure you have:

| Tool | How to check | Install link |
|---|---|---|
| Node.js 18+ | Run `node -v` in terminal | [nodejs.org](https://nodejs.org) |
| Git | Run `git --version` | [git-scm.com](https://git-scm.com) |
| VS Code | Open VS Code | [code.visualstudio.com](https://code.visualstudio.com) |
| GitHub account | Login at github.com | [github.com](https://github.com) |
| Vercel account | Login at vercel.com | [vercel.com](https://vercel.com) |
| Optimizely CMS access | Provided by your team | — |

---

## Part 1 — Create the Next.js Project

### Step 1 — Open a terminal in VS Code
- Open VS Code
- Press `Ctrl + `` ` (backtick) to open the terminal
- Create a new folder and navigate into it:

```bash
mkdir my-cms-site
cd my-cms-site
```

### Step 2 — Scaffold the Next.js app
Run this command. It creates a new Next.js project with TypeScript, Tailwind CSS, and App Router:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

When asked `Ok to proceed? (y)` — type `y` and press Enter.

Wait ~1 minute for it to install. You'll see `Success!` when done.

### Step 3 — Verify it works
```bash
npm run dev
```

Open your browser and go to `http://localhost:3000`. You should see the default Next.js page. Press `Ctrl+C` to stop the server.

---

## Part 2 — Project Structure Explained

After scaffolding, your project looks like this:

```
my-cms-site/
├── app/                  ← All pages live here (App Router)
│   ├── layout.tsx        ← Wraps every page (header, footer go here)
│   ├── page.tsx          ← Homepage /
│   └── globals.css       ← Global styles
├── public/               ← Static files (images, icons)
├── next.config.ts        ← Next.js configuration
├── package.json          ← Project dependencies
└── tsconfig.json         ← TypeScript configuration
```

You will add these folders:

```
├── lib/
│   └── optimizely/       ← CMS API client code
├── components/
│   ├── cms/              ← CMS block components (Hero, RichText, etc.)
│   └── layout/           ← Header and Footer
└── app/
    ├── api/              ← API routes (preview, revalidate)
    └── _components/      ← Shared page logic
```

---

## Part 3 — Environment Variables

Environment variables are secret configuration values your app needs to connect to Optimizely CMS.

### Step 4 — Create `.env.local`

Create a file called `.env.local` in the root of your project. This file is **never committed to GitHub** (it's in `.gitignore` by default).

```env
# Optimizely CMS instance URL
OPTIMIZELY_CMS_URL=https://YOUR-INSTANCE.cms.optimizely.com

# API credentials — get these from CMS → Settings → API Clients
OPTIMIZELY_CMS_CLIENT_ID=your-client-id-here
OPTIMIZELY_CMS_CLIENT_SECRET=your-client-secret-here

# Secret tokens — you choose these values, use any random string
OPTIMIZELY_PREVIEW_SECRET=my-preview-secret-2026
OPTIMIZELY_REVALIDATE_SECRET=my-revalidate-secret-2026

# Your deployed site URL (update after Vercel deploy)
NEXT_PUBLIC_CMS_URL=https://YOUR-INSTANCE.cms.optimizely.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **How to get your credentials:**
> 1. Log in to your Optimizely CMS
> 2. Go to **Settings → API Clients**
> 3. Click **Create** → copy the Client ID and Client Secret

---

## Part 4 — CMS TypeScript Types

Types describe the shape of data coming from CMS. This helps VS Code catch errors.

### Step 5 — Create `lib/optimizely/types.ts`

```typescript
// Every CMS item has a contentLink (its unique identifier)
export interface ContentLink {
  id: number
  workId: number
  guidValue: string
  url?: string
}

// Image type used in Hero, ImageBlock etc.
export interface CmsImage {
  id: string
  url: string
  alt?: string
}

// Base shape — every content item has these fields
export interface BaseContent {
  contentLink: ContentLink
  name: string
  contentType: string[]   // e.g. ['Block', 'HeroBlock']
  url?: string
  [key: string]: unknown  // allow any other fields
}

// A slot in a ContentArea
export interface ExpandedContentReference {
  contentLink: ContentLink
  expandedValue?: BaseContent[]
}

// ─── Block types (match your CMS content type field names) ───

export interface HeroBlock extends BaseContent {
  title?: string
  subtitle?: string
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaUrl?: string
  backgroundImage?: CmsImage
}

export interface RichTextBlock extends BaseContent {
  body?: string  // HTML string
}

export interface CtaBlock extends BaseContent {
  heading?: string
  text?: string
  buttonText?: string
  buttonUrl?: string
  variant?: string
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

// ─── Page types ───

export interface StandardPage extends BaseContent {
  title?: string
  metaDescription?: string
  mainContentArea?: ExpandedContentReference[]
}

// Visual Builder page — has a composition tree
export interface CompositionNode {
  nodeType: 'experience' | 'section' | 'row' | 'column' | 'component'
  key?: string
  displayName?: string
  nodes?: CompositionNode[]
  component?: BaseContent
}

export interface ExperiencePage extends BaseContent {
  title?: string
  composition?: CompositionNode
}

export type AnyContent =
  | StandardPage
  | ExperiencePage
  | HeroBlock
  | RichTextBlock
  | CtaBlock
  | CardGridBlock
  | ImageBlock
  | BaseContent
```

---

## Part 5 — CMS API Client

This is the code that talks to Optimizely CMS and fetches content.

### Step 6 — Create `lib/optimizely/client.ts`

**How it works:**
1. Gets an OAuth2 access token using your Client ID + Secret
2. Uses that token to make authenticated API requests
3. Returns content data as JSON

```typescript
import type { AnyContent } from './types'

const CMS_URL       = (process.env.OPTIMIZELY_CMS_URL ?? '').replace(/\/$/, '')
const CLIENT_ID     = process.env.OPTIMIZELY_CMS_CLIENT_ID ?? ''
const CLIENT_SECRET = process.env.OPTIMIZELY_CMS_CLIENT_SECRET ?? ''
const API_BASE      = `${CMS_URL}/api/episerver/v3.0`

// ─── Token cache (avoids fetching a new token on every request) ───

type TokenCache = { token: string; expiresAt: number } | null
let _tokenCache: TokenCache = null

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.token
  }
  // Request a new token
  const res = await fetch(`${CMS_URL}/api/episerver/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Token error ${res.status}`)
  const data = await res.json() as { access_token: string; expires_in: number }
  _tokenCache = {
    token:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return _tokenCache.token
}

// ─── Core fetch function ───

async function cmsGet<T = AnyContent>(
  endpoint: string,
  queryParams: Record<string, string> = {},
  isDraft = false,
): Promise<T | null> {
  const url = new URL(`${API_BASE}${endpoint}`)
  url.searchParams.set('expand', '*')  // expand=* fetches related content inline
  for (const [k, v] of Object.entries(queryParams)) url.searchParams.set(k, v)

  let authHeader: string | undefined
  try {
    authHeader = `Bearer ${await getAccessToken()}`
  } catch (err) {
    console.warn('[CMS] token failed:', err)
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: 'no-store',  // always fetch fresh (we handle caching via Next.js revalidation)
    })
    if (res.status === 404) return null
    if (!res.ok) {
      console.error(`[CMS] ${res.status} — ${url}`)
      return null
    }
    return res.json() as Promise<T>
  } catch (err) {
    console.error('[CMS] error:', err)
    return null
  }
}

// ─── Public functions used by pages ───

/**
 * Find a page by its public URL.
 * Tries multiple URL formats because CMS may store URLs with /en/ prefix.
 */
export async function getPageByUrl(fullUrl: string, isDraft = false): Promise<AnyContent | null> {
  const base = fullUrl.replace(/\/$/, '')
  const candidates = [`${base}/`, base, `${base}/en/`, `${base}/en`]

  for (const url of candidates) {
    const result = await cmsGet<AnyContent | AnyContent[]>(
      '/content',
      { contentUrl: url },
      isDraft,
    )
    if (result) {
      return Array.isArray(result) ? (result[0] ?? null) : result
    }
  }
  return null
}

/**
 * Fetch a content item directly by its numeric ID.
 * Useful as a fallback when URL-based lookup fails.
 */
export async function getContentById(id: string | number, isDraft = false): Promise<AnyContent | null> {
  return cmsGet<AnyContent>(`/content/${id}`, {}, isDraft)
}

/**
 * Fetch child pages of a content item (used for blog listing etc.)
 */
export async function getContentChildren(id: string | number, isDraft = false): Promise<AnyContent[]> {
  return (await cmsGet<AnyContent[]>(`/content/${id}/children`, {}, isDraft)) ?? []
}
```

---

## Part 6 — CMS Block Components

Each CMS block type needs a React component to render it on screen.

### Step 7 — Create `components/cms/Hero.tsx`

```tsx
import type { HeroBlock, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function Hero({ content }: Props) {
  const b  = content as HeroBlock
  const bg = b.backgroundImage?.url
  // Support both field naming conventions
  const heading = b.headline ?? b.title
  const sub     = b.subheadline ?? b.subtitle

  return (
    <section
      className="relative w-full min-h-[520px] flex items-center justify-center text-white"
      style={{
        background: bg
          ? `linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.3)),url(${bg}) center/cover`
          : 'linear-gradient(135deg,#1e3a5f,#2563eb)',
      }}
    >
      <div className="max-w-4xl mx-auto px-8 text-center">
        {heading && <h1 className="text-5xl font-bold mb-5">{heading}</h1>}
        {sub     && <p  className="text-xl mb-8 text-blue-100">{sub}</p>}
        {b.ctaText && b.ctaUrl && (
          <a href={b.ctaUrl} className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors">
            {b.ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
```

### Step 8 — Create `components/cms/RichText.tsx`

```tsx
import type { RichTextBlock, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function RichText({ content }: Props) {
  const b       = content as RichTextBlock & { headingText?: string }
  const html    = b.body
  const heading = String(b.headingText ?? b.headline ?? '') || undefined

  if (!html && !heading) return null

  return (
    <section className="py-14 px-8">
      <div className="max-w-3xl mx-auto">
        {heading && !html && (
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{heading}</h2>
        )}
        {html && (
          <div
            className="text-gray-700 leading-relaxed [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-3 [&_p]:mb-4 [&_a]:text-blue-600 [&_ul]:list-disc [&_ul]:ml-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </section>
  )
}
```

### Step 9 — Create `components/cms/CtaBlock.tsx`

```tsx
import type { CtaBlock as CtaBlockType, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function CtaBlock({ content }: Props) {
  const b = content as CtaBlockType
  return (
    <section className="py-20 px-8 bg-blue-700 text-white">
      <div className="max-w-3xl mx-auto text-center">
        {b.heading    && <h2 className="text-3xl font-bold mb-4">{b.heading}</h2>}
        {b.text       && <p  className="text-lg mb-8 opacity-90">{b.text}</p>}
        {b.buttonText && b.buttonUrl && (
          <a href={b.buttonUrl} className="inline-block bg-white text-blue-700 font-semibold px-10 py-3 rounded-full hover:bg-blue-50 transition-colors">
            {b.buttonText}
          </a>
        )}
      </div>
    </section>
  )
}
```

### Step 10 — Create `components/cms/ImageBlock.tsx`

```tsx
import type { ImageBlock as ImageBlockType, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function ImageBlock({ content }: Props) {
  const b = content as ImageBlockType
  if (!b.image?.url) return null
  return (
    <section className="py-10 px-8">
      <div className="max-w-4xl mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.image.url} alt={b.altText ?? b.caption ?? ''} className="w-full rounded-2xl" />
        {b.caption && <p className="text-sm text-gray-500 mt-3 text-center">{b.caption}</p>}
      </div>
    </section>
  )
}
```

### Step 11 — Create `components/cms/CardGrid.tsx`

```tsx
import type { CardGridBlock, CardItem, ExpandedContentReference, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function CardGrid({ content }: Props) {
  const b     = content as CardGridBlock
  const cards = (b.cards ?? []).flatMap(
    (ref: ExpandedContentReference) => (ref.expandedValue as CardItem[] | undefined) ?? []
  )

  return (
    <section className="py-16 px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {b.heading && <h2 className="text-3xl font-bold text-center mb-10">{b.heading}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border p-6">
              {card.title       && <h3 className="text-xl font-semibold mb-2">{card.title}</h3>}
              {card.description && <p  className="text-gray-600 mb-4">{card.description}</p>}
              {card.linkUrl     && <a href={card.linkUrl} className="text-blue-600 font-medium hover:underline">Learn more →</a>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## Part 7 — Component Factory

The ComponentFactory is the **central map** that connects CMS content type names to React components. When CMS returns a `HeroBlock`, the factory renders `<Hero />`.

### Step 12 — Create `components/cms/ComponentFactory.tsx`

```tsx
import type { ComponentType }  from 'react'
import type { BaseContent }    from '@/lib/optimizely/types'

import Hero       from './Hero'
import RichText   from './RichText'
import CtaBlock   from './CtaBlock'
import CardGrid   from './CardGrid'
import ImageBlock from './ImageBlock'

interface Props { content: BaseContent }
type BlockComponent = ComponentType<Props>

// ─── ADD YOUR CMS BLOCK TYPES HERE ───
// Key = content type name from CMS, Value = React component
const COMPONENT_MAP: Record<string, BlockComponent> = {
  'HeroBlock':          Hero,
  'Hero Block':         Hero,
  'RichTextBlock':      RichText,
  'RichTextElement':    RichText,
  'Rich Text Element':  RichText,
  'PoorTextElement':    RichText,
  'Poor Text Element':  RichText,
  'TextElement':        RichText,
  'ParagraphElement':   RichText,
  'Heading':            RichText,
  'HeadingElement':     RichText,
  'CtaBlock':           CtaBlock,
  'Contact Block':      CtaBlock,
  'CardGridBlock':      CardGrid,
  'Services Block':     CardGrid,
  'ImageBlock':         ImageBlock,
  'Image':              ImageBlock,
}

// Finds the most specific type name from the contentType array
function resolveType(contentType: string[] | undefined): string | undefined {
  if (!contentType?.length) return undefined
  return [...contentType].reverse().find(t =>
    !['Block', 'Page', 'Content', 'Media', 'Element'].includes(t)
  )
}

export default function ComponentFactory({ content }: Props) {
  if (!content) return null

  const typeName  = resolveType(content.contentType)
  const Component = typeName ? COMPONENT_MAP[typeName] : undefined

  // In development, show a warning for unmapped blocks instead of crashing
  if (!Component) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="border-2 border-dashed border-amber-400 bg-amber-50 rounded-xl p-5 m-4 text-sm text-amber-800">
          <strong>Unmapped block:</strong> <code>{typeName}</code> — {content.name}
          <br />
          <span className="text-xs">Add it to COMPONENT_MAP in ComponentFactory.tsx</span>
        </div>
      )
    }
    return null
  }

  return <Component content={content} />
}
```

> **Key concept:** Every time CMS has a new block type, you add one line to `COMPONENT_MAP` and create the React component. That's it.

---

## Part 8 — CMS Page Renderer

This handles converting a CMS page response into rendered React components.

### Step 13 — Create `components/cms/CmsPage.tsx`

```tsx
import type { AnyContent, StandardPage, ExperiencePage, CompositionNode, BaseContent, ExpandedContentReference } from '@/lib/optimizely/types'
import ComponentFactory from './ComponentFactory'

interface Props { content: AnyContent; isDraft?: boolean }

// Recursively renders the Visual Builder composition tree
function RenderNode({ node }: { node: CompositionNode }) {
  if (!node) return null
  if (node.nodeType === 'component' && node.component) {
    return <ComponentFactory content={node.component as BaseContent} />
  }
  if (!node.nodes?.length) return null
  const children = node.nodes.map((child, i) => <RenderNode key={child.key ?? i} node={child} />)
  switch (node.nodeType) {
    case 'section': return <section className="w-full">{children}</section>
    case 'row':     return <div className="flex flex-wrap gap-4">{children}</div>
    case 'column':  return <div className="flex-1 min-w-0">{children}</div>
    default:        return <>{children}</>
  }
}

export default function CmsPage({ content }: Props) {
  const id = content.contentLink?.id

  // Visual Builder / Experience page
  if ('composition' in content && content.composition) {
    return (
      <main data-content-link={id}>
        <RenderNode node={(content as ExperiencePage).composition!} />
      </main>
    )
  }

  // Traditional page with ContentArea
  if ('mainContentArea' in content) {
    const page  = content as StandardPage
    const items = page.mainContentArea ?? []
    return (
      <main data-content-link={id}>
        {items.map((ref: ExpandedContentReference, i: number) =>
          (ref.expandedValue ?? []).map((block: BaseContent, j: number) => (
            <ComponentFactory key={`${i}-${j}`} content={block} />
          ))
        )}
      </main>
    )
  }

  // Fallback
  return (
    <main className="py-20 text-center" data-content-link={id}>
      <p className="text-gray-400 text-sm">No content found for type: {content.contentType?.join('/')}</p>
    </main>
  )
}
```

---

## Part 9 — Layout (Header + Footer)

### Step 14 — Create `components/layout/Header.tsx`

```tsx
import Link from 'next/link'

const NAV = [
  { href: '/',         label: 'Home'     },
  { href: '/about',    label: 'About'    },
  { href: '/services', label: 'Services' },
  { href: '/blog',     label: 'Blog'     },
]

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">DemoSite</Link>
        <nav className="flex items-center gap-6">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
```

### Step 15 — Create `components/layout/Footer.tsx`

```tsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-8 mt-auto">
      <div className="max-w-6xl mx-auto text-center text-sm">
        <p>© {new Date().getFullYear()} DemoSite — powered by Optimizely CMS + Next.js</p>
      </div>
    </footer>
  )
}
```

---

## Part 10 — Visual Builder Bridge

This is a client component that listens for messages from Optimizely CMS (when an editor makes a change) and refreshes the Next.js page automatically — giving instant preview.

### Step 16 — Create `components/VisualBuilderBridge.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VisualBuilderBridge() {
  const router = useRouter()

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Only trust messages from Optimizely CMS domain
      if (!/optimizely\.com$/i.test(event.origin)) return
      const type = event.data?.type ?? event.data?.action ?? ''
      if (['contentSaved', 'previewUpdated', 'block:save', 'content:update'].includes(type)) {
        router.refresh()  // re-fetches server data without full page reload
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [router])

  return null  // renders nothing — just listens
}
```

### Step 17 — Create `components/DraftBanner.tsx`

This yellow banner shows when an editor is viewing unpublished draft content.

```tsx
import Link from 'next/link'

export default function DraftBanner() {
  return (
    <div className="bg-amber-400 text-amber-900 px-6 py-2 flex items-center justify-between text-sm font-medium sticky top-16 z-40">
      <span>✏️ <strong>Preview Mode</strong> — viewing draft content</span>
      <Link href="/api/exit-preview" className="ml-4 text-xs underline hover:text-amber-700">
        Exit preview
      </Link>
    </div>
  )
}
```

---

## Part 11 — App Layout & Pages

### Step 18 — Update `app/layout.tsx`

Replace the entire file content:

```tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header              from '@/components/layout/Header'
import Footer              from '@/components/layout/Footer'
import VisualBuilderBridge from '@/components/VisualBuilderBridge'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title:       'DemoSite — Optimizely CMS + Next.js',
  description: 'Demo marketing website powered by Optimizely CMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <VisualBuilderBridge />   {/* listens for CMS editor messages */}
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
```

### Step 19 — Create `app/_components/CmsRoutePage.tsx`

This is the shared logic used by all CMS-driven page routes:

```tsx
import { draftMode } from 'next/headers'
import { notFound }  from 'next/navigation'
import type { Metadata } from 'next'

import { getPageByUrl, getContentById } from '@/lib/optimizely/client'
import type { StandardPage, ExperiencePage } from '@/lib/optimizely/types'
import CmsPage     from '@/components/cms/CmsPage'
import DraftBanner from '@/components/DraftBanner'

const SITE_BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export function buildSiteUrl(slug?: string[]): string {
  if (!slug || slug.length === 0) return `${SITE_BASE}/`
  const cleanSlug = slug.filter(s => s !== 'en')  // remove CMS language prefix
  return `${SITE_BASE}/${cleanSlug.join('/')}`
}

export async function generateCmsMetadata(slug?: string[]): Promise<Metadata> {
  const { isEnabled } = await draftMode()
  const url  = buildSiteUrl(slug)
  const page = await getPageByUrl(url, isEnabled) as (StandardPage & ExperiencePage) | null
  if (!page) return { title: 'Not Found' }
  return {
    title:       page.title ?? page.name,
    description: page.metaDescription ?? '',
  }
}

export default async function CmsRoutePage({ slug }: { slug?: string[] }) {
  const { isEnabled: isDraft } = await draftMode()
  const url = buildSiteUrl(slug)
  let page = await getPageByUrl(url, isDraft)

  // Fallback: fetch by ID if URL lookup fails (useful when hostname changes)
  if (!page && (!slug || slug.length === 0)) {
    const startId = process.env.OPTIMIZELY_START_PAGE_ID
    if (startId) page = await getContentById(startId, isDraft)
  }

  if (!page) notFound()

  return (
    <>
      {isDraft && <DraftBanner />}
      <CmsPage content={page!} isDraft={isDraft} />
    </>
  )
}
```

### Step 20 — Update `app/page.tsx` (Homepage)

Replace the entire file:

```tsx
import type { Metadata } from 'next'
import CmsRoutePage, { generateCmsMetadata } from './_components/CmsRoutePage'

export const dynamic = 'force-dynamic'  // always server-render, never cache at build time

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata()
}

export default function HomePage() {
  return <CmsRoutePage />
}
```

### Step 21 — Create `app/[...slug]/page.tsx` (All other pages)

```tsx
import type { Metadata } from 'next'
import CmsRoutePage, { generateCmsMetadata } from '../_components/CmsRoutePage'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return generateCmsMetadata(slug)
}

export default async function CmsSlugPage({ params }: Props) {
  const { slug } = await params
  return <CmsRoutePage slug={slug} />
}
```

---

## Part 12 — API Routes

### Step 22 — Create `app/api/preview/route.ts`

This endpoint enables Draft Mode so editors can see unpublished content:

```typescript
import { draftMode } from 'next/headers'
import { redirect }  from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getContentById } from '@/lib/optimizely/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const key   = searchParams.get('key')
  const ver   = searchParams.get('ver')
  const path  = searchParams.get('path')

  // Reject requests with wrong token
  if (token !== process.env.OPTIMIZELY_PREVIEW_SECRET) {
    return new Response('Invalid preview token', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()  // sets a cookie on the browser

  if (path) redirect(path)

  if (key) {
    const ref     = ver ? `${key}_${ver}` : key
    const content = await getContentById(ref, true)
    if (content?.url) {
      try {
        redirect(new URL(content.url).pathname)
      } catch {
        redirect(content.url)
      }
    }
  }

  redirect('/')
}
```

### Step 23 — Create `app/api/exit-preview/route.ts`

```typescript
import { draftMode } from 'next/headers'
import { redirect }  from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const returnPath = searchParams.get('path') ?? '/'
  const draft = await draftMode()
  draft.disable()
  redirect(returnPath)
}
```

### Step 24 — Create `app/api/revalidate/route.ts`

This endpoint is called by CMS when content is published. It clears the Next.js cache so the live site shows fresh content — **without redeploying**.

```typescript
import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'

const SECRET = process.env.OPTIMIZELY_REVALIDATE_SECRET

function unauthorized() {
  return Response.json({ error: 'Invalid token' }, { status: 401 })
}

// Called by CMS Webhook on publish event
export async function POST(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token')
  if (token !== SECRET) return unauthorized()

  const body = await request.json().catch(() => ({})) as { path?: string }
  if (body.path) {
    revalidatePath(body.path)     // revalidate specific page
  } else {
    revalidatePath('/', 'layout') // revalidate all pages
  }
  return Response.json({ revalidated: true, at: new Date().toISOString() })
}

// Allow manual testing via GET request in browser
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('token') !== SECRET) return unauthorized()
  const path = searchParams.get('path')
  path ? revalidatePath(path) : revalidatePath('/', 'layout')
  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
```

---

## Part 13 — next.config.ts

Update `next.config.ts` to allow CMS images and allow Optimizely to embed your site in an iframe:

```typescript
import type { NextConfig } from 'next'
import path from 'path'

const CMS_HOSTNAME = 'YOUR-INSTANCE.cms.optimizely.com'  // ← change this

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),  // prevents workspace root detection issues
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: CMS_HOSTNAME },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [{
        key:   'Content-Security-Policy',
        // This allows Optimizely CMS to embed your site in an iframe
        value: `frame-ancestors 'self' https://${CMS_HOSTNAME}`,
      }],
    }]
  },
}

export default nextConfig
```

---

## Part 14 — Deploy to Vercel

You need a public HTTPS URL so Optimizely CMS can reach your site for preview.

### Step 25 — Push to GitHub

1. Create a new repository at [github.com](https://github.com) → name it `cms-demo`
2. Run in terminal:

```bash
git add .
git commit -m "initial CMS setup"
git remote add origin https://github.com/YOUR_USERNAME/cms-demo.git
git push -u origin main
```

> If your branch is `master` not `main`, use `git push -u origin master`

### Step 26 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → login
2. Click **Add New Project** → Import your GitHub repo
3. **Before clicking Deploy**, click **Environment Variables** and add:

| Key | Value |
|---|---|
| `OPTIMIZELY_CMS_URL` | `https://YOUR-INSTANCE.cms.optimizely.com` |
| `OPTIMIZELY_CMS_CLIENT_ID` | your client ID |
| `OPTIMIZELY_CMS_CLIENT_SECRET` | your client secret |
| `OPTIMIZELY_PREVIEW_SECRET` | `my-preview-secret-2026` |
| `OPTIMIZELY_REVALIDATE_SECRET` | `my-revalidate-secret-2026` |
| `NEXT_PUBLIC_CMS_URL` | `https://YOUR-INSTANCE.cms.optimizely.com` |
| `NEXT_PUBLIC_SITE_URL` | ← leave blank for now |

4. Click **Deploy**
5. After deployment, copy your URL: `https://cms-demo-xxxx.vercel.app`
6. Go back to **Settings → Environment Variables** → update `NEXT_PUBLIC_SITE_URL` to your Vercel URL
7. Go to **Deployments → top deployment → ⋯ → Redeploy**

---

## Part 15 — Configure Optimizely CMS

### Step 27 — Register your site hostname

1. Log in to Optimizely CMS
2. Go to **Settings → Applications → (your app)**
3. Click **Hostnames → Add Hostname**:
   - Hostname: `cms-demo-xxxx.vercel.app`
   - Type: `Primary`
   - Protocol: `HTTPS`
4. Save

### Step 28 — Register Live Preview URL

In the same application settings, find **Live Preview**:

```
{host}/api/preview?token=my-preview-secret-2026&key={key}&ver={version}&loc={locale}
```

Save.

### Step 29 — Register Webhook (for publish → live update)

1. Go to **Settings → Webhooks → Create**
2. Fill in:
   - **URL:** `https://cms-demo-xxxx.vercel.app/api/revalidate?token=my-revalidate-secret-2026`
   - **Event:** Content Published
   - **Method:** POST
3. Save

---

## Part 16 — Create Content in CMS

### Step 30 — Create your Home page

1. In CMS, click the **Pages icon** (left sidebar)
2. Click **+** → **Blank Experience** → Name: `Home` → Create
3. In **Properties**, find **Simple Address** → set to `/`
4. Click **Add Section** → **Add Row** → **Add Column**
5. Click `+` inside the column → select a block (e.g. **Rich Text Element**)
6. Type some content
7. Click **Options → Publish**

### Step 31 — Verify the live site

Open `https://cms-demo-xxxx.vercel.app` in your browser. You should see your content rendered on the Next.js site.

### Step 32 — Add more pages

Repeat Step 30 for:
- About → Simple Address `/about`
- Services → Simple Address `/services`
- Blog → Simple Address `/blog`

---

## How the Preview Flow Works

```
Editor opens page in CMS
    ↓
CMS calls /api/preview?token=SECRET&key=PAGE_KEY
    ↓
Next.js enables Draft Mode (sets a cookie)
    ↓
Page renders with draft content visible
    ↓
Editor makes changes → CMS sends postMessage to iframe
    ↓
VisualBuilderBridge.tsx receives message → calls router.refresh()
    ↓
Page re-renders with latest draft content (no full reload)
```

## How the Publish Flow Works

```
Editor clicks Publish in CMS
    ↓
CMS saves content as published
    ↓
CMS Webhook fires → POST /api/revalidate?token=SECRET
    ↓
Next.js clears cached pages (revalidatePath)
    ↓
Next visitor to the site gets fresh content from CMS
    ↓
Live site updated — no redeploy needed
```

---

## Adding New Block Types (Quick Reference)

When CMS has a new block type, do 3 things:

**1. Create the component** `components/cms/MyNewBlock.tsx`:
```tsx
import type { BaseContent } from '@/lib/optimizely/types'
export default function MyNewBlock({ content }: { content: BaseContent }) {
  return <div>{content.name}</div>
}
```

**2. Register it in `ComponentFactory.tsx`**:
```tsx
import MyNewBlock from './MyNewBlock'
const COMPONENT_MAP = {
  ...
  'MyNewBlock': MyNewBlock,
}
```

**3. Add fields to `types.ts`** if needed.

That's it. No other files need to change.

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| 404 on homepage | CMS page URL doesn't match `NEXT_PUBLIC_SITE_URL` | Add `OPTIMIZELY_START_PAGE_ID` env var with the page ID from CMS URL bar |
| Token error | Wrong Client ID or Secret | Check CMS → Settings → API Clients |
| Preview not loading | Wrong preview URL format | Check Live Preview URL includes all `{host}`, `{key}`, `{ver}` placeholders |
| Changes not reflecting | Webhook not set up | Register webhook in CMS → Settings → Webhooks |
| Site not loading in CMS iframe | Missing Content-Security-Policy header | Check `next.config.ts` has `frame-ancestors` set to CMS hostname |
| Unmapped block warning | Block type not in ComponentFactory | Add it to `COMPONENT_MAP` |

---

*Built with Next.js 16 + Optimizely SaaS CMS*
