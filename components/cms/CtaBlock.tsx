import type { CtaBlock as CtaBlockType, BaseContent } from '@/lib/optimizely/types'

interface Props { content: BaseContent }

const VARIANT_STYLES: Record<string, { section: string; btn: string }> = {
  primary:   { section: 'bg-blue-700 text-white',   btn: 'bg-white text-blue-700 hover:bg-blue-50' },
  secondary: { section: 'bg-gray-100 text-gray-900', btn: 'bg-blue-600 text-white hover:bg-blue-700' },
  dark:      { section: 'bg-gray-900 text-white',   btn: 'bg-white text-gray-900 hover:bg-gray-100' },
}

export default function CtaBlock({ content }: Props) {
  const b       = content as CtaBlockType
  const styles  = VARIANT_STYLES[b.variant ?? 'primary'] ?? VARIANT_STYLES.primary

  return (
    <section className={`py-20 px-8 ${styles.section}`}>
      <div className="max-w-3xl mx-auto text-center">
        {b.heading && <h2 className="text-3xl font-bold mb-4">{b.heading}</h2>}
        {b.text    && <p  className="text-lg mb-8 opacity-90">{b.text}</p>}
        {b.buttonText && b.buttonUrl && (
          <a
            href={b.buttonUrl}
            className={`inline-block font-semibold px-10 py-3 rounded-full transition-colors ${styles.btn}`}
          >
            {b.buttonText}
          </a>
        )}
      </div>
    </section>
  )
}
