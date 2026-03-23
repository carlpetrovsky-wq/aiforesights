import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function addToMailerLite(email: string, name?: string) {
  const apiKey = process.env.MAILERLITE_API_KEY
  const groupId = process.env.MAILERLITE_GROUP_ID

  if (!apiKey) return { success: false, reason: 'No API key configured' }

  const nameParts = (name || '').trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  try {
    // Add/update subscriber via MailerLite v2 API
    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        fields: {
          ...(firstName && { name: firstName }),
          ...(lastName && { last_name: lastName }),
        },
        groups: groupId ? [groupId] : [],
        status: 'active',
      }),
    })

    const data = await res.json()

    // 200 = updated existing, 201 = created new — both are success
    if (res.ok) return { success: true }

    // 409 = already subscribed — treat as success
    if (res.status === 409) return { success: true }

    console.error('MailerLite error:', data)
    return { success: false, reason: data?.message || `HTTP ${res.status}` }

  } catch (err) {
    console.error('MailerLite fetch error:', err)
    return { success: false, reason: 'Network error' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if already subscribed in Supabase
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, is_active')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: true, message: "You're already subscribed!" })
    }

    // Save to Supabase first
    const { error } = await supabase
      .from('subscribers')
      .insert({
        email: cleanEmail,
        name: name ?? null,
        source: 'website',
        is_active: true,
        subscribed_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Subscribe insert error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sync to MailerLite — non-blocking, never fails the signup
    const mlResult = await addToMailerLite(cleanEmail, name)
    if (!mlResult.success) {
      console.warn('MailerLite sync failed (subscriber saved to DB):', mlResult.reason)
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' })

  } catch (err) {
    console.error('Subscribe route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
