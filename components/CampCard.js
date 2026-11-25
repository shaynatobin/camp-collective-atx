import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CategoryBadge from './CategoryBadge'
import { useShortlist } from '../lib/ShortlistContext'
import { usePlanner } from '../lib/PlannerContext'
import { getInitials, getCategoryGradient, formatAges, formatWeeklyPrice } from '../lib/utils'
import { seasonNote } from '../lib/season'
import { StarDisplay } from './StarRating'
import { outboundUrl, trackCampVisit } from '../lib/outbound'

export default function CampCard({ camp }) {
  const gradient = getCategoryGradient(camp.category)
  const [imgFailed, setImgFailed] = useState(false)
  const { toggle, isInShortlist } = useShortlist()
  const { openAddModal } = usePlanner()
  const saved = isInShortlist(camp.id)
  const ages = formatAges(camp)
  const price = formatWeeklyPrice(camp) || camp.priceRange
  const note = seasonNote(camp)
  const metaParts = [camp.city ? `📍 ${camp.city}, TX` : null, ages, price].filter(Boolean)

  return (
    <article className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full group">
      {/* Image area */}
      <div className="relative w-full h-44 flex-shrink-0 bg-brand-cream">
        {camp.photo && !imgFailed ? (
          <Image
            src={camp.photo}
            alt={camp.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-white text-3xl font-display font-bold opacity-80">
              {getInitials(camp.name)}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1.5">
          <button
            onClick={() => toggle(camp)}
            className={`h-8 px-2.5 rounded-full flex items-center gap-1 shadow text-xs font-medium transition-colors duration-150 ${
              saved ? 'bg-brand-coral text-white' : 'bg-white text-brand-ink-soft hover:text-brand-coral'
            }`}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${camp.name} from your saved camps` : `Save ${camp.name} to compare later`}
            title={saved ? 'Remove from saved camps' : 'Save to compare later'}
          >
            <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => openAddModal(camp)}
            className="h-8 px-2.5 rounded-full bg-white flex items-center gap-1 shadow text-xs font-medium text-brand-ink-soft hover:text-brand-forest transition-colors duration-150"
            aria-label={`Add ${camp.name} to a week in your summer planner`}
            title="Add to a week in your summer planner"
          >
            <span aria-hidden="true">📅</span>
            Plan
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <CategoryBadge category={camp.category} />
        </div>

        <h3 className="font-display font-semibold text-brand-ink text-lg leading-snug mb-1 line-clamp-2">
          {/* The name is the card's link; its overlay makes the whole card clickable,
              and it still opens in a new tab and works with a keyboard. */}
          <Link
            href={`/camps/${camp.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline"
          >
            {camp.name}
          </Link>
        </h3>

        {camp.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-brand-ink-soft mb-1" aria-label={`Rated ${camp.rating} out of 5 from ${camp.reviewCount} parent review${camp.reviewCount !== 1 ? 's' : ''}`}>
            <StarDisplay rating={Math.round(camp.rating)} />
            <span>{camp.rating} ({camp.reviewCount})</span>
          </div>
        )}

        {metaParts.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-brand-ink-soft mb-2">
            {metaParts.map((part, i) => (
              <span key={i} className="flex items-center gap-x-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                <span>{part}</span>
              </span>
            ))}
          </div>
        )}

        {note && (
          <p className="text-xs text-amber-800 bg-amber-50 rounded-md px-2 py-1 mb-2 self-start">{note}</p>
        )}

        {camp.description && (
          <p className="text-sm text-brand-ink-soft line-clamp-2 mb-4 flex-grow">
            {camp.description}
          </p>
        )}

        {/* Card footer */}
        <div className="relative z-10 flex gap-2 mt-auto pt-2">
          <Link
            href={`/camps/${camp.slug}`}
            className="flex-1 text-center text-sm font-medium bg-brand-coral text-white rounded-[10px] py-1.5 hover:bg-brand-coral-dark transition-colors duration-150"
            tabIndex={-1}
            aria-hidden="true"
          >
            View Details
          </Link>
          {camp.url && (
            <a
              href={outboundUrl(camp.url)}
              target="_blank"
              rel="noopener"
              onClick={() => trackCampVisit(camp, 'card')}
              className="flex-1 text-center text-sm font-medium text-brand-coral border border-brand-coral rounded-[10px] py-1.5 hover:bg-brand-coral hover:text-white transition-colors duration-150"
              aria-label={`Visit ${camp.name}'s website (opens in a new tab)`}
            >
              Visit Site →
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
