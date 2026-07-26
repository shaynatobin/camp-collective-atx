import Link from 'next/link'
import Image from 'next/image'
import CategoryBadge from './CategoryBadge'
import { getInitials, getCategoryGradient } from '../lib/utils'

export default function CampCard({ camp }) {
  const gradient = getCategoryGradient(camp.category)

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Photo or gradient placeholder */}
      <div className="relative w-full h-44 flex-shrink-0">
        {camp.photo ? (
          <Image
            src={camp.photo}
            alt={camp.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.classList.add(`bg-gradient-to-br`, ...gradient.split(' '))
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-white text-3xl font-display font-bold opacity-80">
              {getInitials(camp.name)}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <CategoryBadge category={camp.category} />
        </div>

        <h3 className="font-display font-semibold text-brand-navy text-lg leading-snug mb-1 line-clamp-2">
          {camp.name}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {camp.city && <span>📍 {camp.city}, TX</span>}
          {camp.priceRange && (
            <>
              <span>·</span>
              <span>{camp.priceRange}</span>
            </>
          )}
        </div>

        {camp.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
            {camp.description}
          </p>
        )}

        {/* Card footer */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/camps/${camp.slug}`}
            className="flex-1 text-center text-sm font-medium text-brand-terracotta border border-brand-terracotta rounded-lg py-1.5 hover:bg-brand-terracotta hover:text-white transition-colors duration-150"
          >
            View Details
          </Link>
          {camp.url && (
            <a
              href={camp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-medium bg-brand-terracotta text-white rounded-lg py-1.5 hover:bg-opacity-90 transition-colors duration-150"
            >
              Visit Site →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
