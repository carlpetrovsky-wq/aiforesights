import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side admin client — bypasses RLS using service role key.
// Lazy-initialized to avoid crashing at build time when env vars aren't set.
// Only use in API routes, never expose to the client.

let _client: SupabaseClient | null = null

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!url || !key) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY — add it in Vercel env vars')
      }
      _client = createClient(url, key)
    }
    return (_client as any)[prop]
  },
})
