import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Cookie Settings — AI Foresights',
  description: 'Learn about the cookies used on AI Foresights and how to manage your preferences.',
  alternates: {
    canonical: "https://www.aiforesights.com/cookies",
  },
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-2 h-2 bg-brand-sky rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-white mb-3">Cookie Settings</h1>
          <p className="text-brand-muted text-sm">Last updated: March 23, 2026</p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="space-y-8 text-brand-slate">

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">What Are Cookies?</h2>
            <p className="text-sm leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, understand how you use the site, and deliver relevant content and advertisements. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-4">Cookies We Use</h2>
            <div className="space-y-3">

              {/* Strictly Necessary */}
              <div className="border border-brand-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border-b border-brand-border">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-navy">Strictly Necessary</h3>
                    <p className="text-xs text-brand-slate mt-0.5">Required for the site to function</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">Always Active</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-xs">
                    <div className="font-medium text-brand-navy mb-1">Session cookies</div>
                    <p className="text-brand-slate leading-relaxed">Used to maintain your session while navigating the Site. These expire when you close your browser and do not collect any personal information.</p>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="border border-brand-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-brand-border">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-navy">Analytics Cookies</h3>
                    <p className="text-xs text-brand-slate mt-0.5">Help us understand how visitors use the Site</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">Google Analytics</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-xs">
                    <div className="font-medium text-brand-navy mb-1">Google Analytics (_ga, _ga_*, _gid)</div>
                    <p className="text-brand-slate leading-relaxed mb-2">These cookies collect anonymized information about how visitors use the Site — such as pages visited, time spent, and traffic sources. This data helps us improve the Site's content and performance. No personally identifiable information is collected.</p>
                    <p className="text-brand-slate"><strong>Provider:</strong> Google LLC · <strong>Retention:</strong> Up to 2 years</p>
                  </div>
                </div>
              </div>

              {/* Advertising */}
              <div className="border border-brand-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-brand-border">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-navy">Advertising Cookies</h3>
                    <p className="text-xs text-brand-slate mt-0.5">Used to serve relevant advertisements</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">Google AdSense</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-xs">
                    <div className="font-medium text-brand-navy mb-1">Google AdSense (IDE, _gcl_au, DSID)</div>
                    <p className="text-brand-slate leading-relaxed mb-2">We use Google AdSense to display advertisements on the Site. AdSense uses cookies to serve ads based on your interests and prior browsing activity across websites. These cookies help Google deliver ads that are more relevant to you and measure ad effectiveness.</p>
                    <p className="text-brand-slate"><strong>Provider:</strong> Google LLC · <strong>Retention:</strong> Up to 13 months</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-4">Managing Your Cookie Preferences</h2>
            <p className="text-sm leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-50 border border-brand-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-brand-navy mb-2">Browser Settings</h3>
                <p className="text-xs text-brand-slate leading-relaxed">Most browsers allow you to refuse cookies or delete cookies that have already been set. The links below explain how to manage cookies in common browsers:</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                    { name: 'Firefox', url: 'https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences' },
                    { name: 'Safari', url: 'https://support.apple.com/en-us/HT201265' },
                    { name: 'Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
                  ].map(b => (
                    <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-brand-sky hover:underline border border-blue-100 bg-white px-2.5 py-1 rounded-full">
                      {b.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-brand-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-brand-navy mb-2">Opt Out of Google Advertising</h3>
                <p className="text-xs text-brand-slate leading-relaxed mb-3">You can opt out of personalized Google advertising at any time:</p>
                <div className="flex flex-wrap gap-2">
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-xs text-brand-sky hover:underline border border-blue-100 bg-white px-2.5 py-1 rounded-full">Google Ad Settings</a>
                  <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-xs text-brand-sky hover:underline border border-blue-100 bg-white px-2.5 py-1 rounded-full">Digital Advertising Alliance</a>
                  <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-xs text-brand-sky hover:underline border border-blue-100 bg-white px-2.5 py-1 rounded-full">NAI Opt Out</a>
                </div>
              </div>
            </div>

            <p className="text-xs text-brand-muted mt-4">
              Note: Disabling cookies may affect the functionality of some parts of the Site and may result in seeing less relevant advertisements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-3">More Information</h2>
            <p className="text-sm leading-relaxed">
              For more information about how we handle your personal data, please see our <Link href="/privacy" className="text-brand-sky hover:underline">Privacy Policy</Link>. If you have questions about our use of cookies, contact us at <a href="mailto:privacy@aiforesights.com" className="text-brand-sky hover:underline">privacy@aiforesights.com</a>.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
