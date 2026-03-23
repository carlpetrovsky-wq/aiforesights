import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowLeft, Clock, BookOpen, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'The 10 AI Tools Every Professional Needs in 2026 — AI Foresights',
  description: 'Our curated list of the most useful AI tools in 2026, with honest assessments and guidance on who each one is best for.',
}

const tools = [
  {
    rank: 1, name: 'ChatGPT', company: 'OpenAI', pricing: 'Freemium',
    url: 'https://chat.openai.com',
    bestFor: 'General writing, research, brainstorming',
    summary: 'The most widely used AI assistant. Excellent for drafting emails, summarizing documents, brainstorming ideas, and answering complex questions. The free tier is genuinely useful; GPT-4 (paid) is significantly more capable for nuanced tasks.',
    whoFor: 'Everyone — the best starting point if you\'re new to AI',
    limitation: 'Knowledge cutoff means it may not know about very recent events without web browsing enabled.',
  },
  {
    rank: 2, name: 'Claude', company: 'Anthropic', pricing: 'Freemium',
    url: 'https://claude.ai',
    bestFor: 'Long documents, analysis, nuanced writing',
    summary: 'Exceptional at working with long documents — it can read and analyze entire reports, contracts, or books. Claude is known for producing more thoughtful, nuanced writing and is particularly strong at following complex instructions precisely.',
    whoFor: 'Professionals who work with long documents or need careful, detailed analysis',
    limitation: 'Slightly less known, but genuinely excellent for complex tasks.',
  },
  {
    rank: 3, name: 'Perplexity AI', company: 'Perplexity', pricing: 'Freemium',
    url: 'https://perplexity.ai',
    bestFor: 'Research and fact-finding with citations',
    summary: 'The best AI tool for research. Unlike ChatGPT, Perplexity always searches the web in real time and cites its sources — so you can verify everything it tells you. Excellent for market research, competitor analysis, and staying current on any topic.',
    whoFor: 'Anyone who needs reliable, sourced information rather than generated content',
    limitation: 'Less useful for writing/creation tasks; best as a research companion.',
  },
  {
    rank: 4, name: 'Gemini', company: 'Google', pricing: 'Freemium',
    url: 'https://gemini.google.com',
    bestFor: 'Google Workspace integration',
    summary: 'Google\'s AI assistant integrates directly into Gmail, Docs, Sheets, and Slides. If your work lives in Google Workspace, Gemini is an obvious add-on — it can draft emails, summarize threads, analyze spreadsheet data, and generate slides from your notes.',
    whoFor: 'Professionals already using Google Workspace who want AI built into their existing tools',
    limitation: 'Standalone Gemini is strong but not clearly better than ChatGPT or Claude for most tasks.',
  },
  {
    rank: 5, name: 'Copilot', company: 'Microsoft', pricing: 'Freemium',
    url: 'https://copilot.microsoft.com',
    bestFor: 'Microsoft 365 integration',
    summary: 'Microsoft\'s equivalent of Gemini for Office users. Copilot works inside Word, Excel, PowerPoint, Outlook, and Teams. It can generate first drafts of presentations, analyze spreadsheet data in plain English, and summarize email threads.',
    whoFor: 'Professionals in organizations that run Microsoft 365',
    limitation: 'Full M365 Copilot requires a paid license through your organization.',
  },
  {
    rank: 6, name: 'Notion AI', company: 'Notion', pricing: 'Paid add-on',
    url: 'https://notion.so',
    bestFor: 'Note-taking, knowledge management, documentation',
    summary: 'If you use Notion for notes, wikis, or project management, the AI add-on is well worth it. It can summarize meeting notes, generate first drafts of documents, extract action items, and help you search and query across all your existing Notion content.',
    whoFor: 'Notion users who want AI built into their workspace and knowledge base',
    limitation: 'Only useful if you already use Notion.',
  },
  {
    rank: 7, name: 'Otter.ai', company: 'Otter', pricing: 'Freemium',
    url: 'https://otter.ai',
    bestFor: 'Meeting transcription and summaries',
    summary: 'Otter joins your Zoom, Google Meet, or Teams calls and automatically transcribes everything. After the meeting, it produces a summary, pulls out action items, and lets you search the transcript. Saves significant time for anyone who spends a lot of time in meetings.',
    whoFor: 'Managers, consultants, and anyone who has back-to-back meetings',
    limitation: 'Transcription accuracy decreases with heavy accents or technical jargon.',
  },
  {
    rank: 8, name: 'Canva AI', company: 'Canva', pricing: 'Freemium',
    url: 'https://canva.com',
    bestFor: 'Design, presentations, social media graphics',
    summary: 'Canva\'s AI features make professional design accessible to non-designers. Generate presentations from a text description, create images with Magic Media, resize designs automatically, and use Magic Write to generate copy directly in your designs.',
    whoFor: 'Marketing, HR, communications, and small business owners who need polished visuals fast',
    limitation: 'AI-generated images can be inconsistent; best used with their templates.',
  },
  {
    rank: 9, name: 'Grammarly', company: 'Grammarly', pricing: 'Freemium',
    url: 'https://grammarly.com',
    bestFor: 'Writing improvement and consistency',
    summary: 'The gold standard for professional writing polish. The AI features now go beyond grammar — it can rewrite sentences for clarity, adjust tone for different audiences, and give you strategic feedback on entire documents. Works everywhere you type.',
    whoFor: 'Anyone who writes professionally and wants every communication to be polished',
    limitation: 'Suggestions can occasionally be overly cautious; use judgment on what to accept.',
  },
  {
    rank: 10, name: 'Zapier AI', company: 'Zapier', pricing: 'Freemium',
    url: 'https://zapier.com',
    bestFor: 'Automating repetitive tasks between apps',
    summary: 'Zapier connects your apps and automates workflows without code. With their new AI features, you can describe what you want to automate in plain English and Zapier will build the workflow. Excellent for saving time on repetitive tasks like data entry, notifications, and report generation.',
    whoFor: 'Operations, marketing, and small business owners who do repetitive digital tasks',
    limitation: 'More powerful automations may require some setup time to configure correctly.',
  },
]

