import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Send notification to Carl via Brevo transactional email
async function notifyViaBrevo(name: string, email: string, type: string, message: string) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.log('Contact notify: BREVO_API_KEY not set, skipping')
    return
  }

  try {
    // Send a transactional email to Carl with the inquiry details
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'AI Foresights', email: 'hello@aiforesights.com' },
        to: [{ email: 'carlpetrovsky@gmail.com', name: 'Carl' }],
        replyTo: { email, name },
        subject: `[AIForesights] New ${type} inquiry from ${name}`,
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
          <hr/>
          <p style="color:#999;font-size:12px;">Sent from aiforesights.com contact form</p>
        `,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('Contact notify: Brevo error', res.status, JSON.stringify(data))
    } else {
      console.log('Contact notify: sent via Brevo transactional email')
    }
  } catch (e) {
    console.error('Contact notify: Brevo fetch failed', e)
  }
}

// Entropy check — detects random-looking strings bots generate
// Real names like "Jane Smith" score low; "GyutOzLXssjyERweXjIVyU" scores high
function isHighEntropy(str: string): boolean {
  const cleaned = str.replace(/\s+/g, '')
  if (cleaned.length < 8) return false
  const unique = new Set(cleaned.toLowerCase()).size
  const ratio = unique / cleaned.length
  return ratio > 0.65 && cleaned.length > 10
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, type, message, website, formLoadedAt } = body

    // Honeypot — real browsers leave this blank, bots fill it in
    if (website && website.trim() !== '') {
      return NextResponse.json({ success: true }) // silent drop
    }

    // Timing check — bots submit in under 2 seconds
    if (formLoadedAt && (Date.now() - Number(formLoadedAt)) < 2000) {
      return NextResponse.json({ success: true }) // silent drop
    }

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Entropy check — catches random-string bot submissions
    if (isHighEntropy(name) || isHighEntropy(message)) {
      return NextResponse.json({ success: true }) // silent drop
    }

    // Rate limiting: max 3 inquiries per email per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', oneDayAgo)

    if (count && count >= 3) {
      return NextResponse.json({ success: false, error: 'Too many messages. Please try again tomorrow.' }, { status: 429 })
    }

    const trimmedName = name.trim().slice(0, 200)
    const trimmedEmail = email.trim().toLowerCase().slice(0, 320)
    const trimmedType = (type || 'general').slice(0, 50)
    const trimmedMessage = message.trim().slice(0, 5000)

    const { error } = await supabaseAdmin
      .from('inquiries')
      .insert({
        name: trimmedName,
        email: trimmedEmail,
        inquiry_type: trimmedType,
        message: trimmedMessage,
        status: 'new',
      })

    if (error) {
      console.error('Contact form error:', error)
      return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // Send notification via Brevo transactional email
    await notifyViaBrevo(trimmedName, trimmedEmail, trimmedType, trimmedMessage)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Contact API error:', e)
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
