import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { optionalAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUGGESTION_PROMPT = `You are a helpful assistant for ClauseWise, a financial document analysis platform. Based on the conversation history and any document context provided, generate exactly 4 short follow-up questions that the user would likely want to ask next.

Rules:
- Questions must be directly relevant to what was just discussed
- Each question should explore a different angle or topic
- Keep questions concise (under 15 words each)
- Questions should be actionable and specific, not generic
- For financial documents: focus on risks, fees, terms, comparisons, and actionable advice
- Assign each question a category from: Follow-up, Risk, Action, Clarify, Compare, Calculate, Explore
- Assign each question an icon name from: sparkles, trending-up, alert-triangle, help-circle, message-square, refresh-cw

Return ONLY a valid JSON array with exactly 4 objects, no markdown, no explanation:
[{"question": "...", "category": "...", "icon": "..."}]`;

interface Provider {
  name: string;
  endpoint: string;
  getHeaders: (key: string) => Record<string, string>;
  formatBody: (messages: any[]) => any;
  parseResponse: (data: any) => string | null;
  getApiKey: () => string | undefined;
}

const PROVIDERS: Provider[] = [
  {
    name: "Groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    getHeaders: (key) => ({ Authorization: `Bearer ${key}`, "Content-Type": "application/json" }),
    formatBody: (messages) => ({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content || null,
    getApiKey: () => Deno.env.get("GROQ_API_KEY"),
  },
  {
    name: "Cohere",
    endpoint: "https://api.cohere.com/v2/chat",
    getHeaders: (key) => ({ Authorization: `Bearer ${key}`, "Content-Type": "application/json" }),
    formatBody: (messages) => ({
      model: "command-r-plus",
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 512,
    }),
    parseResponse: (data) => data.message?.content?.[0]?.text || null,
    getApiKey: () => Deno.env.get("COHERE_API_KEY"),
  },
  {
    name: "Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    getHeaders: (key) => ({ "Content-Type": "application/json", "x-goog-api-key": key }),
    formatBody: (messages) => ({
      contents: messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      systemInstruction: {
        parts: [{ text: messages.find(m => m.role === 'system')?.content || '' }],
      },
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
    parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || null,
    getApiKey: () => Deno.env.get("GEMINI_API_KEY"),
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth if token provided (supports trial users without auth)
    const { userId } = await optionalAuth(req);
    console.log(`[generate-suggestions] User: ${userId || 'anonymous'}`);

    const { conversationHistory, documentContext } = await req.json();

    if (!conversationHistory || conversationHistory.length < 2) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a concise context for the AI
    const recentMessages = conversationHistory.slice(-6);
    let contextNote = "";
    if (documentContext) {
      contextNote = `\n\nDocument loaded: "${documentContext.fileName || 'Unknown'}", Risk: ${documentContext.riskLevel || 'N/A'} (${documentContext.riskScore || 'N/A'}/100). Clauses: ${documentContext.detectedClauses?.join(', ') || 'None detected'}.`;
    }

    const messages = [
      { role: "system", content: SUGGESTION_PROMPT + contextNote },
      ...recentMessages.map((m: any) => ({
        role: m.isUser ? "user" : "assistant",
        content: m.content.substring(0, 1000), // Trim for efficiency
      })),
      { role: "user", content: "Based on our conversation above, generate 4 relevant follow-up questions I might want to ask next." },
    ];

    // Try providers in order (Groq first for speed)
    for (const provider of PROVIDERS) {
      const apiKey = provider.getApiKey();
      if (!apiKey) continue;

      try {
        console.log(`[generate-suggestions] Trying ${provider.name}`);
        const response = await fetch(provider.endpoint, {
          method: "POST",
          headers: provider.getHeaders(apiKey),
          body: JSON.stringify(provider.formatBody(messages)),
        });

        if (!response.ok) {
          console.error(`[generate-suggestions] ${provider.name} failed: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const content = provider.parseResponse(data);
        if (!content) continue;

        // Extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) continue;

        const suggestions = JSON.parse(jsonMatch[0]);
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          console.log(`[generate-suggestions] ${provider.name} returned ${suggestions.length} suggestions`);
          return new Response(JSON.stringify({ suggestions: suggestions.slice(0, 4) }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.error(`[generate-suggestions] ${provider.name} error:`, e);
        continue;
      }
    }

    // All providers failed — return empty
    return new Response(JSON.stringify({ suggestions: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[generate-suggestions] Error:", e);
    return new Response(JSON.stringify({ suggestions: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
