'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, RefreshCw, Plus, Star, Trash2, Check, ExternalLink } from 'lucide-react'

interface PlaylistVideo {
  youtube_id: string
  title: string
  description: string
  channel: string
  thumbnail: string
  published_at: string
  duration: string
  view_count: string
  playlist: string
}

interface SavedVideo {
  id: string
  youtube_id: string
  title: string
  intro: string
  published_at: string
  is_active: boolean
  newsletter_included: boolean
  tags: string[]
}

function formatCount(n: string) {
  const num = parseInt(n)
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return n
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function AdminVideosPage() {
  const [playlist, setPlaylist] = useState<PlaylistVideo[]>([])
  const [saved, setSaved] = useState<SavedVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selected, setSelected] = useState<PlaylistVideo | null>(null)
  const [intro, setIntro] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'browse' | 'saved'>('browse')
  const [msg, setMsg] = useState('')

  useEffect(() => { loadSaved() }, [])

  async function loadSaved() {
    setLoading(true)
    try {
      const res = await fetch('/api/videos?mode=all')
      setSaved(await res.json())
    } finally { setLoading(false) }
  }

  async function syncPlaylists() {
    setSyncing(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/youtube-sync')
      const data = await res.json()
      if (data.videos) {
        setPlaylist(data.videos)
        setMsg(`Loaded ${data.count} videos from your playlists`)
        setTab('browse')
      } else {
        setMsg('Error: ' + (data.error || 'Unknown error'))
      }
    } catch (e) {
      setMsg('Failed to fetch playlists')
    } finally { setSyncing(false) }
  }

  async function saveVideo(setActive: boolean) {
    if (!selected || !intro.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtube_id: selected.youtube_id,
          title: selected.title,
          intro: intro.trim(),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          published_at: new Date().toISOString(),
          is_active: setActive,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg(setActive ? '✓ Published as this week\'s pick!' : '✓ Saved as draft')
        setSelected(null)
        setIntro('')
        setTags('')
        await loadSaved()
        setTab('saved')
      } else {
        setMsg('Error: ' + data.error)
      }
    } finally { setSaving(false) }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch('/api/videos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current }),
    })
    await loadSaved()
  }

  async function toggleNewsletter(id: string, current: boolean) {
    await fetch('/api/videos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, newsletter_included: !current }),
    })
    await loadSaved()
  }

  async function deleteVideo(id: string) {
    if (!confirm('Delete this video pick?')) return
    await fetch(`/api/videos?id=${id}`, { method: 'DELETE' })
    await loadSaved()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-brand-muted hover:text-brand-sky mb-1 block">← Admin</Link>
            <h1 className="text-2xl font-bold text-brand-navy">AI Video of the Week</h1>
            <p className="text-sm text-brand-muted mt-0.5">Browse your YouTube playlists and publish weekly picks</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/ai-video-of-the-week" target="_blank"
              className="flex items-center gap-1.5 text-sm text-brand-sky hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> View page
            </Link>
            <button onClick={syncPlaylists} disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-brand-sky text-white text-sm font-semibold rounded-lg hover:bg-brand-skyDark disabled:opacity-50 transition-colors">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Loading...' : 'Load from Playlists'}
            </button>
          </div>
        </div>

        {msg && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">{msg}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-200 p-1 rounded-lg w-fit">
          {(['browse', 'saved'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-slate'}`}>
              {t} {t === 'saved' ? `(${saved.length})` : playlist.length ? `(${playlist.length})` : ''}
            </button>
          ))}
        </div>

        {/* Browse tab */}
        {tab === 'browse' && (
          <div>
            {playlist.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-2xl">
                <Play className="w-10 h-10 text-brand-muted mx-auto mb-3" />
                <p className="text-brand-slate font-semibold mb-1">No videos loaded yet</p>
                <p className="text-brand-muted text-sm mb-4">Click "Load from Playlists" to fetch your YouTube videos</p>
                <button onClick={syncPlaylists} disabled={syncing}
                  className="btn-primary text-sm">
                  {syncing ? 'Loading...' : 'Load from Playlists'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Video list */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {playlist.map(v => (
                    <div key={v.youtube_id}
                      onClick={() => { setSelected(v); setIntro(''); setTags('') }}
                      className={`flex gap-3 p-3 rounded-xl cursor-pointer border transition-all ${selected?.youtube_id === v.youtube_id ? 'border-brand-sky bg-brand-sky/5' : 'border-brand-border bg-white hover:border-brand-sky/50'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.thumbnail} alt={v.title} className="w-28 h-16 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brand-navy line-clamp-2 leading-snug">{v.title}</p>
                        <p className="text-[11px] text-brand-muted mt-1">{v.channel} · {timeAgo(v.published_at)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-brand-slate">{v.playlist}</span>
                          {v.view_count !== '0' && (
                            <span className="text-[10px] text-brand-muted">{formatCount(v.view_count)} views</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit panel */}
                <div className="sticky top-4">
                  {selected ? (
                    <div className="bg-white rounded-xl border border-brand-border p-4 space-y-4">
                      <div className="aspect-video rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${selected.youtube_id}?rel=0`}
                          className="w-full h-full" allowFullScreen />
                      </div>
                      <div>
                        <h3 className="font-semibold text-brand-navy text-sm">{selected.title}</h3>
                        <p className="text-[11px] text-brand-muted mt-0.5">{selected.channel}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-navy mb-1.5">
                          Your editorial intro <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={intro}
                          onChange={e => setIntro(e.target.value)}
                          placeholder="Write 2-3 paragraphs explaining why this video matters and what your audience should watch for. Use blank lines between paragraphs."
                          rows={6}
                          className="w-full text-sm border border-brand-border rounded-lg p-3 resize-none focus:outline-none focus:border-brand-sky"
                        />
                        <p className="text-[10px] text-brand-muted mt-1">{intro.length} chars · Separate paragraphs with blank lines</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-navy mb-1.5">Tags (comma separated)</label>
                        <input
                          value={tags}
                          onChange={e => setTags(e.target.value)}
                          placeholder="e.g. ChatGPT, tools, productivity"
                          className="w-full text-sm border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-sky"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveVideo(false)} disabled={saving || !intro.trim()}
                          className="flex-1 py-2 border border-brand-border rounded-lg text-sm font-medium text-brand-slate hover:bg-gray-50 disabled:opacity-50 transition-colors">
                          Save as Draft
                        </button>
                        <button onClick={() => saveVideo(true)} disabled={saving || !intro.trim()}
                          className="flex-1 py-2 bg-brand-sky text-white rounded-lg text-sm font-semibold hover:bg-brand-skyDark disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                          <Star className="w-3.5 h-3.5" />
                          Publish This Week
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-dashed border-brand-border p-8 text-center">
                      <Play className="w-8 h-8 text-brand-muted mx-auto mb-2" />
                      <p className="text-sm text-brand-slate">Select a video from the list to write your intro and publish</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved tab */}
        {tab === 'saved' && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />)}
              </div>
            ) : saved.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-2xl">
                <p className="text-brand-slate text-sm">No videos saved yet. Browse your playlists and publish your first pick.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {saved.map(v => (
                  <div key={v.id} className={`flex gap-4 p-4 rounded-xl border bg-white ${v.is_active ? 'border-brand-sky' : 'border-brand-border'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`} alt={v.title}
                      className="w-32 h-20 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-brand-navy leading-snug">{v.title}</h3>
                          <p className="text-[11px] text-brand-muted mt-0.5">{new Date(v.published_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {v.is_active && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-sky text-white">LIVE</span>
                          )}
                          {v.newsletter_included && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">IN NEWSLETTER</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-brand-slate mt-1.5 line-clamp-2">{v.intro}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => toggleActive(v.id, v.is_active)}
                        title={v.is_active ? 'Deactivate' : 'Set as this week'}
                        className={`p-1.5 rounded-lg transition-colors ${v.is_active ? 'bg-brand-sky/10 text-brand-sky' : 'bg-gray-100 text-brand-muted hover:bg-brand-sky/10 hover:text-brand-sky'}`}>
                        <Star className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleNewsletter(v.id, v.newsletter_included)}
                        title="Toggle newsletter included"
                        className={`p-1.5 rounded-lg transition-colors ${v.newsletter_included ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-brand-muted hover:bg-emerald-50'}`}>
                        <Check className="w-4 h-4" />
                      </button>
                      <a href={`https://www.youtube.com/watch?v=${v.youtube_id}`} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-gray-100 text-brand-muted hover:text-brand-sky transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => deleteVideo(v.id)}
                        className="p-1.5 rounded-lg bg-gray-100 text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
