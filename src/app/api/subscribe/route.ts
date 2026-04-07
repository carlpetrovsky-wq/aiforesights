import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { addContact } from '@/lib/brevo'

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
      const { error } = await supabaseAdmin
        .from('subscribers')
        .insert({
          email: cleanEmail,
          name: name ?? null,
          source: 'website',
          is_active: true,
          subscribed_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Subscribe insert error:', error.message, error.code, error.details)
        return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
      }
    }

    // Add to Brevo contact list
    try {
      await addContact(cleanEmail, name)
    } catch (e) {
      console.error('Brevo addContact error:', e)
      // Don't fail — Supabase is the source of truth
    }

    return NextResponse.json({
      success: true,
      message: "You're subscribed! Welcome to AI Foresights — check your inbox for a welcome email soon.",
    })

  } catch (err) {
    console.error('Subscribe route error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
