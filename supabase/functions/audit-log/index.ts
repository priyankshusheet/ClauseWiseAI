import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Get auth header for user context
    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data.user) {
        userId = data.user.id
      }
    }

    if (req.method === 'POST') {
      const { action, resource_type, resource_id, metadata } = await req.json()

      if (!action || !resource_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: action, resource_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                        req.headers.get('x-real-ip') || 
                        'unknown'
      const userAgent = req.headers.get('user-agent') || 'unknown'

      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type,
          resource_id,
          metadata: metadata || {},
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, log_id: data.id }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const url = new URL(req.url)
      const resource_type = url.searchParams.get('resource_type')
      const resource_id = url.searchParams.get('resource_id')
      const action = url.searchParams.get('action')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (resource_type) query = query.eq('resource_type', resource_type)
      if (resource_id) query = query.eq('resource_id', resource_id)
      if (action) query = query.eq('action', action)

      const { data, error, count } = await query

      if (error) throw error

      return new Response(
        JSON.stringify({ data, total: count, limit, offset }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Audit log error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})