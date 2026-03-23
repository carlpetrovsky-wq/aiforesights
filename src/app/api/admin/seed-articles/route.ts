export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const MAKE_MONEY_ARTICLES = [
  {
    title: "AI Freelance Writing: How to Land Your First Client This Week",
    slug: "ai-freelance-writing-land-first-client",
    excerpt: "AI writing tools let one person produce what used to require a team. Here's how to start getting paid for it within days — no experience required.",
    summary: "AI-assisted freelance writing is one of the fastest ways to start earning extra income. Using tools like ChatGPT and Claude, writers can produce high-quality blog posts, emails, and marketing copy faster than ever. This guide covers how to find your first client on platforms like Upwork, Fiverr, and LinkedIn, what to charge (beginners typically start at $25–$75/hour), and how to use AI to deliver polished work quickly while building your reputation.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    is_featured: true,
    tags: ["freelancing","writing","side hustle","beginner"],
    thumbnail_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
  },
  {
    title: "Faceless YouTube Channels: How People Earn $2,000+/Month Using AI",
    slug: "faceless-youtube-channel-ai-income",
    excerpt: "You don't need to appear on camera to build a profitable YouTube channel in 2026. AI handles the scripts, voiceovers, and editing.",
    summary: "Faceless YouTube channels using AI tools are generating real passive income for thousands of people. The formula: pick a niche (finance tips, AI news, motivation, history), use ChatGPT to write scripts, ElevenLabs for voiceovers, and CapCut or Runway for editing. Channels focused on 'how-to' content, top 10 lists, or news summaries can monetize through YouTube ads once they hit 1,000 subscribers and 4,000 watch hours. Successful creators in this space report earning $500–$5,000/month after 6–12 months of consistent publishing.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    is_featured: true,
    tags: ["YouTube","passive income","video","faceless channel"],
    thumbnail_url: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
  },
  {
    title: "Selling AI-Generated Digital Products on Etsy: A Beginner's Guide",
    slug: "selling-ai-digital-products-etsy",
    excerpt: "AI art, printable planners, and prompt packs are selling well on Etsy. Create once, sell thousands of times.",
    summary: "Digital products are one of the best passive income models because you create them once and sell them repeatedly with no shipping or inventory. AI tools like Midjourney, DALL-E, and Canva make it possible to create high-quality printable art, planners, journals, and social media templates in hours. Sellers on Etsy and Gumroad report earning $500–$3,000/month from digital downloads. This guide covers which product types sell best, how to price them, and how to set up your first Etsy shop.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    tags: ["Etsy","digital products","passive income","art"],
    thumbnail_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  },
  {
    title: "Building AI Chatbots for Small Businesses: $500–$2,000 Per Client",
    slug: "building-ai-chatbots-small-businesses",
    excerpt: "Small businesses desperately need AI chatbots for their websites. You can build and deploy them using no-code tools — no programming required.",
    summary: "Small businesses are willing to pay $500–$2,000 to have someone build and set up an AI chatbot for their website, and ongoing monthly fees of $100–$500 for maintenance. No-code platforms like ManyChat, Chatbot.com, and Tidio make this possible without any programming knowledge. The key is targeting specific niches — restaurants, real estate agents, dentists, and e-commerce stores all have clear use cases. This guide walks through how to find clients, price your services, and deliver a working chatbot in a weekend.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    is_featured: true,
    tags: ["chatbots","freelancing","small business","no-code"],
    thumbnail_url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80",
  },
  {
    title: "AI Voiceover Work: Earn $50–$500 Per Project With ElevenLabs",
    slug: "ai-voiceover-work-elevenlabs",
    excerpt: "AI has made professional-quality voiceovers accessible to everyone. Here's how to turn that into a real income stream.",
    summary: "The demand for voiceovers is enormous — YouTube videos, explainer videos, podcasts, audiobooks, and corporate training all need narration. Using tools like ElevenLabs and Murf AI, you can produce studio-quality voiceovers without expensive equipment or acting training. Freelancers on platforms like Voices.com, Voice123, and Fiverr charge $50–$500 per project. This guide covers how to create a portfolio, set competitive rates, and land your first voiceover client.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    tags: ["voiceover","ElevenLabs","freelancing","audio"],
    thumbnail_url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
  },
  {
    title: "How to Use AI to Start an Automation Agency (Even With No Tech Skills)",
    slug: "start-ai-automation-agency-no-tech-skills",
    excerpt: "AI automation agencies are one of the fastest-growing service businesses. Clients pay $500–$5,000/month for someone to handle their workflows.",
    summary: "Businesses waste enormous amounts of time on repetitive tasks — sending follow-up emails, updating spreadsheets, scheduling appointments, posting social media content. AI automation tools like Zapier and Make can handle all of this automatically. An AI automation agency packages these solutions for small businesses, charging retainer fees of $500–$5,000/month. You don't need to write code — you need to understand business problems and know how to connect tools. This guide explains how to build your first workflow, find clients, and price your services.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    tags: ["automation","agency","Zapier","business"],
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  },
  {
    title: "Prompt Engineering: Getting Paid to Write Better AI Instructions",
    slug: "prompt-engineering-get-paid",
    excerpt: "Companies are paying people to write effective AI prompts. Here's what prompt engineering actually is and how to get started.",
    summary: "Prompt engineering — the skill of writing instructions that get better results from AI tools — has become a genuine job category. Businesses pay $25–$100/hour for consultants who can optimize their AI workflows, write system prompts for chatbots, and train their teams to use AI effectively. This doesn't require a technical background — it requires clear communication skills and a good understanding of how AI tools work. This guide covers what prompt engineers actually do, where to find clients, and how to build a portfolio.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    tags: ["prompt engineering","consulting","AI skills","freelancing"],
    thumbnail_url: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80",
  },
  {
    title: "Create and Sell Online Courses About AI (Without Being an Expert)",
    slug: "create-sell-online-courses-ai",
    excerpt: "The demand for practical AI education is enormous. You don't need to be a researcher to teach people how to use AI tools effectively.",
    summary: "The e-learning market for AI is exploding — millions of people want to learn how to use ChatGPT, Midjourney, and other tools for their specific situations. You don't need to be an AI researcher to create a successful course. If you've learned how to use these tools effectively for real estate, cooking, small business management, or any other niche, there's an audience for that knowledge. Platforms like Udemy, Teachable, and Gumroad make it easy to sell courses. Successful AI courses earn $1,000–$10,000/month from passive sales.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    tags: ["online courses","teaching","passive income","education"],
    thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  },
  {
    title: "AI Social Media Management: $500–$2,000/Month Per Client",
    slug: "ai-social-media-management-business",
    excerpt: "Small businesses need consistent social media content but don't have time to create it. AI makes this a one-person service business.",
    summary: "Social media management is one of the most in-demand services for small businesses — and AI has made it possible for one person to manage 5–10 clients simultaneously. Using Buffer, Manychat, and AI writing tools, you can create a month's worth of posts for a client in a few hours. Most social media managers charge $500–$2,000/month per client. This guide covers how to position yourself, what to deliver, how to find your first clients, and which AI tools make the work fast and efficient.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    tags: ["social media","freelancing","marketing","business"],
    thumbnail_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
  },
  {
    title: "AI Resume Writing Service: Help People Get Jobs and Earn $50–$200 Per Resume",
    slug: "ai-resume-writing-service",
    excerpt: "With AI tools, one skilled person can produce professional, tailored resumes quickly. Job seekers happily pay for this service.",
    summary: "Professional resume writing is a service with steady, year-round demand — people are always looking for jobs. AI tools like ChatGPT, Claude, and Kickresume make it possible to research specific industries, tailor resumes to job descriptions, and polish writing to a professional standard in a fraction of the traditional time. Resume writers on Fiverr and Upwork charge $50–$200 per resume, with cover letters and LinkedIn profile optimization as upsells. This guide covers how to start your resume writing service, what to include in your packages, and how to market it.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    tags: ["resume writing","career","freelancing","side hustle"],
    thumbnail_url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
  },
  {
    title: "Dropshipping With AI: Find Winning Products and Write Listings Faster",
    slug: "dropshipping-with-ai-winning-products",
    excerpt: "AI tools are transforming dropshipping by automating the hardest parts — product research, listing copy, and customer service.",
    summary: "Dropshipping — selling products online without holding inventory — has always been competitive. AI changes the equation by automating the most time-consuming parts: finding trending products, writing compelling product descriptions, handling customer service questions, and analyzing sales data. Tools like ChatGPT for copy, Midjourney for product images, and Perplexity for market research give dropshippers a real edge. This guide covers how to set up an AI-assisted dropshipping store, which platforms to use, and realistic income expectations.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    tags: ["dropshipping","e-commerce","side hustle","product research"],
    thumbnail_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
  },
  {
    title: "Affiliate Marketing With AI: Build Traffic and Earn Commissions",
    slug: "affiliate-marketing-with-ai",
    excerpt: "AI makes it faster to build content-driven websites that earn affiliate commissions from product recommendations.",
    summary: "Affiliate marketing — earning commissions by recommending products — is one of the most scalable income models online. The challenge has always been creating enough quality content to drive traffic. AI writing tools dramatically reduce that barrier. Using ChatGPT or Claude for content, SurferSEO for optimization, and Perplexity for research, you can build authoritative review sites and comparison pages faster than ever. This guide covers how to pick a profitable niche, which affiliate programs pay well, and how to structure AI-assisted content that ranks on Google.",
    source_name: "AI Foresights",
    source_url: "https://www.aiforesights.com/make-money",
    category_slug: "make-money",
    status: "published",
    tags: ["affiliate marketing","passive income","SEO","content"],
    thumbnail_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
  },
]

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { inserted: 0, skipped: 0, errors: [] as string[] }

  for (const article of MAKE_MONEY_ARTICLES) {
    const { data: existing } = await supabaseAdmin
      .from('articles')
      .select('id')
      .eq('slug', article.slug)
      .single()

    if (existing) {
      results.skipped++
      continue
    }

    const { error } = await supabaseAdmin
      .from('articles')
      .insert({
        ...article,
        tags: JSON.stringify(article.tags),
        published_at: new Date().toISOString(),
        vote_count: 0,
      })

    if (error) {
      results.errors.push(`${article.title}: ${error.message}`)
    } else {
      results.inserted++
    }
  }

  return NextResponse.json({
    message: `Seeded ${results.inserted} articles, skipped ${results.skipped} existing`,
    ...results
  })
}
