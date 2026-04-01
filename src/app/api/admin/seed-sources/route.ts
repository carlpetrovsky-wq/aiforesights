export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

const NEW_SOURCES = [
  // Tier 1: Official AI Lab Blogs
  { name: 'Anthropic Blog',        feed_url: 'https://www.anthropic.com/rss.xml',                                   is_active: true },
  { name: 'OpenAI Blog',           feed_url: 'https://openai.com/blog/rss',                                         is_active: true },
  { name: 'Google DeepMind',       feed_url: 'https://deepmind.google/blog/rss.xml',                                is_active: true },
  { name: 'Google AI Blog',        feed_url: 'https://blog.google/technology/ai/rss/',                              is_active: true },
  { name: 'Meta AI Blog',          feed_url: 'https://ai.meta.com/blog/rss/',                                        is_active: true },
  { name: 'Microsoft AI Blog',     feed_url: 'https://blogs.microsoft.com/ai/feed/',                                is_active: true },
  { name: 'Hugging Face Blog',     feed_url: 'https://huggingface.co/blog/feed.xml',                                is_active: true },
  { name: 'Mistral Blog',          feed_url: 'https://mistral.ai/rss.xml',                                          is_active: true },
  { name: 'Cohere Blog',           feed_url: 'https://cohere.com/blog/rss.xml',                                     is_active: true },
  // Tier 2: High-Signal AI Newsletters
  { name: 'The Batch',             feed_url: 'https://www.deeplearning.ai/the-batch/feed/',                         is_active: true },
  { name: 'Import AI',             feed_url: 'https://importai.substack.com/feed',                                  is_active: true },
  { name: 'The Rundown AI',        feed_url: 'https://www.therundown.ai/feed',                                      is_active: true },
  { name: "Ben's Bites",           feed_url: 'https://bensbites.beehiiv.com/feed',                                  is_active: true },
  { name: 'TLDR AI',               feed_url: 'https://tldr.tech/ai/rss',                                            is_active: true },
  { name: 'Last Week in AI',       feed_url: 'https://lastweekin.ai/feed',                                          is_active: true },
  { name: 'The Gradient',          feed_url: 'https://thegradient.pub/rss/',                                        is_active: true },
  // Tier 3: Tech & Business Media
  { name: 'Fortune AI',            feed_url: 'https://fortune.com/feed/section/artificial-intelligence/',           is_active: true },
  { name: 'Harvard Biz Review AI', feed_url: 'https://hbr.org/topic/subject/ai.rss',                               is_active: true },
  { name: 'Fast Company Tech',     feed_url: 'https://www.fastcompany.com/technology/rss',                          is_active: true },
  { name: 'ZDNet AI',              feed_url: 'https://www.zdnet.com/topic/artificial-intelligence/rss.xml',         is_active: true },
  { name: 'IEEE Spectrum AI',      feed_url: 'https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss',   is_active: true },
  { name: 'SiliconAngle AI',       feed_url: 'https://siliconangle.com/category/ai/feed/',                          is_active: true },
  { name: 'The Information AI',    feed_url: 'https://www.theinformation.com/feed',                                 is_active: true },
  { name: 'Ars Technica AI',       feed_url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',            is_active: true },
  // Tier 4: Make Money / Side Hustle / Business
  { name: 'Side Hustle Nation',    feed_url: 'https://www.sidehustlenation.com/feed/',                              is_active: true },
  { name: 'Smart Passive Income',  feed_url: 'https://feeds.feedblitz.com/smartpassiveincome',                      is_active: true },
  { name: 'Indie Hackers',         feed_url: 'https://www.indiehackers.com/feed.xml',                               is_active: true },
  { name: 'Product Hunt Daily',    feed_url: 'https://www.producthunt.com/feed',                                    is_active: true },
  { name: 'Starter Story',         feed_url: 'https://www.starterstory.com/stories.rss',                            is_active: true },
  { name: 'a16z Blog',             feed_url: 'https://a16z.com/feed/',                                              is_active: true },
  { name: 'Y Combinator Blog',     feed_url: 'https://www.ycombinator.com/blog/rss',                                is_active: true },
  { name: 'Entrepreneurship HBR',  feed_url: 'https://hbr.org/topic/subject/entrepreneurship.rss',                 is_active: true },
  // Tier 5: Learn AI / Education
  { name: 'Towards Data Science',  feed_url: 'https://towardsdatascience.com/feed',                                 is_active: true },
  { name: 'ML Mastery',            feed_url: 'https://machinelearningmastery.com/feed/',                            is_active: true },
  { name: 'Hacker News AI',        feed_url: 'https://hnrss.org/best?q=AI+LLM+GPT',                                is_active: true },
  { name: 'Papers With Code',      feed_url: 'https://paperswithcode.com/rss.xml',                                  is_active: true },
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

    const { error } = await supabaseAdmin.from('sources').insert(source)
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
