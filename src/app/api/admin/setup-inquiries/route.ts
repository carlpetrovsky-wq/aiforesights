import { NextRequest, NextResponse } from 'next/server'

// One-time setup route: creates "Contact Inquiries" group in MailerLite
// and sets up an automation to send a thank-you email when someone joins.
// Run once via: POST /api/admin/setup-inquiries (requires admin auth)

export async function POST(req: NextRequest) {
  // Admin auth check
  const token = req.cookies.get('admin_token')?.value
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'MAILERLITE_API_KEY not set' }, { status: 500 })
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }

  const results: string[] = []

  // Step 1: Check if "Contact Inquiries" group already exists
  try {
    const listRes = await fetch('https://connect.mailerlite.com/api/groups?limit=100', { headers })
    const listData = await listRes.json()
    const existing = listData.data?.find((g: any) => g.name === 'Contact Inquiries')

    let groupId: string

    if (existing) {
      groupId = existing.id
      results.push(`Group "Contact Inquiries" already exists: ${groupId}`)
    } else {
      // Create the group
      const createRes = await fetch('https://connect.mailerlite.com/api/groups', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Contact Inquiries' }),
      })
      const createData = await createRes.json()
      if (createData.data?.id) {
        groupId = createData.data.id
        results.push(`Created group "Contact Inquiries": ${groupId}`)
      } else {
        return NextResponse.json({ error: 'Failed to create group', details: createData }, { status: 500 })
      }
    }

    // Step 2: Create automation — send thank-you email when subscriber joins this group
    // MailerLite automations are complex to create via API, so instead we'll document
    // the group ID and Carl can set up the automation in the MailerLite UI (2 minutes).
    results.push(``)
    results.push(`=== NEXT STEPS ===`)
    results.push(`1. Add this env var to Vercel: MAILERLITE_INQUIRIES_GROUP_ID=${groupId}`)
    results.push(`2. In MailerLite UI → Automations → Create:`)
    results.push(`   Trigger: "When subscriber joins group" → select "Contact Inquiries"`)
    results.push(`   Action: "Send email" with your thank-you template`)
    results.push(`3. Redeploy (or wait for next push) for the env var to take effect`)

    return NextResponse.json({ success: true, groupId, results })
  } catch (e: any) {
    return NextResponse.json({ error: 'MailerLite API error', message: e.message }, { status: 500 })
  }
}
