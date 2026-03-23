import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Terms of Use — AI Foresights',
  description: 'Terms of Use for AI Foresights. Please read these terms before using our website.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-white mb-3">Terms of Use</h1>
          <p className="text-brand-muted text-sm">Last updated: March 23, 2026</p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="prose prose-sm max-w-none space-y-8 text-brand-slate">

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using <strong>aiforesights.com</strong> (the "Site"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Site. These terms apply to all visitors, subscribers, and users of the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">2. About AI Foresights</h2>
            <p className="leading-relaxed">
              AI Foresights is an independent AI news aggregation and education platform operated as a sole proprietorship in Texas, USA. The Site provides plain-English summaries of AI news, tool reviews, guides, and educational resources for professionals.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">3. Informational Content Only</h2>
            <p className="leading-relaxed mb-3">
              All content on AI Foresights is provided for <strong>informational and educational purposes only</strong>. Nothing on this Site constitutes:
            </p>
            <ul className="space-y-1.5 mb-3">
              <li>Financial, investment, or legal advice</li>
              <li>A recommendation to purchase or use any specific product or service</li>
              <li>A guarantee of any particular result or outcome</li>
              <li>Professional consulting services of any kind</li>
            </ul>
            <p className="leading-relaxed">
              You should always consult qualified professionals before making decisions based on information you read on this Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">4. AI-Generated Content Disclosure</h2>
            <p className="leading-relaxed">
              Some article summaries and content on this Site are generated or assisted by artificial intelligence, specifically Claude by Anthropic. All AI-assisted content is reviewed before publication, but we make no warranty that AI-generated summaries are perfectly accurate, complete, or up to date. Original source articles are linked for reference, and readers are encouraged to verify important information at the primary source.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">5. Third-Party Links and Content</h2>
            <p className="leading-relaxed">
              The Site contains links to third-party websites, articles, and resources. These links are provided for your convenience. AI Foresights does not control third-party sites and is not responsible for their content, accuracy, privacy practices, or availability. Linking to a third-party site does not constitute an endorsement of that site or its content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">6. Affiliate Relationships</h2>
            <p className="leading-relaxed">
              AI Foresights participates in affiliate programs. Some links on the Site, particularly for tools and books, are affiliate links through which we may earn a commission if you make a purchase. Affiliate links are clearly labeled. Affiliate relationships do not influence our editorial reviews or ratings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">7. Intellectual Property</h2>
            <p className="leading-relaxed mb-3">
              All original content on AI Foresights — including written articles, guides, graphics, and design elements — is the property of AI Foresights and protected by applicable intellectual property laws.
            </p>
            <p className="leading-relaxed">
              You may not reproduce, distribute, modify, or republish any content from the Site without express written permission. Brief quotations with clear attribution and a link back to the original article are permitted for editorial and educational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">8. Disclaimer of Warranties</h2>
            <p className="leading-relaxed">
              The Site is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the Site will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We make no warranty regarding the accuracy, completeness, reliability, or suitability of any content on the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">9. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the fullest extent permitted by applicable law, AI Foresights shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or inability to use the Site or its content, including but not limited to damages for loss of profits, data, or goodwill.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">10. Prohibited Uses</h2>
            <p className="leading-relaxed mb-3">You agree not to use the Site to:</p>
            <ul className="space-y-1.5">
              <li>Violate any applicable laws or regulations</li>
              <li>Scrape or harvest content in bulk without permission</li>
              <li>Transmit spam, malware, or other harmful code</li>
              <li>Interfere with or disrupt the Site's infrastructure</li>
              <li>Impersonate AI Foresights or misrepresent your affiliation with us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">11. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms of Use are governed by and construed in accordance with the laws of the State of Texas, USA, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">12. Changes to These Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to update these Terms of Use at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site after any changes constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">13. Contact</h2>
            <p className="leading-relaxed">
              For questions about these Terms, please contact us at <a href="mailto:help@aiforesights.com" className="text-brand-sky hover:underline">help@aiforesights.com</a>.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
