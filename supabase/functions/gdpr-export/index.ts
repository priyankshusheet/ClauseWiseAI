import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    if (req.method === 'POST') {
      const { action } = await req.json()

      if (action === 'export') {
        // Create export request
        const { data: exportRequest, error: insertError } = await supabase
          .from('data_export_requests')
          .insert({
            user_id: userId,
            status: 'processing',
            export_type: 'full',
          })
          .select()
          .single()

        if (insertError) throw insertError

        // Gather all user data
        const [
          { data: profile },
          { data: documents },
          { data: portfolios },
          { data: chatSessions },
          { data: learningProgress },
          { data: auditLogs },
        ] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', userId).single(),
          supabase.from('document_analyses').select('*').eq('user_id', userId),
          supabase.from('portfolios').select('*').eq('user_id', userId),
          supabase.from('chat_sessions').select('*').eq('user_id', userId),
          supabase.from('learning_progress').select('*').eq('user_id', userId),
          supabase.from('audit_logs').select('*').eq('user_id', userId).limit(1000),
        ])

        const exportData = {
          exported_at: new Date().toISOString(),
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
          },
          profile,
          documents: documents || [],
          portfolios: portfolios || [],
          chat_sessions: chatSessions || [],
          learning_progress: learningProgress || [],
          audit_logs: auditLogs || [],
        }

        // In production, you would upload this to a secure storage
        // For now, return directly (base64 encoded)
        const exportJson = JSON.stringify(exportData, null, 2)
        const base64Data = btoa(unescape(encodeURIComponent(exportJson)))

        await supabase
          .from('data_export_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          })
          .eq('id', exportRequest.id)

        return new Response(
          JSON.stringify({ 
            success: true, 
            export_id: exportRequest.id,
            data: base64Data,
            format: 'base64_json',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'delete') {
        // Create deletion request
        const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days grace period

        const { data: deletionRequest, error: insertError } = await supabase
          .from('deletion_requests')
          .insert({
            user_id: userId,
            status: 'scheduled',
            scheduled_for: scheduledFor.toISOString(),
          })
          .select()
          .single()

        if (insertError) throw insertError

        return new Response(
          JSON.stringify({ 
            success: true,
            deletion_id: deletionRequest.id,
            status: 'scheduled',
            scheduled_for: scheduledFor.toISOString(),
            message: 'Your data deletion is scheduled. You can cancel within 30 days.',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'cancel_deletion') {
        const { error: updateError } = await supabase
          .from('deletion_requests')
          .update({ status: 'cancelled' })
          .eq('user_id', userId)
          .eq('status', 'scheduled')

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ success: true, message: 'Deletion request cancelled' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Invalid action. Use: export, delete, cancel_deletion' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Get status of export/deletion requests
      const [
        { data: exports },
        { data: deletions },
      ] = await Promise.all([
        supabase.from('data_export_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
        supabase.from('deletion_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      ])

      return new Response(
        JSON.stringify({ export_requests: exports, deletion_requests: deletions }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('GDPR operation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})