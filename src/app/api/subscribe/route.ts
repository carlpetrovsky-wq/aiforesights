import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Valid email regex — checks proper format (local@domain.tld)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

// Known disposable/fake email domains to block
const BLOCKED_DOMAINS = new Set([
  'fake.com', 'fake.123', 'test.com', 'example.com', 'mailinator.com',
  'guerrillamail.com', 'tempmail.com', 'throwaway.email', 'yopmail.com',
  'trashmail.com', 'trashmail.net', 'dispostable.com', 'spamgourmet.com',
  'sharklasers.com', 'grr.la', 'guerrillamail.info',
])

async function isValidEmailDomain(domain: string): Promise<boolean> {
  try {
    // Check MX records — real email domains have them
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return false
    const data = await res.json()
    if (data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) return true

    // Fall back to A record check
    const res2 = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, {
      signal: AbortSignal.timeout(3000),
    })
    const data2 = await res2.json()
    return data2.Status === 0 && Array.isArray(data2.Answer) && data2.Answer.length > 0
  } catch {
    return false
  }
}

async function addToMailerLite(email: string, name?: string) {
  const apiKey = process.env.MAILERLITE_API_KEY
  const groupId = process.env.MAILERLITE_GROUP_ID

  if (!apiKey) return { success: false, reason: 'No API key configured' }

  const nameParts = (name || '').trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  try {
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
    if (res.ok) return { success: true }
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

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Format check
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const domain = cleanEmail.split('@')[1]

    // Block known fake/disposable domains
    if (BLOCKED_DOMAINS.has(domain)) {
      return NextResponse.json({ error: 'Please use a real email address.' }, { status: 400 })
    }

    // DNS verification — check domain actually exists and accepts mail
    const domainValid = await isValidEmailDomain(domain)
    if (!domainValid) {
      return NextResponse.json({ error: "That email domain doesn't appear to exist. Please check your address." }, { status: 400 })
    }

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
      return NextResponse.json({ success: true, message: "You're already subscribed!" })
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

    // Sync to MailerLite — non-blocking
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
