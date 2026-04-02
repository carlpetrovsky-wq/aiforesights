'use client'
import Link from 'next/link'
import RatingBadge from '@/components/article/RatingBadge'
import { ExternalLink } from 'lucide-react'
import { Article } from '@/lib/types'
import { timeAgo, cn } from '@/lib/utils'

const CATEGORY_FALLBACKS: Record<string, string> = {
  'latest-news':   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  'future-of-ai':  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  'best-ai-tools': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  'make-money':    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
  'learn-ai':      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
}

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
  ratingAverage?: number
  ratingCount?: number
}

const SOURCE_DOT_COLORS: Record<string, string> = {
  '#0EA5E9': 'bg-blue-400',
  '#8B5CF6': 'bg-purple-400',
  '#10B981': 'bg-emerald-400',
  '#F59E0B': 'bg-amber-400',
  '#EF4444': 'bg-red-400',
  '#F97316': 'bg-orange-400',
}

export default function ArticleCard({ article, variant = 'default', ratingAverage, ratingCount, showBadge }: ArticleCardProps & { showBadge?: boolean }) {
  const ago = timeAgo(article.publishedAt)
  const dotBg = article.sourceColor ? (SOURCE_DOT_COLORS[article.sourceColor] ?? 'bg-blue-400') : 'bg-blue-400'

  // For our own content (AI Foresights), always use internal article page
  // For external sources, link to their sourceUrl
  const isOwnContent = article.sourceName === 'AI Foresights' || article.sourceUrl?.includes('aiforesights.com')
  const articleHref = (!isOwnContent && article.sourceUrl) ? article.sourceUrl : `/article/${article.slug}`
  const isExternal = !isOwnContent && !!article.sourceUrl
  const linkProps = isExternal
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {}

  if (variant === 'compact') {
    return (
      <Link href={articleHref} {...linkProps} className="group block">
        <div className="flex items-start gap-3 py-3 border-b border-brand-border last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
          <div className="w-14 h-10 rounded-md shrink-0 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-blue-200" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-sky transition-colors">
              {article.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotBg)} />
              <span className="text-[11px] font-medium text-brand-slate">{article.sourceName}</span>
              <span className="text-[11px] text-brand-muted">· {ago}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="news-card group">
      {/* Image */}
      <Link href={articleHref} {...linkProps} className="block">
        <div className={cn(
          'w-full overflow-hidden bg-gradient-to-br',
          variant === 'featured' ? 'aspect-[4/3]' : 'aspect-video',
          'from-slate-100 to-slate-200 relative flex items-center justify-center'
        )}>
          {/* Use article thumbnail, or category fallback for featured, or colored dot for compact */}
          {(article.thumbnailUrl || (variant === 'featured') || true) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.thumbnailUrl || CATEGORY_FALLBACKS[article.category] || CATEGORY_FALLBACKS['latest-news']}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // If image fails to load, swap to category fallback, then hide
                const target = e.currentTarget
                const fallback = CATEGORY_FALLBACKS[article.category] || CATEGORY_FALLBACKS['latest-news']
                if (target.src !== fallback) {
                  target.src = fallback
                } else {
                  target.style.display = 'none'
                }
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center">
              <div className={cn('w-5 h-5 rounded-full', dotBg)} />
            </div>
          )}
          {(article.isFeatured || showBadge) && (
            <span className="absolute top-2.5 left-2.5 bg-brand-sky text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              Featured
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-3">
        {/* Source line */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className={cn('w-2 h-2 rounded-full shrink-0', dotBg)} />
          <span className="text-[11px] font-medium text-brand-slate">{article.sourceName}</span>
          <span className="text-[11px] text-brand-muted">· {ago}</span>
        </div>

        {/* Title */}
        <Link href={articleHref} {...linkProps}>
          <h3 className={cn(
            'font-semibold text-brand-navy leading-snug group-hover:text-brand-sky transition-colors mb-1 line-clamp-2',
            variant === 'featured' ? 'text-base' : 'text-[13px]'
          )}>
            {article.title}
          </h3>
          {ratingAverage !== undefined && ratingCount !== undefined && ratingCount > 0 && (
            <RatingBadge average={ratingAverage} count={ratingCount} />
          )}
        </Link>

        {/* Excerpt — featured only */}
        {variant === 'featured' && article.excerpt && (
          <p className="text-[12px] text-brand-slate leading-relaxed line-clamp-2 mb-2">
            {article.excerpt}
          </p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {article.tags.slice(0, 2).map(tag => (
              <span key={tag} className="cat-pill">{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-brand-border">
          <span className="cat-pill">{article.category.replace('-', ' ')}</span>
          <div className="flex items-center gap-2.5">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-brand-muted hover:text-brand-sky transition-colors"
            >
              <ExternalLink size={12} />
            </a>

          </div>
        </div>
      </div>
    </div>
  )
}
