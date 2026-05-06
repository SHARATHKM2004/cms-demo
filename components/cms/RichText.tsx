import type { RichTextBlock, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function RichText({ content }: Props) {
  const b       = content as RichTextBlock & { headingText?: string }
  const html    = b.body
  const heading = String(b.headingText ?? b.headline ?? '') || undefined

  if (!html && !heading) return null

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {heading && !html && (
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
            {heading}
          </h2>
        )}
        {html && (
          <div
            className="cms-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </section>
  )
}

