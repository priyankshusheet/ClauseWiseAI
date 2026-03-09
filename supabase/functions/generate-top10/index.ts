import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORY_PROMPTS: Record<string, string> = {
  "credit-cards": `Generate the current Top 10 Credit Cards in India for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}. Consider: rewards, cashback, annual fees, welcome benefits, lounge access, fuel surcharge waiver, and user popularity.`,
  "health-insurance": `Generate the current Top 10 Health Insurance Plans in India for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}. Consider: claim settlement ratio, coverage amount, network hospitals, premium affordability, and customer reviews.`,
  "life-insurance": `Generate the current Top 10 Life Insurance Policies in India for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}. Consider: claim settlement ratio, premium rates, policy features, company reputation, and customer service.`,
  "loans": `Generate the current Top 10 Loan Products in India for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}. Include home loans, personal loans, and car loans. Consider: interest rates, processing fees, prepayment charges, and approval speed.`,
  "ulips": `Generate the current Top 10 ULIPs (Unit Linked Insurance Plans) in India for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}. Consider: fund performance, charges, flexibility, insurance coverage, and tax benefits.`,
  "mutual-funds": `Generate the current Top 10 Mutual Funds in India for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}. Include equity, debt, and hybrid funds. Consider: returns, expense ratio, fund manager track record, and AUM.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const { category, force = false } = body;

    // If specific category requested, only update that one
    const categoriesToUpdate = category
      ? [category]
      : Object.keys(CATEGORY_PROMPTS);

    const results: Record<string, any> = {};

    for (const cat of categoriesToUpdate) {
      const prompt = CATEGORY_PROMPTS[cat];
      if (!prompt) {
        results[cat] = { error: "Unknown category" };
        continue;
      }

      // Check if we need to refresh (skip if updated within last 7 days unless forced)
      if (!force) {
        const { data: existing } = await supabase
          .from("top_10_lists")
          .select("generated_at")
          .eq("category", cat)
          .single();

        if (existing?.generated_at) {
          const lastUpdate = new Date(existing.generated_at);
          const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate < 7) {
            results[cat] = { skipped: true, reason: `Updated ${daysSinceUpdate.toFixed(1)} days ago` };
            continue;
          }
        }
      }

      console.log(`[generate-top10] Generating Top 10 for: ${cat}`);

      const systemPrompt = `You are a financial expert with deep knowledge of Indian financial products. Return ONLY valid JSON with no markdown or code blocks.

Return this exact structure:
{
  "products": [
    {
      "rank": 1,
      "name": "Product Name",
      "provider": "Company/Bank Name",
      "highlight": "One-line key selling point",
      "rating": 4.5,
      "pros": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "cons": ["Risk 1", "Risk 2", "Risk 3"],
      "keyFeatures": ["Feature 1", "Feature 2"],
      "bestFor": "Who this is ideal for"
    }
  ],
  "lastUpdated": "${new Date().toISOString()}",
  "trendNote": "Brief note about current market trends"
}

Include exactly 10 products ranked 1-10. Be specific with real product names and accurate details.`;

      try {
        const response = await fetch("https://ai.gateway.clausewiseai.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[generate-top10] AI error for ${cat}:`, response.status, errText.substring(0, 200));
          
          if (response.status === 429) {
            results[cat] = { error: "Rate limited, try again later" };
            continue;
          }
          if (response.status === 402) {
            results[cat] = { error: "Payment required" };
            continue;
          }
          results[cat] = { error: "AI generation failed" };
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";

        // Parse the JSON from the response
        let parsed: any;
        try {
          // Try to extract JSON from potential markdown code blocks
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
          const jsonStr = jsonMatch[1]?.trim() || content.trim();
          parsed = JSON.parse(jsonStr);
        } catch (parseErr) {
          console.error(`[generate-top10] JSON parse error for ${cat}:`, parseErr);
          results[cat] = { error: "Failed to parse AI response" };
          continue;
        }

        // Update the database
        const { error: updateError } = await supabase
          .from("top_10_lists")
          .upsert({
            category: cat,
            products: parsed.products || [],
            generated_at: new Date().toISOString(),
            generated_by: "ai",
            metadata: {
              trendNote: parsed.trendNote,
              lastUpdated: parsed.lastUpdated,
            },
          }, { onConflict: "category" });

        if (updateError) {
          console.error(`[generate-top10] DB update error for ${cat}:`, updateError);
          results[cat] = { error: "Database update failed" };
          continue;
        }

        results[cat] = { success: true, productsCount: parsed.products?.length || 0 };
        console.log(`[generate-top10] Updated ${cat} with ${parsed.products?.length} products`);

      } catch (aiError) {
        console.error(`[generate-top10] Exception for ${cat}:`, aiError);
        results[cat] = { error: String(aiError) };
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[generate-top10] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
