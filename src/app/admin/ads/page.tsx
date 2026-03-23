'use client'

import { useEffect, useState, useCallback } from 'react'
import { Megaphone, Pencil, Check, X } from 'lucide-react'
import {
  PageHeader, AdminModal, Field, Input, Textarea,
  Toggle, SaveButton, EmptyState,
  SortableHeader, useSortedData,
} from '@/components/admin/AdminUI'

interface AdSlot {
  id: string
  slot_id: string
  label: string | null
  size: string | null
  position: string | null
  is_active: boolean
  adsense_unit_id: string | null
  custom_html: string | null
  notes: string | null
}

export default function AdsPage() {
  const [slots, setSlots] = useState<AdSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<AdSlot>>({})
  const [saving, setSaving] = useState(false)
  const { sorted: sortedSlots, sortKey, sortDir, handleSort } = useSortedData(slots)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ads')
      if (res.ok) setSlots(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleActive(slot: AdSlot) {
    await fetch('/api/admin/ads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...slot, is_active: !slot.is_active }),
    })
    load()
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (res.ok) { setModalOpen(false); load() }
    } catch { /* silent */ }
    setSaving(false)
  }

  function up(f: string, v: any) { setEditing(prev => ({ ...prev, [f]: v })) }

  const sizeColors: Record<string, string> = {
    leaderboard: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    rectangle: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    banner: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }

  return (
    <div>
      <PageHeader
        title="Ad Slots"
        subtitle={`${slots.filter(s => s.is_active).length} active / ${slots.length} total`}
      />

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : slots.length === 0 ? (
          <EmptyState message="No ad slots configured" icon={Megaphone} />
        ) : (
          <table className="w-full">
            <thead className="bg-white/[0.03] border-b border-white/[0.06]">
              <tr>
                <SortableHeader label="Slot"     sortKey="label"     activeSortKey={sortKey as string} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Position" sortKey="position"  activeSortKey={sortKey as string} sortDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                <SortableHeader label="Size"     sortKey="size"      activeSortKey={sortKey as string} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                <SortableHeader label="Status"   sortKey="is_active" activeSortKey={sortKey as string} sortDir={sortDir} onSort={handleSort} />
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sortedSlots.map(slot => (
                <tr key={slot.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${slot.is_active ? 'bg-emerald-500/10' : 'bg-white/[0.04]'}`}>
                        <Megaphone className={`w-4 h-4 ${slot.is_active ? 'text-emerald-400' : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{slot.label || slot.slot_id}</div>
                        {slot.adsense_unit_id && <div className="text-xs text-emerald-500/70">AdSense configured</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">{slot.position || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sizeColors[slot.size || ''] || 'bg-white/[0.04] text-slate-500 border-white/[0.08]'}`}>
                      {slot.size || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${slot.is_active ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-slate-500 border-white/[0.08] bg-white/[0.03]'}`}>
                      {slot.is_active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing({ ...slot }); setModalOpen(true) }} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-md transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-slate-600 mt-4">
        Ad slots are pre-positioned on the site. Toggle them on/off and add your AdSense unit IDs when your account is approved.
      </p>

      {/* Edit Modal */}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={`Edit: ${editing.label || editing.slot_id || 'Ad Slot'}`}>
        <div className="space-y-4">
          <Field label="Label">
            <Input value={editing.label ?? ''} onChange={e => up('label', e.target.value)} placeholder="Top Leaderboard" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Size">
              <Input value={editing.size ?? ''} onChange={e => up('size', e.target.value)} placeholder="leaderboard" />
            </Field>
            <Field label="Position">
              <Input value={editing.position ?? ''} onChange={e => up('position', e.target.value)} placeholder="Above fold" />
            </Field>
          </div>
          <Field label="AdSense Unit ID" hint="Paste from your AdSense account when approved">
            <Input value={editing.adsense_unit_id ?? ''} onChange={e => up('adsense_unit_id', e.target.value)} placeholder="ca-pub-xxxxx / slot-xxxxx" />
          </Field>
          <Field label="Custom HTML" hint="Override with custom ad code if needed">
            <Textarea value={editing.custom_html ?? ''} onChange={e => up('custom_html', e.target.value)} placeholder="<div>…</div>" rows={3} />
          </Field>
          <Field label="Notes">
            <Input value={editing.notes ?? ''} onChange={e => up('notes', e.target.value)} placeholder="Internal notes…" />
          </Field>
          <Toggle checked={editing.is_active ?? true} onChange={v => up('is_active', v)} label="Active" />

          <div className="flex justify-end pt-4 border-t border-white/[0.06] gap-3">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
            <SaveButton onClick={handleSave} loading={saving} />
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
