import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete unconfirmed subscribers older than 48 hours
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data, error, count } = await supabaseAdmin
    .from('subscribers')
    .delete({ count: 'exact' })
    .eq('confirmed', false)
    .lt('subscribed_at', cutoff)
    .select('email')

  if (error) {
    console.error('Cleanup subscribers error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`Cleanup: deleted ${count} unconfirmed subscribers older than 48hrs`)
  return NextResponse.json({ success: true, deleted: count ?? 0 })
}
