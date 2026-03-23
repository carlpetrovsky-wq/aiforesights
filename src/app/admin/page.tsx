'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, Wrench, Users, Rss,
  TrendingUp, ArrowRight, RefreshCw,
} from 'lucide-react'

interface Stats {
  articles: number
  tools: number
  subscribers: number
  sources: number
  recentArticles: number
  recentSubscribers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) setStats(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { loadStats() }, [])

  const cards = stats
    ? [
        { label: 'Articles',    value: stats.articles,    sub: `+${stats.recentArticles} this week`, icon: FileText,  color: 'sky',     href: '/admin/articles' },
        { label: 'Tools',       value: stats.tools,       sub: 'in directory',                       icon: Wrench,    color: 'emerald',  href: '/admin/tools' },
        { label: 'Subscribers', value: stats.subscribers,  sub: `+${stats.recentSubscribers} this week`, icon: Users, color: 'violet',   href: '/admin/subscribers' },
        { label: 'RSS Sources', value: stats.sources,     sub: 'active feeds',                       icon: Rss,       color: 'amber',    href: '/admin/sources' },
      ]
    : []

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    sky:     { bg: 'bg-sky-500/10',    text: 'text-sky-400',    border: 'border-sky-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your site</p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-white/[0.06] rounded w-20 mb-4" />
              <div className="h-8 bg-white/[0.06] rounded w-14 mb-2" />
              <div className="h-3 bg-white/[0.06] rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(card => {
            const c = colorMap[card.color]
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] rounded-xl p-5 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <card.icon className={`w-4 h-4 ${c.text}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">{card.value}</div>
                <div className="text-xs text-slate-500">{card.sub}</div>
                <div className="text-sm font-medium text-slate-400 mt-2">{card.label}</div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-sky" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Add Article',       href: '/admin/articles?new=1',  desc: 'Create a new article manually' },
            { label: 'Add Tool',          href: '/admin/tools?new=1',     desc: 'Add an AI tool to the directory' },
            { label: 'Add RSS Source',    href: '/admin/sources?new=1',   desc: 'Connect a new RSS feed' },
            { label: 'View Subscribers',  href: '/admin/subscribers',      desc: 'See who signed up' },
            { label: 'Manage Ad Slots',   href: '/admin/ads',              desc: 'Toggle ads, add AdSense IDs' },
            { label: 'Site Settings',     href: '/admin/settings',         desc: 'Edit site config' },
          ].map(action => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-lg transition group"
            >
              <div>
                <div className="text-sm font-medium text-slate-300 group-hover:text-white transition">{action.label}</div>
                <div className="text-xs text-slate-600">{action.desc}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0 ml-3 transition" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
