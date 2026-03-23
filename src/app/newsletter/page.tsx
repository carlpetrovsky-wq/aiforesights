import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import NewsletterForm from '@/components/ui/NewsletterForm'
import { Check } from 'lucide-react'

export const metadata = {
  title: 'Newsletter — AI Foresights',
  description: 'Subscribe to the AI Foresights weekly newsletter. Top AI stories and best new tools in plain English. Free forever.',
}

export default function NewsletterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-sky/15 text-brand-skyLight text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-brand-skyLight rounded-full animate-pulse-dot" />
            Free weekly digest
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">The Weekly AI Digest</h1>
          <p className="text-brand-muted text-base leading-relaxed">
            The top 5 AI stories and best new tools of the week — explained in plain English. No jargon. No spam. Free forever.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">

        {/* What you get */}
        <section>
          <h2 className="text-lg font-bold text-brand-navy mb-5">What You Get Every Week</h2>
          <div className="space-y-3">
            {[
              { title: 'Top 5 AI Stories', desc: 'The most important AI developments of the week, summarized clearly — no technical background needed.' },
              { title: 'Best New AI Tools', desc: 'One or two standout tools worth knowing about, with honest notes on who they\'re best for.' },
              { title: 'One Practical Tip', desc: 'A quick, actionable way to use AI in your work — something you can try the same day.' },
              { title: 'Curated Reads', desc: 'The best long-reads, guides, and resources we found that week, hand-picked from across the web.' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3 border border-brand-border rounded-xl p-4 bg-white">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-brand-navy mb-0.5">{title}</div>
                  <p className="text-xs text-brand-slate leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subscribe form */}
        <section className="bg-brand-navy rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-2">Subscribe Free</h2>
          <p className="text-brand-muted text-sm mb-5">Join thousands of professionals staying ahead of AI. Unsubscribe anytime.</p>
          <NewsletterForm />
          <p className="text-xs text-brand-navyLight mt-3">No spam. Unsubscribe at any time. We respect your privacy.</p>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-bold text-brand-navy mb-4">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Is it really free?', a: 'Yes, completely free. No premium tier, no paywall, no credit card required.' },
              { q: 'How often will I receive emails?', a: 'Once a week, typically sent on Monday mornings. We also send occasional breaking news alerts when something major happens in AI.' },
              { q: 'Can I unsubscribe?', a: 'Absolutely. Every email includes an unsubscribe link at the bottom. One click and you\'re off the list.' },
              { q: 'Do you sell my email address?', a: 'Never. Your email is only used to send you the AI Foresights newsletter. See our Privacy Policy for full details.' },
            ].map(({ q, a }) => (
              <div key={q} className="border border-brand-border rounded-xl p-4 bg-white">
                <h3 className="text-sm font-semibold text-brand-navy mb-1.5">{q}</h3>
                <p className="text-xs text-brand-slate leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
