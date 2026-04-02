export const dynamic = 'force-dynamic'

export async function GET() {
  const content = `User-agent: *
Allow: /

# AI crawlers - explicitly welcome
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

# Sitemap
Sitemap: https://www.aiforesights.com/sitemap.xml

# LLM discovery
LLMs: https://www.aiforesights.com/llms.txt
`
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
