import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
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

// Jurisdiction-specific system prompts
const JURISDICTION_PROMPTS: Record<string, string> = {
  IN: `You are ClauseWise, an expert Indian financial document analyst with deep knowledge of:
- Indian insurance regulations (IRDAI guidelines, Insurance Act 1938, Insurance Regulatory and Development Authority Act 1999)
- RBI regulations for banking and loans (RBI Master Directions, Banking Regulation Act 1949)
- SEBI regulations for investments (SEBI Act 1992, Mutual Fund Regulations)
- Indian Contract Act 1872
- Consumer Protection Act 2019
- Negotiable Instruments Act 1881
- SARFAESI Act 2002 for secured lending
- Indian Stamp Act
- GST implications on financial products
- NBFC regulations (RBI guidelines for Non-Banking Financial Companies)

Your role is to:
1. Analyze financial documents for hidden clauses and risks under Indian law
2. Explain terms using Indian financial terminology (EMI, lakh, crore, TDS, GST, CIBIL score, etc.)
3. Reference specific Indian regulatory frameworks (IRDAI, RBI, SEBI circulars)
4. Identify clauses that violate Indian consumer protection laws
5. Compare terms against Indian industry standards and RBI/IRDAI mandated norms
6. Highlight cooling-off periods, free-look periods as mandated by IRDAI
7. Flag unfair trade practices under Consumer Protection Act 2019

Use Indian currency (₹) and Indian financial conventions. Reference Indian case law when relevant.
When analyzing documents, always cite specific clauses and rate risk levels (Low/Medium/High).
Never provide specific financial advice - only analysis and education.`,

  US: `You are ClauseWise, an expert financial document analyst with deep knowledge of:
- US insurance regulations (state-level DOI rules, NAIC model laws)
- Federal lending laws (TILA, RESPA, ECOA, Fair Lending)
- Credit card regulations (CARD Act, Regulation Z)
- SEC investment regulations
- Dodd-Frank Act consumer protections
- CFPB guidelines

Analyze documents citing specific US regulatory frameworks. Use USD ($) and US financial conventions.
Rate risk levels (Low/Medium/High) with clear justification. Never provide specific financial advice.`,

  GB: `You are ClauseWise, an expert financial document analyst with deep knowledge of:
- FCA regulations and consumer duty
- UK Consumer Rights Act 2015
- Financial Services and Markets Act 2000
- PRA prudential standards
- UK insurance regulations (Solvency II UK)

Analyze documents citing UK regulatory frameworks. Use GBP (£) and UK financial conventions.
Rate risk levels (Low/Medium/High) with clear justification. Never provide specific financial advice.`,

  AE: `You are ClauseWise, an expert financial document analyst with knowledge of:
- UAE Central Bank regulations
- DFSA and ADGM rules
- UAE Insurance Authority guidelines
- UAE Civil Code and Commercial Transactions Law

Analyze documents citing UAE regulatory frameworks. Use AED (د.إ) conventions.
Rate risk levels (Low/Medium/High). Never provide specific financial advice.`,

  SG: `You are ClauseWise, an expert financial document analyst with knowledge of:
- MAS (Monetary Authority of Singapore) regulations
- Singapore Insurance Act
- Securities and Futures Act
- Consumer Protection (Fair Trading) Act

Analyze documents citing Singapore regulatory frameworks. Use SGD ($) conventions.
Rate risk levels (Low/Medium/High). Never provide specific financial advice.`,
};

const DEFAULT_SYSTEM_PROMPT = JURISDICTION_PROMPTS.IN; // India as default

