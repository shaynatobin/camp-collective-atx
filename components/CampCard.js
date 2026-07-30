import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CategoryBadge from './CategoryBadge'
import { getInitials, getCategoryGradient } from '../lib/utils'

function CampImage({ camp, gradient }) {
  const url = camp.photo.toLowerCase()
  const urlSuggestsLogo =
    url.endsWith('.svg') || url.endsWith('.gif') ||
    url.includes('logo') || url.includes('icon') || url.includes('badge')

  const [isLogo, setIsLogo] = useState(urlSuggestsLogo)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-white text-3xl font-display font-bold opacity-80">
          {getInitials(camp.name)}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${isLogo ? 'bg-brand-cream' : ''}`}>
      {isLogo ? (
        <Image
          src={camp.photo}
          alt={camp.name}
          width={280}
          height={160}
          className="absolute inset-0 m-auto object-contain max-h-32 w-auto"
          onError={() => setFailed(true)}
        />
      ) : (
        <Image
          src={camp.photo}
          alt={camp.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={(e) => {
            const img = e.currentTarget
            const ratio = img.naturalWidth / img.naturalHeight
            // Wide wordmarks, small images, or very tall narrow logos
            if (ratio > 2.2 || ratio < 0.4 || img.naturalWidth < 400) {
              setIsLogo(true)
            }
          }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

export default function CampCard({ camp }) {
  const gradient = getCategoryGradient(camp.category)

  return (
    <Link href={`/camps/${camp.slug}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full cursor-pointer">
        {/* Photo or gradient placeholder */}
        <div className="relative w-full h-44 flex-shrink-0">
          {camp.photo ? (
            <CampImage camp={camp} gradient={gradient} />
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
          {camp.url && (
            <div className="mt-auto pt-2">
              <a
                href={camp.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="block w-full text-center text-sm font-medium bg-brand-coral text-white rounded-[10px] py-1.5 hover:bg-brand-coral-dark transition-colors duration-150"
              >
                Visit Site →
              </a>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
