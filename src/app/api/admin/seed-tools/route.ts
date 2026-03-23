export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const TOOLS = [
  { name: "ChatGPT", category: "Writing & content", pricing: "freemium", experience_level: "beginner", description: "OpenAI's flagship AI assistant — the most widely used AI tool in the world. Great for writing, research, answering questions, and everyday tasks. Start here if you're new to AI.", website_url: "https://chat.openai.com", tags: ["chatbot","writing","research","OpenAI"], is_featured: true, status: "published" },
  { name: "Claude", category: "Writing & content", pricing: "freemium", experience_level: "beginner", description: "Anthropic's AI assistant, known for thoughtful writing and handling long documents. Excellent for careful analysis, editing, and nuanced tasks.", website_url: "https://claude.ai", tags: ["chatbot","writing","documents","Anthropic"], is_featured: true, status: "published" },
  { name: "Gemini", category: "Productivity", pricing: "freemium", experience_level: "beginner", description: "Google's AI assistant that works inside Gmail, Docs, Sheets, and Slides. Best for Google Workspace users.", website_url: "https://gemini.google.com", tags: ["chatbot","Google","productivity","workspace"], status: "published" },
  { name: "Perplexity AI", category: "Search & research", pricing: "freemium", experience_level: "beginner", description: "AI-powered search that always cites its sources. The best tool for research when you need verified, current information.", website_url: "https://perplexity.ai", tags: ["search","research","citations"], status: "published" },
  { name: "Microsoft Copilot", category: "Productivity", pricing: "freemium", experience_level: "beginner", description: "Microsoft's AI built into Word, Excel, PowerPoint, and Outlook. If your workplace runs Microsoft 365, this is the natural place to start with AI.", website_url: "https://copilot.microsoft.com", tags: ["Microsoft","Office","productivity"], status: "published" },
  { name: "Grok", category: "Writing & content", pricing: "freemium", experience_level: "beginner", description: "xAI's chatbot with a focus on real-time news and trending topics. Built into X (Twitter).", website_url: "https://grok.com", tags: ["chatbot","news","social media","xAI"], status: "published" },
  { name: "Meta AI", category: "Writing & content", pricing: "free", experience_level: "beginner", description: "Meta's free AI assistant inside Facebook, Instagram, WhatsApp, and Messenger. Easy starting point for everyday questions.", website_url: "https://meta.ai", tags: ["chatbot","Meta","free","social media"], status: "published" },
  { name: "NotebookLM", category: "Search & research", pricing: "free", experience_level: "beginner", description: "Google's free AI tool that answers questions from your own documents. Upload PDFs or notes and chat with them directly.", website_url: "https://notebooklm.google.com", tags: ["documents","research","Google","free"], status: "published" },
  { name: "Jasper", category: "Writing & content", pricing: "paid", experience_level: "intermediate", description: "AI writing platform for marketing teams. Creates on-brand blog posts, ads, emails, and social content at scale.", website_url: "https://jasper.ai", tags: ["marketing","copywriting","content","brand"], status: "published" },
  { name: "Copy.ai", category: "Writing & content", pricing: "freemium", experience_level: "beginner", description: "Fast AI copywriting for marketing messages, product descriptions, and social content. Great for small businesses.", website_url: "https://copy.ai", tags: ["copywriting","marketing","small business"], status: "published" },
  { name: "Grammarly", category: "Writing & content", pricing: "freemium", experience_level: "beginner", description: "The gold standard for professional writing polish. Now with AI rewriting, tone adjustment, and strategic feedback.", website_url: "https://grammarly.com", tags: ["writing","grammar","editing","professional"], status: "published" },
  { name: "Notion AI", category: "Productivity", pricing: "paid", experience_level: "beginner", description: "AI built into Notion for writing, summarizing, and organizing notes. A natural fit if you already use Notion.", website_url: "https://notion.so", tags: ["productivity","notes","workspace","organize"], status: "published" },
  { name: "Writesonic", category: "Writing & content", pricing: "freemium", experience_level: "beginner", description: "AI writing tool for blog posts, ads, and landing pages, with real-time web access through its Chatsonic assistant.", website_url: "https://writesonic.com", tags: ["writing","blog","SEO","marketing"], status: "published" },
  { name: "Sudowrite", category: "Writing & content", pricing: "paid", experience_level: "beginner", description: "AI writing tool built for fiction writers and novelists. Helps with story development, descriptions, and creative blocks.", website_url: "https://sudowrite.com", tags: ["fiction","creative writing","novels"], status: "published" },
  { name: "Midjourney", category: "Image generation", pricing: "paid", experience_level: "beginner", description: "The most popular AI image generator for artistic, stylized visuals. Creates stunning artwork from text descriptions.", website_url: "https://midjourney.com", tags: ["image","art","design","creative"], is_featured: true, status: "published" },
  { name: "DALL-E 3", category: "Image generation", pricing: "freemium", experience_level: "beginner", description: "OpenAI's image generator built into ChatGPT Plus. Creates detailed, accurate images from text descriptions.", website_url: "https://openai.com/dall-e-3", tags: ["image","OpenAI","art"], status: "published" },
  { name: "Adobe Firefly", category: "Image generation", pricing: "freemium", experience_level: "beginner", description: "Adobe's AI image generator built for commercial use. All images are commercially safe — no copyright concerns.", website_url: "https://firefly.adobe.com", tags: ["image","Adobe","commercial","design"], status: "published" },
  { name: "Ideogram", category: "Image generation", pricing: "freemium", experience_level: "beginner", description: "AI image generator that excels at creating images with readable text — great for posters, signs, and social graphics.", website_url: "https://ideogram.ai", tags: ["image","text","design","social media"], status: "published" },
  { name: "Leonardo AI", category: "Image generation", pricing: "freemium", experience_level: "beginner", description: "AI image generator popular for game art, concept art, and consistent character design across multiple images.", website_url: "https://leonardo.ai", tags: ["image","game art","characters","design"], status: "published" },
  { name: "Bing Image Creator", category: "Image generation", pricing: "free", experience_level: "beginner", description: "Microsoft's completely free AI image generator. Create images from text descriptions in your browser — no account needed.", website_url: "https://bing.com/create", tags: ["image","free","Microsoft","beginner"], status: "published" },
  { name: "Runway", category: "Video & audio", pricing: "freemium", experience_level: "intermediate", description: "Professional AI video editing and generation used by filmmakers worldwide. Edit and create video with AI prompts.", website_url: "https://runwayml.com", tags: ["video","editing","filmmaking","creative"], status: "published" },
  { name: "Synthesia", category: "Video & audio", pricing: "paid", experience_level: "beginner", description: "Create professional videos with AI avatars — no camera needed. Paste your script and get a polished video.", website_url: "https://synthesia.io", tags: ["video","avatars","training","explainer"], status: "published" },
  { name: "HeyGen", category: "Video & audio", pricing: "freemium", experience_level: "beginner", description: "AI video with customizable avatars and voices. Popular for marketing videos, sales outreach, and personalized content.", website_url: "https://heygen.com", tags: ["video","avatars","marketing"], status: "published" },
  { name: "CapCut", category: "Video & audio", pricing: "freemium", experience_level: "beginner", description: "Popular free video editing app with AI features — auto-captions, background removal, and viral social media effects.", website_url: "https://capcut.com", tags: ["video","editing","social media","free"], status: "published" },
  { name: "Descript", category: "Video & audio", pricing: "freemium", experience_level: "beginner", description: "Edit video and podcasts like a text document. Remove filler words automatically and generate transcripts.", website_url: "https://descript.com", tags: ["video","podcast","audio","editing"], status: "published" },
  { name: "Sora", category: "Video & audio", pricing: "freemium", experience_level: "beginner", description: "OpenAI's AI video generator. Create realistic short video clips from text descriptions — available to ChatGPT Plus users.", website_url: "https://sora.com", tags: ["video","generation","OpenAI","text-to-video"], status: "published" },
  { name: "Pika Labs", category: "Video & audio", pricing: "freemium", experience_level: "beginner", description: "AI video generator that animates images or creates video from text. Easy to use with no prior video editing experience.", website_url: "https://pika.art", tags: ["video","animation","creative"], status: "published" },
  { name: "ElevenLabs", category: "Video & audio", pricing: "freemium", experience_level: "beginner", description: "The leading AI voice generator. Create natural-sounding voiceovers, clone voices, and produce audiobooks.", website_url: "https://elevenlabs.io", tags: ["voice","audio","voiceover","text-to-speech"], is_featured: true, status: "published" },
  { name: "Murf AI", category: "Video & audio", pricing: "freemium", experience_level: "beginner", description: "Studio-quality AI voiceover generator with 120+ realistic voices. Great for presentations and e-learning content.", website_url: "https://murf.ai", tags: ["voice","voiceover","audio","presentations"], status: "published" },
  { name: "Otter.ai", category: "Productivity", pricing: "freemium", experience_level: "beginner", description: "Joins your video calls and automatically transcribes and summarizes meetings. Huge time-saver for busy professionals.", website_url: "https://otter.ai", tags: ["transcription","meetings","productivity","Zoom"], status: "published" },
  { name: "Canva AI", category: "Design", pricing: "freemium", experience_level: "beginner", description: "Canva with AI superpowers. Generate images, write copy, resize designs, and create presentations from a text prompt.", website_url: "https://canva.com", tags: ["design","presentations","social media","marketing"], is_featured: true, status: "published" },
  { name: "Looka", category: "Design", pricing: "paid", experience_level: "beginner", description: "AI logo maker for small businesses. Describe your brand and get a professional logo in minutes — no design skills needed.", website_url: "https://looka.com", tags: ["logo","branding","small business"], status: "published" },
  { name: "Remove.bg", category: "Design", pricing: "freemium", experience_level: "beginner", description: "Remove image backgrounds instantly with AI. One click works on photos of people, products, and objects.", website_url: "https://remove.bg", tags: ["image","background removal","photos","e-commerce"], status: "published" },
  { name: "Beautiful.ai", category: "Design", pricing: "freemium", experience_level: "beginner", description: "AI presentation maker that automatically designs slides as you type. Professional-looking decks without design experience.", website_url: "https://beautiful.ai", tags: ["presentations","design","slides","business"], status: "published" },
  { name: "Gamma", category: "Design", pricing: "freemium", experience_level: "beginner", description: "Create presentations, documents, and websites from a text prompt in seconds. The easiest way to build a polished presentation.", website_url: "https://gamma.app", tags: ["presentations","design","documents","websites"], status: "published" },
  { name: "Zapier", category: "Productivity", pricing: "freemium", experience_level: "beginner", description: "Automate tasks between your apps without any coding. Describe what you want automated in plain English.", website_url: "https://zapier.com", tags: ["automation","productivity","no-code","workflows"], status: "published" },
  { name: "Make", category: "Productivity", pricing: "freemium", experience_level: "intermediate", description: "Visual automation platform for building complex workflows between apps. More powerful than Zapier with a generous free plan.", website_url: "https://make.com", tags: ["automation","workflows","integration","no-code"], status: "published" },
  { name: "Reclaim AI", category: "Productivity", pricing: "freemium", experience_level: "beginner", description: "AI calendar assistant that automatically schedules your tasks and meetings to protect your most productive hours.", website_url: "https://reclaim.ai", tags: ["calendar","scheduling","productivity","time management"], status: "published" },
  { name: "Loom AI", category: "Productivity", pricing: "freemium", experience_level: "beginner", description: "Record short async videos to replace meetings. AI adds titles, summaries, and action items to every recording.", website_url: "https://loom.com", tags: ["video","meetings","async","productivity"], status: "published" },
  { name: "Fireflies.ai", category: "Productivity", pricing: "freemium", experience_level: "beginner", description: "AI meeting assistant that records, transcribes, and summarizes your calls. Works with Zoom, Teams, and Google Meet.", website_url: "https://fireflies.ai", tags: ["meetings","transcription","productivity","notes"], status: "published" },
  { name: "Speechify", category: "Productivity", pricing: "freemium", experience_level: "beginner", description: "Text-to-speech app that reads any document, email, or article aloud in a natural voice. Great for learning on the go.", website_url: "https://speechify.com", tags: ["text-to-speech","reading","accessibility","audio"], status: "published" },
  { name: "SurferSEO", category: "Business & marketing", pricing: "paid", experience_level: "intermediate", description: "AI-powered SEO tool that analyzes top-ranking pages and tells you exactly what content to write to rank on Google.", website_url: "https://surferseo.com", tags: ["SEO","content","marketing","Google"], status: "published" },
  { name: "Buffer", category: "Business & marketing", pricing: "freemium", experience_level: "beginner", description: "Social media scheduling with AI-assisted post writing. Plan, create, and publish content across all your social accounts.", website_url: "https://buffer.com", tags: ["social media","scheduling","marketing"], status: "published" },
  { name: "Manychat", category: "Business & marketing", pricing: "freemium", experience_level: "beginner", description: "Build chatbots for Instagram, Facebook Messenger, and WhatsApp to automate conversations and grow your audience.", website_url: "https://manychat.com", tags: ["chatbot","social media","Instagram","automation"], status: "published" },
  { name: "GitHub Copilot", category: "Coding & dev", pricing: "paid", experience_level: "intermediate", description: "AI coding assistant built into VS Code. Suggests completions and writes functions from comments. Used by millions of developers.", website_url: "https://github.com/features/copilot", tags: ["coding","developer","GitHub"], status: "published" },
  { name: "Cursor", category: "Coding & dev", pricing: "freemium", experience_level: "intermediate", description: "AI-native code editor that understands your entire codebase. Write, edit, and debug code using plain English.", website_url: "https://cursor.com", tags: ["coding","developer","AI IDE"], status: "published" },
  { name: "Lovable", category: "Coding & dev", pricing: "freemium", experience_level: "beginner", description: "Build web apps by describing them in plain English — no coding needed. Perfect for entrepreneurs and non-technical founders.", website_url: "https://lovable.dev", tags: ["no-code","web apps","entrepreneur","build"], status: "published" },
  { name: "Kickresume", category: "Business & marketing", pricing: "freemium", experience_level: "beginner", description: "AI resume and cover letter builder. Create a professional, tailored resume for any job in minutes.", website_url: "https://kickresume.com", tags: ["resume","career","job search"], status: "published" },
  { name: "Genspark", category: "Search & research", pricing: "freemium", experience_level: "beginner", description: "AI agent that handles complex research tasks end-to-end. Give it a topic and get a complete, sourced research report.", website_url: "https://genspark.ai", tags: ["research","AI agent","reports"], status: "published" },
]

export async function POST(req: NextRequest) {
  // Verify admin token
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { inserted: 0, skipped: 0, errors: [] as string[] }

  for (const tool of TOOLS) {
    // Check if tool already exists by name
    const { data: existing } = await supabaseAdmin
      .from('tools')
      .select('id')
      .eq('name', tool.name)
      .single()

    if (existing) {
      results.skipped++
      continue
    }

    // Generate slug from name
    const slug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const { error } = await supabaseAdmin
      .from('tools')
      .insert({
        ...tool,
        slug,
        tags: JSON.stringify(tool.tags),
        save_count: 0,
        logo_url: null,
      })

    if (error) {
      results.errors.push(`${tool.name}: ${error.message}`)
    } else {
      results.inserted++
    }
  }

  return NextResponse.json({
    message: `Seeded ${results.inserted} tools, skipped ${results.skipped} existing`,
    ...results
  })
}
