'use client'
import { Star } from 'lucide-react'

interface RatingBadgeProps {
  average: number
  count: number
}

export default function RatingBadge({ average, count }: RatingBadgeProps) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-1 mt-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3 h-3 ${s <= Math.round(average) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <span className="text-[10px] font-semibold text-amber-600">{average.toFixed(1)}</span>
      <span className="text-[10px] text-brand-slate">({count})</span>
    </div>
  )
}
