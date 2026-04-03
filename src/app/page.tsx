'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import ToolCard from '@/components/tools/ToolCard'
import AdSlot from '@/components/ads/AdSlot'
import NewsletterForm from '@/components/ui/NewsletterForm'
import ToolSearch from '@/components/search/ToolSearch'
import LearningHub from '@/components/learning/LearningHub'
import Link from 'next/link'
import { MOCK_LEARNING, CATEGORIES, RSS_SOURCES } from '@/lib/data'
import { Article, Tool } from '@/lib/types'

export default function HomePage() {
  const [featured, setFeatured] = useState<Article[]>([])
  const [latest, setLatest]     = useState<Article[]>([])
  const [topTools, setTopTools] = useState<Tool[]>([])
  const [loading, setLoading]   = useState(true)
  const [toolCount, setToolCount] = useState('50+')
  const [activeVideo, setActiveVideo] = useState<{youtube_id: string; title: string; intro: string} | null>(null)
  const [videoRating, setVideoRating] = useState<{average: number; count: number} | null>(null)
  const [activePodcast, setActivePodcast] = useState<{id: string; title: string; episodes: {episode_title: string; podcast_name: string}[]} | null>(null)
  const [newLast24h, setNewLast24h] = useState<number | null>(null)
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({})

  useEffect(() => {
    async function load() {
      try {
        const [featRes, latRes, toolRes, videoRes, podcastRes, statsRes] = await Promise.all([
          fetch(`/api/articles?featured=true&limit=3&t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/articles?limit=6&sortBy=latest&t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/tools?limit=5&t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/videos?mode=active`, { cache: 'no-store' }),
          fetch(`/api/podcasts?mode=active`, { cache: 'no-store' }),
          fetch(`/api/stats?t=${Date.now()}`, { cache: 'no-store' }),
        ])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [featData, latData, toolData, statsData]: [any[], any[], any[], any] = await Promise.all([
          featRes.json(), latRes.json(), toolRes.json(), statsRes.ok ? statsRes.json() : {},
        ])
        try {
          const vd = await videoRes.json()
          if (vd?.youtube_id) {
            setActiveVideo(vd)
            try {
              const rRes = await fetch(`/api/ratings?slug=video-${vd.youtube_id}`)
              const rData = await rRes.json()
              if (rData?.count > 0) setVideoRating(rData)
            } catch {}
        try { const pd = await podcastRes.json(); if (pd?.id) setActivePodcast(pd) } catch {}
          }
        } catch {}
        const featArticles = Array.isArray(featData) ? featData as Article[] : []
        const latArticles  = Array.isArray(latData)  ? latData  as Article[] : []
        setFeatured(featArticles)
        setLatest(latArticles)
        setTopTools(Array.isArray(toolData) ? toolData as Tool[] : [])
        if (statsData?.toolCount) {
          setToolCount(statsData.toolCount.toLocaleString('en-US') + '+')
        }
        if (typeof statsData?.newLast24h === 'number') {
          setNewLast24h(statsData.newLast24h)
        }

        // Fetch ratings for own-content articles
        const ownSlugs = [...featArticles, ...latArticles]
          .filter((a: Article) => a.sourceName === 'AI Foresights')
          .map((a: Article) => a.slug)
        if (ownSlugs.length > 0) {
          try {
            const rRes = await fetch(`/api/ratings?slugs=${ownSlugs.join(',')}`)
            if (rRes.ok) setRatings(await rRes.json())
          } catch { /* silent */ }
        }
      } catch (e) {
        console.error('Failed to load data:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const displayFeatured = activeSource
    ? featured.filter((a: Article) => a.sourceName === activeSource)
    : featured
  // Exclude featured articles from latest news to prevent duplicates
  const featuredIds = new Set(displayFeatured.map((a: Article) => a.id))
  const latestDeduped = latest.filter((a: Article) => !featuredIds.has(a.id))
  const displayLatest = activeSource
    ? latestDeduped.filter((a: Article) => a.sourceName === activeSource)
    : latestDeduped
  const displayTools    = topTools

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="bg-brand-navy py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-sky/15 text-brand-skyLight text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-brand-skyLight rounded-full animate-pulse-dot" />
            Updated daily · Plain-English summaries
          </div>
          <h1 className="text-hero font-bold text-white mb-3 max-w-xl">
            The world of AI,<br />
            explained in <span className="text-brand-skyLight italic">plain English</span>
          </h1>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed max-w-lg mb-6">
            Fresh AI news, tool reviews, and beginner-friendly guides — for professionals navigating the AI revolution. No jargon. No coding required.
          </p>
          <NewsletterForm variant="hero" />
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="text-xs text-brand-muted">
                <strong className="text-white font-semibold">
                  {newLast24h === null ? '…' : `${newLast24h} new`}
                </strong>{' '}
                {newLast24h === 1 ? 'article today' : 'articles today'}
              </div>
              <div className="text-xs text-brand-muted">
                <strong className="text-white font-semibold">{toolCount}</strong> tools reviewed
              </div>
              <div className="text-xs text-brand-muted">
                <strong className="text-white font-semibold">Free</strong> forever
              </div>
          </div>
        </div>
      </section>

      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full my-3 px-4 sm:px-6" />

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-2 pb-1">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/${cat.slug}`}
              className="border border-brand-border rounded-xl p-3 bg-white hover:border-brand-sky transition-colors group">
              <div className="w-2 h-2 rounded-full mb-2" style={{ background: cat.dotColor }} />
              <h4 className="text-[12px] font-semibold text-brand-navy mb-0.5 group-hover:text-brand-sky transition-colors">{cat.label}</h4>
              <p className="text-[10px] text-brand-slate">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* SOURCES STRIP */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-brand-muted shrink-0">Sources:</span>
          {RSS_SOURCES.map(s => (
            <button
              key={s}
              onClick={() => setActiveSource(activeSource === s ? null : s)}
              className={`text-[10px] px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap border transition-colors ${
                activeSource === s
                  ? 'bg-brand-sky text-white border-brand-sky'
                  : 'bg-white border-brand-border text-brand-slate hover:border-brand-sky hover:text-brand-sky'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN + SIDEBAR */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 py-4">

          {/* MAIN FEED */}
          <div>
            <div className="section-header">
              <h2 className="section-title">Featured stories</h2>
              <Link href="/latest-news" className="text-xs text-brand-sky hover:underline">View all news →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3 mb-6">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className={`bg-gray-100 animate-pulse rounded-xl ${i === 0 ? 'sm:row-span-2' : ''}`} style={{minHeight: i === 0 ? 320 : 160}} />
                ))
              ) : (
                <>
                  {displayFeatured[0] && <div className="sm:row-span-2"><ArticleCard article={displayFeatured[0]} variant="featured" showBadge={true} ratingAverage={ratings[displayFeatured[0].slug]?.average} ratingCount={ratings[displayFeatured[0].slug]?.count} /></div>}
                  {displayFeatured.slice(1).map(a => <ArticleCard key={a.id} article={a} variant="default" showBadge={true} ratingAverage={ratings[a.slug]?.average} ratingCount={ratings[a.slug]?.count} />)}
                </>
              )}
            </div>

            {/* Video of the Week teaser */}
            {activeVideo && (
              <div className="mb-6 rounded-xl border border-brand-border bg-white overflow-hidden hover:border-brand-sky transition-colors group">
                <div className="flex gap-4 p-4">
                  <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${activeVideo.youtube_id}/hqdefault.jpg`}
                      alt={activeVideo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500 text-white uppercase tracking-wide">Video of the Week</span>
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-sky transition-colors mb-1.5">
                      {activeVideo.title}
                    </h3>
                    {videoRating && videoRating.count > 0 && (
                      <div className="flex items-center gap-1 mb-1.5">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-3 h-3 ${videoRating.average >= s ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        ))}
                        <span className="text-[10px] text-brand-muted ml-0.5">{videoRating.average.toFixed(1)} ({videoRating.count})</span>
                      </div>
                    )}
                    <p className="text-[11px] text-brand-slate line-clamp-2 leading-relaxed">
                      {activeVideo.intro.split("\n\n")[0]}
                    </p>
                    <Link href="/ai-video-of-the-week" className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-brand-sky hover:underline">
                      Watch now →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Podcast Roundup teaser */}
            {activePodcast && (
              <Link href="/ai-podcast-roundup" className="mb-6 rounded-xl border border-brand-border bg-white hover:border-brand-sky transition-colors group flex items-center gap-4 p-4 block">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <span className="text-lg">🎧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white uppercase tracking-wide">Podcast Roundup</span>
                  </div>
                  <h3 className="text-sm font-bold text-brand-navy leading-snug line-clamp-1 group-hover:text-brand-sky transition-colors">
                    {activePodcast.title}
                  </h3>
                  <p className="text-[11px] text-brand-muted mt-0.5">{activePodcast.episodes?.length || 0} episodes this week · Listen now →</p>
                </div>
              </Link>
            )}

            <div className="section-header">
              <h2 className="section-title">Latest news</h2>
              <Link href="/latest-news" className="text-xs text-brand-sky hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {loading
                ? [...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-48" />)
                : displayLatest.slice(0, 3).map(a => <ArticleCard key={a.id} article={a} />)
              }
            </div>

            <AdSlot slot="in-feed" size="banner" className="mb-4" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {loading
                ? [...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-48" />)
                : displayLatest.slice(3, 6).map(a => <ArticleCard key={a.id} article={a} />)
              }
            </div>
          </div>

          {/* SIDEBAR */}
          <aside>
            <ToolSearch />
            <NewsletterForm variant="sidebar" />
            <div className="mb-4">
              <div className="section-header">
                <h3 className="section-title text-[13px]">Top AI tools</h3>
                <Link href="/best-ai-tools" className="text-[11px] text-brand-sky hover:underline">View all →</Link>
              </div>
              <div className="bg-white border border-brand-border rounded-xl p-3">
                {loading
                  ? [...Array(5)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded h-10 mb-2" />)
                  : displayTools.map(t => <ToolCard key={t.id} tool={t} variant="sidebar" />)
                }
              </div>
            </div>
            <AdSlot slot="sidebar" size="rectangle" />
          </aside>
        </div>
      </div>

      <LearningHub resources={MOCK_LEARNING} />

      <div className="bg-brand-bg border-t border-brand-border py-3 px-4 sm:px-6">
        <AdSlot slot="bottom-leaderboard" size="leaderboard" className="max-w-6xl mx-auto" />
      </div>
      <div className="bg-brand-bg py-2 px-4 sm:px-6">
        <AdSlot slot="pre-footer" size="banner" className="max-w-6xl mx-auto" />
      </div>
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <NewsletterForm variant="inline" />
      </div>

      <Footer />
    </div>
  )
}
