'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Rss, Pencil, Trash2, Globe, Clock } from 'lucide-react'
import {
  PageHeader, AdminModal, Field, Input, Select,
  Toggle, SaveButton, DeleteButton, EmptyState,
} from '@/components/admin/AdminUI'

interface Source {
  id: string
  name: string
  url: string
  feed_url: string | null
  source_type: string
  is_active: boolean
  last_fetched_at: string | null
  fetch_interval_minutes: number
  logo_url: string | null
  created_at: string
}

const emptySource = (): Partial<Source> => ({
  name: '',
  url: '',
  feed_url: '',
  source_type: 'rss',
  is_active: true,
  fetch_interval_minutes: 60,
  logo_url: '',
})

function SourcesContent() {
  const searchParams = useSearchParams()
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Source>>(emptySource())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sources')
      if (res.ok) setSources(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(emptySource())
      setModalOpen(true)
    }
  }, [searchParams])

  async function toggleActive(s: Source) {
    await fetch('/api/admin/sources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...s, is_active: !s.is_active }),
    })
    load()
  }

  async function handleSave() {
    setSaving(true)
    try {
      const method = editing.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/sources', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (res.ok) { setModalOpen(false); load() }
    } catch { /* silent */ }
    setSaving(false)
  }

  async function handleDelete() {
    if (!editing.id || !confirm('Delete this source?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/sources?id=${editing.id}`, { method: 'DELETE' })
      if (res.ok) { setModalOpen(false); load() }
    } catch { /* silent */ }
    setDeleting(false)
  }

  function up(f: string, v: any) { setEditing(prev => ({ ...prev, [f]: v })) }

  return (
    <div>
      <PageHeader
        title="RSS Sources"
        subtitle={`${sources.filter(s => s.is_active).length} active / ${sources.length} total`}
        action={
          <button onClick={() => { setEditing(emptySource()); setModalOpen(true) }} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-sky hover:bg-brand-skyDark text-white text-sm font-medium rounded-lg transition">
            <Plus className="w-4 h-4" /> Add Source
          </button>
        }
      />

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : sources.length === 0 ? (
          <EmptyState message="No RSS sources configured" icon={Rss} />
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {sources.map(s => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.is_active ? 'bg-emerald-500/10' : 'bg-white/[0.04]'}`}>
                  <Rss className={`w-4 h-4 ${s.is_active ? 'text-emerald-400' : 'text-slate-600'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{s.name}</span>
                    {!s.is_active && <span className="text-xs text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded">paused</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
                      <Globe className="w-3 h-3" /> {s.feed_url || s.url}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {s.fetch_interval_minutes}m
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(s)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition ${
                      s.is_active
                        ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : 'text-slate-500 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                  >
                    {s.is_active ? 'Active' : 'Paused'}
                  </button>
                  <button
                    onClick={() => { setEditing({ ...s }); setModalOpen(true) }}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-md transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Edit Source' : 'Add Source'}>
        <div className="space-y-4">
          <Field label="Name">
            <Input value={editing.name ?? ''} onChange={e => up('name', e.target.value)} placeholder="TechCrunch AI" />
          </Field>
          <Field label="Website URL">
            <Input value={editing.url ?? ''} onChange={e => up('url', e.target.value)} placeholder="https://techcrunch.com/…" />
          </Field>
          <Field label="RSS Feed URL">
            <Input value={editing.feed_url ?? ''} onChange={e => up('feed_url', e.target.value)} placeholder="https://…/feed/" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={editing.source_type ?? 'rss'} onChange={e => up('source_type', e.target.value)}>
                <option value="rss">RSS</option>
                <option value="atom">Atom</option>
                <option value="api">API</option>
              </Select>
            </Field>
            <Field label="Fetch Interval (min)">
              <Input type="number" value={editing.fetch_interval_minutes ?? 60} onChange={e => up('fetch_interval_minutes', Number(e.target.value))} />
            </Field>
          </div>
          <Toggle checked={editing.is_active ?? true} onChange={v => up('is_active', v)} label="Active" />

          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <div>{editing.id && <DeleteButton onClick={handleDelete} loading={deleting} />}</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
              <SaveButton onClick={handleSave} loading={saving} label={editing.id ? 'Update' : 'Add Source'} />
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}

export default function SourcesPage() {
  return <Suspense><SourcesContent /></Suspense>
}
