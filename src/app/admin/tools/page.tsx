'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Star, Pencil, ExternalLink, Wrench, RefreshCw, AlertTriangle, CheckCircle, ArrowRight, Link2Off, DollarSign } from 'lucide-react'
import {
  PageHeader, AdminModal, Field, Input, Textarea, Select,
  StatusBadge, Toggle, SaveButton, DeleteButton, EmptyState,
  SortableHeader, useSortedData,
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
  // Validation tracking
  validation_status: string
  last_validated_at: string | null
  validation_message: string | null
  // Affiliate tracking
  affiliate_status: string
  affiliate_network: string | null
  commission_rate: string | null
  commission_type: string | null
  // Discovery tracking
  product_hunt_id: string | null
  discovery_source: string
  created_at: string
  updated_at: string | null
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
  validation_status: 'unknown',
  affiliate_status: 'none',
  affiliate_network: '',
  commission_rate: '',
  commission_type: '',
  discovery_source: 'manual',
})

function ToolsContent() {
  const searchParams = useSearchParams()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [validationFilter, setValidationFilter] = useState<string>('all')
  const [affiliateFilter, setAffiliateFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Tool>>(emptyTool())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [validating, setValidating] = useState(false)
  const { sorted: sortedTools, sortKey, sortDir, handleSort } = useSortedData(tools)
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

  const validationColor: Record<string, string> = {
    valid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    broken: 'text-red-400 bg-red-500/10 border-red-500/20',
    redirected: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    timeout: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    unknown: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  }

  const affiliateColor: Record<string, string> = {
    none: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  // Filter tools based on dropdown selections
  const filteredTools = sortedTools.filter(t => {
    if (validationFilter !== 'all' && t.validation_status !== validationFilter) return false
    if (affiliateFilter !== 'all' && t.affiliate_status !== affiliateFilter) return false
    return true
  })

  // Counts for filter labels
  const validationCounts = {
    valid: tools.filter(t => t.validation_status === 'valid').length,
    broken: tools.filter(t => t.validation_status === 'broken').length,
    redirected: tools.filter(t => t.validation_status === 'redirected').length,
    unknown: tools.filter(t => t.validation_status === 'unknown' || !t.validation_status).length,
  }

  async function runValidation() {
    if (!confirm('Run URL validation on all tools? This may take a minute.')) return
    setValidating(true)
    try {
      const res = await fetch('/api/cron/validate-tools', {
        headers: { 'Authorization': 'Bearer aiforesights-cron-2026' }
      })
      const data = await res.json()
      if (data.success) {
        alert(`Validation complete!\n\nValid: ${data.summary.valid}\nBroken: ${data.summary.broken}\nRedirected: ${data.summary.redirected}`)
        load()
      }
    } catch { alert('Validation failed') }
    setValidating(false)
  }

  return (
    <div>
      <PageHeader
        title="Tools"
        subtitle={`${tools.length} tools`}
        action={
          <div className="flex items-center gap-2">
            <button 
              onClick={runValidation} 
              disabled={validating}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-sm font-medium rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${validating ? 'animate-spin' : ''}`} />
              {validating ? 'Validating…' : 'Validate URLs'}
            </button>
            <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-sky hover:bg-brand-skyDark text-white text-sm font-medium rounded-lg transition">
              <Plus className="w-4 h-4" /> Add Tool
            </button>
          </div>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tools…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition"
          />
        </div>
        <select
          value={validationFilter}
          onChange={e => setValidationFilter(e.target.value)}
          className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-sky/30"
        >
          <option value="all">All URLs ({tools.length})</option>
          <option value="valid">✓ Valid ({validationCounts.valid})</option>
          <option value="broken">✗ Broken ({validationCounts.broken})</option>
          <option value="redirected">→ Redirected ({validationCounts.redirected})</option>
          <option value="unknown">? Unknown ({validationCounts.unknown})</option>
        </select>
        <select
          value={affiliateFilter}
          onChange={e => setAffiliateFilter(e.target.value)}
          className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-sky/30"
        >
          <option value="all">All Affiliates</option>
          <option value="none">No Affiliate</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : tools.length === 0 ? (
          <EmptyState message="No tools found" icon={Wrench} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Tool</th>
                  <SortableHeader label="URL" sortKey="validation_status" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                  <SortableHeader label="Affiliate" sortKey="affiliate_status" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                  <SortableHeader label="Pricing" sortKey="pricing" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortableHeader label="Category" sortKey="category" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden xl:table-cell" />
                  <SortableHeader label="Status" sortKey="status" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} />
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredTools.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-slate-400">{t.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-slate-200 truncate">{t.name}</span>
                            {t.is_featured && <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{t.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span 
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${validationColor[t.validation_status] || validationColor.unknown}`}
                        title={t.validation_message || undefined}
                      >
                        {t.validation_status === 'valid' && <CheckCircle className="w-3 h-3" />}
                        {t.validation_status === 'broken' && <Link2Off className="w-3 h-3" />}
                        {t.validation_status === 'redirected' && <ArrowRight className="w-3 h-3" />}
                        {t.validation_status === 'unknown' && <AlertTriangle className="w-3 h-3" />}
                        {!t.validation_status && <AlertTriangle className="w-3 h-3" />}
                        {t.validation_status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${affiliateColor[t.affiliate_status] || affiliateColor.none}`}>
                        {t.affiliate_status === 'approved' && <DollarSign className="w-3 h-3" />}
                        {t.affiliate_status || 'none'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${pricingColor[t.pricing] || pricingColor.free}`}>
                        {t.pricing}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 hidden xl:table-cell">{t.category || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(t)} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-md transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <a href={t.website_url} target="_blank" rel="noopener" className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-md transition">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          {/* Affiliate Section */}
          <div className="pt-4 border-t border-white/[0.06]">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Affiliate Program</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Affiliate Status">
                <Select value={editing.affiliate_status ?? 'none'} onChange={e => up('affiliate_status', e.target.value)}>
                  <option value="none">No Affiliate</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </Field>
              <Field label="Network">
                <Select value={editing.affiliate_network ?? ''} onChange={e => up('affiliate_network', e.target.value)}>
                  <option value="">Select network…</option>
                  <option value="Impact">Impact</option>
                  <option value="PartnerStack">PartnerStack</option>
                  <option value="ShareASale">ShareASale</option>
                  <option value="CJ">CJ Affiliate</option>
                  <option value="Awin">Awin</option>
                  <option value="Amazon">Amazon Associates</option>
                  <option value="Direct">Direct</option>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Field label="Commission Rate" hint="e.g. 30% recurring, Up to $200/sale">
                <Input value={editing.commission_rate ?? ''} onChange={e => up('commission_rate', e.target.value)} placeholder="30% recurring" />
              </Field>
              <Field label="Commission Type">
                <Select value={editing.commission_type ?? ''} onChange={e => up('commission_type', e.target.value)}>
                  <option value="">Select type…</option>
                  <option value="one-time">One-time</option>
                  <option value="recurring">Recurring</option>
                  <option value="per-signup">Per Signup</option>
                </Select>
              </Field>
            </div>
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
