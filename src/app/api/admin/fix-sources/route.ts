export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

// Correct feed URLs discovered by testing
const UPDATES = [
  { name: "Ben's Bites",         feed_url: 'https://bensbites.substack.com/feed' },
  { name: 'TLDR AI',             feed_url: 'https://tldr.tech/api/rss/ai' },
  { name: 'Meta AI Blog',        feed_url: 'https://about.fb.com/feed/' },
  { name: 'Smart Passive Income',feed_url: 'https://www.smartpassiveincome.com/blog/feed/' },
]

// Sources with no working RSS — disable them
const DISABLE = [
  'a16z Blog', 'Mistral Blog', 'Cohere Blog', 'The Rundown AI',
  'Harvard Biz Review AI', 'Entrepreneurship HBR', 'Starter Story',
]

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { updated: 0, disabled: 0, errors: [] as string[] }

  for (const u of UPDATES) {
    const { error } = await supabaseAdmin
      .from('sources')
      .update({ feed_url: u.feed_url })
      .eq('name', u.name)
    if (error) results.errors.push(`Update ${u.name}: ${error.message}`)
    else results.updated++
  }

  for (const name of DISABLE) {
    const { error } = await supabaseAdmin
      .from('sources')
      .update({ is_active: false })
      .eq('name', name)
    if (error) results.errors.push(`Disable ${name}: ${error.message}`)
    else results.disabled++
  }

  return NextResponse.json({
    message: `Fixed: ${results.updated} URLs updated, ${results.disabled} disabled, ${results.errors.length} errors`,
    ...results
  })
}
