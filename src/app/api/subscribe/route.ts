import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

const BLOCKED_DOMAINS = new Set([
  'fake.com', 'fake.123', 'test.com', 'example.com', 'mailinator.com',
  'guerrillamail.com', 'tempmail.com', 'throwaway.email', 'yopmail.com',
  'trashmail.com', 'trashmail.net', 'dispostable.com', 'spamgourmet.com',
  'sharklasers.com', 'grr.la', 'guerrillamail.info',
])

async function isValidEmailDomain(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return false
    const data = await res.json()
    if (data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) return true
    const res2 = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, {
      signal: AbortSignal.timeout(3000),
    })
    const data2 = await res2.json()
    return data2.Status === 0 && Array.isArray(data2.Answer) && data2.Answer.length > 0
  } catch {
    return false
  }
}

// Add subscriber to MailerLite as unconfirmed — MailerLite sends its own confirmation email
async function addToMailerLite(email: string, name?: string | null): Promise<void> {
  const apiKey = process.env.MAILERLITE_API_KEY
  const groupId = process.env.MAILERLITE_GROUP_ID
  if (!apiKey) return

  const fields: Record<string, string> = {}
  if (name) fields.name = name

  const body: Record<string, unknown> = {
    email,
    status: 'unconfirmed',
    fields,
  }
  if (groupId) body.groups = [groupId]

  await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const domain = cleanEmail.split('@')[1]

    if (BLOCKED_DOMAINS.has(domain)) {
      return NextResponse.json({ error: 'Please use a real email address.' }, { status: 400 })
    }

    const domainValid = await isValidEmailDomain(domain)
    if (!domainValid) {
      return NextResponse.json({ error: "That email domain doesn't appear to exist. Please check your address." }, { status: 400 })
    }

    // Check if already in Supabase
    const { data: existing } = await supabaseAdmin
      .from('subscribers')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (!existing) {
      // Save to Supabase as unconfirmed
      const { error } = await supabaseAdmin
        .from('subscribers')
        .insert({
          email: cleanEmail,
          name: name ?? null,
          source: 'website',
          is_active: false,
          subscribed_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Subscribe insert error:', error.message, error.code, error.details)
        return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
      }
    }

    // Add to MailerLite as unconfirmed — they send the confirmation email automatically
    await addToMailerLite(cleanEmail, name)

    return NextResponse.json({
      success: true,
      message: "Almost there! Check your inbox for a confirmation email and click the link to complete your subscription.",
      pending: true,
    })

  } catch (err) {
    console.error('Subscribe route error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
