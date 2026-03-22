'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import ToolCard from '@/components/tools/ToolCard'
import AdSlot from '@/components/ads/AdSlot'
import NewsletterForm from '@/components/ui/NewsletterForm'
import ToolSearch from '@/components/search/ToolSearch'
import LearningHub from '@/components/learning/LearningHub'
import Link from 'next/link'
import { MOCK_ARTICLES, MOCK_TOOLS, MOCK_LEARNING, CATEGORIES, RSS_SOURCES } from '@/lib/data'

export default function HomePage() {
  const featured = MOCK_ARTICLES.filter(a => a.isFeatured).slice(0, 3)
  const latest   = MOCK_ARTICLES.filter(a => !a.isFeatured).slice(0, 6)
  const topTools = MOCK_TOOLS.slice(0, 5)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="bg-brand-navy py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-sky/15 text-brand-skyLight text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-brand-skyLight rounded-full animate-pulse-dot" />
            Updated daily · Plain-English summaries
          </div>
          <h1 className="text-hero font-bold text-white mb-3 max-w-xl">
            The world of AI,<br />
            explained in{' '}
            <span className="text-brand-skyLight italic">plain English</span>
          </h1>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed max-w-lg mb-6">
            Fresh AI news, tool reviews, and beginner-friendly guides — for professionals navigating the AI revolution. No jargon. No coding required.
          </p>
          <NewsletterForm variant="hero" />
          <div className="flex flex-wrap gap-4 mt-4">
            {[['2,400+','subscribers'],['Daily','updates'],['50+','tools reviewed'],['Free','forever']].map(([val, lab]) => (
              <div key={lab} className="text-xs text-brand-muted">
                <strong className="text-white font-semibold">{val}</strong> {lab}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD SLOT 1 ─────────────────────────────────────────── */}
      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full my-3 px-4 sm:px-6" />

      {/* ── CATEGORIES ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-2 pb-1">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/${cat.slug}`}
              className="border border-brand-border rounded-xl p-3 bg-white hover:border-brand-sky transition-colors group">
              <div className="w-2 h-2 rounded-full mb-2" style={{ background: cat.dotColor }} />
              <h4 className="text-[12px] font-semibold text-brand-navy mb-0.5 group-hover:text-brand-sky transition-colors">
                {cat.label}
              </h4>
              <p className="text-[10px] text-brand-slate">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SOURCES STRIP ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-brand-muted shrink-0">Sources:</span>
          {RSS_SOURCES.map(s => (
            <span key={s} className="text-[10px] bg-white border border-brand-border text-brand-slate px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT + SIDEBAR ────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 py-4">

          {/* ── LEFT: Main feed ─────────────────────────────── */}
          <div>
            {/* Featured */}
            <div className="section-header">
              <h2 className="section-title">Featured stories</h2>
              <Link href="/latest-news" className="text-xs text-brand-sky hover:underline">View all news →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3 mb-6">
              {featured[0] && (
                <div className="sm:row-span-2">
                  <ArticleCard article={featured[0]} variant="featured" />
                </div>
              )}
              {featured.slice(1).map(a => (
                <ArticleCard key={a.id} article={a} variant="default" />
              ))}
            </div>

            {/* Latest news */}
            <div className="section-header">
              <h2 className="section-title">Latest news</h2>
              <Link href="/latest-news" className="text-xs text-brand-sky hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {latest.slice(0, 3).map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>

            {/* AD SLOT 3 — in-feed */}
            <div className="bg-amber-50 border border-dashed border-amber-200 rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[9px] font-semibold text-amber-600 uppercase tracking-widest mb-0.5">Sponsored · Ad Slot 3</div>
                <p className="text-[12px] text-amber-800">Jasper AI — Write marketing copy 10× faster. Trusted by 100,000+ professionals.</p>
              </div>
              <a href="https://jasper.ai" target="_blank" rel="noopener noreferrer sponsored"
                className="shrink-0 bg-amber-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-500 transition-colors whitespace-nowrap">
                Try free →
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {latest.slice(3, 6).map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>

          {/* ── RIGHT: Sidebar ──────────────────────────────── */}
          <aside>
            {/* Smart tool search */}
            <ToolSearch />

            {/* Newsletter */}
            <NewsletterForm variant="sidebar" />

            {/* Top tools */}
            <div className="mb-4">
              <div className="section-header">
                <h3 className="section-title text-[13px]">Top AI tools</h3>
                <Link href="/best-ai-tools" className="text-[11px] text-brand-sky hover:underline">View all →</Link>
              </div>
              <div className="bg-white border border-brand-border rounded-xl p-3">
                {topTools.map(t => (
                  <ToolCard key={t.id} tool={t} variant="sidebar" />
                ))}
              </div>
            </div>

            {/* AD SLOT 2 — sidebar */}
            <AdSlot slot="sidebar" size="rectangle" />
          </aside>
        </div>
      </div>

      {/* ── LEARNING HUB ──────────────────────────────────────── */}
      <LearningHub resources={MOCK_LEARNING} />

      {/* ── AD SLOTS 4 & 5 ────────────────────────────────────── */}
      <div className="bg-brand-bg border-t border-brand-border py-3 px-4 sm:px-6">
        <AdSlot slot="bottom-leaderboard" size="leaderboard" className="max-w-6xl mx-auto" />
      </div>
      <div className="bg-brand-bg py-2 px-4 sm:px-6">
        <AdSlot slot="pre-footer" size="banner" className="max-w-6xl mx-auto" />
      </div>

      {/* ── NEWSLETTER SECTION ────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <NewsletterForm variant="inline" />
      </div>

      <Footer />
    </div>
  )
}
