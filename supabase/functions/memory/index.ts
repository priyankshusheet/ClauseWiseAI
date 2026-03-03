import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { requireAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Generate embedding using Cohere
async function generateEmbedding(text: string): Promise<number[] | null> {
  const COHERE_KEY = Deno.env.get("COHERE_API_KEY");
  if (!COHERE_KEY) return null;

  try {
    const res = await fetch("https://api.cohere.com/v2/embed", {
      method: "POST",
      headers: { Authorization: `Bearer ${COHERE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: [text.substring(0, 2000)],
        model: "embed-multilingual-v3.0",
        input_type: "search_document",
        embedding_types: ["float"],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.embeddings?.float?.[0] || null;
  } catch { return null; }
}

async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  const COHERE_KEY = Deno.env.get("COHERE_API_KEY");
  if (!COHERE_KEY) return null;

  try {
    const res = await fetch("https://api.cohere.com/v2/embed", {
      method: "POST",
      headers: { Authorization: `Bearer ${COHERE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: [text.substring(0, 2000)],
        model: "embed-multilingual-v3.0",
        input_type: "search_query",
        embedding_types: ["float"],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.embeddings?.float?.[0] || null;
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await requireAuth(req, corsHeaders);
    if (authResult instanceof Response) return authResult;
    const { userId, supabase } = authResult;

    const { action, content, memory_type, metadata, query, limit } = await req.json();

    // STORE a new memory
    if (action === "store") {
      if (!content) {
        return new Response(JSON.stringify({ error: "Content is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const embedding = await generateEmbedding(content);
      
      const { data, error } = await supabase.from("user_memories").insert({
        user_id: userId,
        content,
        memory_type: memory_type || "general",
        metadata: metadata || {},
        embedding: embedding ? `[${embedding.join(",")}]` : null,
      }).select("id").single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, id: data.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RECALL relevant memories
    if (action === "recall") {
      if (!query) {
        return new Response(JSON.stringify({ error: "Query is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const queryEmbedding = await generateQueryEmbedding(query);
      
      let memories: any[] = [];
      
      if (queryEmbedding) {
        // Vector similarity search
        const { data, error } = await supabase.rpc("match_user_memories", {
          query_embedding: `[${queryEmbedding.join(",")}]`,
          match_user_id: userId,
          match_threshold: 0.4,
          match_count: limit || 5,
        });
        if (!error && data) memories = data;
      }

      // Fallback: recent memories if vector search returned nothing
      if (memories.length === 0) {
        const { data } = await supabase
          .from("user_memories")
          .select("id, content, memory_type, metadata")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit || 5);
        if (data) memories = data;
      }

      return new Response(JSON.stringify({ memories }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LIST all memories
    if (action === "list") {
      const { data, error } = await supabase
        .from("user_memories")
        .select("id, content, memory_type, metadata, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit || 50);

      if (error) throw error;

      return new Response(JSON.stringify({ memories: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CLEAR all memories
    if (action === "clear") {
      const { error } = await supabase
        .from("user_memories")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: store, recall, list, clear" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("[Memory] Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
