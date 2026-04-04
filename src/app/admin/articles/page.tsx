'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Star, ExternalLink, Pencil, Trash2, FileText, ImageIcon, CheckCircle, AlertCircle, Twitter, Copy, Loader2 } from 'lucide-react'
import {
  PageHeader, AdminModal, Field, Input, Textarea, Select,
  StatusBadge, Toggle, SaveButton, DeleteButton, EmptyState,
  SortableHeader,
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

function ArticlesContent() {
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 100
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<string>('published_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(0)
  }

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Article>>(emptyArticle())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [backfilling, setBackfilling] = useState(false)
  const [backfillResult, setBackfillResult] = useState<{ success: boolean; message: string } | null>(null)

  // X Post Generator
  const [xModalOpen, setXModalOpen] = useState(false)
  const [xPosts, setXPosts] = useState<string[]>([])
  const [xArticleTitle, setXArticleTitle] = useState('')
  const [xArticleSlug, setXArticleSlug] = useState('')
  const [xGenerating, setXGenerating] = useState(false)
  const [xCopied, setXCopied] = useState<number | null>(null)

  async function generateXPosts(slug: string, title: string) {
    setXArticleTitle(title)
    setXArticleSlug(slug)
    setXPosts([])
    setXCopied(null)
    setXModalOpen(true)
    setXGenerating(true)
    try {
      const res = await fetch('/api/admin/generate-xpost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (data.success && data.posts) {
        setXPosts(data.posts)
      } else {
        setXPosts([`Error: ${data.error || 'Failed to generate posts'}`])
      }
    } catch (err) {
      setXPosts([`Error: ${String(err)}`])
    }
    setXGenerating(false)
  }

  function copyXPost(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setXCopied(index)
    setTimeout(() => setXCopied(null), 2000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    params.set('sortBy', sortKey)
    params.set('sortDir', sortDir)
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String(page * PAGE_SIZE))
    try {
      const res = await fetch(`/api/admin/articles?${params}`)
      if (res.ok) {
        const data = await res.json()
        // Handle both old array format and new {articles, total} format
        if (Array.isArray(data)) {
          setArticles(data)
          setTotal(data.length)
        } else {
          setArticles(data.articles ?? [])
          setTotal(data.total ?? 0)
        }
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [statusFilter, search, page, sortKey, sortDir])

  useEffect(() => { setPage(0) }, [statusFilter, search])
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

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_featured: !current }),
      })
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: !current } : a))
    } catch {}
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

  async function backfillImages() {
    setBackfilling(true)
    setBackfillResult(null)
    try {
      const res = await fetch('/api/admin/backfill-images', { method: 'POST' })
      const data = await res.json()
      setBackfillResult({ success: res.ok, message: data.message || data.error || 'Done' })
      if (res.ok) load()
    } catch (err) {
      setBackfillResult({ success: false, message: String(err) })
    }
    setBackfilling(false)
  }

  return (
    <div>
      <PageHeader
        title="Articles"
        subtitle={`${total} total`}
        action={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {backfillResult && (
              <span className={`flex items-center gap-1.5 text-xs ${backfillResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {backfillResult.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {backfillResult.message}
              </span>
            )}
            <button
              onClick={backfillImages}
              disabled={backfilling}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              <ImageIcon className={`w-4 h-4 ${backfilling ? 'animate-pulse' : ''}`} />
              {backfilling ? 'Fetching images…' : 'Backfill Images'}
            </button>
            <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-sky hover:bg-brand-skyDark text-white text-sm font-medium rounded-lg transition">
              <Plus className="w-4 h-4" /> New Article
            </button>
          </div>
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

      {/* Pagination — top */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 mb-2 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <span className="text-xs text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs bg-white/[0.06] hover:bg-white/[0.10] disabled:opacity-40 text-slate-300 rounded-lg transition"
            >← Prev</button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * PAGE_SIZE >= total}
              className="px-3 py-1 text-xs bg-white/[0.06] hover:bg-white/[0.10] disabled:opacity-40 text-slate-300 rounded-lg transition"
            >Next →</button>
          </div>
        </div>
      )}

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
                  <SortableHeader label="Category" sortKey="category_slug" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                  <SortableHeader label="Source" sortKey="source_name" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                  <SortableHeader label="Published" sortKey="published_at" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortableHeader label="Status" sortKey="status" activeSortKey={sortKey ?? ''} sortDir={sortDir} onSort={handleSort} />
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Featured</th>
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
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">
                      {a.published_at ? new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <button
                        onClick={() => toggleFeatured(a.id, a.is_featured)}
                        className={`p-1.5 rounded-md transition ${a.is_featured ? 'text-amber-400 hover:text-amber-300 bg-amber-400/10' : 'text-slate-600 hover:text-amber-400 hover:bg-white/[0.06]'}`}
                        title={a.is_featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star className={`w-3.5 h-3.5 ${a.is_featured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => generateXPosts(a.slug, a.title)}
                          className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 rounded-md transition"
                          title="Generate X post"
                        >
                          <Twitter className="w-3.5 h-3.5" />
                        </button>
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

      {/* Pagination — bottom */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 mt-2 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <span className="text-xs text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs bg-white/[0.06] hover:bg-white/[0.10] disabled:opacity-40 text-slate-300 rounded-lg transition"
            >← Prev</button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * PAGE_SIZE >= total}
              className="px-3 py-1 text-xs bg-white/[0.06] hover:bg-white/[0.10] disabled:opacity-40 text-slate-300 rounded-lg transition"
            >Next →</button>
          </div>
        </div>
      )}

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

      {/* X Post Generator Modal */}
      <AdminModal
        open={xModalOpen}
        onClose={() => setXModalOpen(false)}
        title="Generate X Post"
        wide
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400 truncate">
            <span className="text-slate-500">Article:</span> {xArticleTitle}
          </p>

          {xGenerating ? (
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
              <span className="text-sm text-slate-400">Generating post options…</span>
            </div>
          ) : (
            <div className="space-y-3">
              {xPosts.map((post, i) => (
                <div key={i} className="relative bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-medium text-sky-400">
                      {i === 0 ? 'Curiosity hook' : i === 1 ? 'Key insight' : 'Practical angle'}
                    </span>
                    <span className="text-xs text-slate-600">
                      {post.split('\n\n')[0].length} chars
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{post}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                    <button
                      onClick={() => copyXPost(post, i)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                        xCopied === i
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.10] hover:text-white'
                      }`}
                    >
                      {xCopied === i ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy</>
                      )}
                    </button>
                    <a
                      href={`https://x.com/intent/tweet?text=${encodeURIComponent(post)}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition"
                    >
                      <Twitter className="w-3.5 h-3.5" /> Post on X
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => generateXPosts(xArticleSlug, xArticleTitle)}
              disabled={xGenerating}
              className="text-xs text-sky-400 hover:text-sky-300 transition disabled:opacity-40"
            >
              ↻ Regenerate
            </button>
            <button onClick={() => setXModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">
              Close
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}

export default function ArticlesPage() {
  return <Suspense><ArticlesContent /></Suspense>
}
