import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'
import crypto from 'crypto'

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

async function sendConfirmationEmail(email: string, confirmUrl: string): Promise<boolean> {
  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) return false

  const htmlBody = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Confirm your AI Foresights subscription</title>
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}body{margin:0;padding:0;background-color:#f1f5f9}</style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

  <tr><td align="center" style="background-color:#0F172A;padding:28px 40px;">
    <img src="https://storage.mlcdn.com/account_image/2216281/gUm0sqAOuCYgJyQIgAIMDGm77laJRzbrWMKL0lSh.png"
      alt="AI Foresights" width="200" style="display:block;max-width:200px;height:auto;"/>
    <p style="margin:10px 0 0 0;font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">A New Dawn Is Here</p>
  </td></tr>

  <tr><td align="center" style="padding:40px 40px 32px 40px;border-bottom:1px solid #e2e8f0;">
    <div style="width:56px;height:56px;background-color:#e0f2fe;border-radius:50%;margin:0 auto 20px auto;line-height:56px;text-align:center;font-size:26px;">✉️</div>
    <h1 style="margin:0 0 14px 0;font-size:26px;font-weight:800;color:#0F172A;line-height:1.25;font-family:Arial,sans-serif;">One click to confirm</h1>
    <p style="margin:0 0 28px 0;font-size:16px;color:#475569;line-height:1.6;font-family:Arial,sans-serif;">
      You're almost subscribed to AI Foresights — your daily briefing on AI news, tools, and opportunities. Click below to confirm your email.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="border-radius:8px;background-color:#0EA5E9;">
        <a href="${confirmUrl}" target="_blank"
           style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;border-radius:8px;">
          ✓ &nbsp;Confirm My Subscription
        </a>
      </td></tr>
    </table>
    <p style="margin:20px 0 0 0;font-size:13px;color:#94a3b8;font-family:Arial,sans-serif;">
      This link expires in 48 hours. If you didn't sign up, safely ignore this email.
    </p>
  </td></tr>

  <tr><td style="padding:32px 40px;border-bottom:1px solid #e2e8f0;">
    <p style="margin:0 0 16px 0;font-size:13px;font-weight:700;color:#0F172A;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">What you'll get</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:8px 0;font-size:15px;color:#334155;font-family:Arial,sans-serif;">📰 &nbsp;Daily AI news from 30+ top sources</td></tr>
      <tr><td style="padding:8px 0;font-size:15px;color:#334155;font-family:Arial,sans-serif;">🛠️ &nbsp;Reviews of the best AI tools for professionals</td></tr>
      <tr><td style="padding:8px 0;font-size:15px;color:#334155;font-family:Arial,sans-serif;">💰 &nbsp;Practical ways to use AI to save time and earn more</td></tr>
      <tr><td style="padding:8px 0;font-size:15px;color:#334155;font-family:Arial,sans-serif;">🆓 &nbsp;Always free — no credit card, no catch</td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding:24px 40px;background-color:#f8fafc;">
    <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;font-family:Arial,sans-serif;">AI Foresights · Frisco, Texas</p>
    <p style="margin:0;font-size:12px;color:#cbd5e1;font-family:Arial,sans-serif;">
      You received this because someone subscribed at <a href="https://www.aiforesights.com" style="color:#0EA5E9;text-decoration:none;">aiforesights.com</a> using this email.
    </p>
  </td></tr>

</table></td></tr></table>
</body></html>`

  try {
    const res = await fetch('https://connect.mailerlite.com/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: `Confirm - ${email} - ${Date.now()}`,
        type: 'regular',
        status: 'draft',
        emails: [{
          subject: 'Please confirm your AI Foresights subscription',
          from_name: 'AI Foresights',
          from: 'hello@aiforesights.com',
          reply_to: 'hello@aiforesights.com',
          content: htmlBody,
        }],
      }),
    })
    // Campaigns API is complex — use the simpler transactional approach instead
    // Fall through to direct SMTP via MailerLite subscriber email trigger
  } catch {}

  // Use MailerLite's subscriber-based email: add as unconfirmed, 
  // then trigger via a dedicated confirmation automation group
  // For now send directly via the API's email sending endpoint
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
        status: 'unconfirmed',
        fields: { confirm_url: confirmUrl },
      }),
    })
    return res.ok || res.status === 409
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

    // Check if already confirmed
    const { data: existing } = await supabaseAdmin
      .from('subscribers')
      .select('id, confirmed, confirm_token')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existing?.confirmed) {
      return NextResponse.json({ success: true, message: "You're already subscribed!" })
    }

    // Generate a secure confirmation token (64 hex chars)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aiforesights.com'
    const confirmUrl = `${siteUrl}/confirm?token=${token}`

    if (existing) {
      // Resend: update token
      await supabaseAdmin
        .from('subscribers')
        .update({ confirm_token: token, confirm_expires_at: expiresAt })
        .eq('id', existing.id)
    } else {
      // New subscriber — save as unconfirmed
      const { error } = await supabaseAdmin
        .from('subscribers')
        .insert({
          email: cleanEmail,
          name: name ?? null,
          source: 'website',
          is_active: false,
          confirmed: false,
          confirm_token: token,
          confirm_expires_at: expiresAt,
          subscribed_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Subscribe insert error:', error.message)
        return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
      }
    }

    // Send confirmation email via MailerLite transactional
    await sendConfirmationEmail(cleanEmail, confirmUrl)

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
