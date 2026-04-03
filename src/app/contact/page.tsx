'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, Clock, MessageSquare, Briefcase, Shield, Copy, Check, Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const INQUIRY_TYPES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'advertising', label: 'Advertising & Partnerships' },
  { value: 'tool-suggestion', label: 'Suggest a Tool' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'privacy', label: 'Privacy & Data Request' },
]

const contacts = [
  {
    icon: MessageSquare,
    title: 'General Inquiries',
    email: 'help@aiforesights.com',
  },
  {
    icon: Briefcase,
    title: 'Advertising & Partnerships',
    email: 'help@aiforesights.com',
  },
  {
    icon: Shield,
    title: 'Privacy & Data Requests',
    email: 'privacy@aiforesights.com',
  },
]

function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('general')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), type, message: message.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-brand-navy mb-2">Message sent!</h3>
        <p className="text-sm text-brand-slate leading-relaxed">
          Thanks for reaching out, we will get back to you within 1 business day. Check your inbox at <strong>{email}</strong>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-brand-border bg-white rounded-2xl p-6 sm:p-8 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-brand-navy mb-1.5">Your name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={200}
            placeholder="Jane Smith"
            className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-navy outline-none focus:border-brand-sky transition-colors placeholder:text-brand-muted"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-navy mb-1.5">Email address *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            maxLength={320}
            placeholder="jane@example.com"
            className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-navy outline-none focus:border-brand-sky transition-colors placeholder:text-brand-muted"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-brand-navy mb-1.5">What is this about?</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-navy outline-none focus:border-brand-sky transition-colors cursor-pointer bg-white"
        >
          {INQUIRY_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-brand-navy mb-1.5">Message *</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          maxLength={5000}
          rows={5}
          placeholder="Tell us how we can help..."
          className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm text-brand-navy outline-none focus:border-brand-sky transition-colors resize-y placeholder:text-brand-muted"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-sky hover:bg-brand-skyDark text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60"
      >
        {loading ? 'Sending...' : (
          <><Send className="w-4 h-4" /> Send message</>
        )}
      </button>
    </form>
  )
}

function EmailCard({ icon: Icon, title, email }: { icon: React.ElementType; title: string; email: string }) {
  const [copied, setCopied] = useState(false)
  function copyEmail() {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="flex items-center gap-3 border border-brand-border rounded-xl px-4 py-3 bg-white">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-sky" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-brand-navy">{title}</p>
        <p className="text-xs text-brand-slate truncate">{email}</p>
      </div>
      <button
        onClick={copyEmail}
        className="flex items-center gap-1 text-xs text-brand-slate hover:text-brand-navy px-2 py-1 rounded hover:bg-gray-100 transition-colors shrink-0"
      >
        {copied ? <><Check className="w-3 h-3 text-emerald-600" /><span className="text-emerald-600">Copied</span></> : <><Copy className="w-3 h-3" /><span>Copy</span></>}
      </button>
    </div>
  )
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-white mb-3">Get in Touch</h1>
          <p className="text-brand-muted text-base leading-relaxed">
            Have a question, feedback, or partnership inquiry? Fill out the form below and we will get back to you within one business day.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">

        {/* Response time */}
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Clock className="w-4 h-4 text-brand-sky shrink-0" />
          <p className="text-sm text-brand-navy">
            <strong>Response time:</strong> We typically respond within 1 business day, Monday through Friday. Based in Texas, USA.
          </p>
        </div>

        {/* Contact form */}
        <ContactForm />

        {/* Email alternatives */}
        <section>
          <h2 className="text-sm font-semibold text-brand-navy mb-3">Or email us directly</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {contacts.map(c => (
              <EmailCard key={c.title} icon={c.icon} title={c.title} email={c.email} />
            ))}
          </div>
        </section>

        {/* About */}
        <section className="border border-brand-border rounded-xl p-6 bg-white">
          <h2 className="text-base font-semibold text-brand-navy mb-3">About AI Foresights</h2>
          <p className="text-sm text-brand-slate leading-relaxed mb-2">
            AI Foresights is an independent AI news and education platform based in Texas, USA. We are a sole proprietorship committed to making artificial intelligence understandable for everyday professionals.
          </p>
          <p className="text-sm text-brand-slate leading-relaxed">
            We are not affiliated with any AI company, and our editorial coverage is fully independent.
          </p>
        </section>

      </main>
      <Footer />
    </div>
  )
}
