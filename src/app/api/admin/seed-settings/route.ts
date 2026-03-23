export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const NEW_SETTINGS = [
  { key: 'google_site_verification', value: '', description: 'Google Search Console verification code (content value only)' },
  { key: 'google_analytics_id', value: '', description: 'Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)' },
]

export async function POST() {
  const results = []
  for (const s of NEW_SETTINGS) {
    const { error } = await supabaseAdmin
      .from('settings')
      .upsert(s, { onConflict: 'key', ignoreDuplicates: true })
    results.push({ key: s.key, error: error?.message ?? null })
  }
  return NextResponse.json({ results })
}
