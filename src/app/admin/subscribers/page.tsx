'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Download, Users, Mail, Calendar, MapPin, Pencil, Trash2, UserX, UserCheck } from 'lucide-react'
import {
  PageHeader, AdminModal, Field, Input, Textarea,
  Toggle, SaveButton, DeleteButton, EmptyState,
  SortableHeader, useSortedData,
} from '@/components/admin/AdminUI'

interface Subscriber {
  id: string
  email: string
  name: string | null
  first_name: string | null
  last_name: string | null
  city: string | null
  state: string | null
  country: string | null
  ip_address: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  is_active: boolean
  source: string | null
  subscribed_at: string
  unsubscribed_at: string | null
}

export default function SubscribersPage() {
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { sorted: sortedSubs, sortKey, sortDir, handleSort } = useSortedData(subs)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Subscriber>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}&t=${Date.now()}` : `?t=${Date.now()}`
    try {
      const res = await fetch(`/api/admin/subscribers${params}`)
      if (res.ok) setSubs(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  function handleExport() {
    window.open('/api/admin/subscribers?format=csv', '_blank')
  }

  function openEdit(s: Subscriber) {
    setEditing({ ...s })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!editing.id) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (res.ok) { setModalOpen(false); load() }
    } catch { /* silent */ }
    setSaving(false)
  }

  async function handleDelete() {
    if (!editing.id || !confirm('Permanently delete this subscriber? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/subscribers?id=${editing.id}`, { method: 'DELETE' })
      if (res.ok) { setModalOpen(false); load() }
    } catch { /* silent */ }
    setDeleting(false)
  }

  async function toggleStatus(s: Subscriber) {
    await fetch('/api/admin/subscribers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
    })
    load()
  }

  function up(f: string, v: any) { setEditing(prev => ({ ...prev, [f]: v })) }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const activeCount = subs.filter(s => s.is_active).length

  return (
    <div>
      <PageHeader
        title="Subscribers"
        subtitle={`${activeCount} active / ${subs.length} total`}
        action={
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-sm font-medium rounded-lg transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by email, name, or city…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : subs.length === 0 ? (
          <EmptyState message="No subscribers yet" icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <SortableHeader label="Email"    sortKey="email"          activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Name"     sortKey="first_name"     activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                  <SortableHeader label="Location" sortKey="city"           activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortableHeader label="Source"   sortKey="source"         activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                  <SortableHeader label="Signed Up" sortKey="subscribed_at" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                  <SortableHeader label="Status"   sortKey="is_active"      activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} />
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sortedSubs.map(s => {
                  const displayName = [s.first_name, s.last_name].filter(Boolean).join(' ') || s.name || '—'
                  const location = [s.city, s.state, s.country].filter(Boolean).join(', ') || '—'
                  return (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition group">
                      <td className="px-4 py-3 text-slate-200 font-medium">{s.email}</td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{displayName}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">{location}</td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{s.source || 'website'}</td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{formatDate(s.subscribed_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleStatus(s)}
                          className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-md border cursor-pointer transition ${
                            s.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                          title={s.is_active ? 'Click to unsubscribe' : 'Click to reactivate'}
                        >
                          {s.is_active ? 'active' : 'unsubscribed'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(s)}
                            className="p-1.5 text-slate-600 hover:text-white hover:bg-white/[0.06] rounded-md transition"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Subscriber" wide>
        <div className="space-y-4">
          <Field label="Email">
            <Input value={editing.email ?? ''} disabled className="opacity-60 cursor-not-allowed" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name">
              <Input value={editing.first_name ?? ''} onChange={e => up('first_name', e.target.value)} placeholder="First name" />
            </Field>
            <Field label="Last Name">
              <Input value={editing.last_name ?? ''} onChange={e => up('last_name', e.target.value)} placeholder="Last name" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City">
              <Input value={editing.city ?? ''} onChange={e => up('city', e.target.value)} placeholder="City" />
            </Field>
            <Field label="State">
              <Input value={editing.state ?? ''} onChange={e => up('state', e.target.value)} placeholder="State" />
            </Field>
            <Field label="Country">
              <Input value={editing.country ?? ''} onChange={e => up('country', e.target.value)} placeholder="Country" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="IP Address" hint="Auto-captured on signup (future)">
              <Input value={editing.ip_address ?? ''} onChange={e => up('ip_address', e.target.value)} placeholder="192.168.1.1" />
            </Field>
            <Field label="Source">
              <Input value={editing.source ?? ''} onChange={e => up('source', e.target.value)} placeholder="website" />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea value={editing.notes ?? ''} onChange={e => up('notes', e.target.value)} placeholder="Internal notes about this subscriber…" rows={2} />
          </Field>

          <Toggle
            checked={editing.is_active ?? true}
            onChange={v => up('is_active', v)}
            label={editing.is_active ? 'Active subscriber' : 'Unsubscribed'}
          />

          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <DeleteButton onClick={handleDelete} loading={deleting} />
            <div className="flex items-center gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
              <SaveButton onClick={handleSave} loading={saving} />
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
