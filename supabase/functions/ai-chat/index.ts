import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/auth.ts";
import { 
  validateChatMessages, 
  validateBoolean, 
  validateDocumentContext,
  ValidationError,
  createValidationErrorResponse,
  sanitizeText
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Financial document analysis system prompt
const SYSTEM_PROMPT = `You are ClauseWise, an expert financial document analyst with deep knowledge of:
- Insurance policies (life, health, auto, home)
- Loan agreements (home loans, personal loans, auto loans)
- Credit card terms and conditions
- Investment products and disclosures

Your role is to:
1. Analyze financial documents for hidden clauses and risks
2. Explain complex terms in plain language
3. Identify concerning clauses that may disadvantage consumers
4. Provide actionable recommendations
5. Compare terms against industry standards

When analyzing documents:
- Always cite specific clauses you're referencing
- Rate risk levels (Low/Medium/High) with clear justification
- Highlight auto-renewal, penalty, and exclusion clauses
- Be concise but thorough
- Format responses with clear sections and bullet points

Never provide specific financial advice - only analysis and education.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

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
        JSON.stringify({ error: "Invalid JSON body", code: "VALIDATION_ERROR" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bodyObj = body as Record<string, unknown>;

    // Validate inputs
    const messages = validateChatMessages(bodyObj.messages, { maxMessages: 50, maxContentLength: 30000 });
    const stream = validateBoolean(bodyObj.stream, 'stream', { defaultValue: true });
    const documentContext = validateDocumentContext(bodyObj.documentContext);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured", code: "SERVICE_ERROR" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build enhanced messages with document context
    const enhancedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add document context if available
    if (documentContext) {
      const ctx = documentContext as Record<string, unknown>;
      const extractedText = ctx.extractedText ? sanitizeText(String(ctx.extractedText)).substring(0, 10000) : 'N/A';
      
      enhancedMessages.push({
        role: "system",
        content: `Document Context:
- File: ${ctx.fileName || 'Unknown'}
- Type: ${ctx.fileType || 'Unknown'}
- Risk Score: ${ctx.riskScore || 'N/A'}/100 (${ctx.riskLevel || 'N/A'})
- OCR Confidence: ${ctx.ocrConfidence || 'N/A'}%
- Extracted Text (first 10000 chars): ${extractedText}
- Detected Clauses: ${Array.isArray(ctx.detectedClauses) ? ctx.detectedClauses.join(', ') : 'None'}
- Document Sections: ${Array.isArray(ctx.sections) ? ctx.sections.map((s: any) => s.title).join(', ') : 'N/A'}`
      });
    }

    // Add sanitized conversation history
    const sanitizedMessages = messages.map(m => ({
      role: m.role,
      content: sanitizeText(m.content)
    }));
    enhancedMessages.push(...sanitizedMessages);

    console.log(`[AI-Chat] User: ${authResult.userId}, Processing ${messages.length} messages, stream=${stream}`);

    const response = await fetch("https://ai.gateway.clausewiseai.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: enhancedMessages,
        stream: stream,
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const latency = Date.now() - startTime;
      console.error(`[AI-Chat] Gateway error: ${response.status} (${latency}ms)`);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please wait a moment before trying again.",
            code: "RATE_LIMIT",
            retryAfter: 30
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "AI service quota exceeded. Please add credits to continue.",
            code: "QUOTA_EXCEEDED"
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Don't expose internal error details
      await response.text(); // Consume the response body
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable", code: "SERVICE_ERROR" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const latency = Date.now() - startTime;
    console.log(`[AI-Chat] Gateway response received (${latency}ms)`);

    // Return streaming response
    if (stream) {
      return new Response(response.body, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream",
          "X-Response-Time": `${latency}ms`
        },
      });
    }

    // Non-streaming response
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "X-Response-Time": `${latency}ms`
      },
    });

  } catch (e) {
    const latency = Date.now() - startTime;
    
    if (e instanceof ValidationError) {
      return createValidationErrorResponse(e, corsHeaders);
    }

    console.error(`[AI-Chat] Error (${latency}ms):`, e);

    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred",
        code: "INTERNAL_ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
