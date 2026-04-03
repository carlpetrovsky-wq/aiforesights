// ─────────────────────────────────────────────────────────────
// AI Foresights — Email HTML Templates
// Matches brand: Navy #0F172A header, Sky blue #0EA5E9 CTAs
// ─────────────────────────────────────────────────────────────

const BASE_URL = 'https://www.aiforesights.com'
const LOGO_URL = 'https://www.aiforesights.com/logo-white.png'

function emailWrapper(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Foresights</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr><td style="background-color:#0F172A;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
          <img src="${LOGO_URL}" alt="AI Foresights" width="160" style="display:inline-block;height:auto;" />
          <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;">A New Dawn Is Here</p>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background-color:#ffffff;padding:40px 32px;">
          ${content}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background-color:#0F172A;border-radius:0 0 12px 12px;padding:24px 32px;text-align:center;">
          <img src="${LOGO_URL}" alt="AI Foresights" width="120" style="display:inline-block;height:auto;margin-bottom:12px;" />
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

function blueButton(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
    <tr><td style="background-color:#0EA5E9;border-radius:8px;">
      <a href="${url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${text}</a>
    </td></tr>
  </table>`
}

function sectionLabel(text: string): string {
  return `<p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">${text}</p>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />`
}

function articleCard(title: string, excerpt: string, url: string, thumbnailUrl?: string | null): string {
  const img = thumbnailUrl
    ? `<img src="${thumbnailUrl}" alt="" width="100%" style="display:block;border-radius:6px;margin-bottom:12px;height:auto;" />`
    : ''
  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <tr><td style="padding:16px;">
      ${img}
      <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#0F172A;line-height:1.4;">${title}</p>
      <p style="margin:0 0 12px;font-size:14px;color:#64748b;line-height:1.6;">${excerpt}</p>
      <a href="${url}" style="font-size:13px;font-weight:600;color:#0EA5E9;text-decoration:none;">Read now →</a>
    </td></tr>
  </table>`
}

// ─────────────────────────────────────────────────────────────
// EMAIL 2 — Day 2: "Here's what's happening in AI right now"
// Dynamic — 3 recent articles passed in at send time
// ─────────────────────────────────────────────────────────────
export interface ArticleSnap {
  title: string
  excerpt: string
  slug: string
  thumbnail_url?: string | null
  source_name?: string | null
  category_slug?: string | null
}

export function buildEmail2(articles: ArticleSnap[]): string {
  const articleCards = articles.slice(0, 3).map(a => {
    const url = `${BASE_URL}/article/${a.slug}`
    return articleCard(a.title, a.excerpt || '', url, a.thumbnail_url)
  }).join('')

  const content = `
    <p style="margin:0 0 8px;font-size:28px;font-weight:800;color:#0F172A;text-align:center;">📰 Your first read is ready</p>
    <p style="margin:0 0 32px;font-size:16px;color:#64748b;text-align:center;line-height:1.6;">
      AI moves fast. Here's what's happening right now — in plain English, no technical background needed.
    </p>

    ${sectionLabel("Today's Top Stories")}
    ${articleCards}

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      Every day, our team scans hundreds of sources so you don't have to. The site is updated daily with the stories, tools, and guides that actually matter to you.
    </p>

    ${blueButton('Explore all the latest news →', `${BASE_URL}/latest-news`)}

    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto 0;">
      <tr>
        <td style="padding:0 8px;"><a href="${BASE_URL}/best-ai-tools" style="display:inline-block;padding:10px 20px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#334155;text-decoration:none;">🔧 AI Tools</a></td>
        <td style="padding:0 8px;"><a href="${BASE_URL}/make-money" style="display:inline-block;padding:10px 20px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#334155;text-decoration:none;">💰 Make Money</a></td>
        <td style="padding:0 8px;"><a href="${BASE_URL}/learn-ai" style="display:inline-block;padding:10px 20px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#334155;text-decoration:none;">🎓 Learn AI</a></td>
      </tr>
    </table>

    ${divider()}

    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.7;">
      Welcome aboard,<br/>
      <strong style="color:#0F172A;">Your team at AI Foresights</strong>
    </p>
  `

  return emailWrapper(content, 'Here\'s what\'s happening in AI right now — your first read from AI Foresights.')
}

// ─────────────────────────────────────────────────────────────
// EMAIL 3 — Day 7: "Every Tuesday, this lands in your inbox"
// Static preview of the weekly digest format
// ─────────────────────────────────────────────────────────────
export function buildEmail3(): string {
  const content = `
    <p style="margin:0 0 8px;font-size:28px;font-weight:800;color:#0F172A;text-align:center;">📬 Your weekly AI briefing starts now</p>
    <p style="margin:0 0 32px;font-size:16px;color:#64748b;text-align:center;line-height:1.6;">
      Every Tuesday at 10 AM, this lands in your inbox. Here's exactly what to expect.
    </p>

    ${sectionLabel("What's inside every Tuesday")}

    <!-- Video block -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">🎬 AI Video of the Week</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">One handpicked video that explains the most important AI story of the week — curated so you can stay informed in under 20 minutes.</p>
      </td></tr>
    </table>

    <!-- Podcast block -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">🎙️ AI Podcast Roundup</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">Five of the best AI podcast episodes from the past week — with a short summary of each so you can pick the ones that interest you most.</p>
      </td></tr>
    </table>

    <!-- Articles block -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">📰 Top Stories of the Week</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">The 3 most important AI stories of the week, summarized in plain English. No jargon, no noise — just the news that matters to you.</p>
      </td></tr>
    </table>

    <!-- Make Money block -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">💰 Make Money With AI</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">One practical guide each week — real ways to earn extra income using AI tools, from side hustles to freelance opportunities.</p>
      </td></tr>
    </table>

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;text-align:center;">
      Your first full digest lands <strong>this Tuesday at 10 AM</strong>.<br/>Keep an eye out for it.
    </p>

    ${blueButton('Explore the site while you wait →', BASE_URL)}

    ${divider()}

    <p style="margin:0 0 8px;font-size:14px;color:#64748b;line-height:1.7;">
      One last thing — if you ever have a question about anything AI-related, just reply to this email. We read every one.
    </p>
    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.7;">
      See you Tuesday,<br/>
      <strong style="color:#0F172A;">Your team at AI Foresights</strong>
    </p>
  `

  return emailWrapper(content, 'Every Tuesday at 10 AM, your AI briefing arrives. Here\'s exactly what\'s inside.')
}

// ─────────────────────────────────────────────────────────────
// WEEKLY DIGEST — Tuesday Campaign
// ─────────────────────────────────────────────────────────────
export interface VideoSnap {
  youtube_id: string
  title: string
  intro: string
  published_at: string
}

export interface PodcastSnap {
  title: string
  week_of: string
  episodes: Array<{ episode_title?: string; title?: string; podcast_name?: string; channel?: string; duration?: string }>
}

export interface ToolSnap {
  name: string
  slug: string
  description: string
  website_url: string
  affiliate_url?: string | null
  pricing?: string | null
  category?: string | null
  logo_url?: string | null
}

export function buildWeeklyDigest(
  video: VideoSnap | null,
  podcast: PodcastSnap | null,
  articles: ArticleSnap[],
  makeMoneyArticle: ArticleSnap | null,
  tools: ToolSnap[] = []
): string {
  const now = new Date()
  const weekLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // ── Video section ─────────────────────────────────────────
  const videoSection = video ? `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr><td>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;">
          <tr><td style="border-left:3px solid #0EA5E9;padding-left:10px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">🎬 AI Video of the Week</p>
          </td></tr>
        </table>
        <a href="${BASE_URL}/ai-video-of-the-week" style="display:block;text-decoration:none;">
          <img src="https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg" alt="${video.title}" width="100%" style="display:block;border-radius:10px;height:auto;width:100%;" />
        </a>
        <p style="margin:14px 0 6px;font-size:18px;font-weight:700;color:#0F172A;line-height:1.4;">${video.title}</p>
        <p style="margin:0 0 14px;font-size:14px;color:#64748b;line-height:1.7;">${video.intro.split(' ').slice(0, 35).join(' ')}${video.intro.split(' ').length > 35 ? '…' : ''}</p>
        <a href="${BASE_URL}/ai-video-of-the-week" style="display:inline-block;padding:9px 20px;background-color:#0EA5E9;border-radius:6px;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;">▶&nbsp; Watch now</a>
      </td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 28px;" />
  ` : ''

  // ── Podcast section ───────────────────────────────────────
  const podcastSection = podcast ? `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr><td>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
          <tr><td style="border-left:3px solid #0EA5E9;padding-left:10px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">🎙️ AI Podcast Roundup</p>
          </td></tr>
        </table>
        <p style="margin:0 0 16px;font-size:17px;font-weight:700;color:#0F172A;line-height:1.3;">${podcast.title}</p>
        ${podcast.episodes.slice(0, 5).map((ep, i) => `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px;background-color:#f8fafc;border-radius:8px;">
          <tr>
            <td width="36" valign="top" style="padding:12px 0 12px 14px;">
              <span style="display:inline-block;width:24px;height:24px;background-color:#0F172A;border-radius:50%;text-align:center;font-size:11px;font-weight:700;color:#ffffff;line-height:24px;">${i + 1}</span>
            </td>
            <td style="padding:12px 14px 12px 8px;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0F172A;line-height:1.4;">${ep.episode_title || ep.title || ''}</p>
              ${(ep.podcast_name || ep.channel) ? `<p style="margin:0;font-size:12px;color:#94a3b8;">${ep.podcast_name || ep.channel}${ep.duration ? `&nbsp;·&nbsp;${ep.duration}` : ''}</p>` : ''}
            </td>
          </tr>
        </table>`).join('')}
        <a href="${BASE_URL}/ai-podcast-roundup" style="display:inline-block;margin-top:8px;padding:9px 20px;border:1.5px solid #0EA5E9;border-radius:6px;color:#0EA5E9;font-size:13px;font-weight:600;text-decoration:none;">Listen to all 5 episodes →</a>
      </td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 28px;" />
  ` : ''

  // ── Top articles ──────────────────────────────────────────
  const articlesSection = articles.length > 0 ? `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr><td>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
          <tr><td style="border-left:3px solid #0EA5E9;padding-left:10px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">📰 Top Stories This Week</p>
          </td></tr>
        </table>
        ${articles.slice(0, 3).map((a: ArticleSnap, i: number) => `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:${i < 2 ? '14px' : '0'};padding-bottom:${i < 2 ? '14px' : '0'};border-bottom:${i < 2 ? '1px solid #f1f5f9' : 'none'};">
          <tr>
            <td valign="top" width="64">
              ${a.thumbnail_url && a.thumbnail_url.startsWith('http')
                ? `<img src="${a.thumbnail_url}" alt="" width="56" height="56" style="display:block;border-radius:6px;width:56px;height:56px;object-fit:cover;" />`
                : `<div style="width:56px;height:56px;background-color:#e2e8f0;border-radius:6px;display:flex;align-items:center;justify-content:center;"><div style="width:20px;height:20px;border-radius:50%;background:#94a3b8;"></div></div>`}
            </td>
            <td valign="top" style="padding-left:12px;">
              <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#0F172A;line-height:1.4;">${a.title}</p>
              <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.5;">${(a.excerpt || '').split(' ').slice(0, 18).join(' ')}${(a.excerpt || '').split(' ').length > 18 ? '…' : ''}</p>
              <a href="${BASE_URL}/article/${a.slug}" style="font-size:12px;font-weight:600;color:#0EA5E9;text-decoration:none;">Read more →</a>
            </td>
          </tr>
        </table>`).join('')}
      </td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 28px;" />
  ` : ''

  // ── Make money guide ──────────────────────────────────────
  const makeMoneySection = makeMoneyArticle ? `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr><td style="background-color:#0F172A;border-radius:12px;padding:24px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;">
          <tr><td style="border-left:3px solid #0EA5E9;padding-left:10px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">💰 Make Money With AI</p>
          </td></tr>
        </table>
        ${makeMoneyArticle.thumbnail_url && makeMoneyArticle.thumbnail_url.startsWith('http')
          ? `<img src="${makeMoneyArticle.thumbnail_url}" alt="" width="100%" style="display:block;border-radius:8px;margin-bottom:16px;height:auto;" />`
          : ''}
        <p style="margin:0 0 10px;font-size:19px;font-weight:800;color:#ffffff;line-height:1.3;">${makeMoneyArticle.title}</p>
        <p style="margin:0 0 18px;font-size:14px;color:#94a3b8;line-height:1.7;">${(makeMoneyArticle.excerpt || '').split(' ').slice(0, 22).join(' ')}…</p>
        <a href="${BASE_URL}/article/${makeMoneyArticle.slug}" style="display:inline-block;padding:11px 26px;background-color:#0EA5E9;border-radius:7px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Read the full guide →</a>
      </td></tr>
    </table>
  ` : ''

  // ── Tools spotlight ───────────────────────────────────────
  const toolsSection = tools.length > 0 ? `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr><td>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
          <tr><td style="border-left:3px solid #0EA5E9;padding-left:10px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0EA5E9;">🔧 AI Tools Worth Trying</p>
          </td></tr>
        </table>
        ${tools.slice(0, 3).map((tool, i) => {
          const toolUrl = tool.affiliate_url || tool.website_url
          const pricingColor = tool.pricing === 'free' ? '#16a34a' : tool.pricing === 'freemium' ? '#0EA5E9' : '#94a3b8'
          const pricingLabel = tool.pricing === 'free' ? 'Free' : tool.pricing === 'freemium' ? 'Free plan available' : tool.pricing === 'paid' ? 'Paid' : tool.pricing || ''
          return `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:${i < tools.length - 1 ? '10px' : '0'};border:1px solid #e2e8f0;border-radius:8px;">
          <tr>
            <td style="padding:14px 16px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td valign="middle">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle">
                          <p style="margin:0;font-size:15px;font-weight:700;color:#0F172A;display:inline;">${tool.name}</p>
                          ${pricingLabel ? `<span style="display:inline-block;margin-left:8px;padding:2px 8px;background-color:${pricingColor}18;border-radius:4px;font-size:11px;font-weight:600;color:${pricingColor};">${pricingLabel}</span>` : ''}
                        </td>
                      </tr>
                    </table>
                    <p style="margin:4px 0 10px;font-size:13px;color:#64748b;line-height:1.6;">${tool.description.split(' ').slice(0, 20).join(' ')}${tool.description.split(' ').length > 20 ? '…' : ''}</p>
                    <a href="${toolUrl}" style="font-size:13px;font-weight:600;color:#0EA5E9;text-decoration:none;">Try it free →</a>
                  </td>
                  ${tool.logo_url && tool.logo_url.startsWith('http') ? `<td valign="middle" align="right" style="padding-left:16px;width:48px;">
                    <img src="${tool.logo_url}" alt="${tool.name}" width="40" height="40" style="display:block;border-radius:8px;width:40px;height:40px;object-fit:contain;" />
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>
        </table>`
        }).join('')}
        <a href="${BASE_URL}/best-ai-tools" style="display:inline-block;margin-top:12px;font-size:13px;font-weight:600;color:#0EA5E9;text-decoration:none;">Browse all AI tools →</a>
      </td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 28px;" />
  ` : ''

  // ── Sign-off ──────────────────────────────────────────────
  const signOff = `
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;" />
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td valign="top" style="padding-right:16px;">
          <p style="margin:0 0 6px;font-size:14px;color:#334155;line-height:1.7;">That's your weekly AI briefing. See you next Tuesday.</p>
          <p style="margin:0;font-size:14px;color:#64748b;">Questions or suggestions? Just reply — we read every email.</p>
          <p style="margin:12px 0 0;font-size:14px;color:#64748b;">— <strong style="color:#0F172A;">Your team at AI Foresights</strong></p>
        </td>
        <td valign="top" align="right" style="white-space:nowrap;">
          <a href="${BASE_URL}" style="display:inline-block;padding:10px 20px;background-color:#f1f5f9;border-radius:7px;color:#334155;font-size:13px;font-weight:600;text-decoration:none;">Visit the site →</a>
        </td>
      </tr>
    </table>
  `

  const content = `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr><td style="background-color:#f8fafc;border-radius:10px;padding:20px 24px;border-left:4px solid #0EA5E9;">
        <p style="margin:0 0 2px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Week of ${weekLabel}</p>
        <p style="margin:0;font-size:22px;font-weight:800;color:#0F172A;line-height:1.3;">Your Weekly AI Briefing</p>
      </td></tr>
    </table>
    ${videoSection}
    ${podcastSection}
    ${articlesSection}
    ${toolsSection}
    ${makeMoneySection}
    ${signOff}
  `

  return emailWrapper(content, `This week: AI video pick, 5 podcast episodes, top stories, and a make money guide — your Tuesday briefing.`)
}
