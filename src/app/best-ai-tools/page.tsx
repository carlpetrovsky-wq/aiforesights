'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ToolCard from '@/components/tools/ToolCard'
import AdSlot from '@/components/ads/AdSlot'
import { Tool } from '@/lib/types'

const PRICING_FILTERS  = ['All', 'Free', 'Freemium', 'Paid']
const LEVEL_FILTERS    = ['All levels', 'Beginner', 'Intermediate', 'Advanced']
const CATEGORY_FILTERS = [
  'All categories',
  'Chatbots',
  'AI Agents',
  'AI Models',
  'App Builders',
  'Coding & Dev',
  'Customer Service',
  'Data & Analytics',
  'Design',
  'Education',
  'Healthcare',
  'Image Generation',
  'Productivity',
  'Search & Research',
  'Video & Audio',
  'Writing & Content',
]

export default function BestAIToolsPage() {
  const [tools, setTools]       = useState<Tool[]>([])
  const [loading, setLoading]   = useState(true)
  const [pricing, setPricing]   = useState('All')
  const [level, setLevel]       = useState('All levels')
  const [category, setCategory] = useState('All categories')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: '200' })
        if (pricing !== 'All') params.set('pricing', pricing.toLowerCase())
        if (level !== 'All levels') params.set('level', level.toLowerCase())
        if (category !== 'All categories') params.set('category', category)
        if (search) params.set('search', search)
        const res = await fetch(`/api/tools?${params}`)
        const data = await res.json()
        setTools(Array.isArray(data) ? data : [])
      } catch {
        setTools([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [pricing, level, category, search])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-brand-navy py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-emerald-400 rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Best AI tools</h1>
          <p className="text-sm text-brand-muted max-w-lg">Ranked, reviewed, and explained without the jargon. Free and paid options for every level.</p>
        </div>
      </div>
      <AdSlot slot="top-leaderboard" size="leaderboard" className="max-w-6xl mx-auto w-full px-4 sm:px-6 my-3" />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-4">
        <div className="relative mb-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tools, e.g. ChatGPT, image generation, writing..."
            className="w-full px-4 py-2.5 pl-10 border border-brand-border rounded-xl text-sm outline-none focus:border-brand-sky bg-white text-brand-navy placeholder:text-brand-muted" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-brand-slate font-medium">Category:</span>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-brand-border bg-white text-brand-slate focus:outline-none focus:border-brand-sky cursor-pointer"
            >
              {CATEGORY_FILTERS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-brand-slate">{loading ? 'Loading…' : `${tools.length} tools`}</span>
          {(pricing !== 'All' || level !== 'All levels' || category !== 'All categories' || search) && (
            <button onClick={() => { setPricing('All'); setLevel('All levels'); setCategory('All categories'); setSearch('') }}
              className="text-xs text-brand-sky hover:underline">Clear filters</button>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-36" />)}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-2xl">
            <p className="text-brand-slate text-sm">No tools match your filters.</p>
            <button onClick={() => { setPricing('All'); setLevel('All levels'); setCategory('All categories'); setSearch('') }}
              className="mt-3 text-xs text-brand-sky hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map(t => <ToolCard key={t.id} tool={t} variant="grid" />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
