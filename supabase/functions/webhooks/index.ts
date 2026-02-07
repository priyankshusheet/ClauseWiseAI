import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { requireAuth } from "../_shared/auth.ts";
import { 
  validateString, 
  validateEnum,
  ValidationError,
  createValidationErrorResponse 
} from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface WebhookPayload {
  event: string
  data: Record<string, unknown>
  timestamp: string
  webhook_id: string
}

// Valid webhook events
const VALID_EVENTS = [
  'document.uploaded',
  'document.analyzed',
  'document.failed',
  'risk.threshold_crossed',
  'portfolio.updated',
  'export.completed',
] as const;

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
  webhook: { id: string; url: string; secret: string | null; secret_encrypted: boolean | null; retry_count: number },
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

  // Decrypt secret if encrypted, then sign payload
  if (webhook.secret) {
    let decryptedSecret = webhook.secret;
    
    if (webhook.secret_encrypted) {
      // Call database function to decrypt the secret
      const { data: decryptResult, error: decryptError } = await supabase
        .rpc('decrypt_webhook_secret', { 
          encrypted_secret: webhook.secret, 
          wh_id: webhook.id 
        });
      
      if (decryptError || !decryptResult) {
        console.error('Failed to decrypt webhook secret:', decryptError);
        // Continue without signature if decryption fails
      } else {
        decryptedSecret = decryptResult;
      }
    }
    
    headers['X-Webhook-Signature'] = await signPayload(payloadStr, decryptedSecret)
  }

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadStr,
    })

    const responseBody = await response.text()

    // Log delivery (truncate response for storage)
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
      response_body: 'Delivery failed',
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
    // Require authentication
    const authResult = await requireAuth(req, corsHeaders);
    if (authResult instanceof Response) {
      return authResult;
    }

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
    const event = validateEnum(bodyObj.event, 'event', VALID_EVENTS, { required: true });
    
    if (!event) {
      return new Response(
        JSON.stringify({ error: 'Invalid event type', valid_events: VALID_EVENTS }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate data is an object
    if (bodyObj.data !== undefined && bodyObj.data !== null) {
      if (typeof bodyObj.data !== 'object' || Array.isArray(bodyObj.data)) {
        return new Response(
          JSON.stringify({ error: 'data must be an object', code: 'VALIDATION_ERROR' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const data = (bodyObj.data as Record<string, unknown>) || {};

    // Use the authenticated user's ID
    const userId = authResult.userId;

    // Get all active webhooks for this user and event
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
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
    if (error instanceof ValidationError) {
      return createValidationErrorResponse(error, corsHeaders);
    }

    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
