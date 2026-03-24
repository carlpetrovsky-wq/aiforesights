'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import AdSlot from '@/components/ads/AdSlot'
import { MOCK_ARTICLES } from '@/lib/data'
import { Article } from '@/lib/types'
import Link from 'next/link'
import { TrendingUp, Brain, Globe, Zap } from 'lucide-react'

export default function FutureOfAIPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/articles?limit=24&category=future-of-ai&sortBy=latest')
        const data = await res.json()
        setArticles(Array.isArray(data) && data.length > 0 ? data : MOCK_ARTICLES)
      } catch {
        setArticles(MOCK_ARTICLES.slice(0, 6))
        // Fetch ratings for all articles
        const slugsToRate = (Array.isArray(articles) ? articles : []).map((a: any) => a.slug).join(',')
        if (slugsToRate) {
          try {
            const rRes = await fetch(`/api/ratings?slugs=${slugsToRate}`)
            const rData = await rRes.json()
            setRatings(rData)
          } catch {}
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
              { icon: TrendingUp, label: 'AI Trends', desc: 'What\'s growing fast' },
              { icon: Brain, label: 'New Capabilities', desc: 'What AI can do now' },
              { icon: Globe, label: 'Industry Impact', desc: 'Your field, explained' },
              { icon: Zap, label: 'What\'s Next', desc: 'Coming in 6–12 months' },
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
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-52" />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-2xl">
            <p className="text-brand-slate text-sm mb-3">Fresh Future of AI articles are added every day.</p>
            <Link href="/latest-news" className="text-brand-sky text-sm hover:underline">Browse all latest news →</Link>
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
        <div className="mt-8 bg-brand-navy rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">Stay ahead of what's coming</p>
          <p className="text-brand-muted text-sm mb-4">Weekly AI forecasts and trend reports in plain English. Free.</p>
          <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
