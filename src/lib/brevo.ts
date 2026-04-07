// ─────────────────────────────────────────────────────────────
// Brevo (formerly Sendinblue) — API helper for AI Foresights
// Replaces MailerLite. Free tier: 300 emails/day, unlimited contacts
// ─────────────────────────────────────────────────────────────

const BREVO_API = 'https://api.brevo.com/v3'

function getApiKey(): string {
  const key = process.env.BREVO_API_KEY
  if (!key) throw new Error('BREVO_API_KEY not set')
  return key
}

function getListId(): number {
  const id = process.env.BREVO_LIST_ID
  if (!id) throw new Error('BREVO_LIST_ID not set')
  return Number(id)
}

export async function brevoFetch(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${BREVO_API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'api-key': getApiKey(),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  // Some Brevo endpoints return 204 No Content (e.g. sendNow)
  if (res.status === 204) return { success: true }

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Brevo ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  }
  return data
}

// ── Contact Management ────────────────────────────────────────

/** Add a contact to Brevo and the main subscriber list */
export async function addContact(email: string, name?: string | null, extraAttributes?: Record<string, string>) {
  const attributes: Record<string, string> = { ...extraAttributes }
  if (name) {
    const parts = name.trim().split(' ')
    attributes.FIRSTNAME = parts[0] || ''
    if (parts.length > 1) attributes.LASTNAME = parts.slice(1).join(' ')
  }

  return brevoFetch('/contacts', 'POST', {
    email,
    attributes,
    listIds: [getListId()],
    updateEnabled: true, // upsert — don't fail if contact exists
  })
}

/** Delete a contact from Brevo by email */
export async function deleteContact(email: string) {
  try {
    await brevoFetch(`/contacts/${encodeURIComponent(email)}`, 'DELETE')
  } catch (e) {
    console.error('Brevo delete contact error:', e)
    // Don't fail the whole request
  }
}

// ── Campaign Management ───────────────────────────────────────

/** Create an email campaign targeting the main list, returns campaign ID */
export async function createCampaign(opts: {
  name: string
  subject: string
  htmlContent: string
  listId?: number
}): Promise<number> {
  const data = await brevoFetch('/emailCampaigns', 'POST', {
    name: opts.name,
    subject: opts.subject,
    sender: { name: 'AI Foresights', email: 'hello@aiforesights.com' },
    replyTo: 'help@aiforesights.com',
    htmlContent: opts.htmlContent,
    recipients: { listIds: [opts.listId ?? getListId()] },
  })

  const id = data?.id
  if (!id) throw new Error('No campaign ID returned from Brevo')
  return id
}

/** Send a campaign immediately */
export async function sendCampaignNow(campaignId: number) {
  return brevoFetch(`/emailCampaigns/${campaignId}/sendNow`, 'POST')
}

/** Send a test email for a campaign to specific addresses */
export async function sendCampaignTest(campaignId: number, emails: string[]) {
  return brevoFetch(`/emailCampaigns/${campaignId}/sendTest`, 'POST', {
    emailTo: emails,
  })
}

// ── List Management ───────────────────────────────────────────

/** Get all lists */
export async function getLists() {
  return brevoFetch('/contacts/lists?limit=50')
}

// ── Transactional Email ──────────────────────────────────────

/** Send a single transactional email (confirmation, notifications, etc.) */
export async function sendTransactionalEmail(opts: {
  to: { email: string; name?: string }
  subject: string
  htmlContent: string
  replyTo?: string
}) {
  return brevoFetch('/smtp/email', 'POST', {
    sender: { name: 'AI Foresights', email: 'hello@aiforesights.com' },
    to: [opts.to],
    replyTo: { email: opts.replyTo ?? 'help@aiforesights.com' },
    subject: opts.subject,
    htmlContent: opts.htmlContent,
  })
}
