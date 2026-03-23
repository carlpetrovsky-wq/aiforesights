'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Download, Users, Mail, Calendar, Tag } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/admin/AdminUI'

interface Subscriber {
  id: string
  email: string
  name: string | null
  is_active: boolean
  source: string | null
  subscribed_at: string
}

export default function SubscribersPage() {
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
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

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div>
      <PageHeader
        title="Subscribers"
        subtitle={`${subs.length} total`}
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
          placeholder="Search by email or name…"
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    <div className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> Source</div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Signed Up</div>
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {subs.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-slate-200 font-medium">{s.email}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{s.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{s.source || 'website'}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{formatDate(s.subscribed_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-md border ${
                        s.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {s.is_active ? 'active' : 'unsubscribed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
