export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface ValidationResult {
  id: string
  name: string
  url: string
  status: 'valid' | 'protected' | 'broken' | 'redirected' | 'timeout'
  message: string | null
  statusCode: number | null
}

async function validateUrl(url: string, timeout = 10000): Promise<{
  status: 'valid' | 'protected' | 'broken' | 'redirected' | 'timeout'
  message: string | null
  statusCode: number | null
}> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Use browser-like User-Agent to avoid bot blocking
  const browserUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  try {
    // Try HEAD first (faster), fall back to GET if HEAD fails with 403/405
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': browserUA },
    })

    // Some sites block HEAD requests — retry with GET
    if (res.status === 403 || res.status === 405) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': browserUA },
      })
    }

    clearTimeout(timeoutId)
    const statusCode = res.status

    // 2xx = valid
    if (statusCode >= 200 && statusCode < 300) {
      return { status: 'valid', message: null, statusCode }
    }

    // 3xx = redirect — check if it's a minor redirect (same domain, just trailing slash, www, or protocol)
    if (statusCode >= 300 && statusCode < 400) {
      const location = res.headers.get('location')
      if (location) {
        try {
          const originalUrl = new URL(url)
          const redirectUrl = new URL(location, url)
          const originalHost = originalUrl.hostname.replace(/^www\./, '')
          const redirectHost = redirectUrl.hostname.replace(/^www\./, '')
          
          // Same domain = valid (handles www, trailing slash, http→https)
          if (originalHost === redirectHost) {
            return { status: 'valid', message: null, statusCode }
          }
          
          // Different domain but common rebrands (e.g., chat.openai.com → chatgpt.com)
          // Still mark as redirected so admin can update the URL
        } catch { /* ignore URL parse errors */ }
      }
      return { 
        status: 'redirected', 
        message: location ? `Redirects to: ${location}` : 'Redirect (no location)',
        statusCode 
      }
    }

    // 403 = likely bot protection (Cloudflare, etc.) — site works in browser
    if (statusCode === 403) {
      return { 
        status: 'protected', 
        message: 'Bot protection (works in browser)',
        statusCode 
      }
    }

    // Other 4xx/5xx = broken
    return { 
      status: 'broken', 
      message: `HTTP ${statusCode}`,
      statusCode 
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    
    if (err instanceof Error && err.name === 'AbortError') {
      return { status: 'timeout', message: 'Request timed out after 10s', statusCode: null }
    }
    
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { status: 'broken', message, statusCode: null }
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all published tools
  const { data: tools, error: fetchError } = await supabaseAdmin
    .from('tools')
    .select('id, name, website_url')
    .eq('status', 'published')
    .order('name')

  if (fetchError || !tools) {
    return NextResponse.json({ 
      error: 'Failed to fetch tools', 
      details: fetchError?.message 
    }, { status: 500 })
  }

  const results: ValidationResult[] = []
  const now = new Date().toISOString()

  // Process tools sequentially to avoid rate limiting
  for (const tool of tools) {
    const validation = await validateUrl(tool.website_url)
    
    results.push({
      id: tool.id,
      name: tool.name,
      url: tool.website_url,
      ...validation,
    })

    // Update the tool record
    await supabaseAdmin
      .from('tools')
      .update({
        validation_status: validation.status,
        validation_message: validation.message,
        last_validated_at: now,
        updated_at: now,
      })
      .eq('id', tool.id)

    // Small delay between requests to be polite
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // Summary
  const summary = {
    total: results.length,
    valid: results.filter(r => r.status === 'valid').length,
    protected: results.filter(r => r.status === 'protected').length,
    broken: results.filter(r => r.status === 'broken').length,
    redirected: results.filter(r => r.status === 'redirected').length,
    timeout: results.filter(r => r.status === 'timeout').length,
  }

  // Only include problem tools in response (exclude valid and protected)
  const problems = results.filter(r => r.status !== 'valid' && r.status !== 'protected')

  return NextResponse.json({
    success: true,
    timestamp: now,
    summary,
    problems,
  })
}
