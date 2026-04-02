'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Loader2, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'

interface GenerateResult {
  success: boolean
  article?: { slug: string; title: string; category_slug: string }
  url?: string
  articlesAnalyzed?: number
  error?: string
}

export default function GenerateArticlePage() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [history, setHistory] = useState<GenerateResult[]>([])

  async function generate() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() || null }),
      })
      const data: GenerateResult = await res.json()
      setResult(data)
      if (data.success) {
        setHistory(h => [data, ...h].slice(0, 10))
        setTopic('')
      }
    } catch (err) {
      setResult({ success: false, error: String(err) })
    }
    setLoading(false)
  }

  const categoryLabels: Record<string, string> = {
    'latest-news': 'Latest News',
    'future-of-ai': 'Future of AI',
    'best-ai-tools': 'Best AI Tools',
    'make-money': 'Make Money',
    'learn-ai': 'Learn AI',
  }

  const categoryColors: Record<string, string> = {
    'latest-news': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'future-of-ai': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'best-ai-tools': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'make-money': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'learn-ai': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Article Generator</h1>
        </div>
        <p className="text-sm text-slate-500">
          Synthesizes recent news into an original AI Foresights Staff article. Picks the biggest story from the last 48 hours automatically, or give it a specific topic.
        </p>
      </div>

      {/* Generator Card */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Topic <span className="text-slate-600 font-normal">(optional — leave blank to auto-pick from recent news)</span>
        </label>
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. How ChatGPT is changing the way small businesses handle customer service"
          rows={3}
          disabled={loading}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 resize-none disabled:opacity-50"
        />
        <p className="text-xs text-slate-600 mt-2 mb-4">
          Claude Sonnet writes a 650–800 word original piece, bylined as "AI Foresights Staff", and publishes it automatically.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Article
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`border rounded-xl p-5 mb-6 ${result.success
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-red-500/5 border-red-500/20'
        }`}>
          {result.success && result.article ? (
            <div>
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[result.article.category_slug] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {categoryLabels[result.article.category_slug] ?? result.article.category_slug}
                    </span>
                    {result.articlesAnalyzed && (
                      <span className="text-xs text-slate-600">analyzed {result.articlesAnalyzed} recent articles</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug">{result.article.title}</p>
                </div>
              </div>
              <div className="flex gap-3 ml-8">
                <Link
                  href={result.url!}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View article
                </Link>
                <Link
                  href="/admin/articles"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Edit in Articles
                </Link>
                <button
                  onClick={generate}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate another
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300 mb-1">Generation failed</p>
                <p className="text-xs text-red-400/80 font-mono">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Generated This Session</h2>
          <div className="space-y-3">
            {history.map((item, i) => (
              item.success && item.article ? (
                <div key={i} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${categoryColors[item.article.category_slug] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    {categoryLabels[item.article.category_slug] ?? item.article.category_slug}
                  </span>
                  <Link
                    href={item.url!}
                    target="_blank"
                    className="text-sm text-slate-300 hover:text-white transition truncate flex-1"
                  >
                    {item.article.title}
                  </Link>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">How it works</h3>
        <div className="space-y-2 text-xs text-slate-500">
          <p>1. Pulls the last 48 hours of RSS articles from your database (excluding AI Foresights articles)</p>
          <p>2. Passes them to Claude Sonnet with instructions to find the most significant trend</p>
          <p>3. Claude writes a 650–800 word plain-English explainer for your 35–65 audience</p>
          <p>4. Article is auto-published with source_name "AI Foresights" and author "AI Foresights Staff"</p>
          <p>5. It immediately appears on the relevant category page and qualifies for the homepage featured section</p>
        </div>
      </div>
    </div>
  )
}
