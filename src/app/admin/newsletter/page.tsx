'use client'
import { useState, useEffect, useRef } from 'react'
import { Send, Star, RefreshCw, CheckCircle, AlertCircle, Wrench, Search } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  published_at: string
  is_featured: boolean
  category_slug: string
  source_name?: string | null
  thumbnail_url?: string | null
}

interface Tool {
  id: string
  name: string
  slug: string
  description: string
  category?: string | null
  pricing?: string | null
  logo_url?: string | null
  newsletter_featured?: boolean
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const PRICING_COLORS: Record<string, string> = {
  free: '#16a34a',
  freemium: '#0EA5E9',
  paid: '#94a3b8',
}

export default function AdminNewsletterPage() {
  const [sendStatus, setSendStatus] = useState<Status>('idle')
  const [sendResult, setSendResult] = useState<string>('')

  const [mmArticles, setMmArticles] = useState<Article[]>([])
  const [loadingMM, setLoadingMM] = useState(true)
  const [togglingMM, setTogglingMM] = useState<string | null>(null)

  const [tools, setTools] = useState<Tool[]>([])
  const [loadingTools, setLoadingTools] = useState(true)
  const [togglingTool, setTogglingTool] = useState<string | null>(null)
  const [toolSearch, setToolSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMakeMoneyArticles()
    fetchAllTools()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchAllTools(toolSearch), 300)
    return () => clearTimeout(t)
  }, [toolSearch])

  async function fetchMakeMoneyArticles() {
    setLoadingMM(true)
    const res = await fetch('/api/admin/articles?limit=50&category=make-money&source=AI+Foresights&sortBy=published_at&sortDir=desc')
    const data = await res.json()
    setMmArticles(data.articles ?? [])
    setLoadingMM(false)
  }

  async function fetchAllTools(search = '') {
    setLoadingTools(true)
    const url = search ? `/api/admin/tools?search=${encodeURIComponent(search)}` : '/api/admin/tools'
    const res = await fetch(url)
    const data = await res.json()
    setTools(Array.isArray(data) ? data : [])
    setLoadingTools(false)
  }

  async function toggleMM(article: Article) {
    setTogglingMM(article.id)
    const newVal = !article.is_featured
    if (newVal) {
      await Promise.all(
        mmArticles.filter(a => a.is_featured && a.id !== article.id).map(a =>
          fetch('/api/admin/articles', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: a.id, is_featured: false }),
          })
        )
      )
    }
    await fetch('/api/admin/articles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: article.id, is_featured: newVal }),
    })
    await fetchMakeMoneyArticles()
    setTogglingMM(null)
  }

  async function toggleTool(tool: Tool) {
    const newVal = !tool.newsletter_featured
    const currentCount = tools.filter(t => t.newsletter_featured).length
    if (newVal && currentCount >= 3) {
      alert('Maximum 3 tools. Unselect one first.')
      return
    }
    setTogglingTool(tool.id)
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tool.id, newsletter_featured: newVal }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.error || 'Update failed'
        if (msg.includes('newsletter_featured') || msg.includes('column')) {
          alert('The newsletter_featured column is missing from the tools table.\n\nRun this in Supabase SQL editor:\n\nALTER TABLE tools ADD COLUMN IF NOT EXISTS newsletter_featured boolean DEFAULT false;')
        } else {
          alert(`Error: ${msg}`)
        }
        setTogglingTool(null)
        return
      }
    } catch (err) {
      alert(`Network error: ${err instanceof Error ? err.message : String(err)}`)
      setTogglingTool(null)
      return
    }
    await fetchAllTools(toolSearch)
    setTogglingTool(null)
  }

  async function sendDigest() {
    if (!confirm('Send the weekly digest to all subscribers now?')) return
    setSendStatus('loading')
    setSendResult('')
    try {
      const res = await fetch('/api/newsletter/send-weekly', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unknown error')
      setSendStatus('success')
      setSendResult(
        `"${data.subject}" scheduled — ` +
        `Articles: ${data.articlesCount}, Tools: ${data.toolsCount}, ` +
        `Video: ${data.hasVideo ? '✓' : '✗'}, Podcast: ${data.hasPodcast ? '✓' : '✗'}, Make Money: ${data.hasMakeMoney ? '✓' : '✗'}`
      )
    } catch (err) {
      setSendStatus('error')
      setSendResult(err instanceof Error ? err.message : String(err))
    }
  }

  const featuredMM = mmArticles.find(a => a.is_featured)
  const featuredTools = tools.filter(t => t.newsletter_featured)
  const filteredTools = toolSearch
    ? tools.filter(t =>
        t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(toolSearch.toLowerCase())
      )
    : tools

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
        <p className="text-sm text-gray-500 mt-1">Curate and send the weekly Tuesday digest.</p>
      </div>

      {/* Summary */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-sky-900 mb-3">This week&apos;s digest will include:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-sky-800">
          <span>🎬 Active Video of the Week</span>
          <span>🎙️ Active Podcast Roundup</span>
          <span>📰 3 most recent articles</span>
          <span>🔧 {featuredTools.length > 0 ? `${featuredTools.length} featured tool${featuredTools.length > 1 ? 's' : ''}` : '3 most recent tools (auto)'}</span>
          <span>💰 {featuredMM ? 'Starred guide (below)' : 'Most recent guide (auto)'}</span>
        </div>
      </div>

      {/* Tools picker */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-semibold text-gray-900">Featured AI Tools</h2>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{featuredTools.length}/3</span>
          </div>
          <button onClick={() => fetchAllTools(toolSearch)} className="text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600">Select up to 3 tools to spotlight this week. If none selected, 3 most recently added tools are used.</p>

        {featuredTools.length > 0 && (
          <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 space-y-1.5">
            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Selected:</p>
            {featuredTools.map(t => (
              <div key={t.id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-sky-900">{t.name}</span>
                <button onClick={() => toggleTool(t)} className="text-xs text-sky-600 hover:text-red-500 font-medium">Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            value={toolSearch}
            onChange={e => setToolSearch(e.target.value)}
            placeholder="Search tools by name or category…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        {loadingTools ? (
          <p className="text-sm text-gray-400">Loading tools…</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {filteredTools.slice(0, 40).map(tool => (
              <div
                key={tool.id}
                onClick={() => !togglingTool && toggleTool(tool)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  tool.newsletter_featured ? 'border-sky-300 bg-sky-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {tool.logo_url ? (
                  <img src={tool.logo_url} alt="" width={32} height={32} className="w-8 h-8 rounded-md object-contain shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-gray-100 shrink-0 flex items-center justify-center text-xs font-bold text-gray-400">
                    {tool.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{tool.name}</p>
                    {tool.pricing && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
                        style={{ color: PRICING_COLORS[tool.pricing] || '#94a3b8', backgroundColor: (PRICING_COLORS[tool.pricing] || '#94a3b8') + '18' }}>
                        {tool.pricing === 'freemium' ? 'Free plan' : tool.pricing}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{tool.category}</p>
                </div>
                <div className="shrink-0">
                  {togglingTool === tool.id
                    ? <RefreshCw className="w-4 h-4 text-gray-300 animate-spin" />
                    : tool.newsletter_featured
                      ? <CheckCircle className="w-5 h-5 text-sky-500" />
                      : <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Make Money picker */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Featured Make Money Guide</h2>
          </div>
          <button onClick={fetchMakeMoneyArticles} className="text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600">Star one article. If none starred, the most recent guide is used automatically.</p>

        {featuredMM && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
            <strong>Starred:</strong> {featuredMM.title}
          </div>
        )}

        {loadingMM ? <p className="text-sm text-gray-400">Loading…</p> : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {mmArticles.map(article => (
              <div
                key={article.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  article.is_featured ? 'border-amber-300 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button onClick={() => togglingMM !== article.id && toggleMM(article)} disabled={togglingMM === article.id} className="shrink-0">
                  <Star className={`w-5 h-5 transition-colors ${article.is_featured ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-400'}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-gray-900">Send Digest</h2>
        </div>
        <p className="text-sm text-gray-600">Auto-sends every <strong>Tuesday at 10 AM ET</strong>. Use this for manual or test sends.</p>

        <button
          onClick={sendDigest}
          disabled={sendStatus === 'loading'}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          {sendStatus === 'loading'
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</>
            : <><Send className="w-4 h-4" /> Send Digest Now</>}
        </button>

        {sendResult && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${sendStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {sendStatus === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {sendResult}
          </div>
        )}
      </div>

      {/* Schedule reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Automated Schedule</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between"><span>RSS fetch</span><span className="font-mono text-xs text-gray-400">4× daily</span></div>
          <div className="flex justify-between"><span>Article generation</span><span className="font-mono text-xs text-gray-400">Daily 5AM ET</span></div>
          <div className="flex justify-between"><span>Weekly digest</span><span className="font-mono text-xs text-gray-400">Tuesday 10AM ET</span></div>
        </div>
        <p className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <strong>Welcome sequence:</strong> Email 2 → Day 1 · Email 3 → Day 3 · Managed in MailerLite → Automations
        </p>
      </div>
    </div>
  )
}