// AI Provider configurations with fallback order
interface AIProvider {
  name: string;
  endpoint: string;
  getHeaders: (apiKey: string) => Record<string, string>;
  formatBody: (messages: any[], stream: boolean) => any;
  parseResponse: (data: any) => string | null;
  getApiKey: () => string | undefined;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    name: "Cohere",
    endpoint: "https://api.cohere.com/v2/chat",
    getHeaders: (apiKey) => ({ Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }),
    formatBody: (messages, _stream) => ({
      model: "command-r-plus",
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
        content: m.content
      })),
      temperature: 0.3,
      max_tokens: 4096,
    }),
    parseResponse: (data) => data.message?.content?.[0]?.text || null,
    getApiKey: () => Deno.env.get("COHERE_API_KEY"),
  },
  {
    name: "Groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    getHeaders: (apiKey) => ({ Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }),
    formatBody: (messages, stream) => ({
      model: "llama-3.3-70b-versatile",
      messages,
      stream,
      temperature: 0.3,
      max_tokens: 4096,
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content || null,
    getApiKey: () => Deno.env.get("GROQ_API_KEY"),
  },
  {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    getHeaders: (apiKey) => ({ Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }),
    formatBody: (messages, stream) => ({
      model: "gpt-4o-mini",
      messages,
      stream,
      temperature: 0.3,
      max_tokens: 4096,
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content || null,
    getApiKey: () => Deno.env.get("OPENAI_API_KEY"),
  },
  {
    name: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    getHeaders: (apiKey) => ({ "Content-Type": "application/json", "x-goog-api-key": apiKey }),
    formatBody: (messages, _stream) => ({
      contents: messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      systemInstruction: {
        parts: [{ text: messages.find(m => m.role === 'system')?.content || DEFAULT_SYSTEM_PROMPT }]
      },
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
    }),
    parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || null,
    getApiKey: () => Deno.env.get("GEMINI_API_KEY"),
  },
];

async function tryProvider(provider: AIProvider, messages: any[], stream: boolean) {
  const apiKey = provider.getApiKey();
  if (!apiKey) return { success: false, error: `${provider.name}: API key not configured` };

  try {
    console.log(`[AI-Chat] Trying provider: ${provider.name}`);
    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: provider.getHeaders(apiKey),
      body: JSON.stringify(provider.formatBody(messages, stream)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI-Chat] ${provider.name} error: ${response.status} - ${errorText.substring(0, 200)}`);
      if (response.status === 429) return { success: false, error: `RATE_LIMIT:${provider.name}` };
      if (response.status === 402) return { success: false, error: `QUOTA_EXCEEDED:${provider.name}` };
      return { success: false, error: `${provider.name}: HTTP ${response.status}` };
    }

    console.log(`[AI-Chat] ${provider.name} responded successfully`);
    return { success: true, response };
  } catch (error) {
    console.error(`[AI-Chat] ${provider.name} exception:`, error);
    return { success: false, error: `${provider.name}: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

async function callAIWithFallback(messages: any[], stream: boolean) {
  const errors: string[] = [];

  for (const provider of AI_PROVIDERS) {
    const result = await tryProvider(provider, messages, stream);
    if (result.success && result.response) return { response: result.response, provider: provider.name };
    if (result.error) {
      if (result.error.startsWith('RATE_LIMIT:')) return { error: "Rate limit exceeded. Please wait.", code: "RATE_LIMIT", status: 429 };
      if (result.error.startsWith('QUOTA_EXCEEDED:')) return { error: "AI quota exceeded.", code: "QUOTA_EXCEEDED", status: 402 };
      errors.push(result.error);
    }
  }

  console.error(`[AI-Chat] All providers failed:`, errors);
  return { error: "AI service temporarily unavailable.", code: "SERVICE_ERROR", status: 503 };
}

// Recall memories for context
async function recallMemories(userId: string, query: string): Promise<string> {
  try {
    const COHERE_KEY = Deno.env.get("COHERE_API_KEY");
    if (!COHERE_KEY) return "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate query embedding
    const embedRes = await fetch("https://api.cohere.com/v2/embed", {
      method: "POST",
      headers: { Authorization: `Bearer ${COHERE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: [query.substring(0, 2000)],
        model: "embed-multilingual-v3.0",
        input_type: "search_query",
        embedding_types: ["float"],
      }),
    });
    if (!embedRes.ok) return "";
    const embedData = await embedRes.json();
    const queryEmbedding = embedData.embeddings?.float?.[0];
    if (!queryEmbedding) return "";

    const { data } = await supabase.rpc("match_user_memories", {
      query_embedding: `[${queryEmbedding.join(",")}]`,
      match_user_id: userId,
      match_threshold: 0.4,
      match_count: 3,
    });

    if (!data || data.length === 0) return "";

    return "\n\n[User Context from Previous Sessions]\n" + 
      data.map((m: any) => `- ${m.content} (${m.memory_type})`).join("\n");
  } catch (e) {
    console.error("[AI-Chat] Memory recall error:", e);
    return "";
  }
}

// Store conversation summary as memory
async function storeMemory(userId: string, content: string, memoryType: string = "conversation") {
  try {
    const COHERE_KEY = Deno.env.get("COHERE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let embedding: number[] | null = null;
    if (COHERE_KEY) {
      const embedRes = await fetch("https://api.cohere.com/v2/embed", {
        method: "POST",
        headers: { Authorization: `Bearer ${COHERE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: [content.substring(0, 2000)],
          model: "embed-multilingual-v3.0",
          input_type: "search_document",
          embedding_types: ["float"],
        }),
      });
      if (embedRes.ok) {
        const data = await embedRes.json();
        embedding = data.embeddings?.float?.[0] || null;
      }
    }

    await supabase.from("user_memories").insert({
      user_id: userId,
      content,
      memory_type: memoryType,
      metadata: { timestamp: new Date().toISOString() },
      embedding: embedding ? `[${embedding.join(",")}]` : null,
    });
  } catch (e) {
    console.error("[AI-Chat] Memory store error:", e);
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
    const country = (bodyObj.country as string) || 'IN';

    // Select jurisdiction-specific system prompt
    const systemPrompt = JURISDICTION_PROMPTS[country] || DEFAULT_SYSTEM_PROMPT;

    // Build enhanced messages
    const enhancedMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Recall memories for authenticated users
    if (userId) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        const memoryContext = await recallMemories(userId, lastUserMessage.content);
        if (memoryContext) {
          enhancedMessages.push({ role: "system", content: memoryContext });
        }
      }
    }

    // Add document context
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
    const sanitizedMessages = messages.map(m => ({ role: m.role, content: sanitizeText(m.content) }));
    enhancedMessages.push(...sanitizedMessages);

    console.log(`[AI-Chat] User: ${userId || 'anonymous'}, Country: ${country}, Messages: ${messages.length}, stream=${stream}`);

    const result = await callAIWithFallback(enhancedMessages, stream);

    if ('error' in result) {
      return new Response(
        JSON.stringify({ error: result.error, code: result.code, ...(result.code === 'RATE_LIMIT' ? { retryAfter: 30 } : {}) }),
        { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const latency = Date.now() - startTime;
    console.log(`[AI-Chat] ${result.provider} response (${latency}ms)`);

    // Store memory for authenticated users (async, don't await)
    if (userId && messages.length >= 2) {
      const lastUserMsg = messages.filter(m => m.role === 'user').pop();
      if (lastUserMsg && lastUserMsg.content.length > 20) {
        // Store in background without blocking response
        storeMemory(userId, lastUserMsg.content, documentContext ? "document_discussion" : "general_query");
      }
    }

    if (stream) {
      return new Response(result.response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-Response-Time": `${latency}ms`, "X-AI-Provider": result.provider },
      });
    }

    const data = await result.response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Response-Time": `${latency}ms`, "X-AI-Provider": result.provider },
    });

  } catch (e) {
    const latency = Date.now() - startTime;
    if (e instanceof ValidationError) return createValidationErrorResponse(e, corsHeaders);
    console.error(`[AI-Chat] Error (${latency}ms):`, e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
