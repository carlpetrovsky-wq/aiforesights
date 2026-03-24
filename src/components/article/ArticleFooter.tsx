'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Star, ArrowUp, BookOpen } from 'lucide-react'

interface RelatedArticle {
  slug: string
  title: string
  thumbnail_url?: string
  category_slug: string
}

interface ArticleFooterProps {
  articleSlug: string
  category: string
  relatedArticles: RelatedArticle[]
  isOwnContent: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  'make-money': 'Make Money with AI',
  'latest-news': 'Latest News',
  'future-of-ai': 'Future of AI',
  'best-ai-tools': 'Best AI Tools',
  'learn-ai': 'Learn AI',
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  'latest-news':   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=70',
  'future-of-ai':  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=70',
  'best-ai-tools': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=70',
  'make-money':    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=70',
  'learn-ai':      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=70',
}

// Generate or retrieve a stable anonymous session ID
function getSessionId(): string {
  try {
    let id = localStorage.getItem('aif_session_id')
    if (!id) {
      id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem('aif_session_id', id)
    }
    return id
  } catch {
    return 'sess_' + Math.random().toString(36).slice(2)
  }
}

function StarDisplay({ average, count, size = 'sm' }: { average: number; count: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => {
          const fill = average >= s ? 1 : average >= s - 0.5 ? 0.5 : 0
          return (
            <div key={s} className="relative">
              <Star className={`${starSize} text-gray-200`} />
              {fill > 0 && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: fill === 0.5 ? '50%' : '100%' }}>
                  <Star className={`${starSize} fill-amber-400 text-amber-400`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <span className="text-xs font-semibold text-brand-navy">{average.toFixed(1)}</span>
      <span className="text-xs text-brand-slate">({count.toLocaleString()} {count === 1 ? 'rating' : 'ratings'})</span>
    </div>
  )
}

export { StarDisplay }

export default function ArticleFooter({ articleSlug, category, relatedArticles, isOwnContent }: ArticleFooterProps) {
  const [userRating, setUserRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [aggregate, setAggregate] = useState<{ average: number; count: number } | null>(null)
  const [showBackTop, setShowBackTop] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load aggregate from API
  const fetchAggregate = useCallback(async () => {
    try {
      const res = await fetch(`/api/ratings?slug=${articleSlug}`)
      const data = await res.json()
      if (data.count > 0) setAggregate(data)
    } catch {}
  }, [articleSlug])

  useEffect(() => {
    fetchAggregate()
    // Check if user already rated this article
    try {
      const saved = localStorage.getItem(`rating_${articleSlug}`)
      if (saved) { setUserRating(parseInt(saved)); setSubmitted(true) }
    } catch {}
  }, [articleSlug, fetchAggregate])

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function submitRating(stars: number) {
    setSubmitting(true)
    setUserRating(stars)
    try {
      localStorage.setItem(`rating_${articleSlug}`, String(stars))
    } catch {}

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: articleSlug, sessionId: getSessionId(), rating: stars })
      })
      const data = await res.json()
      if (data.average !== undefined) {
        setAggregate({ average: data.average, count: data.count })
      }
    } catch {}

    setSubmitted(true)
    setSubmitting(false)
  }

  const categoryLabel = CATEGORY_LABELS[category] || category
  const categoryHref = `/${category}`

  return (
    <>
      <div className="border-t border-brand-border my-8" />

      {/* ── STAR RATING ─────────────────────────────────────── */}
      {isOwnContent && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center mb-8">
          {!submitted ? (
            <>
              <p className="text-sm font-bold text-brand-navy mb-1">Was this guide helpful?</p>
              {aggregate && aggregate.count > 0 && (
                <div className="flex justify-center mb-3">
                  <StarDisplay average={aggregate.average} count={aggregate.count} size="sm" />
                </div>
              )}
              <p className="text-xs text-brand-slate mb-4">Be the first to rate — or add yours below</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => submitRating(star)}
                    disabled={submitting}
                    className="transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (hovered || userRating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-7 h-7 ${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm font-semibold text-brand-navy">
                {userRating >= 4 ? 'Thanks — glad this was helpful! 🎉' : userRating >= 3 ? 'Thanks for rating this guide.' : 'Thanks — we will work on improving this.'}
              </p>
              {aggregate && aggregate.count > 0 && (
                <StarDisplay average={aggregate.average} count={aggregate.count} size="sm" />
              )}
              <button
                onClick={() => { setSubmitted(false); setUserRating(0) }}
                className="text-xs text-brand-slate hover:text-brand-sky underline"
              >
                Change rating
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── RELATED ARTICLES ────────────────────────────────── */}
      {relatedArticles.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-sky" />
              <h3 className="text-base font-bold text-brand-navy">More from {categoryLabel}</h3>
            </div>
            <Link href={categoryHref} className="text-xs text-brand-sky hover:text-brand-skyDark font-medium transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/article/${related.slug}`}
                className="group block bg-white border border-brand-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <img
                  src={related.thumbnail_url || CATEGORY_FALLBACKS[related.category_slug] || CATEGORY_FALLBACKS['latest-news']}
                  alt={related.title}
                  className="w-full h-28 object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="p-3">
                  <p className="text-xs font-semibold text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-sky transition-colors">
                    {related.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── NEWSLETTER CTA ──────────────────────────────────── */}
      <div className="bg-brand-navy rounded-2xl p-6 text-center mb-4">
        <p className="text-white font-bold text-base mb-1">Get new guides every week</p>
        <p className="text-brand-muted text-sm mb-4">
          Real AI income strategies, tool reviews, and plain-English news — free in your inbox.
        </p>
        <Link href="/#newsletter" className="inline-block bg-brand-sky hover:bg-brand-skyDark text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
          Subscribe free →
        </Link>
      </div>

      {/* ── BACK TO TOP ─────────────────────────────────────── */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 bg-brand-navy hover:bg-brand-sky text-white p-3 rounded-full shadow-lg transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  )
}
