export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface ValidationResult {
  id: string
  name: string
  url: string
  status: 'valid' | 'broken' | 'redirected' | 'timeout'
  message: string | null
  statusCode: number | null
}

async function validateUrl(url: string, timeout = 8000): Promise<{
  status: 'valid' | 'broken' | 'redirected' | 'timeout'
  message: string | null
  statusCode: number | null
}> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual', // Don't follow redirects automatically
      signal: controller.signal,
      headers: {
        'User-Agent': 'AIForesights-LinkChecker/1.0 (+https://www.aiforesights.com)',
      },
    })
    clearTimeout(timeoutId)

    const statusCode = res.status

    // 2xx = valid
    if (statusCode >= 200 && statusCode < 300) {
      return { status: 'valid', message: null, statusCode }
    }

    // 3xx = redirect (not necessarily bad, but worth flagging)
    if (statusCode >= 300 && statusCode < 400) {
      const location = res.headers.get('location')
      return { 
        status: 'redirected', 
        message: location ? `Redirects to: ${location}` : 'Redirect (no location header)',
        statusCode 
      }
    }

    // 4xx/5xx = broken
    return { 
      status: 'broken', 
      message: `HTTP ${statusCode}`,
      statusCode 
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    
    if (err instanceof Error && err.name === 'AbortError') {
      return { status: 'timeout', message: 'Request timed out after 8s', statusCode: null }
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
    broken: results.filter(r => r.status === 'broken').length,
    redirected: results.filter(r => r.status === 'redirected').length,
    timeout: results.filter(r => r.status === 'timeout').length,
  }

  // Only include problem tools in response for brevity
  const problems = results.filter(r => r.status !== 'valid')

  return NextResponse.json({
    success: true,
    timestamp: now,
    summary,
    problems,
  })
}
