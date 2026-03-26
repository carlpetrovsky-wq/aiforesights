export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Map of tool slug -> correct category
const CATEGORY_FIXES: Record<string, string> = {
  // Chatbots (the most important beginner category)
  'chatgpt':        'Chatbots',
  'claude':         'Chatbots',
  'perplexity-ai':  'Chatbots',
  'gemini':         'Chatbots',
  'grok':           'Chatbots',
  'meta-ai':        'Chatbots',
  'microsoft-copilot': 'Chatbots',
  'character-ai':   'Chatbots',
  // Coding & Dev
  'cursor':         'Coding & Dev',
  'github-copilot': 'Coding & Dev',
  'lovable':        'Coding & Dev',
  // Image Generation
  'midjourney':     'Image Generation',
  'dall-e-3':       'Image Generation',
  'adobe-firefly':  'Image Generation',
  'bing-image-creator': 'Image Generation',
  'ideogram':       'Image Generation',
  'leonardo-ai':    'Image Generation',
  // Video & Audio
  'runway-ml':      'Video & Audio',
  'sora':           'Video & Audio',
  'heygen':         'Video & Audio',
  'synthesia':      'Video & Audio',
  'elevenlabs':     'Video & Audio',
  'capcut':         'Video & Audio',
  'descript':       'Video & Audio',
  'murf-ai':        'Video & Audio',
  'pika-labs':      'Video & Audio',
  // Writing & Content
  'jasper-ai':      'Writing & Content',
  'copy-ai':        'Writing & Content',
  'grammarly':      'Writing & Content',
  'writesonic':     'Writing & Content',
  'sudowrite':      'Writing & Content',
  // Productivity
  'notion-ai':      'Productivity',
  'zapier':         'Productivity',
  'make':           'Productivity',
  'otter-ai':       'Productivity',
  'fireflies-ai':   'Productivity',
  'reclaim-ai':     'Productivity',
  'loom-ai':        'Productivity',
  'speechify':      'Productivity',
  'notebooklm':     'Productivity',
  // Design
  'canva-ai':       'Design',
  'beautiful-ai':   'Design',
  'looka':          'Design',
  'remove-bg':      'Design',
  'gamma':          'Design',
  // Search & Research
  'genspark':       'Search & Research',
  // Business & Marketing
  'surfer-seo':     'Business & marketing',
  'buffer':         'Business & marketing',
  'manychat':       'Business & marketing',
  'kickresume':     'Business & marketing',
  // AI Models / Open Source
  'hugging-face':   'AI Models',
}

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get('admin_token')?.value
  const bearerToken = req.headers.get('authorization')?.replace('Bearer ', '')
  const expected = process.env.ADMIN_TOKEN
  if (!expected || (cookieToken !== expected && bearerToken !== expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []
  let updated = 0

  for (const [slug, category] of Object.entries(CATEGORY_FIXES)) {
    const { error } = await supabaseAdmin
      .from('tools')
      .update({ category })
      .eq('slug', slug)
    
    if (!error) {
      updated++
      results.push(`${slug} → ${category}`)
    }
  }

  return NextResponse.json({ success: true, updated, results })
}
