import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ExternalLink, BookOpen, Play, FileText, GraduationCap } from 'lucide-react'
import { MOCK_LEARNING } from '@/lib/data'

const TYPE_LABELS: Record<string, string> = {
  course: 'Course', video: 'Video', book: 'Book', guide: 'Guide',
}
const TYPE_ICONS: Record<string, typeof BookOpen> = {
  course: GraduationCap, video: Play, book: BookOpen, guide: FileText,
}
const TYPE_COLORS: Record<string, { bg: string; text: string; iconBg: string }> = {
  course: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100' },
  video:  { bg: 'bg-red-50',  text: 'text-red-700',  iconBg: 'bg-red-100' },
  book:   { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100' },
  guide:  { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
}
const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-blue-50 text-blue-700',
  advanced: 'bg-purple-50 text-purple-700',
}

export default function LearnAIPage() {
  const beginner = MOCK_LEARNING.filter(r => r.level === 'beginner')
  const intermediate = MOCK_LEARNING.filter(r => r.level === 'intermediate')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="w-2 h-2 bg-red-400 rounded-full mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Learn AI</h1>
          <p className="text-sm text-brand-muted max-w-lg">
            Courses, videos, books, and guides picked for everyday professionals — starting from zero. No coding. No jargon. Just clear, practical learning.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Start from scratch', 'Free options', 'Quick reads', 'Step-by-step'].map(tag => (
              <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-brand-muted">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 py-8 space-y-10">

        {/* Beginner */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Start here — Beginner</h2>
              <p className="text-xs text-brand-slate mt-0.5">Perfect if you are brand new to AI. No experience needed.</p>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Beginner friendly</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {beginner.map(r => {
              const Icon = TYPE_ICONS[r.type] || BookOpen
              const colors = TYPE_COLORS[r.type] || TYPE_COLORS.guide
              const isInternal = r.url.startsWith('/')
              return (
                <div key={r.id} className="border border-brand-border rounded-xl bg-white overflow-hidden hover:border-brand-sky transition-colors group flex flex-col">
                  {/* Visual header */}
                  <div className="w-full h-28 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: r.thumbnailBg }}>
                    {r.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {TYPE_LABELS[r.type]}
                      </span>
                    </div>
                    {r.isFree && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-emerald-700">FREE</span>
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-[12px] font-semibold text-brand-navy leading-snug mb-1.5 line-clamp-2 group-hover:text-brand-sky transition-colors">
                      {r.title}
                    </h3>
                    {r.description && (
                      <p className="text-[10px] text-brand-slate leading-relaxed mb-2 line-clamp-2 flex-1">{r.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded capitalize ${LEVEL_COLORS[r.level]}`}>{r.level}</span>
                      <span className="text-[10px] text-brand-muted">· {r.duration}</span>
                    </div>
                    <a
                      href={r.affiliateUrl || r.url}
                      target={isInternal ? undefined : '_blank'}
                      rel={isInternal ? undefined : 'noopener noreferrer'}
                      className="flex items-center gap-1 text-[10px] text-brand-sky hover:underline font-medium mt-auto"
                    >
                      {r.isFree ? 'Free' : r.isAffiliate ? 'Affiliate link' : 'Visit'} · {r.platform}
                      {!isInternal && <ExternalLink className="w-2.5 h-2.5" />}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Intermediate */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Go deeper — Intermediate</h2>
              <p className="text-xs text-brand-slate mt-0.5">Once you have the basics, these will take you further.</p>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">Intermediate</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {intermediate.map(r => {
              const Icon = TYPE_ICONS[r.type] || BookOpen
              const colors = TYPE_COLORS[r.type] || TYPE_COLORS.guide
              const isInternal = r.url.startsWith('/')
              return (
                <div key={r.id} className="border border-brand-border rounded-xl bg-white overflow-hidden hover:border-brand-sky transition-colors group flex flex-col">
                  <div className="w-full h-28 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: r.thumbnailBg }}>
                    {r.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 z-10">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {TYPE_LABELS[r.type]}
                      </span>
                    </div>
                    {r.isFree && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-emerald-700">FREE</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-[12px] font-semibold text-brand-navy leading-snug mb-1.5 line-clamp-2 group-hover:text-brand-sky transition-colors">
                      {r.title}
                    </h3>
                    {r.description && (
                      <p className="text-[10px] text-brand-slate leading-relaxed mb-2 line-clamp-2 flex-1">{r.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded capitalize ${LEVEL_COLORS[r.level]}`}>{r.level}</span>
                      <span className="text-[10px] text-brand-muted">· {r.duration}</span>
                    </div>
                    <a
                      href={r.affiliateUrl || r.url}
                      target={isInternal ? undefined : '_blank'}
                      rel={isInternal ? undefined : 'noopener noreferrer'}
                      className="flex items-center gap-1 text-[10px] text-brand-sky hover:underline font-medium mt-auto"
                    >
                      {r.isFree ? 'Free' : r.isAffiliate ? 'Affiliate link' : 'Visit'} · {r.platform}
                      {!isInternal && <ExternalLink className="w-2.5 h-2.5" />}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-navy rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold text-white mb-2">New resources added every week</h2>
          <p className="text-brand-muted text-sm mb-4">Subscribe to our free newsletter and we will let you know when new guides and courses are available.</p>
          <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
        </section>

      </main>
      <Footer />
    </div>
  )
}
