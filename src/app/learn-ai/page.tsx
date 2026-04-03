'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import AdSlot from '@/components/ads/AdSlot'
import LoadMoreButton from '@/components/ui/LoadMoreButton'
import { Article } from '@/lib/types'
import Link from 'next/link'
import { ExternalLink, BookOpen, Play, FileText, GraduationCap, Sparkles, Rss } from 'lucide-react'
import { MOCK_LEARNING } from '@/lib/data'

const PAGE_SIZE = 12

const TYPE_LABELS: Record<string, string> = { course: 'Course', video: 'Video', book: 'Book', guide: 'Guide' }
const TYPE_ICONS: Record<string, typeof BookOpen> = { course: GraduationCap, video: Play, book: BookOpen, guide: FileText }
const TYPE_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
  course: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
  video:  { bg: 'bg-red-50',  text: 'text-red-700',  iconBg: 'bg-red-100' },
  book:   { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
  guide:  { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
}
const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-blue-50 text-blue-700',
  advanced: 'bg-purple-50 text-purple-700',
}

export default function LearnAIPage() {
  const [pinned, setPinned]           = useState<Article[]>([])
  const [news, setNews]               = useState<Article[]>([])
  const [offset, setOffset]           = useState(0)
  const [hasMore, setHasMore]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [ratings, setRatings]         = useState<Record<string, { average: number; count: number }>>({})

  const beginner     = MOCK_LEARNING.filter(r => r.level === 'beginner')
  const intermediate = MOCK_LEARNING.filter(r => r.level === 'intermediate')

  async function fetchRatings(articles: Article[]) {
    if (!articles.length) return
    try {
      const slugs = articles.map(a => a.slug).join(',')
      const rData = await (await fetch(`/api/ratings?slugs=${slugs}`)).json()
      setRatings(prev => ({ ...prev, ...rData }))
    } catch {}
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/articles?limit=100&category=learn-ai&sortBy=latest')
        const all: Article[] = await res.json()
        if (!Array.isArray(all)) return
        const own = all.filter(a => a.sourceName === 'AI Foresights')
        const rss = all.filter(a => a.sourceName !== 'AI Foresights')
        setPinned(own)
        setNews(rss.slice(0, PAGE_SIZE))
        setOffset(PAGE_SIZE)
        setHasMore(rss.length > PAGE_SIZE)
        await fetchRatings([...own, ...rss.slice(0, PAGE_SIZE)])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/articles?limit=${PAGE_SIZE + 1}&category=learn-ai&sortBy=latest&offset=${offset}`)
      const data: Article[] = await res.json()
      if (!Array.isArray(data)) return
      const rss = data.filter(a => a.sourceName !== 'AI Foresights').slice(0, PAGE_SIZE)
      setNews(prev => [...prev, ...rss])
      setOffset(prev => prev + PAGE_SIZE)
      setHasMore(data.filter(a => a.sourceName !== 'AI Foresights').length > PAGE_SIZE)
      await fetchRatings(rss)
    } finally { setLoadingMore(false) }
  }, [offset, loadingMore, hasMore])

  function ResourceCard({ r }: { r: typeof MOCK_LEARNING[0] }) {
    const Icon = TYPE_ICONS[r.type] || BookOpen
    const colors = TYPE_COLORS[r.type] || TYPE_COLORS.guide
    const isInternal = r.url.startsWith('/')
    return (
      <a href={r.affiliateUrl || r.url} target={isInternal ? undefined : '_blank'} rel={isInternal ? undefined : 'noopener noreferrer'}
        className="border border-brand-border rounded-xl bg-white overflow-hidden hover:border-brand-sky hover:shadow-md transition-all group flex flex-col cursor-pointer">
        <div className="w-full h-28 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: r.thumbnailBg }}>
          {r.thumbnailUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover absolute inset-0" />
            : <div className={`w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center`}><Icon className={`w-6 h-6 ${colors.text}`} /></div>
          }
          <div className="absolute top-2 left-2 z-10">
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>{TYPE_LABELS[r.type]}</span>
          </div>
          {r.isFree && <div className="absolute top-2 right-2 z-10"><span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-emerald-700">FREE</span></div>}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-[12px] font-semibold text-brand-navy leading-snug mb-1.5 line-clamp-2 group-hover:text-brand-sky transition-colors">{r.title}</h3>
          {r.description && <p className="text-[10px] text-brand-slate leading-relaxed mb-2 line-clamp-2 flex-1">{r.description}</p>}
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded capitalize ${LEVEL_COLORS[r.level]}`}>{r.level}</span>
            <span className="text-[10px] text-brand-muted">· {r.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-brand-sky font-medium mt-auto">
            {r.isFree ? 'Free' : r.isAffiliate ? 'Affiliate link' : 'Visit'} · {r.platform}
            {!isInternal && <ExternalLink className="w-2.5 h-2.5" />}
          </div>
        </div>
      </a>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-red-400 rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Learn AI</h1>
          <p className="text-sm text-brand-muted max-w-lg">Courses, videos, books, and guides picked for everyday professionals — starting from zero. No coding. No jargon. Just clear, practical learning.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Start from scratch', 'Free options', 'Quick reads', 'Step-by-step'].map(tag => (
              <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-brand-muted">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-8 space-y-10">

        {/* AI Foresights guides pinned at top */}
        {!loading && pinned.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-brand-navy">From AI Foresights</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinned.map((a, i) => (
                <ArticleCard key={a.id} article={a} variant="default" ratingAverage={ratings[a.slug]?.average} ratingCount={ratings[a.slug]?.count} />
              ))}
            </div>
          </section>
        )}

        {/* Curated resources — Beginner */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Start here — Beginner</h2>
              <p className="text-xs text-brand-slate mt-0.5">Perfect if you are brand new to AI. No experience needed.</p>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Beginner friendly</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {beginner.map(r => <ResourceCard key={r.id} r={r} />)}
          </div>
        </section>

        {/* Curated resources — Intermediate */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Go deeper — Intermediate</h2>
              <p className="text-xs text-brand-slate mt-0.5">Once you have the basics, these will take you further.</p>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">Intermediate</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {intermediate.map(r => <ResourceCard key={r.id} r={r} />)}
          </div>
        </section>

        {/* RSS news stream */}
        {(loading || news.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Rss className="w-4 h-4 text-brand-sky" />
              <h2 className="text-base font-bold text-brand-navy">Latest AI Learning News</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-52" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {news.map((a, i) => (
                    <div key={a.id}>
                      <ArticleCard article={a} variant="default" />
                      {(i + 1) % 6 === 0 && <div className="mt-4"><AdSlot slot="in-feed" size="banner" /></div>}
                    </div>
                  ))}
                </div>
                <LoadMoreButton onClick={loadMore} loading={loadingMore} hasMore={hasMore} />
              </>
            )}
          </section>
        )}

        <section className="bg-brand-navy rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold text-white mb-2">New resources added every week</h2>
          <p className="text-brand-muted text-sm mb-4">Subscribe to our free newsletter and we will let you know when new guides and courses are available.</p>
          <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
