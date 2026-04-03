'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Headphones, Play, Calendar, Star, Linkedin, Facebook, Link2, Check } from 'lucide-react'
import AdSlot from '@/components/ads/AdSlot'

interface Episode {
  youtube_id: string
  podcast_name: string
  episode_title: string
  summary: string
  duration: string
  view_count: string
  thumbnail: string
  tags: string[]
}

interface Roundup {
  id: string
  title: string
  week_of: string
  episodes: Episode[]
  is_active: boolean
  newsletter_included: boolean
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatViews(n: string) {
  const num = parseInt(n)
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`
  if (num >= 1000) return `${Math.floor(num / 1000)}K views`
  return `${num} views`
}

function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : 'https://www.aiforesights.com/ai-podcast-roundup'
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  function copyLink() {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  return (
    <div className="border-t border-brand-border pt-6 mt-6">
      <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">Share this roundup</p>
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

function RatingWidget({ roundupId }: { roundupId: string }) {
  const [userRating, setUserRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [aggregate, setAggregate] = useState<{ average: number; count: number } | null>(null)
  const slug = `podcast-${roundupId}`

  useEffect(() => {
    fetch(`/api/ratings?slug=${slug}`).then(r => r.json()).then(d => { if (d.count > 0) setAggregate(d) }).catch(() => {})
    try {
      const saved = localStorage.getItem(`rating_${slug}`)
      if (saved) { setUserRating(parseInt(saved)); setSubmitted(true) }
    } catch {}
  }, [slug])

  async function submitRating(stars: number) {
    setSubmitting(true)
    setUserRating(stars)
    try { localStorage.setItem(`rating_${slug}`, String(stars)) } catch {}
    try {
      const sessionId = localStorage.getItem('aif_session_id') || (() => {
        const id = Math.random().toString(36).slice(2)
        localStorage.setItem('aif_session_id', id)
        return id
      })()
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sessionId, rating: stars }),
      })
      const d = await res.json()
      if (d.average !== undefined) setAggregate({ average: d.average, count: d.count })
    } catch {}
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6 text-center mt-6">
      {!submitted ? (
        <>
          <p className="text-sm font-bold text-brand-navy mb-1">Rate this week&apos;s roundup</p>
          {aggregate && aggregate.count > 0 && (
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${aggregate.average >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}
              <span className="text-xs text-brand-slate ml-1">({aggregate.count} ratings)</span>
            </div>
          )}
          <p className="text-xs text-brand-slate mb-4">Were these good picks for you this week?</p>
          <div className="flex items-center justify-center gap-2">
            {[1,2,3,4,5].map(star => (
              <button key={star} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                onClick={() => submitRating(star)} disabled={submitting}
                className="transition-transform hover:scale-110 focus:outline-none disabled:opacity-50">
                <Star className={`w-8 h-8 transition-colors ${(hovered || userRating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${userRating >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}
          </div>
          <p className="text-sm font-semibold text-brand-navy">Thanks for rating!</p>
          {aggregate && <p className="text-xs text-brand-slate">{aggregate.average.toFixed(1)} average from {aggregate.count} ratings</p>}
        </div>
      )}
    </div>
  )
}

