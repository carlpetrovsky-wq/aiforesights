import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, Clock, MessageSquare, Briefcase, Shield } from 'lucide-react'

export const metadata = {
  title: 'Contact — AI Foresights',
  description: 'Get in touch with the AI Foresights team. We\'d love to hear from you.',
}

export default function ContactPage() {
  const contacts = [
    {
      icon: MessageSquare,
      title: 'General Inquiries',
      desc: 'Questions about the site, feedback, or anything else.',
      email: 'privacy@aiforesights.com',
      subject: 'General Inquiry',
    },
    {
      icon: Briefcase,
      title: 'Advertising & Partnerships',
      desc: 'Sponsorships, ad placements, and partnership opportunities.',
      email: 'privacy@aiforesights.com',
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-white mb-3">Contact Us</h1>
          <p className="text-brand-muted text-base leading-relaxed">
            We'd love to hear from you. Reach out using the emails below and we'll respond within one business day.
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
          {contacts.map(({ icon: Icon, title, desc, email, subject }) => (
            <div key={title} className="border border-brand-border rounded-xl p-5 bg-white">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-brand-sky" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-brand-navy mb-1">{title}</h3>
                  <p className="text-xs text-brand-slate mb-3">{desc}</p>
                  <a
                    href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
                    className="inline-flex items-center gap-1.5 text-sm text-brand-sky font-medium hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {email}
                  </a>
                </div>
              </div>
            </div>
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
