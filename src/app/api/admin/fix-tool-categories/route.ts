export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Full audit: correct category + meaningful tags for every tool
// Tags should be plain English words a user would type when searching
const TOOL_AUDIT: Record<string, { category: string; tags: string[] }> = {
  // ── CHATBOTS ──────────────────────────────────────────────────────────────
  'chatgpt':           { category: 'Chatbots', tags: ['chatbot', 'writing', 'coding', 'research', 'openai', 'ai assistant'] },
  'claude':            { category: 'Chatbots', tags: ['chatbot', 'writing', 'analysis', 'documents', 'anthropic', 'ai assistant'] },
  'gemini':            { category: 'Chatbots', tags: ['chatbot', 'google', 'search', 'multimodal', 'ai assistant'] },
  'grok':              { category: 'Chatbots', tags: ['chatbot', 'news', 'social media', 'xai', 'real-time', 'twitter'] },
  'meta-ai':           { category: 'Chatbots', tags: ['chatbot', 'meta', 'facebook', 'free', 'ai assistant'] },
  'microsoft-copilot': { category: 'Chatbots', tags: ['chatbot', 'microsoft', 'office', 'productivity', 'bing', 'ai assistant'] },
  'perplexity-ai':     { category: 'Chatbots', tags: ['chatbot', 'search', 'research', 'citations', 'real-time', 'ai assistant'] },
  'character-ai':      { category: 'Chatbots', tags: ['chatbot', 'characters', 'roleplay', 'creative', 'entertainment', 'chat'] },
  // Perplexity Pro (new) already has Search & Research — leave it, but add chatbot tag
  'perplexity-pro':    { category: 'Search & Research', tags: ['chatbot', 'search', 'research', 'citations', 'real-time', 'ai assistant'] },
  'notebooklm':        { category: 'Chatbots', tags: ['chatbot', 'google', 'research', 'documents', 'notes', 'ai assistant'] },

  // ── AI AGENTS ─────────────────────────────────────────────────────────────
  'openclaw':          { category: 'AI Agents', tags: ['agent', 'automation', 'open source', 'local', 'self-hosted', 'personal ai'] },
  'devin':             { category: 'AI Agents', tags: ['agent', 'coding', 'autonomous', 'software engineer', 'enterprise'] },
  'manus':             { category: 'AI Agents', tags: ['agent', 'autonomous', 'general purpose', 'research', 'tasks'] },
  'autogpt':           { category: 'AI Agents', tags: ['agent', 'open source', 'automation', 'autonomous', 'gpt'] },
  'lindy':             { category: 'AI Agents', tags: ['agent', 'automation', 'no-code', 'workflow', 'business', 'email'] },
  'crewai':            { category: 'AI Agents', tags: ['agent', 'framework', 'multi-agent', 'open source', 'developer'] },
  'n8n':               { category: 'AI Agents', tags: ['automation', 'workflow', 'open source', 'self-hosted', 'no-code', 'zapier alternative'] },

  // ── AI MODELS ─────────────────────────────────────────────────────────────
  'gpt-4o':            { category: 'AI Models', tags: ['model', 'multimodal', 'openai', 'vision', 'audio', 'api'] },
  'gpt-5':             { category: 'AI Models', tags: ['model', 'openai', 'reasoning', 'frontier', 'powerful', 'api'] },
  'deepseek-r1':       { category: 'AI Models', tags: ['model', 'open source', 'chinese', 'reasoning', 'affordable', 'api'] },
  'llama-4':           { category: 'AI Models', tags: ['model', 'meta', 'open source', 'free', 'local', 'open weights'] },
  'mistral-large':     { category: 'AI Models', tags: ['model', 'european', 'open source', 'efficient', 'multilingual', 'api'] },
  'gemini-3-pro':      { category: 'AI Models', tags: ['model', 'google', 'multimodal', 'long context', 'frontier', 'api'] },
  'hugging-face':      { category: 'AI Models', tags: ['model', 'open source', 'models', 'research', 'developer', 'hub'] },

  // ── CODING & DEV ──────────────────────────────────────────────────────────
  'cursor':            { category: 'Coding & Dev', tags: ['coding', 'ide', 'editor', 'developer', 'autocomplete', 'ai coding'] },
  'github-copilot':    { category: 'Coding & Dev', tags: ['coding', 'developer', 'autocomplete', 'github', 'ide', 'ai coding'] },
  'claude-code':       { category: 'Coding & Dev', tags: ['coding', 'agent', 'terminal', 'anthropic', 'autonomous', 'ai coding'] },
  'windsurf':          { category: 'Coding & Dev', tags: ['coding', 'ide', 'editor', 'agent', 'developer', 'ai coding'] },
  'bolt-new':          { category: 'Coding & Dev', tags: ['coding', 'app builder', 'no-code', 'browser', 'full stack', 'rapid prototyping'] },
  'v0-vercel':         { category: 'Coding & Dev', tags: ['coding', 'ui', 'react', 'components', 'design', 'frontend'] },
  'replit':            { category: 'Coding & Dev', tags: ['coding', 'ide', 'browser', 'learning', 'beginner', 'app builder'] },
  'cline':             { category: 'Coding & Dev', tags: ['coding', 'vscode', 'open source', 'agent', 'developer', 'ai coding'] },
  'aider':             { category: 'Coding & Dev', tags: ['coding', 'terminal', 'git', 'open source', 'developer', 'ai coding'] },
  'antigravity':       { category: 'Coding & Dev', tags: ['coding', 'agent', 'free', 'developer', 'multi-model', 'ai coding'] },
  'tabnine':           { category: 'Coding & Dev', tags: ['coding', 'autocomplete', 'privacy', 'enterprise', 'ide', 'ai coding'] },
  'opencode':          { category: 'Coding & Dev', tags: ['coding', 'terminal', 'open source', 'agent', 'developer', 'ai coding'] },
  'lovable':           { category: 'Coding & Dev', tags: ['coding', 'app builder', 'no-code', 'full stack', 'rapid prototyping'] },

  // ── APP BUILDERS ──────────────────────────────────────────────────────────
  'bubble':            { category: 'App Builders', tags: ['no-code', 'app builder', 'web app', 'visual', 'beginner', 'business'] },
  'webflow':           { category: 'App Builders', tags: ['no-code', 'web design', 'website', 'cms', 'professional', 'designer'] },
  'framer':            { category: 'App Builders', tags: ['no-code', 'website', 'design', 'prototype', 'landing page', 'beginner'] },
  'dify':              { category: 'App Builders', tags: ['ai app', 'open source', 'workflow', 'llm', 'chatbot builder', 'developer'] },

  // ── SEARCH & RESEARCH ─────────────────────────────────────────────────────
  'genspark':          { category: 'Search & Research', tags: ['search', 'research', 'ai search', 'web', 'real-time'] },
  'consensus':         { category: 'Search & Research', tags: ['search', 'research', 'academic', 'science', 'citations', 'fact-check'] },
  'exa':               { category: 'Search & Research', tags: ['search', 'api', 'semantic', 'developer', 'research', 'web search'] },

  // ── IMAGE GENERATION ──────────────────────────────────────────────────────
  'midjourney':        { category: 'Image Generation', tags: ['image generation', 'art', 'design', 'creative', 'ai art'] },
  'dall-e-3':          { category: 'Image Generation', tags: ['image generation', 'openai', 'art', 'creative', 'ai art'] },
  'adobe-firefly':     { category: 'Image Generation', tags: ['image generation', 'adobe', 'commercial safe', 'design', 'editing'] },
  'bing-image-creator':{ category: 'Image Generation', tags: ['image generation', 'microsoft', 'free', 'bing', 'ai art'] },
  'ideogram':          { category: 'Image Generation', tags: ['image generation', 'text in images', 'logos', 'typography', 'design'] },
  'ideogram-2':        { category: 'Image Generation', tags: ['image generation', 'text in images', 'logos', 'typography', 'design'] },
  'leonardo-ai':       { category: 'Image Generation', tags: ['image generation', 'art', 'game assets', 'creative', 'ai art'] },
  'flux-pro':          { category: 'Image Generation', tags: ['image generation', 'photorealistic', 'text rendering', 'api', 'model'] },
  'stable-diffusion':  { category: 'Image Generation', tags: ['image generation', 'open source', 'free', 'local', 'ai art', 'customizable'] },
  'krea-ai':           { category: 'Image Generation', tags: ['image generation', 'real-time', 'upscaling', 'design', 'creative'] },

  // ── VIDEO & AUDIO ─────────────────────────────────────────────────────────
  'runway-ml':         { category: 'Video & Audio', tags: ['video', 'video editing', 'ai video', 'creative', 'film'] },
  'sora':              { category: 'Video & Audio', tags: ['video', 'text to video', 'openai', 'ai video', 'generation'] },
  'heygen':            { category: 'Video & Audio', tags: ['video', 'avatar', 'presenter', 'business', 'ai video'] },
  'synthesia':         { category: 'Video & Audio', tags: ['video', 'avatar', 'training', 'business', 'ai video', 'presenter'] },
  'elevenlabs':        { category: 'Video & Audio', tags: ['voice', 'text to speech', 'audio', 'voiceover', 'clone'] },
  'capcut':            { category: 'Video & Audio', tags: ['video editing', 'social media', 'tiktok', 'beginner', 'mobile'] },
  'descript':          { category: 'Video & Audio', tags: ['video editing', 'podcast', 'transcription', 'audio', 'overdub'] },
  'murf-ai':           { category: 'Video & Audio', tags: ['voice', 'text to speech', 'voiceover', 'audio', 'narration'] },
  'pika-labs':         { category: 'Video & Audio', tags: ['video', 'text to video', 'ai video', 'generation', 'effects'] },
  'kling-ai':          { category: 'Video & Audio', tags: ['video', 'text to video', 'photorealistic', 'ai video', 'generation'] },
  'luma-dream-machine':{ category: 'Video & Audio', tags: ['video', 'text to video', 'image to video', 'ai video', 'motion'] },
  'suno':              { category: 'Video & Audio', tags: ['music', 'audio', 'song generation', 'ai music', 'creative'] },
  'udio':              { category: 'Video & Audio', tags: ['music', 'audio', 'song generation', 'ai music', 'background music'] },
  'opus-clip':         { category: 'Video & Audio', tags: ['video', 'clips', 'social media', 'repurposing', 'tiktok', 'creator'] },
  'captions':          { category: 'Video & Audio', tags: ['video', 'captions', 'subtitles', 'social media', 'creator', 'mobile'] },
  'adobe-podcast':     { category: 'Video & Audio', tags: ['audio', 'podcast', 'noise removal', 'microphone', 'recording'] },

  // ── PRODUCTIVITY ──────────────────────────────────────────────────────────
  'zapier':            { category: 'Productivity', tags: ['automation', 'workflow', 'no-code', 'integrations', 'business'] },
  'make':              { category: 'Productivity', tags: ['automation', 'workflow', 'no-code', 'integrations', 'business'] },
  'notion-ai':         { category: 'Productivity', tags: ['notes', 'productivity', 'writing', 'ai assistant', 'documents', 'workspace'] },
  'otter-ai':          { category: 'Productivity', tags: ['transcription', 'meeting notes', 'audio', 'productivity', 'notes'] },
  'fireflies-ai':      { category: 'Productivity', tags: ['transcription', 'meeting notes', 'audio', 'productivity', 'notes'] },
  'reclaim-ai':        { category: 'Productivity', tags: ['scheduling', 'calendar', 'productivity', 'time management', 'tasks'] },
  'loom-ai':           { category: 'Productivity', tags: ['video', 'screen recording', 'communication', 'productivity', 'async'] },
  'speechify':         { category: 'Productivity', tags: ['text to speech', 'reading', 'accessibility', 'audio', 'productivity'] },
  'mem':               { category: 'Productivity', tags: ['notes', 'knowledge management', 'ai', 'organization', 'productivity'] },
  'taskade':           { category: 'Productivity', tags: ['tasks', 'productivity', 'agent', 'project management', 'team'] },
  'gamma-ai':          { category: 'Productivity', tags: ['presentations', 'slides', 'documents', 'ai generated', 'design'] },
  'tome':              { category: 'Productivity', tags: ['presentations', 'slides', 'ai generated', 'storytelling', 'design'] },
  'harvey-ai':         { category: 'Productivity', tags: ['legal', 'contracts', 'research', 'enterprise', 'compliance'] },

  // ── WRITING & CONTENT ─────────────────────────────────────────────────────
  'jasper-ai':         { category: 'Writing & Content', tags: ['writing', 'marketing', 'copywriting', 'content', 'blog', 'ai writing'] },
  'copy-ai':           { category: 'Writing & Content', tags: ['writing', 'copywriting', 'marketing', 'content', 'ads', 'ai writing'] },
  'grammarly':         { category: 'Writing & Content', tags: ['writing', 'grammar', 'editing', 'proofreading', 'english', 'ai writing'] },
  'writesonic':        { category: 'Writing & Content', tags: ['writing', 'marketing', 'copywriting', 'content', 'blog', 'ai writing'] },
  'sudowrite':         { category: 'Writing & Content', tags: ['writing', 'fiction', 'creative writing', 'story', 'novel', 'author'] },
  'quillbot':          { category: 'Writing & Content', tags: ['writing', 'paraphrasing', 'grammar', 'rewriting', 'students', 'ai writing'] },
  'rytr':              { category: 'Writing & Content', tags: ['writing', 'content', 'affordable', 'small business', 'blog', 'ai writing'] },

  // ── DESIGN ────────────────────────────────────────────────────────────────
  'canva-ai':          { category: 'Design', tags: ['design', 'graphics', 'social media', 'marketing', 'templates', 'beginner'] },
  'beautiful-ai':      { category: 'Design', tags: ['presentations', 'slides', 'design', 'business', 'templates'] },
  'looka':             { category: 'Design', tags: ['logo', 'brand', 'design', 'small business', 'identity'] },
  'remove-bg':         { category: 'Design', tags: ['design', 'background removal', 'images', 'editing', 'free'] },
  'gamma':             { category: 'Design', tags: ['presentations', 'slides', 'design', 'documents', 'ai generated'] },

  // ── DATA & ANALYTICS ──────────────────────────────────────────────────────
  'julius-ai':         { category: 'Data & Analytics', tags: ['data', 'analytics', 'spreadsheets', 'charts', 'no-code', 'business'] },
  'rows':              { category: 'Data & Analytics', tags: ['spreadsheet', 'data', 'analytics', 'automation', 'business'] },

  // ── CUSTOMER SERVICE ──────────────────────────────────────────────────────
  'intercom-fin':      { category: 'Customer Service', tags: ['customer service', 'chatbot', 'support', 'automation', 'business'] },
  'tidio':             { category: 'Customer Service', tags: ['customer service', 'chatbot', 'live chat', 'ecommerce', 'small business'] },

  // ── BUSINESS & MARKETING ──────────────────────────────────────────────────
  'surfer-seo':        { category: 'Business & marketing', tags: ['seo', 'content', 'marketing', 'search ranking', 'blog'] },
  'buffer':            { category: 'Business & marketing', tags: ['social media', 'scheduling', 'marketing', 'content', 'business'] },
  'manychat':          { category: 'Business & marketing', tags: ['chatbot', 'marketing', 'social media', 'instagram', 'automation'] },
  'kickresume':        { category: 'Business & marketing', tags: ['resume', 'cv', 'job search', 'career', 'templates'] },

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  'khanmigo':          { category: 'Education', tags: ['education', 'tutoring', 'students', 'learning', 'math', 'k12'] },
  'duolingo-max':      { category: 'Education', tags: ['education', 'language learning', 'beginner', 'conversation', 'practice'] },

  // ── HEALTHCARE ────────────────────────────────────────────────────────────
  'nabla-copilot':     { category: 'Healthcare', tags: ['healthcare', 'medical', 'notes', 'doctors', 'documentation', 'clinical'] },
}

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get('admin_token')?.value
  const bearerToken = req.headers.get('authorization')?.replace('Bearer ', '')
  const expected = process.env.ADMIN_TOKEN
  if (!expected || (cookieToken !== expected && bearerToken !== expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let updated = 0
  let skipped = 0
  const errors: string[] = []

  for (const [slug, data] of Object.entries(TOOL_AUDIT)) {
    const { error } = await supabaseAdmin
      .from('tools')
      .update({ category: data.category, tags: data.tags })
      .eq('slug', slug)

    if (error) {
      errors.push(`${slug}: ${error.message}`)
      skipped++
    } else {
      updated++
    }
  }

  return NextResponse.json({ success: true, updated, skipped, errors: errors.slice(0, 5) })
}
