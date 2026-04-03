'use client'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { LearningResource } from '@/lib/types'
import { learningTypeColor, levelClass, cn } from '@/lib/utils'

interface LearningHubProps {
  resources: LearningResource[]
}

const TYPE_ICONS: Record<string, string> = {
  video: '▶', course: '≡', book: '□', guide: '◈',
}

export default function LearningHub({ resources }: LearningHubProps) {
  return (
    <section className="bg-white border-t border-brand-border py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="section-header mb-1">
          <h2 className="section-title">AI learning hub</h2>
          <Link href="/learn-ai" className="text-xs text-brand-sky hover:underline">View all resources →</Link>
        </div>
        <p className="text-xs text-brand-slate mb-4">
          Courses, videos &amp; books for professionals — from complete beginners to advanced.
        </p>

        {/* Scrollable on mobile, grid on desktop */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible">
          {resources.map(r => {
            const typeColors = learningTypeColor(r.type)
            return (
              <div key={r.id}
                className="flex-none w-44 sm:w-auto scroll-snap-start border border-brand-border rounded-xl overflow-hidden hover:border-brand-sky transition-colors group bg-white">
                {/* Thumb */}
                <div className="w-full aspect-video flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: r.thumbnailBg }}>
                  {r.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover absolute inset-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span className="text-2xl opacity-40">{TYPE_ICONS[r.type]}</span>
                  )}
                  <span className={cn(
                    'absolute top-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize z-10',
                    typeColors.bg, typeColors.text
                  )}>
                    {r.type}
                  </span>
                </div>

                {/* Body */}
                <div className="p-2.5">
                  <p className="text-[11px] font-medium text-brand-navy line-clamp-2 leading-snug mb-1.5 group-hover:text-brand-sky transition-colors">
                    {r.title}
                  </p>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded capitalize', levelClass(r.level))}>
                      {r.level}
                    </span>
                    {r.duration && (
                      <span className="text-[10px] text-brand-muted">· {r.duration}</span>
                    )}
                  </div>
                  <a
                    href={r.affiliateUrl ?? r.url}
                    target={r.url.startsWith('http') ? '_blank' : undefined}
                    rel={`noopener noreferrer${r.isAffiliate ? ' sponsored' : ''}`}
                    className="flex items-center gap-1 text-[10px] text-brand-sky hover:underline font-medium"
                  >
                    {r.isFree ? 'Free' : r.isAffiliate ? 'Affiliate link' : 'Visit'}
                    {' · '}{r.platform}
                    <ExternalLink size={9} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
