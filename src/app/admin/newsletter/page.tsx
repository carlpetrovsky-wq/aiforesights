'use client'
import { useState, useEffect } from 'react'
import { Send, Star, RefreshCw, CheckCircle, AlertCircle, Wrench } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  published_at: string
  is_featured: boolean
  category_slug: string
}

interface Tool {
  id: string
  name: string
  category: string
  pricing: string
  is_featured: boolean
  website_url: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function AdminNewsletterPage() {
  const [sendStatus, setSendStatus] = useState<Status>('idle')
  const [sendResult, setSendResult] = useState<string>('')

  const [mmArticles, setMmArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [togglingArticleId, setTogglingArticleId] = useState<string | null>(null)

  const [tools, setTools] = useState<Tool[]>([])
  const [loadingTools, setLoadingTools] = useState(true)
  const [togglingToolId, setTogglingToolId] = useState<string | null>(null)
  const [toolSearch, setToolSearch] = useState('')

  useEffect(() => {
    fetchMakeMoneyArticles()
    fetchTools()
  }, [])

  async function fetchMakeMoneyArticles() {
    setLoadingArticles(true)
    const res = await fetch('/api/admin/articles?limit=20&sortBy=published_at&sortDir=desc')
    const data = await res.json()
    const mm = (data.articles ?? []).filter((a: Article) => a.category_slug === 'make-money')
    setMmArticles(mm)
    setLoadingArticles(false)
  }

  async function fetchTools() {
    setLoadingTools(true)
    const res = await fetch('/api/admin/tools?limit=100')
    const data = await res.json()
    setTools(data.tools ?? data ?? [])
    setLoadingTools(false)
  }

  async function toggleArticleFeatured(article: Article) {
    setTogglingArticleId(article.id)
    const newVal = !article.is_featured
    if (newVal) {
      await Promise.all(
        mmArticles
          .filter(a => a.is_featured && a.id !== article.id)
          .map(a => fetch('/api/admin/articles', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: a.id, is_featured: false }),
          }))
      )
    }
    await fetch('/api/admin/articles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: article.id, is_featured: newVal }),
    })
    await fetchMakeMoneyArticles()
    setTogglingArticleId(null)
  }

  async function toggleToolFeatured(tool: Tool) {
    setTogglingToolId(tool.id)
    const newVal = !tool.is_featured
    const currentlyFeatured = tools.filter(t => t.is_featured && t.id !== tool.id)
    if (newVal && currentlyFeatured.length >= 3) {
      await fetch('/api/admin/tools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentlyFeatured[0].id, is_featured: false }),
      })
    }
    await fetch('/api/admin/tools', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tool.id, is_featured: newVal }),
    })
    await fetchTools()
    setTogglingToolId(null)
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
        `Sent: "${data.subject}" — Articles: ${data.articlesCount}, Tools: ${data.toolsCount}, ` +
        `Video: ${data.hasVideo ? '✓' : '✗'}, Podcast: ${data.hasPodcast ? '✓' : '✗'}, Make Money: ${data.hasMakeMoney ? '✓' : '✗'}`
      )
    } catch (err) {
      setSendStatus('error')
      setSendResult(err instanceof Error ? err.message : String(err))
    }
  }

  const featuredArticle = mmArticles.find(a => a.is_featured)
  const featuredTools = tools.filter(t => t.is_featured)
  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(toolSearch.toLowerCase())
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
        <p className="text-sm text-gray-500 mt-1">Curate and send the weekly digest. Auto-sends every Tuesday at 10 AM ET.</p>
      </div>

      {/* Send */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-gray-900">Send Weekly Digest</h2>
        </div>
        <p className="text-sm text-gray-600">
          Auto-sends every <strong>Tuesday at 10 AM ET</strong>. Use the button below to send manually or test.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
          <p className="font-medium text-gray-900 mb-2">This week&apos;s digest includes:</p>
          <p>🎬 Active Video of the Week</p>
          <p>🎙️ Active Podcast Roundup (5 episodes)</p>
          <p>📰 3 most recent published articles</p>
          <p>🔧 Featured tools below (up to 3, or 3 most recent if none starred)</p>
          <p>💰 Featured Make Money guide below (or most recent if none starred)</p>
        </div>
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

      {/* Tools */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-semibold text-gray-900">Featured AI Tools</h2>
          </div>
          <button onClick={fetchTools} className="text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-gray-600">
          Star up to <strong>3 tools</strong> to spotlight in the digest. Falls back to 3 most recently added tools if none are starred.
        </p>
        {featuredTools.length > 0 && (
          <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 text-sm text-sky-800">
            <strong>Starred ({featuredTools.length}/3):</strong> {featuredTools.map(t => t.name).join(', ')}
          </div>
        )}
        <input
          type="text"
          placeholder="Search tools by name or category…"
          value={toolSearch}
          onChange={e => setToolSearch(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
        {loadingTools ? (
          <p className="text-sm text-gray-400">Loading tools…</p>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {filteredTools.map(tool => (
              <div
                key={tool.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${tool.is_featured ? 'border-sky-300 bg-sky-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <button
                  onClick={() => toggleToolFeatured(tool)}
                  disabled={togglingToolId === tool.id}
                  className="shrink-0"
                  title={tool.is_featured ? 'Remove from digest' : 'Add to digest'}
                >
                  <Star className={`w-5 h-5 transition-colors ${tool.is_featured ? 'fill-sky-400 text-sky-400' : 'text-gray-300 hover:text-sky-400'}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{tool.name}</p>
                    <span className="text-xs text-gray-400 shrink-0">{tool.category}</span>
                  </div>
                  <p className="text-xs text-gray-400 capitalize">{tool.pricing}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Make Money */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Featured Make Money Guide</h2>
          </div>
          <button onClick={fetchMakeMoneyArticles} className="text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-gray-600">
          Star one guide for the dark featured block at the bottom of the digest. Falls back to most recent if none starred.
        </p>
        {featuredArticle && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            <strong>Starred:</strong> {featuredArticle.title}
          </div>
        )}
        {loadingArticles ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : mmArticles.length === 0 ? (
          <p className="text-sm text-gray-400">No Make Money articles found.</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {mmArticles.map(article => (
              <div
                key={article.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${article.is_featured ? 'border-amber-300 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <button onClick={() => toggleArticleFeatured(article)} disabled={togglingArticleId === article.id} className="shrink-0">
                  <Star className={`w-5 h-5 transition-colors ${article.is_featured ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-400'}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                  <p className="text-xs text-gray-400">{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Automated Schedule</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between"><span>RSS fetch</span><span className="font-mono text-xs text-gray-400">4× daily (7AM, 1PM, 7PM, 1AM UTC)</span></div>
          <div className="flex justify-between"><span>Article generation</span><span className="font-mono text-xs text-gray-400">Daily 10AM UTC (5AM ET)</span></div>
          <div className="flex justify-between"><span>Weekly digest send</span><span className="font-mono text-xs text-gray-400">Tuesday 15:00 UTC (10AM ET)</span></div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Welcome sequence: Email 1 (immediate) → Email 2 (Day 1) → Email 3 (Day 3) — active in MailerLite</p>
      </div>
    </div>
  )
}
