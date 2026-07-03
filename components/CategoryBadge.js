import { CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/utils'

export default function CategoryBadge({ category, size = 'sm' }) {
  if (!category) return null
  const colorClass = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'
  const label = CATEGORY_LABELS[category] || category
  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass}`}>
      {label}
    </span>
  )
}
