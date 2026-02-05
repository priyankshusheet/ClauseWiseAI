import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { requireAuth, optionalAuth, createServiceClient } from "../_shared/auth.ts";
import { 
  validateString, 
  validateNumber,
  ValidationError,
  createValidationErrorResponse 
} from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createServiceClient();

  try {
    if (req.method === 'POST') {
      // POST requests can be either authenticated (for user context) or internal calls
      const { userId: authUserId } = await optionalAuth(req);

      // Parse and validate request body
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body', code: 'VALIDATION_ERROR' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const bodyObj = body as Record<string, unknown>;

      // Validate inputs
      const action = validateString(bodyObj.action, 'action', { required: true, maxLength: 100 });
      const resource_type = validateString(bodyObj.resource_type, 'resource_type', { required: true, maxLength: 100 });
      const resource_id = validateString(bodyObj.resource_id, 'resource_id', { maxLength: 100 });
      
      // Validate metadata is an object if provided
      let metadata: Record<string, unknown> = {};
      if (bodyObj.metadata !== undefined && bodyObj.metadata !== null) {
        if (typeof bodyObj.metadata !== 'object' || Array.isArray(bodyObj.metadata)) {
          return new Response(
            JSON.stringify({ error: 'metadata must be an object', code: 'VALIDATION_ERROR' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        metadata = bodyObj.metadata as Record<string, unknown>;
      }

      const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                        req.headers.get('x-real-ip') || 
                        'unknown'
      const userAgent = (req.headers.get('user-agent') || 'unknown').substring(0, 500);

      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: authUserId,
          action,
          resource_type,
          resource_id,
          metadata,
          ip_address: ipAddress.substring(0, 45), // IPv6 max length
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
      // Require authentication for reading logs
      const authResult = await requireAuth(req, corsHeaders);
      if (authResult instanceof Response) {
        return authResult;
      }

      const userId = authResult.userId;

      const url = new URL(req.url)
      const resource_type = url.searchParams.get('resource_type')
      const resource_id = url.searchParams.get('resource_id')
      const action = url.searchParams.get('action')
      
      // Validate and sanitize pagination parameters
      let limit = parseInt(url.searchParams.get('limit') || '50')
      let offset = parseInt(url.searchParams.get('offset') || '0')
      
      // Enforce limits
      limit = Math.min(Math.max(1, isNaN(limit) ? 50 : limit), 100)
      offset = Math.max(0, isNaN(offset) ? 0 : offset)

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (resource_type) query = query.eq('resource_type', resource_type.substring(0, 100))
      if (resource_id) query = query.eq('resource_id', resource_id.substring(0, 100))
      if (action) query = query.eq('action', action.substring(0, 100))

      const { data, error, count } = await query

      if (error) throw error

      return new Response(
        JSON.stringify({ data, total: count, limit, offset }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    if (error instanceof ValidationError) {
      return createValidationErrorResponse(error, corsHeaders);
    }

    console.error('Audit log error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
