'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Play, Calendar, Tv, Linkedin, Facebook, Link2, Check, Star } from 'lucide-react'

interface Video {
  id: string
  youtube_id: string
  title: string
  intro: string
  published_at: string
  is_active: boolean
  tags: string[]
  newsletter_included: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function parseDuration(iso: string): string {
  // PT1H2M3S → 1:02:03
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const h = match[1] ? `${match[1]}:` : ''
  const m = match[2] ? match[2].padStart(h ? 2 : 1, '0') : '0'
  const s = (match[3] || '0').padStart(2, '0')
  return `${h}${m}:${s}`
}

function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : 'https://www.aiforesights.com/ai-video-of-the-week'
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border-t border-brand-border pt-6 mt-6">
      <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">Share this video</p>
      <div className="flex flex-wrap gap-2">
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-sm text-brand-slate hover:border-blue-600 hover:text-blue-600 transition-colors">
          <Linkedin className="w-4 h-4" /> LinkedIn
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-sm text-brand-slate hover:border-blue-500 hover:text-blue-500 transition-colors">
          <Facebook className="w-4 h-4" /> Facebook
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-sm text-brand-slate hover:border-black hover:text-black transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          X
        </a>
        <button onClick={copyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-sm text-brand-slate hover:border-brand-sky hover:text-brand-sky transition-colors">
          {copied ? <><Check className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Link2 className="w-4 h-4" /> Copy link</>}
        </button>
      </div>
    </div>
  )
}

