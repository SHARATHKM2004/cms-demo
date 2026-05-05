import type { RichTextBlock, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function RichText({ content }: Props) {
  const b = content as RichTextBlock & { headingText?: string }
  // Support body (classic), headingText (Content Graph HeadingElement), or name fallback
  const html    = b.body
  const heading = b.headingText ?? b.headline

  if (!html && !heading) return null

  return (
    <section className="py-14 px-8">
      <div className="max-w-3xl mx-auto">
        {heading && !html && (
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{heading}</h2>
        )}
        {html && (
          <div
            className="
              text-gray-700 leading-relaxed
              [&_h1]:text-4xl [&_h1]:font-bold  [&_h1]:mb-4  [&_h1]:text-gray-900
              [&_h2]:text-3xl [&_h2]:font-bold  [&_h2]:mb-3  [&_h2]:text-gray-900
              [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-gray-900
              [&_p]:mb-4
              [&_ul]:list-disc   [&_ul]:ml-6 [&_ul]:mb-4
              [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
              [&_a]:text-blue-600 [&_a]:underline
              [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
              [&_img]:rounded-xl [&_img]:my-4
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </section>
  )
}
