'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import AdSlot from '@/components/ads/AdSlot'
import LoadMoreButton from '@/components/ui/LoadMoreButton'
import { Article } from '@/lib/types'
import Link from 'next/link'
import { TrendingUp, Brain, Globe, Zap, Sparkles, Rss } from 'lucide-react'

const PAGE_SIZE = 12

export default function FutureOfAIPage() {
  const [pinned, setPinned]           = useState<Article[]>([])
  const [news, setNews]               = useState<Article[]>([])
  const [offset, setOffset]           = useState(0)
  const [hasMore, setHasMore]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [ratings, setRatings]         = useState<Record<string, { average: number; count: number }>>({})

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
        const res = await fetch('/api/articles?limit=100&category=future-of-ai&sortBy=latest')
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
      const res = await fetch(`/api/articles?limit=${PAGE_SIZE + 1}&category=future-of-ai&sortBy=latest&offset=${offset}`)
      const data: Article[] = await res.json()
      if (!Array.isArray(data)) return
      const rss = data.filter(a => a.sourceName !== 'AI Foresights').slice(0, PAGE_SIZE)
      setNews(prev => [...prev, ...rss])
      setOffset(prev => prev + PAGE_SIZE)
      setHasMore(data.filter(a => a.sourceName !== 'AI Foresights').length > PAGE_SIZE)
      await fetchRatings(rss)
    } finally { setLoadingMore(false) }
  }, [offset, loadingMore, hasMore])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-purple-400 rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Future of AI</h1>
          <p className="text-sm text-brand-muted max-w-lg">Trends, forecasts, and what's coming — explained for everyday professionals. No jargon required.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: TrendingUp, label: 'AI Trends', desc: "What's growing fast" },
              { icon: Brain, label: 'New Capabilities', desc: 'What AI can do now' },
              { icon: Globe, label: 'Industry Impact', desc: 'Your field, explained' },
              { icon: Zap, label: "What's Next", desc: 'Coming in 6–12 months' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/[0.06] rounded-xl p-3">
                <Icon className="w-4 h-4 text-purple-300 mb-1.5" />
                <div className="text-xs font-semibold text-white">{label}</div>
                <div className="text-[10px] text-brand-muted mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full px-4 sm:px-6 my-3" />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-4 space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-52" />)}
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
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
            {news.length > 0 && (
              <section>
                {pinned.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Rss className="w-4 h-4 text-brand-sky" />
                    <h2 className="text-base font-bold text-brand-navy">From Around the Web</h2>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {news.map((a, i) => (
                    <div key={a.id}>
                      <ArticleCard article={a} variant="default" ratingAverage={ratings[a.slug]?.average} ratingCount={ratings[a.slug]?.count} />
                      {(i + 1) % 6 === 0 && <div className="mt-4"><AdSlot slot="in-feed" size="banner" /></div>}
                    </div>
                  ))}
                </div>
                <LoadMoreButton onClick={loadMore} loading={loadingMore} hasMore={hasMore} />
              </section>
            )}
            {pinned.length === 0 && news.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-2xl">
                <p className="text-brand-slate text-sm mb-3">Fresh Future of AI articles are added every day.</p>
                <Link href="/latest-news" className="text-brand-sky text-sm hover:underline">Browse all latest news →</Link>
              </div>
            )}
          </>
        )}
        <div className="bg-brand-navy rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">Stay ahead of what's coming</p>
          <p className="text-brand-muted text-sm mb-4">Weekly AI forecasts and trend reports in plain English. Free.</p>
          <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
