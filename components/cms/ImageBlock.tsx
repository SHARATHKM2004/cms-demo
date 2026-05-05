import type { ImageBlock as ImageBlockType, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function ImageBlock({ content }: Props) {
  const b   = content as ImageBlockType
  const url = b.image?.url
  if (!url) return null

  return (
    <section className="py-10 px-8">
      <div className="max-w-4xl mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={b.altText ?? b.caption ?? b.name ?? ''}
          className="w-full rounded-2xl object-cover"
        />
        {b.caption && (
          <p className="text-sm text-gray-500 mt-3 text-center">{b.caption}</p>
        )}
      </div>
    </section>
  )
}
