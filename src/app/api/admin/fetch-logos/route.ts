export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function getDomain(url: string): string {
  try {
    const u = new URL(url)
    // Use root domain for Clearbit (e.g. firefly.adobe.com -> adobe.com)
    const parts = u.hostname.split('.')
    if (parts.length > 2) {
      // Keep last two parts (adobe.com, not firefly.adobe.com)
      // Exception: co.uk, com.au etc - keep last 3
      const tld = parts[parts.length - 1]
      const sld = parts[parts.length - 2]
      if (['co', 'com', 'org', 'net', 'gov'].includes(sld) && tld.length === 2) {
        return parts.slice(-3).join('.')
      }
      return parts.slice(-2).join('.')
    }
    return u.hostname
  } catch {
    return url
  }
}

async function logoExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok && (res.headers.get('content-type') ?? '').startsWith('image')
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get('admin_token')?.value
  const bearerToken = req.headers.get('authorization')?.replace('Bearer ', '')
  const expected = process.env.ADMIN_TOKEN
  if (!expected || (cookieToken !== expected && bearerToken !== expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all tools without logos
  const { data: tools, error } = await supabaseAdmin
    .from('tools')
    .select('id, slug, name, website_url')
    .is('logo_url', null)
    .not('website_url', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!tools?.length) return NextResponse.json({ message: 'All tools already have logos', updated: 0 })

  let updated = 0
  const results: string[] = []

  for (const tool of tools) {
    const domain = getDomain(tool.website_url)
    
    // Try Clearbit first (high quality, 128x128+)
    const clearbitUrl = `https://logo.clearbit.com/${domain}`
    // Try Google favicon as fallback (always works, lower quality)
    const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

    let logoUrl: string | null = null

    const clearbitOk = await logoExists(clearbitUrl)
    if (clearbitOk) {
      logoUrl = clearbitUrl
    } else {
      // Google favicon always returns something, use it as fallback
      logoUrl = googleUrl
    }

    if (logoUrl) {
      await supabaseAdmin
        .from('tools')
        .update({ logo_url: logoUrl })
        .eq('id', tool.id)
      
      updated++
      results.push(`${tool.name} → ${clearbitOk ? 'clearbit' : 'google-favicon'}`)
    }
  }

  return NextResponse.json({ success: true, updated, results })
}