export default function PodcastRoundupPage() {
  const [active, setActive] = useState<Roundup | null>(null)
  const [recent, setRecent] = useState<Roundup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [activeRes, recentRes] = await Promise.all([
          fetch('/api/podcasts?mode=active'),
          fetch('/api/podcasts?mode=recent'),
        ])
        const activeData = await activeRes.json()
        const recentData = await recentRes.json()
        setActive(activeData)
        setRecent(Array.isArray(recentData) ? recentData.filter(r => !r.is_active).slice(0, 4) : [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Podcast Roundup</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Podcast Roundup</h1>
          <p className="text-sm text-brand-muted max-w-lg">Five AI conversations worth your time — hand-picked and summarized every week. Perfect for your commute.</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 py-8 space-y-12">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />)}
          </div>
        ) : !active ? (
          <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-2xl">
            <Headphones className="w-10 h-10 text-brand-muted mx-auto mb-3" />
            <p className="text-brand-slate font-semibold mb-1">First roundup coming Monday</p>
            <p className="text-brand-muted text-sm">Subscribe to get it in your inbox.</p>
            <Link href="/#newsletter" className="btn-primary inline-block mt-4 text-sm">Subscribe free</Link>
          </div>
        ) : (
          <>
            {/* This week's roundup */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-brand-muted" />
                <span className="text-sm text-brand-muted">Week of {formatDate(active.week_of)}</span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500 text-white">THIS WEEK</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy mb-6">{active.title}</h2>

              <div className="space-y-6">
                {active.episodes.map((ep, i) => (
                  <div key={ep.youtube_id}>
                    {i === 2 && <AdSlot slot="in-feed" size="banner" className="mb-4" />}
                    <div className="border border-brand-border rounded-2xl overflow-hidden bg-white hover:border-brand-sky transition-colors">
                    <div className="flex gap-4 p-4">
                      {/* Episode number */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-sky/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-brand-sky">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold text-brand-sky">{ep.podcast_name}</span>
                          {ep.duration && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-brand-muted">{ep.duration}</span>}
                          {ep.view_count && parseInt(ep.view_count) > 0 && (
                            <span className="text-[10px] text-brand-muted">{formatViews(ep.view_count)}</span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-brand-navy leading-snug mb-2">{ep.episode_title}</h3>
                        <p className="text-sm text-brand-slate leading-relaxed">{ep.summary}</p>
                      </div>
                    </div>
                    {/* YouTube embed */}
                    <div className="w-full aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ep.youtube_id}?rel=0&modestbranding=1`}
                        title={ep.episode_title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                    <div className="px-4 pb-3 pt-2">
                      <a href={`https://www.youtube.com/watch?v=${ep.youtube_id}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-sky transition-colors">
                        <Play className="w-3 h-3" /> Watch on YouTube
                      </a>
                    </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Brand footer */}
              <div className="border border-brand-sky/20 bg-gradient-to-br from-brand-sky/5 to-brand-navy/5 rounded-2xl p-6 mt-8">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-transparent.svg" alt="AI Foresights" className="w-10 h-10 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-brand-navy mb-1">Want more plain-English AI news?</p>
                    <p className="text-sm text-brand-slate leading-relaxed mb-3">AI Foresights covers the latest AI developments, side income ideas, and tool reviews — written for everyday professionals, not tech experts.</p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-sky hover:bg-brand-skyDark px-3.5 py-2 rounded-lg transition-colors">Explore AI Foresights →</Link>
                      <Link href="/#newsletter" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-sky border border-brand-sky/40 hover:bg-brand-sky/10 px-3.5 py-2 rounded-lg transition-colors">Subscribe free — it&apos;s worth it</Link>
                    </div>
                  </div>
                </div>
              </div>

              <ShareBar title={active.title} />
              <RatingWidget roundupId={active.id} />
            </section>

            {/* Previous roundups */}
            {recent.length > 0 && (
              <section>
                <h3 className="text-base font-bold text-brand-navy mb-4">Previous Roundups</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recent.map(r => (
                    <div key={r.id} className="border border-brand-border rounded-xl p-4 bg-white hover:border-brand-sky transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Headphones className="w-4 h-4 text-brand-muted" />
                        <span className="text-[11px] text-brand-muted">{formatDate(r.week_of)}</span>
                      </div>
                      <p className="text-sm font-semibold text-brand-navy leading-snug mb-1">{r.title}</p>
                      <p className="text-[11px] text-brand-muted">{r.episodes?.length || 0} episodes</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Bottom ad slot */}
        <AdSlot slot="top-leaderboard" size="leaderboard" />

        {/* Newsletter CTA */}
        <div className="bg-brand-navy rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">Get the roundup in your inbox every Monday</p>
          <p className="text-brand-muted text-sm mb-4">Five AI podcast picks with plain-English summaries — free, every week.</p>
          <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
