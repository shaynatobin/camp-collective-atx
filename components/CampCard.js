import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import CategoryBadge from './CategoryBadge'
import { useShortlist } from '../lib/ShortlistContext'
import { usePlanner } from '../lib/PlannerContext'
import { getInitials, getCategoryGradient } from '../lib/utils'

export default function CampCard({ camp }) {
  const gradient = getCategoryGradient(camp.category)
  const [imgFailed, setImgFailed] = useState(false)
  const router = useRouter()
  const { toggle, isInShortlist } = useShortlist()
  const { openAddModal } = usePlanner()
  const saved = isInShortlist(camp.id)

  return (
    <div
      onClick={() => router.push(`/camps/${camp.slug}`)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full cursor-pointer group"
    >
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
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); toggle(camp) }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors duration-150 ${
              saved ? 'bg-brand-coral text-white' : 'bg-white text-gray-400 hover:text-brand-coral'
            }`}
            title={saved ? 'Remove from shortlist' : 'Save to shortlist'}
          >
            {saved ? '♥' : '♡'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openAddModal(camp) }}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow text-gray-400 hover:text-brand-forest transition-colors duration-150 text-sm"
            title="Add to Summer Planner"
          >
            📅
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <CategoryBadge category={camp.category} />
        </div>

        <h3 className="font-display font-semibold text-brand-ink text-lg leading-snug mb-1 line-clamp-2">
          {camp.name}
        </h3>

        <div className="flex items-center gap-2 text-sm text-brand-ink-soft mb-2">
          {camp.city && <span>📍 {camp.city}, TX</span>}
          {camp.priceRange && (
            <>
              <span>·</span>
              <span>{camp.priceRange}</span>
            </>
          )}
        </div>

        {camp.description && (
          <p className="text-sm text-brand-ink-soft line-clamp-2 mb-4 flex-grow">
            {camp.description}
          </p>
        )}

        {/* Card footer */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/camps/${camp.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-center text-sm font-medium text-brand-coral border border-brand-coral rounded-[10px] py-1.5 hover:bg-brand-coral hover:text-white transition-colors duration-150"
          >
            View Details
          </Link>
          {camp.url && (
            <a
              href={camp.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-center text-sm font-medium bg-brand-coral text-white rounded-[10px] py-1.5 hover:bg-brand-coral-dark transition-colors duration-150"
            >
              Visit Site →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
