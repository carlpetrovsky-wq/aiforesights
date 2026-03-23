'use client'

import { useEffect, useState, useCallback } from 'react'
import { Settings, Save, Check } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/admin/AdminUI'

interface Setting {
  key: string
  value: string | null
  description: string | null
  updated_at: string
}

// Settings that should use a textarea instead of input
const longKeys = new Set(['custom_css', 'custom_head_html', 'footer_text'])
// Settings that should use a select
const selectOptions: Record<string, string[]> = {
  newsletter_frequency: ['daily', 'weekly', 'biweekly', 'monthly'],
  rss_auto_publish: ['true', 'false'],
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data: Setting[] = await res.json()
        setSettings(data)
        setValues(Object.fromEntries(data.map(s => [s.key, s.value ?? ''])))
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function handleChange(key: string, value: string) {
    setValues(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = Object.entries(values).map(([key, value]) => ({ key, value }))
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch { /* silent */ }
    setSaving(false)
  }

  function formatKey(key: string) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div>
      <PageHeader
        title="Site Settings"
        subtitle="Configure your site"
        action={
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-brand-sky hover:bg-brand-skyDark text-white'
            }`}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save All'}</>}
          </button>
        }
      />

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : settings.length === 0 ? (
          <EmptyState message="No settings found" icon={Settings} />
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {settings.map(s => (
              <div key={s.key} className="px-5 py-4 hover:bg-white/[0.01] transition">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {/* Label */}
                  <div className="sm:w-48 flex-shrink-0">
                    <div className="text-sm font-medium text-slate-200">{formatKey(s.key)}</div>
                    {s.description && (
                      <div className="text-xs text-slate-600 mt-0.5">{s.description}</div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex-1">
                    {selectOptions[s.key] ? (
                      <select
                        value={values[s.key] ?? ''}
                        onChange={e => handleChange(s.key, e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition"
                      >
                        {selectOptions[s.key].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : longKeys.has(s.key) ? (
                      <textarea
                        value={values[s.key] ?? ''}
                        onChange={e => handleChange(s.key, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition resize-y"
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[s.key] ?? ''}
                        onChange={e => handleChange(s.key, e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 transition"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 mt-4">
        Changes are saved to the Supabase settings table. Add new settings by inserting rows directly.
      </p>
    </div>
  )
}
