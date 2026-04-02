'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Star, ArrowUp, BookOpen, Linkedin, Facebook, Link2, Check } from 'lucide-react'

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

function ShareBar() {
  const [copied, setCopied] = useState(false)
  const [pageUrl, setPageUrl] = useState('')
  const [pageTitle, setPageTitle] = useState('')

  useEffect(() => {
    setPageUrl(window.location.href)
    setPageTitle(document.title)
  }, [])

  function copyLink() {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // fallback
      const el = document.createElement('textarea')
      el.value = pageUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedTitle = encodeURIComponent(pageTitle.replace(' | AI Foresights', ''))

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-brand-navy flex items-center gap-1.5">
          <svg className="w-4 h-4 text-brand-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share this article
        </span>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-medium rounded-lg transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#0e5fc4] text-white text-sm font-medium rounded-lg transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
          aria-label="Share on X"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </a>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            copied
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white border-brand-border text-brand-navy hover:bg-gray-50'
          }`}
          aria-label="Copy link"
        >
          {copied ? (
            <><Check className="w-4 h-4" />Copied!</>
          ) : (
            <><Link2 className="w-4 h-4" />Copy link</>
          )}
        </button>
      </div>
    </div>
  )
}

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

      {/* ── SHARE BAR ───────────────────────────────────────── */}
      {isOwnContent && (
        <ShareBar />
      )}

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
