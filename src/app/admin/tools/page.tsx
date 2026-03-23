'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Star, Pencil, ExternalLink, Wrench } from 'lucide-react'
import {
  PageHeader, AdminModal, Field, Input, Textarea, Select,
  StatusBadge, Toggle, SaveButton, DeleteButton, EmptyState,
} from '@/components/admin/AdminUI'

interface Tool {
  id: string
  name: string
  slug: string
  description: string | null
  long_description: string | null
  website_url: string
  logo_url: string | null
  thumbnail_url: string | null
  category: string | null
  pricing: string
  tags: string[]
  experience_level: string
  save_count: number
  view_count: number
  status: string
  is_featured: boolean
  affiliate_url: string | null
}

const emptyTool = (): Partial<Tool> => ({
  name: '',
  description: '',
  long_description: '',
  website_url: '',
  logo_url: '',
  category: '',
  pricing: 'free',
  tags: [],
  experience_level: 'beginner',
  status: 'published',
  is_featured: false,
  affiliate_url: '',
})

function ToolsContent() {
  const searchParams = useSearchParams()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Tool>>(emptyTool())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tagsInput, setTagsInput] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    try {
      const res = await fetch(`/api/admin/tools${params}`)
      if (res.ok) setTools(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(emptyTool())
      setTagsInput('')
      setModalOpen(true)
    }
  }, [searchParams])

  function openEdit(t: Tool) {
    setEditing({ ...t })
    setTagsInput(Array.isArray(t.tags) ? t.tags.join(', ') : '')
    setModalOpen(true)
  }

  function openNew() {
    setEditing(emptyTool())
    setTagsInput('')
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    try {
      const method = editing.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/tools', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editing, tags }),
      })
      if (res.ok) { setModalOpen(false); load() }
    } catch { /* silent */ }
    setSaving(false)
  }

  async function handleDelete() {
    if (!editing.id || !confirm('Delete this tool?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/tools?id=${editing.id}`, { method: 'DELETE' })
      if (res.ok) { setModalOpen(false); load() }
    } catch { /* silent */ }
    setDeleting(false)
  }

  function up(f: string, v: any) { setEditing(prev => ({ ...prev, [f]: v })) }

  const pricingColor: Record<string, string> = {
    free: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    freemium: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    paid: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    enterprise: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  }

  return (
    <div>
      <PageHeader
        title="Tools"
        subtitle={`${tools.length} tools`}
        action={
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-sky hover:bg-brand-skyDark text-white text-sm font-medium rounded-lg transition">
            <Plus className="w-4 h-4" /> Add Tool
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search tools…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition"
        />
      </div>

      {/* Grid */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : tools.length === 0 ? (
          <EmptyState message="No tools found" icon={Wrench} />
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {tools.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-400">{t.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{t.name}</span>
                    {t.is_featured && <Star className="w-3 h-3 text-amber-400" />}
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{t.description}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${pricingColor[t.pricing] || pricingColor.free}`}>
                  {t.pricing}
                </span>
                <span className="text-xs text-slate-500 hidden sm:block">{t.save_count} saves</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(t)} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-md transition">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <a href={t.website_url} target="_blank" rel="noopener" className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-md transition">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing.id ? 'Edit Tool' : 'Add Tool'} wide>
        <div className="space-y-4">
          <Field label="Name">
            <Input value={editing.name ?? ''} onChange={e => up('name', e.target.value)} placeholder="ChatGPT" />
          </Field>
          <Field label="Description">
            <Textarea value={editing.description ?? ''} onChange={e => up('description', e.target.value)} placeholder="Short description…" rows={2} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Website URL">
              <Input value={editing.website_url ?? ''} onChange={e => up('website_url', e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Affiliate URL" hint="Leave blank if none">
              <Input value={editing.affiliate_url ?? ''} onChange={e => up('affiliate_url', e.target.value)} placeholder="https://…?ref=aif" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Pricing">
              <Select value={editing.pricing ?? 'free'} onChange={e => up('pricing', e.target.value)}>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
                <option value="enterprise">Enterprise</option>
              </Select>
            </Field>
            <Field label="Experience Level">
              <Select value={editing.experience_level ?? 'beginner'} onChange={e => up('experience_level', e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={editing.status ?? 'published'} onChange={e => up('status', e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
          </div>
          <Field label="Tags" hint="Comma-separated: Writing, Coding, Research">
            <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Writing, Coding, Research" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Logo URL">
              <Input value={editing.logo_url ?? ''} onChange={e => up('logo_url', e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Category">
              <Input value={editing.category ?? ''} onChange={e => up('category', e.target.value)} placeholder="AI Assistant" />
            </Field>
          </div>
          <Toggle checked={editing.is_featured ?? false} onChange={v => up('is_featured', v)} label="Featured tool" />

          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <div>{editing.id && <DeleteButton onClick={handleDelete} loading={deleting} />}</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
              <SaveButton onClick={handleSave} loading={saving} label={editing.id ? 'Update' : 'Add Tool'} />
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}

export default function ToolsPage() {
  return <Suspense><ToolsContent /></Suspense>
}
