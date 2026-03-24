'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import AdSlot from '@/components/ads/AdSlot'
import { MOCK_ARTICLES } from '@/lib/data'
import { Article } from '@/lib/types'

const CATEGORY_FILTERS = ['All','Latest news','Future of AI','Best AI tools','Make money']

export default function LatestNewsPage() {
  const [articles, setArticles]       = useState<Article[]>([])
  const [loading, setLoading]         = useState(true)
  const [sortBy, setSortBy]           = useState<'latest'|'popular'>('latest')
  const [activeCategory, setCategory] = useState('All')
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: '24', sortBy })
        if (activeCategory !== 'All') {
          params.set('category', activeCategory.toLowerCase().replace(/ /g,'-'))
        }
        const res = await fetch(`/api/articles?${params}`)
        const data = await res.json()
        const arts = Array.isArray(data) && data.length > 0 ? data : MOCK_ARTICLES
        setArticles(arts)
        // Fetch ratings
        try {
          const slugs = arts.map((a: any) => a.slug).join(',')
          if (slugs) {
            const rRes = await fetch(`/api/ratings?slugs=${slugs}`)
            const rData = await rRes.json()
            setRatings(rData)
          }
        } catch {}
      } catch {
        setArticles(MOCK_ARTICLES)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sortBy, activeCategory])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Latest AI news</h1>
          <p className="text-sm text-brand-muted max-w-lg">Breaking AI developments explained in plain English. Updated daily from top sources.</p>
        </div>
      </div>
      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full px-4 sm:px-6 my-3" />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORY_FILTERS.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${activeCategory === cat ? 'bg-brand-sky text-white' : 'text-brand-slate hover:bg-gray-100 bg-white border border-brand-border'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setSortBy('latest')}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${sortBy === 'latest' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-slate'}`}>
              Latest
            </button>
            <button onClick={() => setSortBy('popular')}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${sortBy === 'popular' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-slate'}`}>
              Popular
            </button>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-52" />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-2xl">
            <p className="text-brand-slate text-sm">No articles found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a, i) => (
              <div key={a.id}>
                <ArticleCard article={a} variant={a.isFeatured && i === 0 ? 'featured' : 'default'} ratingAverage={ratings[a.slug]?.average} ratingCount={ratings[a.slug]?.count} />
                {(i + 1) % 6 === 0 && <div className="mt-4"><AdSlot slot="in-feed" size="banner" /></div>}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
