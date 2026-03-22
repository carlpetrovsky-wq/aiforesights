import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if already subscribed first
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'You\'re already subscribed!',
      })
    }

    // Plain insert — no upsert to avoid needing UPDATE permission
    const { error } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        name: name ?? null,
        source: 'website',
        is_active: true,
        subscribed_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Subscribe insert error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' })

  } catch (err) {
    console.error('Subscribe route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
