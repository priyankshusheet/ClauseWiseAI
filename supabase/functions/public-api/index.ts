import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface RateLimitInfo {
  remaining: number
  reset: number
  limit: number
}

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(keyPrefix: string, limit: number): RateLimitInfo {
  const now = Date.now()
  const hourMs = 60 * 60 * 1000
  
  let entry = rateLimitMap.get(keyPrefix)
  
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + hourMs }
    rateLimitMap.set(keyPrefix, entry)
  }
  
  entry.count++
  
  return {
    remaining: Math.max(0, limit - entry.count),
    reset: entry.resetAt,
    limit,
  }
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    // API versioning - expect /v1/... 
    const version = pathParts[0] || 'v1'
    const resource = pathParts[1]
    const resourceId = pathParts[2]

    // Authenticate via API key
    const apiKey = req.headers.get('x-api-key')
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate API key format (prefix_secret)
    const keyPrefix = apiKey.substring(0, 8)
    const keyHash = await hashApiKey(apiKey)

    const { data: apiKeyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_prefix', keyPrefix)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (keyError || !apiKeyRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check expiration
    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key expired', code: 'EXPIRED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting
    const rateLimit = checkRateLimit(keyPrefix, apiKeyRecord.rate_limit_per_hour)
    
    if (rateLimit.remaining <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          code: 'RATE_LIMITED',
          reset_at: new Date(rateLimit.reset).toISOString()
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          } 
        }
      )
    }

    // Update last used
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyRecord.id)

    const userId = apiKeyRecord.user_id
    const scopes = apiKeyRecord.scopes || ['read']

    // Route handlers
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-API-Version': version,
      'X-RateLimit-Limit': rateLimit.limit.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.reset.toString(),
    }

    // API Routes
    switch (resource) {
      case 'documents': {
        if (req.method === 'GET' && !resourceId) {
          // List documents
          const { data, error } = await supabase
            .from('document_analyses')
            .select('id, file_name, file_type, risk_level, risk_score, created_at, updated_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50)

          if (error) throw error

          return new Response(
            JSON.stringify({ data, meta: { total: data.length } }),
            { status: 200, headers: responseHeaders }
          )
        }

        if (req.method === 'GET' && resourceId) {
          // Get single document
          const { data, error } = await supabase
            .from('document_analyses')
            .select('*')
            .eq('id', resourceId)
            .eq('user_id', userId)
            .single()

          if (error || !data) {
            return new Response(
              JSON.stringify({ error: 'Document not found', code: 'NOT_FOUND' }),
              { status: 404, headers: responseHeaders }
            )
          }

          return new Response(
            JSON.stringify({ data }),
            { status: 200, headers: responseHeaders }
          )
        }

        if (req.method === 'DELETE' && resourceId) {
          if (!scopes.includes('write') && !scopes.includes('delete')) {
            return new Response(
              JSON.stringify({ error: 'Insufficient permissions', code: 'FORBIDDEN' }),
              { status: 403, headers: responseHeaders }
            )
          }

          const { error } = await supabase
            .from('document_analyses')
            .delete()
            .eq('id', resourceId)
            .eq('user_id', userId)

          if (error) throw error

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: responseHeaders }
          )
        }
        break
      }

      case 'portfolios': {
        if (req.method === 'GET' && !resourceId) {
          const { data, error } = await supabase
            .from('portfolios')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (error) throw error

          return new Response(
            JSON.stringify({ data }),
            { status: 200, headers: responseHeaders }
          )
        }

        if (req.method === 'POST') {
          if (!scopes.includes('write')) {
            return new Response(
              JSON.stringify({ error: 'Insufficient permissions', code: 'FORBIDDEN' }),
              { status: 403, headers: responseHeaders }
            )
          }

          const body = await req.json()
          const { data, error } = await supabase
            .from('portfolios')
            .insert({
              user_id: userId,
              name: body.name,
              description: body.description,
            })
            .select()
            .single()

          if (error) throw error

          return new Response(
            JSON.stringify({ data }),
            { status: 201, headers: responseHeaders }
          )
        }
        break
      }

      case 'analytics': {
        if (req.method === 'GET') {
          const { data, error } = await supabase
            .from('user_analytics')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(30)

          if (error) throw error

          return new Response(
            JSON.stringify({ data }),
            { status: 200, headers: responseHeaders }
          )
        }
        break
      }

      case 'templates': {
        if (req.method === 'GET') {
          const { data, error } = await supabase
            .from('analysis_templates')
            .select('*')
            .or(`is_public.eq.true,user_id.eq.${userId}`)
            .order('usage_count', { ascending: false })

          if (error) throw error

          return new Response(
            JSON.stringify({ data }),
            { status: 200, headers: responseHeaders }
          )
        }
        break
      }

      default:
        return new Response(
          JSON.stringify({ 
            error: 'Not found', 
            code: 'NOT_FOUND',
            available_endpoints: [
              'GET /v1/documents',
              'GET /v1/documents/:id',
              'DELETE /v1/documents/:id',
              'GET /v1/portfolios',
              'POST /v1/portfolios',
              'GET /v1/analytics',
              'GET /v1/templates',
            ]
          }),
          { status: 404, headers: responseHeaders }
        )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: responseHeaders }
    )

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})