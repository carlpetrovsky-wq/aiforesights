import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function addToMailchimp(email: string, name?: string) {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const listId = process.env.MAILCHIMP_LIST_ID || 'be88d695d0'

  if (!apiKey) return { success: false, reason: 'No API key' }

  // Mailchimp API keys end with -us1, -us2, etc — that's the datacenter
  const dc = apiKey.split('-').pop()
  if (!dc) return { success: false, reason: 'Invalid API key format' }

  const nameParts = (name || '').trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`

  const body = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      ...(firstName && { FNAME: firstName }),
      ...(lastName && { LNAME: lastName }),
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    // 200 = added, 400 with "Member Exists" = already on list (not an error for us)
    if (res.ok || data.title === 'Member Exists') {
      return { success: true }
    }

    console.error('Mailchimp error:', data)
    return { success: false, reason: data.detail || data.title }
  } catch (err) {
    console.error('Mailchimp fetch error:', err)
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

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, is_active')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed!",
      })
    }

    // Save to Supabase
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

    // Add to Mailchimp (non-blocking — don't fail the signup if Mailchimp is down)
    const mcResult = await addToMailchimp(cleanEmail, name)
    if (!mcResult.success) {
      console.warn('Mailchimp sync failed (subscriber saved to DB):', mcResult.reason)
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' })

  } catch (err) {
    console.error('Subscribe route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
