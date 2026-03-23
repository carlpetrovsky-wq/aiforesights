'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Star, ExternalLink, Pencil, Trash2, FileText } from 'lucide-react'
import {
  PageHeader, AdminModal, Field, Input, Textarea, Select,
  StatusBadge, Toggle, SaveButton, DeleteButton, EmptyState,
} from '@/components/admin/AdminUI'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  summary: string | null
  thumbnail_url: string | null
  source_url: string
  source_name: string | null
  category_slug: string | null
  author: string | null
  published_at: string | null
  status: string
  is_featured: boolean
  tags: string[]
  vote_count: number
  view_count: number
  created_at: string
}

const emptyArticle = (): Partial<Article> => ({
  title: '',
  excerpt: '',
  content: '',
  summary: '',
  source_url: '',
  source_name: '',
  category_slug: 'latest-news',
  author: '',
  status: 'draft',
  is_featured: false,
  tags: [],
  thumbnail_url: '',
})

const categories = [
  { slug: 'latest-news', label: 'Latest News' },
  { slug: 'future-of-ai', label: 'Future of AI' },
  { slug: 'best-ai-tools', label: 'Best AI Tools' },
  { slug: 'make-money', label: 'Make Money with AI' },
  { slug: 'learn-ai', label: 'Learn AI' },
]

export default function ArticlesPage() {
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Article>>(emptyArticle())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    try {
      const res = await fetch(`/api/admin/articles?${params}`)
      if (res.ok) setArticles(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [statusFilter, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(emptyArticle())
      setModalOpen(true)
    }
  }, [searchParams])

  function openNew() {
    setEditing(emptyArticle())
    setModalOpen(true)
  }

  function openEdit(a: Article) {
    setEditing({ ...a })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const method = editing.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/articles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (res.ok) {
        setModalOpen(false)
        load()
      }
    } catch { /* silent */ }
    setSaving(false)
  }

  async function handleDelete() {
    if (!editing.id || !confirm('Delete this article?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/articles?id=${editing.id}`, { method: 'DELETE' })
      if (res.ok) {
        setModalOpen(false)
        load()
      }
    } catch { /* silent */ }
    setDeleting(false)
  }

  function up(field: string, value: any) {
    setEditing(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <PageHeader
        title="Articles"
        subtitle={`${articles.length} total`}
        action={
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-sky hover:bg-brand-skyDark text-white text-sm font-medium rounded-lg transition">
            <Plus className="w-4 h-4" /> New Article
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : articles.length === 0 ? (
          <EmptyState message="No articles found" icon={FileText} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Source</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Votes</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {articles.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {a.is_featured && <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        <span className="text-slate-200 font-medium truncate max-w-[300px]">{a.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{a.category_slug?.replace(/-/g, ' ') || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{a.source_name || '—'}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-center text-slate-500 hidden md:table-cell">{a.vote_count}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-md transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {a.source_url && (
                          <a href={a.source_url} target="_blank" rel="noopener" className="p-1.5 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-md transition">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing.id ? 'Edit Article' : 'New Article'}
        wide
      >
        <div className="space-y-4">
          <Field label="Title">
            <Input value={editing.title ?? ''} onChange={e => up('title', e.target.value)} placeholder="Article title" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={editing.category_slug ?? ''} onChange={e => up('category_slug', e.target.value)}>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={editing.status ?? 'draft'} onChange={e => up('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
          </div>

          <Field label="Excerpt">
            <Textarea value={editing.excerpt ?? ''} onChange={e => up('excerpt', e.target.value)} placeholder="Short description…" rows={2} />
          </Field>

          <Field label="Summary" hint="Plain-English summary shown on the site">
            <Textarea value={editing.summary ?? ''} onChange={e => up('summary', e.target.value)} placeholder="AI-generated or manual summary…" rows={3} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Source URL">
              <Input value={editing.source_url ?? ''} onChange={e => up('source_url', e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Source Name">
              <Input value={editing.source_name ?? ''} onChange={e => up('source_name', e.target.value)} placeholder="TechCrunch" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Author">
              <Input value={editing.author ?? ''} onChange={e => up('author', e.target.value)} placeholder="Author name" />
            </Field>
            <Field label="Thumbnail URL">
              <Input value={editing.thumbnail_url ?? ''} onChange={e => up('thumbnail_url', e.target.value)} placeholder="https://…" />
            </Field>
          </div>

          <Toggle checked={editing.is_featured ?? false} onChange={v => up('is_featured', v)} label="Featured article" />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <div>{editing.id && <DeleteButton onClick={handleDelete} loading={deleting} />}</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">
                Cancel
              </button>
              <SaveButton onClick={handleSave} loading={saving} label={editing.id ? 'Update' : 'Create'} />
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
