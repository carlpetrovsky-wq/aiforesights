'use client'
import { useState, useEffect } from 'react'
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

export default function ArticleFooter({ articleSlug, category, relatedArticles, isOwnContent }: ArticleFooterProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [showBackTop, setShowBackTop] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`rating_${articleSlug}`)
      if (saved) { setRating(parseInt(saved)); setSubmitted(true) }
    } catch {}
  }, [articleSlug])

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function submitRating(stars: number) {
    setRating(stars)
    setSubmitted(true)
    try { localStorage.setItem(`rating_${articleSlug}`, String(stars)) } catch {}
  }

  const categoryLabel = CATEGORY_LABELS[category] || category
  const categoryHref = `/${category}`

  return (
    <>
      {/* ── DIVIDER ────────────────────────────────────────── */}
      <div className="border-t border-brand-border my-8" />

      {/* ── STAR RATING ─────────────────────────────────────── */}
      {isOwnContent && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center mb-8">
          {!submitted ? (
            <>
              <p className="text-sm font-bold text-brand-navy mb-1">Was this guide helpful?</p>
              <p className="text-xs text-brand-slate mb-4">Rate this article</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => submitRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (hovered || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-brand-navy">
                {rating >= 4 ? 'Thanks — glad this was helpful! 🎉' : rating >= 3 ? 'Thanks for rating this guide.' : 'Thanks — we will work on improving this.'}
              </p>
              <button
                onClick={() => { setSubmitted(false); setRating(0) }}
                className="text-xs text-brand-slate hover:text-brand-sky underline mt-1"
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
        <Link
          href="/#newsletter"
          className="inline-block bg-brand-sky hover:bg-brand-skyDark text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
        >
          Subscribe free →
        </Link>
      </div>

      {/* ── BACK TO TOP (fixed) ─────────────────────────────── */}
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
