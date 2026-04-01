export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

const NEW_SOURCES = [
  { name: 'Anthropic Blog',        url: 'https://www.anthropic.com/news',                          feed_url: 'https://www.anthropic.com/rss.xml' },
  { name: 'OpenAI Blog',           url: 'https://openai.com/blog',                                 feed_url: 'https://openai.com/blog/rss' },
  { name: 'Google DeepMind',       url: 'https://deepmind.google/blog',                            feed_url: 'https://deepmind.google/blog/rss.xml' },
  { name: 'Google AI Blog',        url: 'https://blog.google/technology/ai',                       feed_url: 'https://blog.google/technology/ai/rss/' },
  { name: 'Meta AI Blog',          url: 'https://ai.meta.com/blog',                                feed_url: 'https://ai.meta.com/blog/rss/' },
  { name: 'Microsoft AI Blog',     url: 'https://blogs.microsoft.com/ai',                          feed_url: 'https://blogs.microsoft.com/ai/feed/' },
  { name: 'Hugging Face Blog',     url: 'https://huggingface.co/blog',                             feed_url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'Mistral Blog',          url: 'https://mistral.ai/news',                                 feed_url: 'https://mistral.ai/rss.xml' },
  { name: 'Cohere Blog',           url: 'https://cohere.com/blog',                                 feed_url: 'https://cohere.com/blog/rss.xml' },
  { name: 'The Batch',             url: 'https://www.deeplearning.ai/the-batch',                   feed_url: 'https://www.deeplearning.ai/the-batch/feed/' },
  { name: 'Import AI',             url: 'https://importai.substack.com',                           feed_url: 'https://importai.substack.com/feed' },
  { name: 'The Rundown AI',        url: 'https://www.therundown.ai',                               feed_url: 'https://www.therundown.ai/feed' },
  { name: "Ben's Bites",           url: 'https://bensbites.com',                                   feed_url: 'https://bensbites.beehiiv.com/feed' },
  { name: 'TLDR AI',               url: 'https://tldr.tech/ai',                                    feed_url: 'https://tldr.tech/ai/rss' },
  { name: 'Last Week in AI',       url: 'https://lastweekin.ai',                                   feed_url: 'https://lastweekin.ai/feed' },
  { name: 'The Gradient',          url: 'https://thegradient.pub',                                 feed_url: 'https://thegradient.pub/rss/' },
  { name: 'Fortune AI',            url: 'https://fortune.com/section/artificial-intelligence',     feed_url: 'https://fortune.com/feed/section/artificial-intelligence/' },
  { name: 'Harvard Biz Review AI', url: 'https://hbr.org/topic/subject/ai',                       feed_url: 'https://hbr.org/topic/subject/ai.rss' },
  { name: 'Fast Company Tech',     url: 'https://www.fastcompany.com/technology',                  feed_url: 'https://www.fastcompany.com/technology/rss' },
  { name: 'ZDNet AI',              url: 'https://www.zdnet.com/topic/artificial-intelligence',     feed_url: 'https://www.zdnet.com/topic/artificial-intelligence/rss.xml' },
  { name: 'IEEE Spectrum AI',      url: 'https://spectrum.ieee.org/topic/artificial-intelligence', feed_url: 'https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss' },
  { name: 'SiliconAngle AI',       url: 'https://siliconangle.com/category/ai',                   feed_url: 'https://siliconangle.com/category/ai/feed/' },
  { name: 'Ars Technica AI',       url: 'https://arstechnica.com/ai',                             feed_url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
  { name: 'Side Hustle Nation',    url: 'https://www.sidehustlenation.com',                        feed_url: 'https://www.sidehustlenation.com/feed/' },
  { name: 'Smart Passive Income',  url: 'https://www.smartpassiveincome.com',                      feed_url: 'https://feeds.feedblitz.com/smartpassiveincome' },
  { name: 'Indie Hackers',         url: 'https://www.indiehackers.com',                            feed_url: 'https://www.indiehackers.com/feed.xml' },
  { name: 'Product Hunt Daily',    url: 'https://www.producthunt.com',                             feed_url: 'https://www.producthunt.com/feed' },
  { name: 'Starter Story',         url: 'https://www.starterstory.com',                            feed_url: 'https://www.starterstory.com/stories.rss' },
  { name: 'a16z Blog',             url: 'https://a16z.com',                                        feed_url: 'https://a16z.com/feed/' },
  { name: 'Y Combinator Blog',     url: 'https://www.ycombinator.com/blog',                       feed_url: 'https://www.ycombinator.com/blog/rss' },
  { name: 'Entrepreneurship HBR',  url: 'https://hbr.org/topic/subject/entrepreneurship',          feed_url: 'https://hbr.org/topic/subject/entrepreneurship.rss' },
  { name: 'Towards Data Science',  url: 'https://towardsdatascience.com',                          feed_url: 'https://towardsdatascience.com/feed' },
  { name: 'ML Mastery',            url: 'https://machinelearningmastery.com',                      feed_url: 'https://machinelearningmastery.com/feed/' },
  { name: 'Hacker News AI',        url: 'https://news.ycombinator.com',                            feed_url: 'https://hnrss.org/best?q=AI+LLM+GPT' },
  { name: 'Papers With Code',      url: 'https://paperswithcode.com',                              feed_url: 'https://paperswithcode.com/rss.xml' },
]

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { inserted: 0, skipped: 0, errors: [] as string[], firstError: null as any }

  // Test: try to read from sources first to confirm supabaseAdmin works
  const { data: existing, error: readErr } = await supabaseAdmin
    .from('sources')
    .select('name')
  
  if (readErr) {
    return NextResponse.json({ error: 'DB read failed', detail: readErr }, { status: 500 })
  }

  const existingNames = new Set((existing ?? []).map((s: any) => s.name))

  for (const source of NEW_SOURCES) {
    if (existingNames.has(source.name)) {
      results.skipped++
      continue
    }

    const { error } = await supabaseAdmin.from('sources').insert({
      name: source.name,
      url: source.url,
      feed_url: source.feed_url,
      source_type: 'rss',
      is_active: true,
      fetch_interval_minutes: 60,
    })

    if (error) {
      results.errors.push(`${source.name}: ${error.message} (code: ${error.code})`)
      if (!results.firstError) results.firstError = error
    } else {
      results.inserted++
    }
  }

  return NextResponse.json({
    message: `Done: ${results.inserted} inserted, ${results.skipped} skipped, ${results.errors.length} errors`,
    existingInDB: existing?.length ?? 0,
    ...results
  })
}
