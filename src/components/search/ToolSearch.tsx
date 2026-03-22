'use client'
import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { MOCK_TOOLS } from '@/lib/data'
import { Tool } from '@/lib/types'
import { pricingClass, pricingLabel, cn } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

const CATEGORIES = ['All categories','Writing & content','Image generation','Coding & dev','Productivity','Search & research','Video & audio','Business & marketing','Design']
const COMPANIES  = ['All companies','OpenAI','Anthropic','Google','Meta','Microsoft','Midjourney','Canva']
const LEVELS = [
  { id: 'brand-new',     label: 'Brand new to AI' },
  { id: 'beginner',      label: 'Beginner' },
  { id: 'intermediate',  label: 'Intermediate' },
  { id: 'professional',  label: 'Professional' },
  { id: 'business-owner',label: 'Business owner' },
]

export default function ToolSearch() {
  const [query, setQuery]     = useState('')
  const [category, setCategory] = useState('All categories')
  const [company, setCompany]   = useState('All companies')
  const [level, setLevel]       = useState('brand-new')

  const results = useMemo<Tool[]>(() => {
    return MOCK_TOOLS.filter(t => {
      const q = query.toLowerCase()
      const matchQuery = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
      const matchLevel = level === 'professional' || level === 'business-owner'
        ? t.experienceLevel !== 'advanced'
        : level === 'intermediate'
        ? t.experienceLevel !== 'advanced'
        : t.experienceLevel === 'beginner' || t.experienceLevel === 'all'
      return matchQuery && matchLevel
    }).slice(0, 3)
  }, [query, level])

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
          placeholder="Search tool or company…"
          className="w-full pl-7 pr-3 py-2 rounded-lg border border-brand-border text-[12px] bg-white outline-none focus:border-brand-sky transition-colors text-brand-navy placeholder:text-brand-muted"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg border border-brand-border text-[11px] bg-white text-brand-slate outline-none focus:border-brand-sky cursor-pointer">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={company} onChange={e => setCompany(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg border border-brand-border text-[11px] bg-white text-brand-slate outline-none focus:border-brand-sky cursor-pointer">
          {COMPANIES.map(c => <option key={c}>{c}</option>)}
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

      {/* Results preview */}
      {results.length > 0 && (
        <div className="border-t border-blue-200 pt-2.5">
          <p className="text-[10px] text-brand-sky font-medium mb-2">
            Showing tools for: {LEVELS.find(l => l.id === level)?.label}
          </p>
          {results.map(tool => (
            <div key={tool.id} className="flex items-center gap-2 py-1.5 border-b border-blue-100 last:border-0">
              <div className="w-6 h-6 rounded-md bg-white border border-brand-border flex items-center justify-center text-[9px] font-bold text-brand-slate shrink-0">
                {tool.name.charAt(0)}
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
        </div>
      )}
    </div>
  )
}
