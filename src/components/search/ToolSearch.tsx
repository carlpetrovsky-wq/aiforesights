'use client'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Tool } from '@/lib/types'
import { pricingClass, pricingLabel, cn } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

const CATEGORIES = [
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

const LEVELS = [
  { id: 'beginner',      label: 'Brand new to AI',  value: 'beginner' },
  { id: 'intermediate',  label: 'Some experience',  value: 'intermediate' },
  { id: 'advanced',      label: 'Advanced user',    value: 'advanced' },
  { id: 'business',      label: 'Business owner',   value: 'beginner' },
]

export default function ToolSearch() {
  const [query, setQuery]       = useState('')
  const [category, setCategory] = useState('All categories')
  const [level, setLevel]       = useState('beginner')
  const [tools, setTools]       = useState<Tool[]>([])
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTools()
    }, 200)
    return () => clearTimeout(timer)
  }, [query, category, level])

  async function fetchTools() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '3' })
      if (query) params.set('search', query)
      if (category !== 'All categories') params.set('category', category)
      const selectedLevel = LEVELS.find(l => l.id === level)
      if (selectedLevel) params.set('level', selectedLevel.value)
      const res = await fetch(`/api/tools?${params}`)
      const data = await res.json()
      setTools(Array.isArray(data) ? data.slice(0, 3) : [])
    } catch {
      setTools([])
    } finally {
      setLoading(false)
    }
  }

  const selectedLevelLabel = LEVELS.find(l => l.id === level)?.label ?? ''

  return (
    <div className="border-2 border-brand-sky rounded-xl p-4 mb-4 bg-blue-50/40">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Search size={13} className="text-brand-sky shrink-0" />
        <span className="text-[12px] font-semibold text-brand-navy">Find the right AI tool</span>
      </div>

      {/* Search input */}
      <div className="relative mb-2.5">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tools…"
          className="w-full pl-7 pr-3 py-2 rounded-lg border border-brand-border text-[12px] bg-white outline-none focus:border-brand-sky transition-colors text-brand-navy placeholder:text-brand-muted"
        />
      </div>

      {/* Category dropdown */}
      <div className="mb-2.5">
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg border border-brand-border text-[11px] bg-white text-brand-slate outline-none focus:border-brand-sky cursor-pointer">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Experience pills */}
      <div className="text-[10px] font-semibold text-brand-slate mb-1.5">I am a…</div>
      <div className="flex flex-wrap gap-1 mb-3">
        {LEVELS.map(l => (
          <button key={l.id} onClick={() => setLevel(l.id)}
            className={cn(
              'text-[10px] px-2.5 py-1 rounded-full border transition-all',
              level === l.id
                ? 'bg-brand-sky text-white border-brand-sky'
                : 'bg-white text-brand-slate border-brand-border hover:border-brand-sky'
            )}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="border-t border-blue-200 pt-2.5">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-8 bg-blue-100 animate-pulse rounded" />)}
          </div>
        ) : tools.length > 0 ? (
          <>
            <p className="text-[10px] text-brand-sky font-medium mb-2">
              Showing tools for: {selectedLevelLabel}
            </p>
            {tools.map(tool => (
              <div key={tool.id} className="flex items-center gap-2 py-1.5 border-b border-blue-100 last:border-0">
                <div className="w-6 h-6 rounded-md bg-white border border-brand-border flex items-center justify-center text-[9px] font-bold text-brand-slate shrink-0 overflow-hidden">
                  {tool.logoUrl ? (
                    <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-0.5"
                      onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
                  ) : tool.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-brand-navy line-clamp-1">{tool.name}</div>
                  <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded', pricingClass(tool.pricing))}>
                    {pricingLabel(tool.pricing)}
                  </span>
                </div>
                <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="text-brand-muted hover:text-brand-sky shrink-0">
                  <ExternalLink size={10} />
                </a>
              </div>
            ))}
            <Link href="/best-ai-tools"
              className="block text-center text-[10px] text-brand-sky font-medium mt-2 hover:underline">
              View all tools →
            </Link>
          </>
        ) : (
          <p className="text-[10px] text-brand-slate text-center py-2">No tools found. <Link href="/best-ai-tools" className="text-brand-sky hover:underline">Browse all →</Link></p>
        )}
      </div>
    </div>
  )
}
