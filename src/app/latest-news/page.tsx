'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import AdSlot from '@/components/ads/AdSlot'
import LoadMoreButton from '@/components/ui/LoadMoreButton'
import { Article } from '@/lib/types'
import { Sparkles, Rss } from 'lucide-react'

const PAGE_SIZE = 12
const CATEGORY_FILTERS = ['All','Latest news','Future of AI','Best AI tools','Make money']

export default function LatestNewsPage() {
  const [pinned, setPinned]           = useState<Article[]>([])
  const [news, setNews]               = useState<Article[]>([])
  const [offset, setOffset]           = useState(0)
  const [hasMore, setHasMore]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sortBy, setSortBy]           = useState<'latest'|'popular'>('latest')
  const [activeCategory, setCategory] = useState('All')
  const [ratings, setRatings]         = useState<Record<string, { average: number; count: number }>>({})

  async function fetchRatings(articles: Article[]) {
    if (!articles.length) return
    try {
      const slugs = articles.map(a => a.slug).join(',')
      const rRes = await fetch(`/api/ratings?slugs=${slugs}`)
      setRatings(prev => ({ ...prev, ...await rRes.json() }))
    } catch {}
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const catSlug = activeCategory === 'All' ? '' : activeCategory.toLowerCase().replace(/ /g, '-')
        const catParam = catSlug ? `&category=${catSlug}` : ''
        const res = await fetch(`/api/articles?limit=100${catParam}&sortBy=${sortBy}`)
        const all: Article[] = await res.json()
        if (!Array.isArray(all)) return
        const own = all.filter(a => a.sourceName === 'AI Foresights')
        const rss = all.filter(a => a.sourceName !== 'AI Foresights')
        setPinned(own)
        setNews(rss.slice(0, PAGE_SIZE))
        setOffset(PAGE_SIZE)
        setHasMore(rss.length > PAGE_SIZE)
        await fetchRatings([...own, ...rss.slice(0, PAGE_SIZE)])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sortBy, activeCategory])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const catSlug = activeCategory === 'All' ? '' : activeCategory.toLowerCase().replace(/ /g, '-')
      const catParam = catSlug ? `&category=${catSlug}` : ''
      const res = await fetch(`/api/articles?limit=${PAGE_SIZE + 1}${catParam}&sortBy=${sortBy}&offset=${offset}`)
      const data: Article[] = await res.json()
      if (!Array.isArray(data)) return
      const rss = data.filter(a => a.sourceName !== 'AI Foresights')
      const page = rss.slice(0, PAGE_SIZE)
      setNews(prev => [...prev, ...page])
      setOffset(prev => prev + PAGE_SIZE)
      setHasMore(rss.length > PAGE_SIZE)
      await fetchRatings(page)
    } finally {
      setLoadingMore(false)
    }
  }, [activeCategory, sortBy, offset, loadingMore, hasMore])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Latest AI News</h1>
          <p className="text-sm text-brand-muted max-w-lg">Breaking AI developments explained in plain English. Updated daily from top sources.</p>
        </div>
      </div>
      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full px-4 sm:px-6 my-3" />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-4 space-y-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORY_FILTERS.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${activeCategory === cat ? 'bg-brand-sky text-white' : 'text-brand-slate hover:bg-gray-100 bg-white border border-brand-border'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {(['latest','popular'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors capitalize ${sortBy === s ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-slate'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-52" />)}
          </div>
        ) : (
          <>
            {/* Pinned AI Foresights articles */}
            {pinned.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-bold text-brand-navy">From AI Foresights</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinned.map((a, i) => (
                    <ArticleCard key={a.id} article={a} variant={i === 0 ? 'featured' : 'default'} ratingAverage={ratings[a.slug]?.average} ratingCount={ratings[a.slug]?.count} />
                  ))}
                </div>
              </section>
            )}

            {/* RSS news stream */}
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
                <p className="text-brand-slate text-sm">No articles found for this filter.</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
