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
  // Primary: ClauseWiseAI AI Gateway (Gemini)
  {
    name: "ClauseWiseAI AI (Gemini)",
    endpoint: "https://ai.gateway.clausewiseai.dev/v1/chat/completions",
    getHeaders: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatBody: (messages, stream) => ({
      model: "google/gemini-3-flash-preview",
      messages,
      stream,
      temperature: 0.3,
      max_tokens: 4096,
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content || null,
    getApiKey: () => Deno.env.get("LOVABLE_API_KEY"),
  },
  // Fallback 1: OpenAI
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
  },
  // Fallback 2: Gemini (direct)
  {
    name: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    getHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    }),
    formatBody: (messages, _stream) => ({
      contents: messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      systemInstruction: {
        parts: [{ text: messages.find(m => m.role === 'system')?.content || SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      }
    }),
    parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || null,
    getApiKey: () => Deno.env.get("GEMINI_API_KEY"),
  },
  // Fallback 3: Groq
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
  },
  // Fallback 4: Cohere
  {
    name: "Cohere",
    endpoint: "https://api.cohere.com/v1/chat",
    getHeaders: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatBody: (messages, _stream) => {
      const systemMsg = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');
      const lastMessage = userMessages.pop();
      return {
        model: "command-r-plus",
        message: lastMessage?.content || '',
        preamble: systemMsg?.content || SYSTEM_PROMPT,
        chat_history: userMessages.map(m => ({
          role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
          message: m.content
        })),
        temperature: 0.3,
        max_tokens: 4096,
      };
    },
    parseResponse: (data) => data.text || null,
    getApiKey: () => Deno.env.get("COHERE_API_KEY"),
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
    
    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: provider.getHeaders(apiKey),
      body: JSON.stringify(provider.formatBody(messages, stream)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI-Chat] ${provider.name} error: ${response.status} - ${errorText.substring(0, 200)}`);
      
      // Don't fallback on rate limits or quota - return specific error
      if (response.status === 429) {
        return { 
          success: false, 
          error: `RATE_LIMIT:${provider.name}` 
        };
      }
      if (response.status === 402) {
        return { 
          success: false, 
          error: `QUOTA_EXCEEDED:${provider.name}` 
        };
      }
      
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
): Promise<{ response: Response; provider: string } | { error: string; code: string; status: number }> {
  const errors: string[] = [];

  for (const provider of AI_PROVIDERS) {
    const result = await tryProvider(provider, messages, stream);
    
    if (result.success && result.response) {
      return { response: result.response, provider: provider.name };
    }
    
    if (result.error) {
      // Handle specific errors that should not trigger fallback
      if (result.error.startsWith('RATE_LIMIT:')) {
        return {
          error: "Rate limit exceeded. Please wait a moment before trying again.",
          code: "RATE_LIMIT",
          status: 429
        };
      }
      if (result.error.startsWith('QUOTA_EXCEEDED:')) {
        return {
          error: "AI service quota exceeded. Please add credits to continue.",
          code: "QUOTA_EXCEEDED",
          status: 402
        };
      }
      
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Optional authentication - allow unauthenticated users for trial
    const { userId } = await optionalAuth(req);

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

    console.log(`[AI-Chat] User: ${userId || 'anonymous'}, Processing ${messages.length} messages, stream=${stream}`);

    // Call AI with fallback mechanism
    const result = await callAIWithFallback(enhancedMessages, stream);

    if ('error' in result) {
      return new Response(
        JSON.stringify({ 
          error: result.error,
          code: result.code,
          ...(result.code === 'RATE_LIMIT' ? { retryAfter: 30 } : {})
        }),
        { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const latency = Date.now() - startTime;
    console.log(`[AI-Chat] ${result.provider} response received (${latency}ms)`);

    // Return streaming response
    if (stream) {
      return new Response(result.response.body, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream",
          "X-Response-Time": `${latency}ms`,
          "X-AI-Provider": result.provider
        },
      });
    }

    // Non-streaming response
    const data = await result.response.json();
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "X-Response-Time": `${latency}ms`,
        "X-AI-Provider": result.provider
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
