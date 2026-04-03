'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import AdSlot from '@/components/ads/AdSlot'
import LoadMoreButton from '@/components/ui/LoadMoreButton'
import { Article } from '@/lib/types'
import Link from 'next/link'
import { DollarSign, Briefcase, Clock, TrendingUp, Sparkles, Rss } from 'lucide-react'

const PAGE_SIZE = 12

export default function MakeMoneyPage() {
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
      setRatings(prev => ({ ...prev, ...await (await fetch(`/api/ratings?slugs=${slugs}`)).json() }))
    } catch {}
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/articles?limit=100&category=make-money&sortBy=latest')
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
      const res = await fetch(`/api/articles?limit=${PAGE_SIZE + 1}&category=make-money&sortBy=latest&offset=${offset}`)
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
          <div className="w-2 h-2 bg-amber-400 rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Make Money with AI</h1>
          <p className="text-sm text-brand-muted max-w-lg">Real side hustles, freelance opportunities, and income strategies using AI tools — no tech background needed.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: DollarSign, label: 'Side Hustles', desc: 'Start earning this week' },
              { icon: Briefcase, label: 'Freelance Gigs', desc: 'AI skills in demand' },
              { icon: Clock, label: 'Save Time', desc: 'Do more with less' },
              { icon: TrendingUp, label: 'New Income', desc: 'Real success stories' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/[0.06] rounded-xl p-3">
                <Icon className="w-4 h-4 text-amber-300 mb-1.5" />
                <div className="text-xs font-semibold text-white">{label}</div>
                <div className="text-[10px] text-brand-muted mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full px-4 sm:px-6 my-3" />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-6 space-y-10">
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
                  <h2 className="text-base font-bold text-brand-navy">AI Foresights Guides</h2>
                  <span className="text-xs text-brand-muted">— written by our team</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinned.map((a, i) => (
                    <ArticleCard key={a.id} article={a} variant={i === 0 ? 'featured' : 'default'} ratingAverage={ratings[a.slug]?.average} ratingCount={ratings[a.slug]?.count} />
                  ))}
                </div>
              </section>
            )}
            {news.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Rss className="w-4 h-4 text-brand-sky" />
                  <h2 className="text-base font-bold text-brand-navy">Latest AI Income News</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {news.map((a, i) => (
                    <div key={a.id}>
                      <ArticleCard article={a} variant="default" />
                      {(i + 1) % 6 === 0 && <div className="mt-4"><AdSlot slot="in-feed" size="banner" /></div>}
                    </div>
                  ))}
                </div>
                <LoadMoreButton onClick={loadMore} loading={loadingMore} hasMore={hasMore} />
              </section>
            )}
            {pinned.length === 0 && news.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-2xl">
                <p className="text-brand-slate text-sm mb-3">Make Money guides are added weekly. Subscribe to get notified.</p>
                <Link href="/#newsletter" className="btn-primary inline-block text-sm">Get notified free</Link>
              </div>
            )}
          </>
        )}
        <div className="bg-brand-navy rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">New income ideas every week</p>
          <p className="text-brand-muted text-sm mb-4">Real ways professionals are using AI to earn extra income — in your inbox, free.</p>
          <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
