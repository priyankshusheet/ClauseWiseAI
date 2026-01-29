import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  event: string
  data: Record<string, unknown>
  timestamp: string
  webhook_id: string
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function deliverWebhook(
  webhook: { id: string; url: string; secret: string | null; retry_count: number },
  payload: WebhookPayload,
  supabase: ReturnType<typeof createClient>,
  attempt: number = 1
): Promise<boolean> {
  const payloadStr = JSON.stringify(payload)
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Webhook-Event': payload.event,
    'X-Webhook-Timestamp': payload.timestamp,
    'X-Webhook-Attempt': attempt.toString(),
  }

  if (webhook.secret) {
    headers['X-Webhook-Signature'] = await signPayload(payloadStr, webhook.secret)
  }

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadStr,
    })

    const responseBody = await response.text()

    // Log delivery
    await supabase.from('webhook_deliveries').insert({
      webhook_id: webhook.id,
      event_type: payload.event,
      payload,
      response_status: response.status,
      response_body: responseBody.substring(0, 1000),
      attempt_number: attempt,
      delivered_at: response.ok ? new Date().toISOString() : null,
    })

    if (response.ok) {
      // Update webhook last triggered
      await supabase
        .from('webhooks')
        .update({ last_triggered_at: new Date().toISOString(), failure_count: 0 })
        .eq('id', webhook.id)
      return true
    }

    // Retry logic
    if (attempt < webhook.retry_count) {
      // Exponential backoff: 1s, 4s, 9s...
      await new Promise(resolve => setTimeout(resolve, attempt * attempt * 1000))
      return deliverWebhook(webhook, payload, supabase, attempt + 1)
    }

    // Mark as failed after all retries
    await supabase
      .from('webhooks')
      .update({ failure_count: webhook.retry_count })
      .eq('id', webhook.id)

    return false
  } catch (error) {
    console.error('Webhook delivery error:', error)

    await supabase.from('webhook_deliveries').insert({
      webhook_id: webhook.id,
      event_type: payload.event,
      payload,
      response_status: 0,
      response_body: error instanceof Error ? error.message : 'Unknown error',
      attempt_number: attempt,
    })

    if (attempt < webhook.retry_count) {
      await new Promise(resolve => setTimeout(resolve, attempt * attempt * 1000))
      return deliverWebhook(webhook, payload, supabase, attempt + 1)
    }

    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { event, user_id, data } = await req.json()

    if (!event || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing event or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Supported events
    const validEvents = [
      'document.uploaded',
      'document.analyzed',
      'document.failed',
      'risk.threshold_crossed',
      'portfolio.updated',
      'export.completed',
    ]

    if (!validEvents.includes(event)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event type', valid_events: validEvents }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all active webhooks for this user and event
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .contains('events', [event])

    if (error) throw error

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No webhooks configured for this event', delivered: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Deliver to all matching webhooks
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      webhook_id: '', // Will be set per webhook
    }

    const results = await Promise.all(
      webhooks.map(async (webhook) => {
        const webhookPayload = { ...payload, webhook_id: webhook.id }
        const success = await deliverWebhook(webhook, webhookPayload, supabase)
        return { webhook_id: webhook.id, success }
      })
    )

    const delivered = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({ 
        message: 'Webhooks processed', 
        delivered,
        failed,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})