'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Star, Trash2, Check, ExternalLink, Headphones, Play, ChevronDown, ChevronUp } from 'lucide-react'

interface Episode {
  youtube_id: string
  podcast_name: string
  episode_title: string
  summary: string
  duration: string
  view_count: string
  thumbnail: string
  tags: string[]
}

interface Roundup {
  id: string
  title: string
  week_of: string
  episodes: Episode[]
  is_active: boolean
  newsletter_included: boolean
  created_at: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminPodcastsPage() {
  const [roundups, setRoundups] = useState<Roundup[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadRoundups() }, [])

  async function loadRoundups() {
    setLoading(true)
    try {
      const res = await fetch('/api/podcasts?mode=all')
      setRoundups(await res.json())
    } finally { setLoading(false) }
  }

  async function generateRoundup() {
    setGenerating(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/generate-podcast-roundup')
      const data = await res.json()
      if (data.success) {
        setMsg(`✓ ${data.message}`)
        await loadRoundups()
      } else {
        setMsg('Error: ' + (data.error || 'Unknown error'))
      }
    } catch {
      setMsg('Failed to generate roundup')
    } finally { setGenerating(false) }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch('/api/podcasts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current }),
    })
    await loadRoundups()
  }

  async function toggleNewsletter(id: string, current: boolean) {
    await fetch('/api/podcasts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, newsletter_included: !current }),
    })
    await loadRoundups()
  }

  async function deleteRoundup(id: string) {
    if (!confirm('Delete this roundup?')) return
    await fetch(`/api/podcasts?id=${id}`, { method: 'DELETE' })
    await loadRoundups()
  }

  const drafts = roundups.filter(r => !r.is_active)
  const published = roundups.filter(r => r.is_active)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-brand-muted hover:text-brand-sky mb-1 block">← Admin</Link>
            <h1 className="text-2xl font-bold text-brand-navy">AI Podcast Roundup</h1>
            <p className="text-sm text-brand-muted mt-0.5">Auto-generates every Monday. Review draft and publish with one click.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/ai-podcast-roundup" target="_blank"
              className="flex items-center gap-1.5 text-sm text-brand-sky hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> View page
            </Link>
            <button onClick={generateRoundup} disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-brand-sky text-white text-sm font-semibold rounded-lg hover:bg-brand-skyDark disabled:opacity-50 transition-colors">
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate Now'}
            </button>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${msg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {msg}
          </div>
        )}

        {/* Draft alert */}
        {drafts.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <p className="text-sm font-semibold text-amber-800">
                {drafts.length} draft roundup{drafts.length > 1 ? 's' : ''} ready for review
              </p>
            </div>
            <button onClick={() => setExpanded(drafts[0].id)}
              className="text-xs font-semibold text-amber-700 hover:underline">Review →</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />)}
          </div>
        ) : roundups.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-2xl">
            <Headphones className="w-10 h-10 text-brand-muted mx-auto mb-3" />
            <p className="text-brand-slate font-semibold mb-1">No roundups yet</p>
            <p className="text-brand-muted text-sm mb-4">Auto-generates every Monday, or click Generate Now to create one immediately.</p>
            <button onClick={generateRoundup} disabled={generating} className="btn-primary text-sm">
              {generating ? 'Generating...' : 'Generate First Roundup'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {roundups.map(r => (
              <div key={r.id} className={`rounded-xl border bg-white ${r.is_active ? 'border-emerald-400' : 'border-brand-border'}`}>
                {/* Summary row */}
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {r.is_active && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">LIVE</span>}
                      {!r.is_active && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">DRAFT</span>}
                      {r.newsletter_included && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">IN NEWSLETTER</span>}
                      <span className="text-[11px] text-brand-muted">Week of {formatDate(r.week_of)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-brand-navy leading-snug">{r.title}</h3>
                    <p className="text-[11px] text-brand-muted mt-0.5">{r.episodes?.length || 0} episodes</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="p-1.5 rounded-lg bg-gray-100 text-brand-muted hover:bg-gray-200 transition-colors">
                      {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => toggleActive(r.id, r.is_active)} title={r.is_active ? 'Unpublish' : 'Publish'}
                      className={`p-1.5 rounded-lg transition-colors ${r.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-brand-muted hover:bg-emerald-50 hover:text-emerald-600'}`}>
                      <Star className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleNewsletter(r.id, r.newsletter_included)} title="Toggle newsletter"
                      className={`p-1.5 rounded-lg transition-colors ${r.newsletter_included ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-brand-muted hover:bg-blue-50'}`}>
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteRoundup(r.id)}
                      className="p-1.5 rounded-lg bg-gray-100 text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded episodes */}
                {expanded === r.id && (
                  <div className="border-t border-brand-border px-4 pb-4 pt-3 space-y-3">
                    {r.episodes?.map((ep, i) => (
                      <div key={ep.youtube_id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-brand-border">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-sky/10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-brand-sky">{i + 1}</span>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ep.thumbnail} alt={ep.episode_title} className="w-24 h-14 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-brand-sky mb-0.5">{ep.podcast_name}</p>
                          <p className="text-xs font-semibold text-brand-navy leading-snug line-clamp-1">{ep.episode_title}</p>
                          <p className="text-[11px] text-brand-slate mt-1 line-clamp-2 leading-relaxed">{ep.summary}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {ep.duration && <span className="text-[10px] text-brand-muted">{ep.duration}</span>}
                            <a href={`https://www.youtube.com/watch?v=${ep.youtube_id}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-brand-sky hover:underline">
                              <Play className="w-2.5 h-2.5" /> Watch
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Publish button for drafts */}
                    {!r.is_active && (
                      <button onClick={() => toggleActive(r.id, false)}
                        className="w-full py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors mt-2">
                        ✓ Looks good — Publish this roundup
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
