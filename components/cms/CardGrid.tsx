import type {
  CardGridBlock,
  CardItem,
  ExpandedContentReference,
  BaseContent,
} from '@/lib/optimizely/types'

interface Props { content: BaseContent }

function Card({ card }: { card: CardItem }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
      {card.image?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image.url}
          alt={card.title ?? ''}
          className="w-full h-44 object-cover rounded-xl mb-4"
        />
      )}
      {card.title && (
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{card.title}</h3>
      )}
      {card.description && (
        <p className="text-gray-600 mb-4 flex-1">{card.description}</p>
      )}
      {card.linkUrl && (
        <a href={card.linkUrl} className="text-blue-600 font-medium hover:underline mt-auto">
          Learn more →
        </a>
      )}
    </div>
  )
}

export default function CardGrid({ content }: Props) {
  const b     = content as CardGridBlock
  const refs  = b.cards ?? []

  // When expand=* is used, cards are inlined in expandedValue
  const cards = refs.flatMap(
    (ref: ExpandedContentReference) => (ref.expandedValue as CardItem[] | undefined) ?? [],
  )

  return (
    <section className="py-16 px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {b.heading && (
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">{b.heading}</h2>
        )}
        {cards.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No cards found — add CardItem blocks to this CardGridBlock in CMS.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <Card key={card.contentLink?.id ?? i} card={card} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
