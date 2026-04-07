import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendTransactionalEmail } from '@/lib/brevo'
import { randomBytes } from 'crypto'

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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aiforesights.com'
const LOGO_URL = 'https://www.aiforesights.com/logo-horizontal-white.png'

function buildConfirmationEmail(confirmUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your AI Foresights subscription</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; background-color: #f1f5f9; }
    @media only screen and (max-width: 620px) {
      .email-card { width: 100% !important; }
      .email-padding { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" class="email-card" width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td align="center" style="background-color:#0F172A;padding:28px 40px;">
            <img src="${LOGO_URL}" alt="AI Foresights" width="200" height="auto"
                 style="display:block;max-width:200px;height:auto;" />
            <p style="margin:10px 0 0 0;font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">A New Dawn Is Here</p>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td align="center" class="email-padding" style="padding:40px 40px 32px 40px;border-bottom:1px solid #e2e8f0;">
            <div style="width:56px;height:56px;background-color:#e0f2fe;border-radius:50%;margin:0 auto 20px auto;line-height:56px;text-align:center;font-size:26px;">&#9993;&#65039;</div>
            <h1 style="margin:0 0 14px 0;font-size:26px;font-weight:800;color:#0F172A;line-height:1.25;font-family:Arial,sans-serif;">One click to confirm</h1>
            <p style="margin:0 0 28px 0;font-size:16px;color:#475569;line-height:1.6;font-family:Arial,sans-serif;">
              You're almost subscribed to AI Foresights — your weekly briefing on AI news, tools, and opportunities. Just click the button below to confirm your email address.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="border-radius:8px;background-color:#0EA5E9;">
                  <a href="${confirmUrl}" target="_blank"
                     style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;border-radius:8px;letter-spacing:0.3px;">
                    &#10003; &nbsp;Confirm My Subscription
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:20px 0 0 0;font-size:13px;color:#94a3b8;font-family:Arial,sans-serif;">
              This link expires in 48 hours. If you didn't sign up, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- WHAT YOU GET -->
        <tr>
          <td class="email-padding" style="padding:32px 40px;border-bottom:1px solid #e2e8f0;">
            <p style="margin:0 0 16px 0;font-size:13px;font-weight:700;color:#0F172A;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">What you'll get</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding:8px 0;font-size:15px;color:#334155;font-family:Arial,sans-serif;">&#128240; &nbsp;Daily AI news from 30+ top sources</td></tr>
              <tr><td style="padding:8px 0;font-size:15px;color:#334155;font-family:Arial,sans-serif;">&#128736;&#65039; &nbsp;Reviews of the best AI tools for professionals</td></tr>
              <tr><td style="padding:8px 0;font-size:15px;color:#334155;font-family:Arial,sans-serif;">&#128176; &nbsp;Practical ways to use AI to save time and earn more</td></tr>
              <tr><td style="padding:8px 0;font-size:15px;color:#334155;font-family:Arial,sans-serif;">&#127381; &nbsp;Always free — no credit card, no catch</td></tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding:24px 40px;background-color:#f8fafc;">
            <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;font-family:Arial,sans-serif;">
              AI Foresights &middot; Texas, USA
            </p>
            <p style="margin:0;font-size:12px;color:#cbd5e1;font-family:Arial,sans-serif;">
              You received this because someone subscribed at <a href="${BASE_URL}" style="color:#0EA5E9;text-decoration:none;">aiforesights.com</a> using this email address.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
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
      .select('id, confirmed')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existing?.confirmed) {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed! Check your inbox every Tuesday for our AI briefing.",
      })
    }

    // Generate confirmation token
    const confirmToken = randomBytes(32).toString('hex')
    const confirmExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    if (existing && !existing.confirmed) {
      // Re-send confirmation for unconfirmed subscriber
      await supabaseAdmin
        .from('subscribers')
        .update({
          name: name ?? null,
          confirm_token: confirmToken,
          confirm_expires_at: confirmExpiresAt,
        })
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
          confirm_token: confirmToken,
          confirm_expires_at: confirmExpiresAt,
          subscribed_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Subscribe insert error:', error.message, error.code, error.details)
        return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
      }
    }

    // Send confirmation email via Brevo transactional API
    const confirmUrl = `${BASE_URL}/api/confirm?token=${confirmToken}`
    const html = buildConfirmationEmail(confirmUrl)

    try {
      await sendTransactionalEmail({
        to: { email: cleanEmail, name: name ?? undefined },
        subject: 'Confirm your AI Foresights subscription',
        htmlContent: html,
      })
    } catch (e) {
      console.error('Brevo confirmation email error:', e)
      // Still return success — subscriber is in Supabase, they can retry
    }

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
