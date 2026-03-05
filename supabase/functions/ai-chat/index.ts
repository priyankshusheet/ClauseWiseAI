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

When analyzing documents:
- Always cite specific clauses you're referencing
- Rate risk levels (Low/Medium/High) with clear justification
- Highlight auto-renewal, penalty, and exclusion clauses
- Be concise but thorough
- Format responses with clear sections and bullet points

Never provide specific financial advice - only analysis and education.`;

// AI Provider configurations — ordered by speed and streaming support
interface AIProvider {
  name: string;
  endpoint: string;
  getHeaders: (apiKey: string) => Record<string, string>;
  formatBody: (messages: any[], stream: boolean) => any;
  parseResponse: (data: any) => string | null;
  getApiKey: () => string | undefined;
  supportsStreaming: boolean;
}

const AI_PROVIDERS: AIProvider[] = [
  // Primary: Groq — fastest, native OpenAI-compatible streaming
  {
    name: "Groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    getHeaders: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatBody: (messages, stream) => ({
      model: "llama-3.3-70b-versatile",
      messages,
      stream,
      temperature: 0.3,
      max_tokens: 4096,
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content || null,
    getApiKey: () => Deno.env.get("GROQ_API_KEY"),
    supportsStreaming: true,
  },
  // Secondary: OpenAI — reliable, native streaming
  {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    getHeaders: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatBody: (messages, stream) => ({
      model: "gpt-4o-mini",
      messages,
      stream,
      temperature: 0.3,
      max_tokens: 4096,
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content || null,
    getApiKey: () => Deno.env.get("OPENAI_API_KEY"),
    supportsStreaming: true,
  },
  // Tertiary: Gemini
  {
    name: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse",
    getHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    }),
    formatBody: (messages, _stream) => ({
      contents: messages.filter((m: any) => m.role !== 'system').map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      systemInstruction: {
        parts: [{ text: messages.find((m: any) => m.role === 'system')?.content || SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      }
    }),
    parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || null,
    getApiKey: () => Deno.env.get("GEMINI_API_KEY"),
    supportsStreaming: true,
  },
  // Fallback: Cohere — slowest, no native streaming
  {
    name: "Cohere",
    endpoint: "https://api.cohere.com/v2/chat",
    getHeaders: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatBody: (messages, _stream) => ({
      model: "command-a-03-2025",
      messages: messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
        content: m.content
      })),
      temperature: 0.3,
      max_tokens: 4096,
    }),
    parseResponse: (data) => data.message?.content?.[0]?.text || null,
    getApiKey: () => Deno.env.get("COHERE_API_KEY"),
    supportsStreaming: false,
  },
];

async function tryProvider(
  provider: AIProvider,
  messages: any[],
  stream: boolean
): Promise<{ success: boolean; response?: Response; error?: string }> {
  const apiKey = provider.getApiKey();
  if (!apiKey) {
    return { success: false, error: `${provider.name}: API key not configured` };
  }

  try {
    console.log(`[AI-Chat] Trying provider: ${provider.name}`);
    
    // Only request streaming from providers that support it
    const shouldStream = stream && provider.supportsStreaming;
    
    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: provider.getHeaders(apiKey),
      body: JSON.stringify(provider.formatBody(messages, shouldStream)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI-Chat] ${provider.name} error: ${response.status} - ${errorText.substring(0, 200)}`);
      return { success: false, error: `${provider.name}: HTTP ${response.status}` };
    }

    console.log(`[AI-Chat] ${provider.name} responded successfully`);
    return { success: true, response };
  } catch (error) {
    console.error(`[AI-Chat] ${provider.name} exception:`, error);
    return { success: false, error: `${provider.name}: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

async function callAIWithFallback(
  messages: any[],
  stream: boolean
): Promise<{ response: Response; provider: AIProvider } | { error: string; code: string; status: number }> {
  const errors: string[] = [];

  for (const provider of AI_PROVIDERS) {
    const result = await tryProvider(provider, messages, stream);
    
    if (result.success && result.response) {
      return { response: result.response, provider };
    }
    
    if (result.error) {
      errors.push(result.error);
    }
  }

  console.error(`[AI-Chat] All providers failed:`, errors);
  return {
    error: "AI service temporarily unavailable. All providers failed.",
    code: "SERVICE_ERROR",
    status: 503
  };
}

// Convert Gemini SSE stream to OpenAI-compatible SSE stream
function convertGeminiStreamToOpenAI(geminiStream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = geminiStream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          // Flush remaining buffer
          if (buffer.trim()) {
            processGeminiLines(buffer, controller, encoder);
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          
          if (!line.startsWith('data: ') || line === '') continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const openAIChunk = JSON.stringify({
                choices: [{ delta: { content: text } }]
              });
              controller.enqueue(encoder.encode(`data: ${openAIChunk}\n\n`));
            }
          } catch {
            // skip incomplete JSON
          }
        }
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      reader.cancel();
    }
  });
}

function processGeminiLines(text: string, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data: ')) continue;
    const jsonStr = trimmed.slice(6).trim();
    if (!jsonStr || jsonStr === '[DONE]') continue;
    try {
      const parsed = JSON.parse(jsonStr);
      const content = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`));
      }
    } catch { /* skip */ }
  }
}

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

    // Fetch relevant memories for authenticated users
    if (userId) {
      try {
        const lastUserMessage = messages[messages.length - 1]?.content || '';
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Generate embedding for the query to find relevant memories
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
                console.log(`[AI-Chat] Loaded ${memories.length} relevant memories for user`);
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

    console.log(`[AI-Chat] User: ${userId || 'anonymous'}, Processing ${messages.length} messages, stream=${stream}`);

    const result = await callAIWithFallback(enhancedMessages, stream);

    if ('error' in result) {
      return new Response(
        JSON.stringify({ error: result.error, code: result.code }),
        { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const latency = Date.now() - startTime;
    console.log(`[AI-Chat] ${result.provider.name} response received (${latency}ms)`);

    const responseHeaders = {
      ...corsHeaders,
      "X-Response-Time": `${latency}ms`,
      "X-AI-Provider": result.provider.name,
    };

    if (stream) {
      // Providers with native OpenAI-compatible streaming
      if (result.provider.name === "Groq" || result.provider.name === "OpenAI") {
        return new Response(result.response.body, {
          headers: { ...responseHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // Gemini streaming — convert SSE format to OpenAI-compatible
      if (result.provider.name === "Google Gemini" && result.response.body) {
        const convertedStream = convertGeminiStreamToOpenAI(result.response.body);
        return new Response(convertedStream, {
          headers: { ...responseHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // Non-streaming providers (Cohere) — wrap in single SSE event
      const providerData = await result.response.json();
      const content = result.provider.parseResponse(providerData) || "";

      const streamBody = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          // Send content in small chunks to simulate streaming
          const words = content.split(' ');
          let i = 0;
          const sendChunk = () => {
            if (i < words.length) {
              const chunk = words.slice(i, i + 3).join(' ') + ' ';
              const payload = JSON.stringify({ choices: [{ delta: { content: chunk } }] });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
              i += 3;
              // Small delay between chunks for visual streaming effect
              setTimeout(sendChunk, 0);
            } else {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            }
          };
          sendChunk();
        }
      });

      return new Response(streamBody, {
        headers: { ...responseHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response
    const data = await result.response.json();
    const content = result.provider.parseResponse(data) || "";
    const normalized = {
      choices: [{ message: { role: "assistant", content } }]
    };
    return new Response(JSON.stringify(normalized), {
      headers: { ...responseHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    const latency = Date.now() - startTime;
    
    if (e instanceof ValidationError) {
      return createValidationErrorResponse(e, corsHeaders);
    }

    console.error(`[AI-Chat] Error (${latency}ms):`, e);

    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
