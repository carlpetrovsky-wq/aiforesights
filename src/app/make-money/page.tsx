'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import AdSlot from '@/components/ads/AdSlot'
import { MOCK_ARTICLES } from '@/lib/data'
import { Article } from '@/lib/types'
import Link from 'next/link'
import { DollarSign, Briefcase, Clock, TrendingUp, BookOpen, Rss } from 'lucide-react'

export default function MakeMoneyPage() {
  const [guides, setGuides] = useState<Article[]>([])
  const [news, setNews] = useState<Article[]>([])
  const [newsPage, setNewsPage] = useState(1)
  const [hasMoreNews, setHasMoreNews] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({})
  const NEWS_PER_PAGE = 12

  async function fetchRatings(articles: Article[]) {
    if (articles.length === 0) return
    try {
      const slugs = articles.map(a => a.slug).join(',')
      const rRes = await fetch(`/api/ratings?slugs=${slugs}`)
      const rData = await rRes.json()
      setRatings(prev => ({ ...prev, ...rData }))
    } catch {}
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Fetch guides (own content) + first page of news separately
        const [guidesRes, newsRes] = await Promise.all([
          fetch('/api/articles?limit=50&category=make-money&sortBy=latest&source=AI+Foresights'),
          fetch(`/api/articles?limit=${NEWS_PER_PAGE + 1}&category=make-money&sortBy=latest&excludeSource=AI+Foresights`)
        ])
        const guidesData = await guidesRes.json()
        const newsData = await newsRes.json()

        // Fallback: if API doesn't support source filter, fetch all and split
        let ownGuides: Article[] = []
        let rssNews: Article[] = []

        if (Array.isArray(guidesData) && guidesData.some((a: Article) => a.sourceName === 'AI Foresights')) {
          ownGuides = guidesData.filter((a: Article) => a.sourceName === 'AI Foresights')
        }
        if (Array.isArray(newsData) && newsData.some((a: Article) => a.sourceName !== 'AI Foresights')) {
          rssNews = newsData.filter((a: Article) => a.sourceName !== 'AI Foresights')
        }

        // If source filtering not supported, fall back to fetching all
        if (ownGuides.length === 0 && rssNews.length === 0) {
          const allRes = await fetch('/api/articles?limit=100&category=make-money&sortBy=latest')
          const all: Article[] = await allRes.json()
          ownGuides = all.filter(a => a.sourceName === 'AI Foresights')
          rssNews = all.filter(a => a.sourceName !== 'AI Foresights')
        }

        setGuides(ownGuides)
        const firstPage = rssNews.slice(0, NEWS_PER_PAGE)
        setNews(firstPage)
        setHasMoreNews(rssNews.length > NEWS_PER_PAGE)
        setNewsPage(1)

        await fetchRatings([...ownGuides, ...firstPage])
      } catch {
        setGuides([])
        setNews(MOCK_ARTICLES.slice(0, 6))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function loadMoreNews() {
    setLoadingMore(true)
    try {
      const nextPage = newsPage + 1
      const offset = nextPage * NEWS_PER_PAGE
      const res = await fetch(`/api/articles?limit=${NEWS_PER_PAGE + 1}&category=make-money&sortBy=latest&offset=${offset - NEWS_PER_PAGE}`)
      const data = await res.json()
      if (!Array.isArray(data)) return
      const newItems = data.filter((a: Article) => a.sourceName !== 'AI Foresights').slice(0, NEWS_PER_PAGE)
      const hasMore = data.filter((a: Article) => a.sourceName !== 'AI Foresights').length > NEWS_PER_PAGE
      setNews(prev => [...prev, ...newItems])
      setHasMoreNews(hasMore)
      setNewsPage(nextPage)
      await fetchRatings(newItems)
    } catch {} finally {
      setLoadingMore(false)
    }
  }

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
            {/* ── AI Foresights Guides ── */}
            {guides.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-bold text-brand-navy">AI Foresights Guides</h2>
                  <span className="text-xs text-brand-muted">— written by our team</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guides.map((a, i) => (
                    <ArticleCard
                      key={a.id}
                      article={a}
                      variant={i === 0 ? 'featured' : 'default'}
                      ratingAverage={ratings[a.slug]?.average}
                      ratingCount={ratings[a.slug]?.count}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Latest AI Income News ── */}
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
                {hasMoreNews && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={loadMoreNews}
                      disabled={loadingMore}
                      className="px-6 py-2.5 rounded-lg bg-brand-sky text-white text-sm font-semibold hover:bg-brand-skyDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {guides.length === 0 && news.length === 0 && (
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
