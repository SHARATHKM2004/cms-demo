import type { RichTextBlock, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function RichText({ content }: Props) {
  const b   = content as RichTextBlock
  const html = b.body ?? ''

  return (
    <section className="py-14 px-8">
      <div className="max-w-3xl mx-auto">
        {/* Basic prose styling without a plugin dependency */}
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
      </div>
    </section>
  )
}
