'use client'
import { useState, useEffect } from 'react'
import { Send, Zap, Star, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  published_at: string
  is_featured: boolean
  category_slug: string
  thumbnail_url?: string | null
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function AdminNewsletterPage() {
  const [sendStatus, setSendStatus] = useState<Status>('idle')
  const [setupStatus, setSetupStatus] = useState<Status>('idle')
  const [sendResult, setSendResult] = useState<string>('')
  const [setupResult, setSetupResult] = useState<string>('')

  const [mmArticles, setMmArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMakeMoneyArticles()
  }, [])

  async function fetchMakeMoneyArticles() {
    setLoadingArticles(true)
    const res = await fetch('/api/admin/articles?limit=20&sortBy=published_at&sortDir=desc')
    const data = await res.json()
    const mm = (data.articles ?? []).filter((a: Article) => a.category_slug === 'make-money')
    setMmArticles(mm)
    setLoadingArticles(false)
  }

  async function toggleFeatured(article: Article) {
    setTogglingId(article.id)
    const newVal = !article.is_featured

    // If setting to featured, unflag all others first
    if (newVal) {
      await Promise.all(
        mmArticles
          .filter(a => a.is_featured && a.id !== article.id)
          .map(a =>
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
    setTogglingId(null)
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
      setSendResult(`Campaign created: "${data.subject}" — Articles: ${data.articlesCount}, Video: ${data.hasVideo ? '✓' : '✗'}, Podcast: ${data.hasPodcast ? '✓' : '✗'}, Make Money: ${data.hasMakeMoney ? '✓' : '✗'}`)
    } catch (err) {
      setSendStatus('error')
      setSendResult(err instanceof Error ? err.message : String(err))
    }
  }

  async function setupAutomations() {
    if (!confirm('Create Email 2 (Day 2) and Email 3 (Day 7) automations in MailerLite? Run this once only.')) return
    setSetupStatus('loading')
    setSetupResult('')
    try {
      const res = await fetch('/api/newsletter/setup-automations', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unknown error')
      setSetupStatus('success')
      setSetupResult(`Email 2 ID: ${data.email2AutomationId} · Email 3 ID: ${data.email3AutomationId}`)
    } catch (err) {
      setSetupStatus('error')
      setSetupResult(err instanceof Error ? err.message : String(err))
    }
  }

  const featuredArticle = mmArticles.find(a => a.is_featured)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the weekly digest and welcome sequence automations.</p>
      </div>

      {/* ── Weekly Digest ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-gray-900">Weekly Digest</h2>
        </div>
        <p className="text-sm text-gray-600">
          Automatically sent every <strong>Tuesday at 10 AM ET</strong> via GitHub Actions cron.
          Use the button below to send manually at any time — for testing or off-schedule sends.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
          <p className="font-medium text-gray-900 mb-2">What's included in each digest:</p>
          <p>🎬 Active Video of the Week (from Videos page)</p>
          <p>🎙️ Active Podcast Roundup (from Podcasts page)</p>
          <p>📰 3 most recent published articles (non-Make Money)</p>
          <p>💰 Featured Make Money guide (flagged below, or most recent)</p>
        </div>

        <button
          onClick={sendDigest}
          disabled={sendStatus === 'loading'}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          {sendStatus === 'loading' ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</>
          ) : (
            <><Send className="w-4 h-4" /> Send Digest Now</>
          )}
        </button>

        {sendResult && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${sendStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {sendStatus === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {sendResult}
          </div>
        )}
      </div>

      {/* ── Make Money Feature Pick ── */}
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
        <p className="text-sm text-gray-600">
          Star one article to feature it in this week's digest. If none is starred, the most recent Make Money article is used automatically.
        </p>

        {featuredArticle && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            <strong>Currently featured:</strong> {featuredArticle.title}
          </div>
        )}

        {loadingArticles ? (
          <p className="text-sm text-gray-400">Loading articles…</p>
        ) : mmArticles.length === 0 ? (
          <p className="text-sm text-gray-400">No Make Money articles found.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {mmArticles.map(article => (
              <div
                key={article.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${article.is_featured ? 'border-amber-300 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <button
                  onClick={() => toggleFeatured(article)}
                  disabled={togglingId === article.id}
                  className="shrink-0"
                  title={article.is_featured ? 'Unfeature' : 'Feature in digest'}
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${article.is_featured ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-400'}`}
                  />
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

      {/* ── Welcome Sequence Setup ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-500" />
          <h2 className="text-lg font-semibold text-gray-900">Welcome Sequence Setup</h2>
        </div>
        <p className="text-sm text-gray-600">
          Run this <strong>once</strong> to create Email 2 (Day 2) and Email 3 (Day 7) automations in MailerLite.
          These fire automatically for every new subscriber. Do not run again unless you need to recreate them.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
          <p>📧 <strong>Email 2 — Day 2:</strong> "Your first read is ready" — 3 recent articles snapshot</p>
          <p>📧 <strong>Email 3 — Day 7:</strong> "Every Tuesday, this lands in your inbox" — digest preview</p>
        </div>

        <button
          onClick={setupAutomations}
          disabled={setupStatus === 'loading'}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          {setupStatus === 'loading' ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Creating automations…</>
          ) : (
            <><Zap className="w-4 h-4" /> Create MailerLite Automations</>
          )}
        </button>

        {setupResult && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${setupStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {setupStatus === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {setupResult}
          </div>
        )}
      </div>

      {/* ── Cron Schedule Reference ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Automated Schedule</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between"><span>RSS fetch</span><span className="font-mono text-xs text-gray-400">4× daily (7AM, 1PM, 7PM, 1AM UTC)</span></div>
          <div className="flex justify-between"><span>Article generation</span><span className="font-mono text-xs text-gray-400">Daily 10AM UTC (5AM ET)</span></div>
          <div className="flex justify-between"><span>Weekly digest send</span><span className="font-mono text-xs text-gray-400">Tuesday 15:00 UTC (10AM ET)</span></div>
        </div>
      </div>
    </div>
  )
}
