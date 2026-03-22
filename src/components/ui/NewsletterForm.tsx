'use client'
import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'

interface NewsletterFormProps {
  variant?: 'hero' | 'sidebar' | 'inline'
}

export default function NewsletterForm({ variant = 'inline' }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'sidebar') {
    return (
      <div className="bg-brand-navy rounded-xl p-4 mb-4">
        <h3 className="text-[13px] font-semibold text-white mb-1">Weekly AI digest</h3>
        <p className="text-[11px] text-brand-slate leading-relaxed mb-3">Top stories + best new tools every week. Free forever.</p>
        {submitted ? (
          <div className="flex items-center gap-2 text-brand-skyLight text-xs"><CheckCircle size={14} /><span>You&apos;re subscribed!</span></div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" required
              className="w-full px-3 py-2 rounded-lg text-[12px] border-0 outline-none text-brand-navy" />
            {error && <p className="text-[10px] text-red-400">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-brand-sky text-white py-2 rounded-lg text-[12px] font-semibold hover:bg-brand-skyDark transition-colors disabled:opacity-60">
              {loading ? 'Subscribing…' : 'Subscribe free'}
            </button>
          </form>
        )}
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        {submitted ? (
          <div className="flex items-center gap-2 text-brand-skyLight text-sm bg-white/10 px-4 py-2.5 rounded-lg">
            <CheckCircle size={16} /><span>You&apos;re subscribed — welcome!</span>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required
                className="flex-1 px-4 py-2.5 rounded-lg text-sm text-brand-navy outline-none border-0" />
              <button type="submit" disabled={loading}
                className="bg-brand-sky text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-skyDark transition-colors disabled:opacity-60 whitespace-nowrap">
                {loading ? '…' : 'Get free updates'}
              </button>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </>
        )}
      </form>
    )
  }

  return (
    <div id="newsletter" className="bg-brand-navy rounded-2xl p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-brand-sky/20 rounded-xl flex items-center justify-center shrink-0">
          <Mail size={20} className="text-brand-skyLight" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white mb-1">Weekly AI digest</h2>
          <p className="text-sm text-brand-slate mb-4">Top stories + the best new AI tools every week. Free forever. No spam.</p>
          {submitted ? (
            <div className="flex items-center gap-2 text-brand-skyLight text-sm"><CheckCircle size={16} /><span>You&apos;re subscribed — check your inbox!</span></div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required
                className="flex-1 px-4 py-2.5 rounded-lg text-sm text-brand-navy outline-none border-0" />
              <button type="submit" disabled={loading}
                className="bg-brand-sky text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-skyDark transition-colors disabled:opacity-60 whitespace-nowrap">
                {loading ? 'Subscribing…' : 'Subscribe free'}
              </button>
            </form>
          )}
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  )
}