export default function TenAIToolsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-navy py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/learn-ai" className="inline-flex items-center gap-1.5 text-brand-muted hover:text-white text-xs mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Learn AI
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider">Guide</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-brand-muted uppercase tracking-wider">Beginner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">The 10 AI Tools Every Professional Needs in 2026</h1>
          <div className="flex items-center gap-4 text-xs text-brand-muted">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 15 min read</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> AI Foresights</span>
            <span>Free</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="space-y-8 text-brand-slate">

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-brand-navy">
            These are the tools we'd recommend to any professional in 2026 — whether you're brand new to AI or looking to build a more complete toolkit. Each includes honest notes on who it's best for and where it falls short.
          </div>

          <div className="space-y-5">
            {tools.map(tool => (
              <div key={tool.rank} className="border border-brand-border rounded-xl bg-white overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  <div className="w-8 h-8 rounded-lg bg-brand-navy text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {tool.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="text-base font-bold text-brand-navy">{tool.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-brand-muted">{tool.company}</span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-brand-sky">{tool.pricing}</span>
                        </div>
                      </div>
                      <a href={tool.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-brand-sky hover:underline shrink-0 font-medium">
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-xs text-brand-sky font-medium mb-2">Best for: {tool.bestFor}</div>
                    <p className="text-sm text-brand-slate leading-relaxed mb-3">{tool.summary}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-emerald-50 rounded-lg px-3 py-2 text-xs">
                        <div className="font-semibold text-emerald-700 mb-0.5">Who it's for</div>
                        <p className="text-brand-slate">{tool.whoFor}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg px-3 py-2 text-xs">
                        <div className="font-semibold text-amber-700 mb-0.5">Worth knowing</div>
                        <p className="text-brand-slate">{tool.limitation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-brand-navy rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-white mb-2">Get Weekly AI Tool Reviews</h3>
            <p className="text-brand-muted text-sm mb-4">New tools reviewed every week in our free newsletter.</p>
            <Link href="/#newsletter" className="btn-primary inline-block">Subscribe free</Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
