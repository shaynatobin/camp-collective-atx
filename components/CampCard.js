import Link from 'next/link'
import Image from 'next/image'
import CategoryBadge from './CategoryBadge'
import { getInitials, getCategoryGradient } from '../lib/utils'

export default function CampCard({ camp }) {
  const gradient = getCategoryGradient(camp.category)

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Photo or gradient placeholder */}
      <div className="relative w-full h-44 flex-shrink-0">
        {camp.photo ? (() => {
          const url = camp.photo.toLowerCase()
          const isLogo = url.endsWith('.svg') || url.endsWith('.gif') ||
            url.includes('logo') || url.includes('icon') || url.includes('badge')
          return (
            <div className={`w-full h-full ${isLogo ? 'bg-white flex items-center justify-center p-4' : 'relative'}`}>
              <Image
                src={camp.photo}
                alt={camp.name}
                fill={!isLogo}
                width={isLogo ? 200 : undefined}
                height={isLogo ? 120 : undefined}
                className={isLogo ? 'object-contain max-h-28 w-auto' : 'object-cover'}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.closest('.relative, div')
                  if (parent) {
                    parent.className = `w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`
                    parent.innerHTML = `<span style="color:white;font-size:1.875rem;font-weight:700;opacity:0.8">${getInitials(camp.name)}</span>`
                  }
                }}
              />
            </div>
          )
        })() : (
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
            className="flex-1 text-center text-sm font-medium text-brand-coral border border-brand-coral rounded-[10px] py-1.5 hover:bg-brand-coral hover:text-white transition-colors duration-150"
          >
            View Details
          </Link>
          {camp.url && (
            <a
              href={camp.url}
              target="_blank"
              rel="noopener noreferrer"
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
