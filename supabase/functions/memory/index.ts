import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/auth.ts";
import {
  validateString,
  ValidationError,
  createValidationErrorResponse,
  sanitizeText
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await requireAuth(req, corsHeaders);
    if (authResult instanceof Response) return authResult;

    const { action, content, memoryType, metadata } = await req.json();
    const userId = authResult.userId;

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ACTION: store — save a new memory with embedding
    if (action === "store") {
      if (!content) {
        return new Response(JSON.stringify({ error: "Content is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const sanitizedContent = sanitizeText(content).substring(0, 5000);
      const type = memoryType || "general";

      // Generate embedding using Cohere multilingual
      let embedding = null;
      const COHERE_KEY = Deno.env.get("COHERE_API_KEY");
      if (COHERE_KEY) {
        try {
          const embedResponse = await fetch("https://api.cohere.com/v2/embed", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${COHERE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              texts: [sanitizedContent],
              model: "embed-multilingual-v3.0",
              input_type: "search_document",
              embedding_types: ["float"],
            }),
          });

          if (embedResponse.ok) {
            const embedData = await embedResponse.json();
            embedding = embedData.embeddings?.float?.[0];
          }
        } catch (e) {
          console.warn("[Memory] Embedding generation failed:", e);
        }
      }

      const { data, error } = await supabaseAdmin
        .from("user_memories")
        .insert({
          user_id: userId,
          content: sanitizedContent,
          memory_type: type,
          metadata: metadata || {},
          embedding: embedding ? JSON.stringify(embedding) : null,
        })
        .select()
        .single();

      if (error) {
        console.error("[Memory] Store error:", error);
        return new Response(JSON.stringify({ error: "Failed to store memory" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, memory: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: recall — find relevant memories
    if (action === "recall") {
      const query = content || "";
      
      if (!query) {
        // Return recent memories
        const { data, error } = await supabaseAdmin
          .from("user_memories")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        return new Response(JSON.stringify({ success: true, memories: data || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Semantic search using embeddings
      const COHERE_KEY = Deno.env.get("COHERE_API_KEY");
      if (COHERE_KEY) {
        try {
          const embedResponse = await fetch("https://api.cohere.com/v2/embed", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${COHERE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              texts: [query],
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
                match_threshold: 0.4,
                match_count: 5,
              });

              return new Response(JSON.stringify({ success: true, memories: memories || [] }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
          }
        } catch (e) {
          console.warn("[Memory] Semantic search failed:", e);
        }
      }

      // Fallback: text search
      const { data } = await supabaseAdmin
        .from("user_memories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({ success: true, memories: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: list — get all memories
    if (action === "list") {
      const { data } = await supabaseAdmin
        .from("user_memories")
        .select("id, content, memory_type, metadata, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      return new Response(JSON.stringify({ success: true, memories: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: delete
    if (action === "delete") {
      const memoryId = metadata?.memoryId;
      if (memoryId) {
        await supabaseAdmin
          .from("user_memories")
          .delete()
          .eq("id", memoryId)
          .eq("user_id", userId);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    if (e instanceof ValidationError) {
      return createValidationErrorResponse(e, corsHeaders);
    }
    console.error("[Memory] Error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
