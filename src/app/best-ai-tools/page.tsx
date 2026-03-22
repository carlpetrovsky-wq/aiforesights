'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ToolCard from '@/components/tools/ToolCard'
import AdSlot from '@/components/ads/AdSlot'
import { MOCK_TOOLS } from '@/lib/data'
import { useState, useMemo } from 'react'

const PRICING_FILTERS = ['All', 'Free', 'Freemium', 'Paid']
const LEVEL_FILTERS = ['All levels', 'Brand new to AI', 'Beginner', 'Intermediate', 'Advanced']

export default function BestAIToolsPage() {
  const [pricing, setPricing] = useState('All')
  const [level, setLevel] = useState('All levels')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return MOCK_TOOLS.filter(t => {
      const matchPricing = pricing === 'All' || t.pricing.toLowerCase() === pricing.toLowerCase()
      const matchLevel = level === 'All levels' || t.experienceLevel === level.toLowerCase().replace('brand new to ai', 'beginner')
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      return matchPricing && matchLevel && matchSearch
    })
  }, [pricing, level, search])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-emerald-400 rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Best AI tools</h1>
          <p className="text-sm text-brand-muted max-w-lg">The top AI tools for professionals — ranked, reviewed, and explained without the jargon.</p>
        </div>
      </div>
      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full px-4 sm:px-6 my-3" />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-4">
        {/* Search bar */}
        <div className="relative mb-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tools, e.g. ChatGPT, image generation, writing..."
            className="w-full px-4 py-2.5 pl-10 border border-brand-border rounded-xl text-sm outline-none focus:border-brand-sky bg-white text-brand-navy placeholder:text-brand-muted" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-slate font-medium">Pricing:</span>
            {PRICING_FILTERS.map(f => (
              <button key={f} onClick={() => setPricing(f)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${pricing === f ? 'bg-brand-sky text-white' : 'text-brand-slate hover:bg-gray-100 bg-white border border-brand-border'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-brand-slate font-medium">Level:</span>
            {LEVEL_FILTERS.map(f => (
              <button key={f} onClick={() => setLevel(f)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${level === f ? 'bg-brand-navy text-white' : 'text-brand-slate hover:bg-gray-100 bg-white border border-brand-border'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-brand-slate">{filtered.length} tools found</span>
          {(pricing !== 'All' || level !== 'All levels' || search) && (
            <button onClick={() => { setPricing('All'); setLevel('All levels'); setSearch('') }}
              className="text-xs text-brand-sky hover:underline">Clear filters</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-2xl">
            <p className="text-brand-slate text-sm">No tools match your filters.</p>
            <button onClick={() => { setPricing('All'); setLevel('All levels'); setSearch('') }}
              className="mt-3 text-xs text-brand-sky hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(t => <ToolCard key={t.id} tool={t} variant="grid" />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
