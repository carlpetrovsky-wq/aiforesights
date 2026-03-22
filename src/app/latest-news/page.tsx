import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import AdSlot from '@/components/ads/AdSlot'
import { MOCK_ARTICLES } from '@/lib/data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Latest AI News — AI Foresights',
  description: 'Breaking AI news and developments explained in plain English. Updated daily from top sources.',
}

export default function LatestNewsPage() {
  const articles = MOCK_ARTICLES

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-brand-navy py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Latest AI news</h1>
          <p className="text-sm text-brand-muted max-w-lg">
            Breaking AI developments explained in plain English. Aggregated daily from TechCrunch, Wired, The Verge, and more.
          </p>
        </div>
      </div>

      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full px-4 sm:px-6 my-3" />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-4">
        {/* Sort tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button className="text-xs font-semibold bg-brand-sky text-white px-3 py-1.5 rounded-lg">Latest</button>
          <button className="text-xs font-medium text-brand-slate hover:text-brand-navy px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Popular</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a, i) => (
            <div key={a.id}>
              <ArticleCard article={a} variant={a.isFeatured ? 'featured' : 'default'} />
              {/* In-feed ad every 6 articles */}
              {(i + 1) % 6 === 0 && (
                <div className="mt-4">
                  <AdSlot slot="in-feed" size="banner" />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
