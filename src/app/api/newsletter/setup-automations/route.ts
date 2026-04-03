export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { buildEmail3 } from '@/lib/email/templates'

const MAILERLITE_API = 'https://connect.mailerlite.com/api'
const GROUP_ID = process.env.MAILERLITE_GROUP_ID!
const BASE_URL = 'https://www.aiforesights.com'

async function mlFetch(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${MAILERLITE_API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  if (!res.ok) throw new Error(`MailerLite ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  return data
}

// Fetch 3 most recent published articles for the Email 2 snapshot
async function getRecentArticles() {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('title, slug, excerpt, thumbnail_url, category_slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)
  return data ?? []
}

function buildEmail2Static(articles: Array<{
  title: string; slug: string; excerpt?: string | null; thumbnail_url?: string | null
}>): string {
  const LOGO_URL = 'https://www.aiforesights.com/images/logo-white.png'

  function articleCard(title: string, excerpt: string, url: string, thumb?: string | null) {
    const img = thumb
      ? `<img src="${thumb}" alt="" width="100%" style="display:block;border-radius:6px;margin-bottom:12px;height:auto;" />`
      : ''
    return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;">
      <tr><td style="padding:16px;">
        ${img}
        <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#0F172A;line-height:1.4;">${title}</p>
        <p style="margin:0 0 12px;font-size:14px;color:#64748b;line-height:1.6;">${excerpt}</p>
        <a href="${url}" style="font-size:13px;font-weight:600;color:#0EA5E9;text-decoration:none;">Read now →</a>
      </td></tr>
    </table>`
  }

  const cards = articles.slice(0, 3).map(a =>
    articleCard(a.title, a.excerpt || '', `${BASE_URL}/article/${a.slug}`, a.thumbnail_url)
  ).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">Here's what's happening in AI right now — your first read from AI Foresights.&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <tr><td style="background-color:#0F172A;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
        <img src="${LOGO_URL}" alt="AI Foresights" width="160" style="display:inline-block;height:auto;"/>
        <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;">A New Dawn Is Here</p>
      </td></tr>
      <tr><td style="background-color:#ffffff;padding:40px 32px;">
        <p style="margin:0 0 8px;font-size:28px;font-weight:800;color:#0F172A;text-align:center;">📰 Your first read is ready</p>
        <p style="margin:0 0 32px;font-size:16px;color:#64748b;text-align:center;line-height:1.6;">AI moves fast. Here's what's happening right now — in plain English, no technical background needed.</p>

        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">Today's Top Stories</p>
        ${cards}

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"/>
        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">Every day, our team scans hundreds of sources so you don't have to. The site is updated daily with the stories, tools, and guides that actually matter to you.</p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
          <tr><td style="background-color:#0EA5E9;border-radius:8px;">
            <a href="${BASE_URL}/latest-news" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Explore all the latest news →</a>
          </td></tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
          <tr>
            <td style="padding:0 8px;"><a href="${BASE_URL}/best-ai-tools" style="display:inline-block;padding:10px 20px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#334155;text-decoration:none;">🔧 AI Tools</a></td>
            <td style="padding:0 8px;"><a href="${BASE_URL}/make-money" style="display:inline-block;padding:10px 20px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#334155;text-decoration:none;">💰 Make Money</a></td>
            <td style="padding:0 8px;"><a href="${BASE_URL}/learn-ai" style="display:inline-block;padding:10px 20px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#334155;text-decoration:none;">🎓 Learn AI</a></td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"/>
        <p style="margin:0;font-size:14px;color:#64748b;line-height:1.7;">Welcome aboard,<br/><strong style="color:#0F172A;">Your team at AI Foresights</strong></p>
      </td></tr>
      <tr><td style="background-color:#0F172A;border-radius:0 0 12px 12px;padding:24px 32px;text-align:center;">
        <img src="${LOGO_URL}" alt="AI Foresights" width="120" style="display:inline-block;height:auto;margin-bottom:12px;"/>
        <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;">Texas, USA &nbsp;·&nbsp; <a href="${BASE_URL}" style="color:#94a3b8;text-decoration:none;">aiforesights.com</a> &nbsp;·&nbsp; <a href="mailto:help@aiforesights.com" style="color:#94a3b8;text-decoration:none;">help@aiforesights.com</a></p>
        <p style="margin:0;color:#64748b;font-size:11px;">You're receiving this because you subscribed at aiforesights.com.<br/>
        <a href="{$unsubscribe}" style="color:#64748b;">Unsubscribe</a> &nbsp;·&nbsp; <a href="{$manage_preferences}" style="color:#64748b;">Manage preferences</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  try {
    // ── Step 1: Get existing automations to find the welcome one ──
    const automations = await mlFetch('/automations?limit=25')
    results.automationsFound = automations?.data?.length ?? 0

    // ── Step 2: Fetch article snapshot for Email 2 ────────────
    const articles = await getRecentArticles()
    const email2Html = buildEmail2Static(articles)
    const email3Html = buildEmail3()

    // ── Step 3: Create Email 2 automation ─────────────────────
    // Trigger: subscriber added to group → wait 2 days → send
    const auto2 = await mlFetch('/automations', 'POST', {
      name: 'Welcome Sequence — Email 2 (Day 2)',
      enabled: true,
      trigger: {
        type: 'subscriber_added_to_group',
        groups: [GROUP_ID],
      },
      steps: [
        {
          type: 'delay',
          value: 2,
          unit: 'days',
        },
        {
          type: 'email',
          email: {
            subject: '📰 Your first read from AI Foresights is ready',
            from_name: 'AI Foresights',
            from: 'hello@aiforesights.com',
            reply_to: 'help@aiforesights.com',
            content: email2Html,
          },
        },
      ],
    })
    results.email2AutomationId = auto2?.data?.id ?? null

    // ── Step 4: Create Email 3 automation ─────────────────────
    // Trigger: same group → wait 7 days → send
    const auto3 = await mlFetch('/automations', 'POST', {
      name: 'Welcome Sequence — Email 3 (Day 7)',
      enabled: true,
      trigger: {
        type: 'subscriber_added_to_group',
        groups: [GROUP_ID],
      },
      steps: [
        {
          type: 'delay',
          value: 7,
          unit: 'days',
        },
        {
          type: 'email',
          email: {
            subject: '📬 Every Tuesday, this lands in your inbox',
            from_name: 'AI Foresights',
            from: 'hello@aiforesights.com',
            reply_to: 'help@aiforesights.com',
            content: email3Html,
          },
        },
      ],
    })
    results.email3AutomationId = auto3?.data?.id ?? null

    return NextResponse.json({
      success: true,
      message: 'Email 2 (Day 2) and Email 3 (Day 7) automations created in MailerLite.',
      ...results,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[setup-automations] Error:', message)
    return NextResponse.json({ error: message, partial: results }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Check current automation status
  const adminCookie = req.cookies.get('admin_token')?.value
  if (adminCookie !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await mlFetch('/automations?limit=25')
  return NextResponse.json({ automations: data?.data ?? [] })
}
