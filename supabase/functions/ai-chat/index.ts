import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { optionalAuth } from "../_shared/auth.ts";
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

When a document is loaded in context:
- Reference SPECIFIC clauses and sections from the extracted text
- Quote relevant portions of the document
- Provide analysis grounded in the actual document content
- Don't give generic advice — be specific to THIS document

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
    const { userId } = await optionalAuth(req);

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
    const messages = validateChatMessages(bodyObj.messages, { maxMessages: 50, maxContentLength: 30000 });
    const stream = validateBoolean(bodyObj.stream, 'stream', { defaultValue: true });
    const documentContext = validateDocumentContext(bodyObj.documentContext);

    const enhancedMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (documentContext) {
      const ctx = documentContext as Record<string, unknown>;
      const extractedText = ctx.extractedText ? sanitizeText(String(ctx.extractedText)).substring(0, 15000) : '';
      
      if (extractedText) {
        enhancedMessages.push({
          role: "system",
          content: `DOCUMENT LOADED FOR ANALYSIS:
File: ${ctx.fileName || 'Unknown'}
Type: ${ctx.fileType || 'Unknown'}
Risk Score: ${ctx.riskScore || 'N/A'}/100 (${ctx.riskLevel || 'N/A'})
OCR Confidence: ${ctx.ocrConfidence || 'N/A'}%

FULL DOCUMENT TEXT:
${extractedText}

DETECTED CLAUSES: ${Array.isArray(ctx.detectedClauses) ? ctx.detectedClauses.join(', ') : 'None'}

IMPORTANT: Base all your answers on the actual document text above. Quote specific sections when answering questions. Do NOT give generic answers.`
        });
      } else {
        enhancedMessages.push({
          role: "system",
          content: `Document "${ctx.fileName}" is referenced but no text was extracted. Ask the user to re-upload or provide more details.`
        });
      }
    }

    // Fetch relevant memories for authenticated users
    if (userId) {
      try {
        const lastUserMessage = messages[messages.length - 1]?.content || '';
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const COHERE_KEY = Deno.env.get("COHERE_API_KEY");
        if (COHERE_KEY && lastUserMessage.length > 10) {
          const embedResponse = await fetch("https://api.cohere.com/v2/embed", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${COHERE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              texts: [lastUserMessage],
              model: "embed-multilingual-v3.0",
              input_type: "search_query",
              embedding_types: ["float"],
            }),
          });

          if (embedResponse.ok) {
            const embedData = await embedResponse.json();
            const queryEmbedding = embedData.embeddings?.float?.[0];

            if (queryEmbedding) {
              const { data: memories } = await supabaseAdmin.rpc("match_user_memories", {
                query_embedding: JSON.stringify(queryEmbedding),
                match_user_id: userId,
                match_threshold: 0.5,
                match_count: 3,
              });

              if (memories && memories.length > 0) {
                const memoryContext = memories
                  .map((m: any) => `[${m.memory_type}] ${m.content}`)
                  .join('\n');
                enhancedMessages.push({
                  role: "system",
                  content: `Relevant context from previous interactions:\n${memoryContext}\n\nUse this context to provide personalized, continuous advice.`
                });
              }
            }
          }
        }
      } catch (memErr) {
        console.warn("[AI-Chat] Memory retrieval failed (non-critical):", memErr);
      }
    }

    const sanitizedMessages = messages.map((m: any) => ({
      role: m.role,
      content: sanitizeText(m.content)
    }));
    enhancedMessages.push(...sanitizedMessages);

    console.log(`[AI-Chat] User: ${userId || 'anonymous'}, Messages: ${messages.length}, stream=${stream}, hasDocContext=${!!documentContext}`);

    // AI providers
    const fallbackProviders = [
      {
        name: "Groq",
        call: async () => {
          const key = Deno.env.get("GROQ_API_KEY");
          if (!key) return null;
          return fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: enhancedMessages,
              stream,
              temperature: 0.3,
              max_tokens: 4096,
            }),
          });
        },
        streaming: true,
      },
      {
        name: "OpenAI",
        call: async () => {
          const key = Deno.env.get("OPENAI_API_KEY");
          if (!key) return null;
          return fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: enhancedMessages,
              stream,
              temperature: 0.3,
              max_tokens: 4096,
            }),
          });
        },
        streaming: true,
      },
    ];

    for (const provider of fallbackProviders) {
      try {
        console.log(`[AI-Chat] Trying fallback: ${provider.name}`);
        const response = await provider.call();
        if (!response || !response.ok) continue;

        const latency = Date.now() - startTime;
        console.log(`[AI-Chat] ${provider.name} succeeded (${latency}ms)`);

        if (stream && provider.streaming) {
          return new Response(response.body, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/event-stream",
              "X-Response-Time": `${latency}ms`,
              "X-AI-Provider": provider.name,
            },
          });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json", "X-AI-Provider": provider.name },
        });
      } catch (e) {
        console.error(`[AI-Chat] ${provider.name} failed:`, e);
      }
    }

    return new Response(
      JSON.stringify({ error: "AI service temporarily unavailable.", code: "SERVICE_ERROR" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    if (e instanceof ValidationError) {
      return createValidationErrorResponse(e, corsHeaders);
    }

    console.error(`[AI-Chat] Error:`, e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
