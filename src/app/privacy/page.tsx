import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Privacy Policy — AI Foresights',
  description: 'Privacy Policy for AI Foresights. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-brand-muted text-sm">Last updated: March 23, 2026</p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="prose prose-sm max-w-none space-y-8 text-brand-slate">

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">1. Introduction</h2>
            <p className="leading-relaxed">
              AI Foresights ("we," "our," or "us") is a sole proprietorship based in Texas, USA. This Privacy Policy explains how we collect, use, disclose, and protect information about you when you visit <strong>aiforesights.com</strong> (the "Site") or subscribe to our newsletter.
            </p>
            <p className="leading-relaxed mt-3">
              By using the Site, you agree to the practices described in this policy. If you do not agree, please do not use the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">2. Information We Collect</h2>
            <h3 className="text-sm font-semibold text-brand-navy mb-2">Information You Provide</h3>
            <ul className="space-y-1.5 mb-4">
              <li><strong>Email address:</strong> When you subscribe to our newsletter or create an account.</li>
              <li><strong>Contact information:</strong> Name, email, and message content when you contact us.</li>
            </ul>
            <h3 className="text-sm font-semibold text-brand-navy mb-2">Information Collected Automatically</h3>
            <ul className="space-y-1.5">
              <li><strong>Usage data:</strong> Pages visited, time on site, referral sources, and browser/device type, collected via Google Analytics.</li>
              <li><strong>IP address:</strong> Collected by our hosting provider (Vercel) and analytics services for security and geographic analysis.</li>
              <li><strong>Cookies:</strong> Small data files placed on your device by Google Analytics and Google AdSense. See our <a href="/cookies" className="text-brand-sky hover:underline">Cookie Policy</a> for details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">3. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="space-y-1.5">
              <li>Send you the newsletter and email updates you subscribed to</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Analyze site usage to improve content and user experience</li>
              <li>Display relevant advertisements through Google AdSense</li>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud and unauthorized use of the Site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">4. Sharing Your Information</h2>
            <p className="leading-relaxed mb-3">We do not sell your personal information. We may share your information with:</p>
            <ul className="space-y-2">
              <li><strong>Google LLC:</strong> For analytics (Google Analytics) and advertising (Google AdSense). Google may use this data in accordance with <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-sky hover:underline">Google's Privacy Policy</a>.</li>
              <li><strong>Vercel Inc.:</strong> Our hosting provider, which processes server logs and request data.</li>
              <li><strong>Supabase:</strong> Our database provider, which stores newsletter subscriber data.</li>
              <li><strong>Legal authorities:</strong> If required by law, court order, or to protect the rights and safety of our users or the public.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">5. Google AdSense & Advertising</h2>
            <p className="leading-relaxed">
              We use Google AdSense to display advertisements on the Site. Google AdSense uses cookies to serve ads based on your prior visits to this and other websites. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand-sky hover:underline">Google Ad Settings</a> or <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-brand-sky hover:underline">aboutads.info</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">6. Affiliate Links</h2>
            <p className="leading-relaxed">
              Some links on the Site, particularly in our AI Tools and Learn AI sections, are affiliate links. If you click these links and make a purchase, we may earn a commission at no additional cost to you. Affiliate links are clearly labeled throughout the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">7. Data Retention</h2>
            <p className="leading-relaxed">
              We retain newsletter subscriber data for as long as you remain subscribed. If you unsubscribe, we will remove your email address from our active mailing list within 30 days. Analytics data is retained for up to 26 months per Google Analytics default settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">8. Your Rights</h2>
            <p className="leading-relaxed mb-3">Depending on your location, you may have the following rights:</p>
            <ul className="space-y-1.5">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request that we correct inaccurate data.</li>
              <li><strong>Deletion:</strong> Request that we delete your personal data.</li>
              <li><strong>Unsubscribe:</strong> Opt out of our newsletter at any time via the unsubscribe link in any email.</li>
              <li><strong>Opt-out of advertising cookies:</strong> See our <a href="/cookies" className="text-brand-sky hover:underline">Cookie Policy</a>.</li>
            </ul>
            <p className="leading-relaxed mt-3">
              To exercise these rights, contact us at <a href="mailto:privacy@aiforesights.com" className="text-brand-sky hover:underline">privacy@aiforesights.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">9. Children's Privacy</h2>
            <p className="leading-relaxed">
              AI Foresights is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately at <a href="mailto:privacy@aiforesights.com" className="text-brand-sky hover:underline">privacy@aiforesights.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">10. Security</h2>
            <p className="leading-relaxed">
              We implement reasonable technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">11. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify subscribers of material changes via email or a prominent notice on the Site. The "Last updated" date at the top of this page reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">12. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm">
              <p className="font-semibold text-brand-navy">AI Foresights</p>
              <p>Texas, USA</p>
              <p><a href="mailto:privacy@aiforesights.com" className="text-brand-sky hover:underline">privacy@aiforesights.com</a></p>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
