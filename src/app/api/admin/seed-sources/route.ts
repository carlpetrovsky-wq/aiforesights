export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

const NEW_SOURCES = [
  // Tier 1: Official AI Lab Blogs
  { name: 'Anthropic Blog',        feed_url: 'https://www.anthropic.com/rss.xml',                                         url: 'https://www.anthropic.com/news' },
  { name: 'OpenAI Blog',           feed_url: 'https://openai.com/blog/rss',                                               url: 'https://openai.com/blog' },
  { name: 'Google DeepMind',       feed_url: 'https://deepmind.google/blog/rss.xml',                                      url: 'https://deepmind.google/blog' },
  { name: 'Google AI Blog',        feed_url: 'https://blog.google/technology/ai/rss/',                                    url: 'https://blog.google/technology/ai' },
  { name: 'Meta AI Blog',          feed_url: 'https://ai.meta.com/blog/rss/',                                             url: 'https://ai.meta.com/blog' },
  { name: 'Microsoft AI Blog',     feed_url: 'https://blogs.microsoft.com/ai/feed/',                                      url: 'https://blogs.microsoft.com/ai' },
  { name: 'Hugging Face Blog',     feed_url: 'https://huggingface.co/blog/feed.xml',                                      url: 'https://huggingface.co/blog' },
  { name: 'Mistral Blog',          feed_url: 'https://mistral.ai/rss.xml',                                                url: 'https://mistral.ai/news' },
  { name: 'Cohere Blog',           feed_url: 'https://cohere.com/blog/rss.xml',                                           url: 'https://cohere.com/blog' },
  // Tier 2: High-Signal AI Newsletters
  { name: 'The Batch',             feed_url: 'https://www.deeplearning.ai/the-batch/feed/',                               url: 'https://www.deeplearning.ai/the-batch' },
  { name: 'Import AI',             feed_url: 'https://importai.substack.com/feed',                                        url: 'https://importai.substack.com' },
  { name: 'The Rundown AI',        feed_url: 'https://www.therundown.ai/feed',                                            url: 'https://www.therundown.ai' },
  { name: "Ben's Bites",           feed_url: 'https://bensbites.beehiiv.com/feed',                                        url: 'https://bensbites.com' },
  { name: 'TLDR AI',               feed_url: 'https://tldr.tech/ai/rss',                                                  url: 'https://tldr.tech/ai' },
  { name: 'Last Week in AI',       feed_url: 'https://lastweekin.ai/feed',                                                url: 'https://lastweekin.ai' },
  { name: 'The Gradient',          feed_url: 'https://thegradient.pub/rss/',                                              url: 'https://thegradient.pub' },
  // Tier 3: Tech & Business Media
  { name: 'Fortune AI',            feed_url: 'https://fortune.com/feed/section/artificial-intelligence/',                 url: 'https://fortune.com/section/artificial-intelligence' },
  { name: 'Harvard Biz Review AI', feed_url: 'https://hbr.org/topic/subject/ai.rss',                                     url: 'https://hbr.org/topic/subject/ai' },
  { name: 'Fast Company Tech',     feed_url: 'https://www.fastcompany.com/technology/rss',                                url: 'https://www.fastcompany.com/technology' },
  { name: 'ZDNet AI',              feed_url: 'https://www.zdnet.com/topic/artificial-intelligence/rss.xml',               url: 'https://www.zdnet.com/topic/artificial-intelligence' },
  { name: 'IEEE Spectrum AI',      feed_url: 'https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss',         url: 'https://spectrum.ieee.org/topic/artificial-intelligence' },
  { name: 'SiliconAngle AI',       feed_url: 'https://siliconangle.com/category/ai/feed/',                                url: 'https://siliconangle.com/category/ai' },
  { name: 'Ars Technica AI',       feed_url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',                  url: 'https://arstechnica.com/ai' },
  // Tier 4: Make Money / Side Hustle / Business
  { name: 'Side Hustle Nation',    feed_url: 'https://www.sidehustlenation.com/feed/',                                    url: 'https://www.sidehustlenation.com' },
  { name: 'Smart Passive Income',  feed_url: 'https://feeds.feedblitz.com/smartpassiveincome',                            url: 'https://www.smartpassiveincome.com' },
  { name: 'Indie Hackers',         feed_url: 'https://www.indiehackers.com/feed.xml',                                     url: 'https://www.indiehackers.com' },
  { name: 'Product Hunt Daily',    feed_url: 'https://www.producthunt.com/feed',                                          url: 'https://www.producthunt.com' },
  { name: 'Starter Story',         feed_url: 'https://www.starterstory.com/stories.rss',                                  url: 'https://www.starterstory.com' },
  { name: 'a16z Blog',             feed_url: 'https://a16z.com/feed/',                                                    url: 'https://a16z.com' },
  { name: 'Y Combinator Blog',     feed_url: 'https://www.ycombinator.com/blog/rss',                                      url: 'https://www.ycombinator.com/blog' },
  { name: 'Entrepreneurship HBR',  feed_url: 'https://hbr.org/topic/subject/entrepreneurship.rss',                       url: 'https://hbr.org/topic/subject/entrepreneurship' },
  // Tier 5: Learn AI / Education
  { name: 'Towards Data Science',  feed_url: 'https://towardsdatascience.com/feed',                                       url: 'https://towardsdatascience.com' },
  { name: 'ML Mastery',            feed_url: 'https://machinelearningmastery.com/feed/',                                  url: 'https://machinelearningmastery.com' },
  { name: 'Hacker News AI',        feed_url: 'https://hnrss.org/best?q=AI+LLM+GPT',                                      url: 'https://news.ycombinator.com' },
  { name: 'Papers With Code',      feed_url: 'https://paperswithcode.com/rss.xml',                                        url: 'https://paperswithcode.com' },
]

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { inserted: 0, skipped: 0, errors: [] as string[] }

  for (const source of NEW_SOURCES) {
    const { data: existing } = await supabaseAdmin
      .from('sources')
      .select('id')
      .eq('name', source.name)
      .maybeSingle()

    if (existing) { results.skipped++; continue }

    const { error } = await supabaseAdmin.from('sources').insert({
      name: source.name,
      url: source.url,
      feed_url: source.feed_url,
      source_type: 'rss',
      is_active: true,
      fetch_interval_minutes: 60,
    })

    if (error) {
      results.errors.push(`${source.name}: ${error.message}`)
    } else {
      results.inserted++
    }
  }

  return NextResponse.json({
    message: `Done: ${results.inserted} inserted, ${results.skipped} skipped, ${results.errors.length} errors`,
    ...results
  })
}
