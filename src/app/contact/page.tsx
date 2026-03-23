'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, Clock, MessageSquare, Briefcase, Shield, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const contacts = [
  {
    icon: MessageSquare,
    title: 'General Inquiries',
    desc: 'Questions about the site, feedback, or anything else.',
    email: 'help@aiforesights.com',
    subject: 'General Inquiry',
  },
  {
    icon: Briefcase,
    title: 'Advertising & Partnerships',
    desc: 'Sponsorships, ad placements, and partnership opportunities.',
    email: 'help@aiforesights.com',
    subject: 'Advertising Inquiry',
  },
  {
    icon: Shield,
    title: 'Privacy & Data Requests',
    desc: 'To request data deletion, access, or report a privacy concern.',
    email: 'privacy@aiforesights.com',
    subject: 'Privacy Request',
  },
]

function ContactCard({ icon: Icon, title, desc, email, subject }: typeof contacts[0] & { icon: React.ElementType }) {
  const [copied, setCopied] = useState(false)

  function copyEmail() {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border border-brand-border rounded-xl p-5 bg-white">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-brand-sky" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-brand-navy mb-1">{title}</h3>
          <p className="text-xs text-brand-slate mb-4">{desc}</p>

          {/* Email address — prominently displayed */}
          <div className="bg-gray-50 border border-brand-border rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-3.5 h-3.5 text-brand-sky shrink-0" />
              <span className="text-sm font-medium text-brand-navy truncate">{email}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Copy button */}
              <button
                onClick={copyEmail}
                className="flex items-center gap-1 text-xs text-brand-slate hover:text-brand-navy transition-colors px-2 py-1 rounded hover:bg-gray-200"
                title="Copy email address"
              >
                {copied ? (
                  <><Check className="w-3 h-3 text-emerald-600" /><span className="text-emerald-600">Copied!</span></>
                ) : (
                  <><Copy className="w-3 h-3" /><span>Copy</span></>
                )}
              </button>
              {/* Open in Gmail - works on any browser/device */}
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${email}&su=${encodeURIComponent(subject)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs bg-brand-sky text-white px-2.5 py-1 rounded hover:bg-brand-skyDark transition-colors font-medium"
              >
                <Mail className="w-3 h-3" />
                Open in Gmail
              </a>
            </div>
          </div>
          <p className="text-[11px] text-brand-muted mt-1.5">
            Click "Copy" to copy the address, or "Open in Gmail" to compose an email directly.
          </p>
        </div>
      </div>
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
          <h1 className="text-3xl font-bold text-white mb-3">Contact Us</h1>
          <p className="text-brand-muted text-base leading-relaxed">
            We'd love to hear from you. Copy our email address below or click "Email us" to open in your mail app.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">

        {/* Response time */}
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Clock className="w-4 h-4 text-brand-sky shrink-0" />
          <p className="text-sm text-brand-navy">
            <strong>Response time:</strong> We typically respond within 1 business day, Monday through Friday. Texas, USA.
          </p>
        </div>

        {/* Contact cards */}
        <div className="space-y-4">
          {contacts.map(contact => (
            <ContactCard key={contact.title} {...contact} icon={contact.icon} />
          ))}
        </div>

        {/* About the team */}
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