export default function VideoOfTheWeekPage() {
  const [active, setActive] = useState<Video | null>(null)
  const [recent, setRecent] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [aggregate, setAggregate] = useState<{ average: number; count: number } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [activeRes, recentRes] = await Promise.all([
          fetch('/api/videos?mode=active'),
          fetch('/api/videos?mode=recent'),
        ])
        const activeData = await activeRes.json()
        const recentData = await recentRes.json()
        setActive(activeData)
        // Fetch rating for this video pick
        if (activeData?.youtube_id) {
          const rSlug = `video-${activeData.youtube_id}`
          try {
            const rRes = await fetch(`/api/ratings?slug=${rSlug}`)
            const rData = await rRes.json()
            if (rData.count > 0) setAggregate(rData)
          } catch {}
          try {
            const saved = localStorage.getItem(`rating_video-${activeData.youtube_id}`)
            if (saved) { setUserRating(parseInt(saved)); setSubmitted(true) }
          } catch {}
        }
        // Recent = all except the active one, up to 6
        setRecent(
          Array.isArray(recentData)
            ? recentData.filter(v => !v.is_active).slice(0, 6)
            : []
        )
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function submitRating(stars: number, youtubeId: string) {
    setSubmitting(true)
    setUserRating(stars)
    const rSlug = `video-${youtubeId}`
    try { localStorage.setItem(`rating_${rSlug}`, String(stars)) } catch {}
    try {
      const sessionId = localStorage.getItem('aif_session_id') || (() => {
        const id = Math.random().toString(36).slice(2)
        localStorage.setItem('aif_session_id', id)
        return id
      })()
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: rSlug, sessionId, rating: stars })
      })
      const data = await res.json()
      if (data.average !== undefined) setAggregate({ average: data.average, count: data.count })
    } catch {}
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-brand-navy py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Video of the Week</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Video of the Week</h1>
          <p className="text-sm text-brand-muted max-w-lg">
            One hand-picked video every week — the most insightful AI content explained for everyday professionals. No algorithm. No fluff.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 py-8 space-y-12">

        {loading ? (
          <div className="space-y-4">
            <div className="w-full aspect-video bg-gray-100 animate-pulse rounded-2xl" />
            <div className="h-8 bg-gray-100 animate-pulse rounded w-3/4" />
            <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
            <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6" />
          </div>
        ) : !active ? (
          <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-2xl">
            <Tv className="w-10 h-10 text-brand-muted mx-auto mb-3" />
            <p className="text-brand-slate font-semibold mb-1">First video coming soon</p>
            <p className="text-brand-muted text-sm">Subscribe to be notified when we post our first pick.</p>
            <Link href="/#newsletter" className="btn-primary inline-block mt-4 text-sm">Subscribe free</Link>
          </div>
        ) : (
          <>
            {/* This week's video */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-brand-muted" />
                <span className="text-sm text-brand-muted">Week of {formatDate(active.published_at)}</span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">THIS WEEK</span>
              </div>

              {/* YouTube embed — privacy-enhanced */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black mb-6">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${active.youtube_id}?rel=0&modestbranding=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4">{active.title}</h2>

              {/* Editorial intro copy */}
              <div className="prose prose-sm max-w-none text-brand-slate leading-relaxed space-y-3">
                {active.intro.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Tags */}
              {active.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {active.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-brand-sky/10 text-brand-sky font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Watch on YouTube link */}
              <a
                href={`https://www.youtube.com/watch?v=${active.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 text-sm text-brand-muted hover:text-brand-sky transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Watch on YouTube
              </a>

              {/* Brand footer */}
              <div className="border border-brand-sky/20 bg-gradient-to-br from-brand-sky/5 to-brand-navy/5 rounded-2xl p-6 mt-8">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-transparent.svg" alt="AI Foresights" className="w-10 h-10 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-brand-navy mb-1">Want more plain-English AI news?</p>
                    <p className="text-sm text-brand-slate leading-relaxed mb-3">
                      AI Foresights covers the latest AI developments, side income ideas, and tool reviews — written for everyday professionals, not tech experts.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-sky hover:bg-brand-skyDark px-3.5 py-2 rounded-lg transition-colors">
                        Explore AI Foresights →
                      </Link>
                      <Link href="/#newsletter" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-sky border border-brand-sky/40 hover:bg-brand-sky/10 px-3.5 py-2 rounded-lg transition-colors">
                        Subscribe free — it&apos;s worth it
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share bar */}
              <ShareBar title={active.title} />

              {/* Star rating */}
              <div className="bg-gray-50 rounded-2xl p-6 text-center mt-6">
                {!submitted ? (
                  <>
                    <p className="text-sm font-bold text-brand-navy mb-1">Rate this week&apos;s pick</p>
                    {aggregate && aggregate.count > 0 && (
                      <div className="flex items-center justify-center gap-1.5 mb-3">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${aggregate.average >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-xs text-brand-slate ml-1">({aggregate.count} {aggregate.count === 1 ? 'rating' : 'ratings'})</span>
                      </div>
                    )}
                    <p className="text-xs text-brand-slate mb-4">Was this a good pick for you?</p>
                    <div className="flex items-center justify-center gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button key={star}
                          onMouseEnter={() => setHovered(star)}
                          onMouseLeave={() => setHovered(0)}
                          onClick={() => submitRating(star, active.youtube_id)}
                          disabled={submitting}
                          className="transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star className={`w-8 h-8 transition-colors ${(hovered || userRating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-5 h-5 ${userRating >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-brand-navy">Thanks for rating!</p>
                    {aggregate && <p className="text-xs text-brand-slate">{aggregate.average.toFixed(1)} average from {aggregate.count} {aggregate.count === 1 ? 'rating' : 'ratings'}</p>}
                  </div>
                )}
              </div>

            </section>

            {/* Previous picks */}
            {recent.length > 0 && (
              <section>
                <h3 className="text-base font-bold text-brand-navy mb-4">Previous Picks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recent.map(video => (
                    <div key={video.id} className="group border border-brand-border rounded-xl overflow-hidden hover:border-brand-sky hover:shadow-md transition-all bg-white">
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-black overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                          </a>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <p className="text-[11px] text-brand-muted mb-1">{formatDate(video.published_at)}</p>
                        <h4 className="text-sm font-semibold text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-sky transition-colors">
                          {video.title}
                        </h4>
                        {video.intro && (
                          <p className="text-[11px] text-brand-slate mt-1.5 line-clamp-2 leading-relaxed">
                            {video.intro.split('\n\n')[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Newsletter CTA */}
        <div className="bg-brand-navy rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">Get the video in your inbox every week</p>
          <p className="text-brand-muted text-sm mb-4">
            We send one AI video pick per week with our editorial take — straight to your inbox. Free.
          </p>
          <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
        </div>

      </main>
      <Footer />
    </div>
  )
}
