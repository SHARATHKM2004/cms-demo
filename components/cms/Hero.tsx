import type { HeroBlock, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

export default function Hero({ content }: Props) {
  const b = content as HeroBlock
  const bg = b.backgroundImage?.url

  return (
    <section
      className="relative w-full min-h-[520px] flex items-center justify-center text-white"
      style={{
        background: bg
          ? `linear-gradient(135deg,rgba(0,0,0,.65) 0%,rgba(0,0,0,.3) 100%),url(${bg}) center/cover no-repeat`
          : 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto px-8 text-center">
        {b.headline && (
          <h1 className="text-5xl font-bold mb-5 leading-tight">{b.headline}</h1>
        )}
        {b.subheadline && (
          <p className="text-xl mb-8 text-blue-100">{b.subheadline}</p>
        )}
        {b.ctaText && b.ctaUrl && (
          <a
            href={b.ctaUrl}
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
          >
            {b.ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
