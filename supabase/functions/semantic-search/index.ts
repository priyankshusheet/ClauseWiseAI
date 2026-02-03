import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/auth.ts";
import { 
  validateString, 
  validateNumber,
  validateBoolean,
  validateArray,
  ValidationError,
  createValidationErrorResponse 
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Semantic search with keyword expansion
const KEYWORD_EXPANSIONS: Record<string, string[]> = {
  'fee': ['charge', 'cost', 'payment', 'premium', 'price'],
  'penalty': ['fine', 'charge', 'fee', 'late payment', 'default'],
  'cancel': ['terminate', 'end', 'stop', 'closure', 'exit', 'surrender'],
  'coverage': ['benefit', 'protection', 'insured', 'covered'],
  'exclusion': ['exception', 'not covered', 'limitation', 'restriction'],
  'interest': ['rate', 'apr', 'percentage', 'finance charge'],
  'claim': ['reimbursement', 'settlement', 'payout'],
  'renewal': ['auto-renewal', 'extension', 'continuation'],
  'risk': ['danger', 'hazard', 'concern', 'issue'],
  'hidden': ['buried', 'obscured', 'fine print', 'small text'],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    const query = validateString(bodyObj.query, 'query', { required: true, maxLength: 1000 });
    const documentChunks = validateArray(bodyObj.documentChunks, 'documentChunks', { required: true, maxLength: 1000 });
    const topK = validateNumber(bodyObj.topK, 'topK', { min: 1, max: 50, defaultValue: 5 });
    const includeContext = validateBoolean(bodyObj.includeContext, 'includeContext', { defaultValue: true });
    const minSimilarity = validateNumber(bodyObj.minSimilarity, 'minSimilarity', { min: 0, max: 1, defaultValue: 0.3 });

    if (!query || !documentChunks) {
      return new Response(
        JSON.stringify({ error: "Query and documentChunks are required", code: "VALIDATION_ERROR" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Semantic-Search] User: ${authResult.userId}, Query: "${query.substring(0, 50)}..." across ${documentChunks.length} chunks`);

    // Expand query with related terms
    const expandedQuery = expandQuery(query);
    
    // Score each chunk
    const scoredChunks = documentChunks.map((chunk: any) => {
      // Validate chunk structure
      if (!chunk || typeof chunk !== 'object') {
        return { ...chunk, similarity: 0 };
      }
      const content = typeof chunk.content === 'string' ? chunk.content : '';
      return {
        ...chunk,
        similarity: calculateSimilarity(expandedQuery, content, chunk.semanticSignature),
      };
    });

    // Sort by similarity and filter
    const relevantChunks = scoredChunks
      .filter((chunk: any) => chunk.similarity >= (minSimilarity || 0.3))
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, topK || 5);

    // Build context from relevant chunks
    let ragContext = '';
    if (includeContext && relevantChunks.length > 0) {
      ragContext = relevantChunks
        .map((chunk: any, idx: number) => 
          `[Source ${idx + 1} - ${chunk.metadata?.sectionType || 'general'} (${Math.round(chunk.similarity * 100)}% match)]:\n${chunk.content}`
        )
        .join('\n\n---\n\n');
    }

    console.log(`[Semantic-Search] Found ${relevantChunks.length} relevant chunks`);

    return new Response(JSON.stringify({
      success: true,
      results: relevantChunks.map((chunk: any) => ({
        content: chunk.content,
        similarity: chunk.similarity,
        metadata: chunk.metadata,
      })),
      ragContext,
      query: {
        original: query,
        expanded: expandedQuery,
      },
      metadata: {
        totalChunks: documentChunks.length,
        matchedChunks: relevantChunks.length,
        topSimilarity: relevantChunks[0]?.similarity || 0,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    if (e instanceof ValidationError) {
      return createValidationErrorResponse(e, corsHeaders);
    }

    console.error("[Semantic-Search] Error:", e);
    return new Response(
      JSON.stringify({ error: "Search failed", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function expandQuery(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/);
  const expanded = new Set(words);

  for (const word of words) {
    // Add expansions
    for (const [key, synonyms] of Object.entries(KEYWORD_EXPANSIONS)) {
      if (word.includes(key) || key.includes(word)) {
        synonyms.forEach(syn => expanded.add(syn));
      }
      // Check if word matches any synonym
      if (synonyms.some(syn => word.includes(syn) || syn.includes(word))) {
        expanded.add(key);
        synonyms.forEach(syn => expanded.add(syn));
      }
    }
  }

  return Array.from(expanded);
}

function calculateSimilarity(queryTerms: string[], content: string, semanticSignature?: number[]): number {
  const lowerContent = content.toLowerCase();
  
  // Term frequency scoring
  let termScore = 0;
  let matchedTerms = 0;
  
  for (const term of queryTerms) {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lowerContent.match(regex);
    if (matches) {
      matchedTerms++;
      // TF-IDF inspired scoring
      termScore += Math.log(1 + matches.length) * (1 / Math.log(1 + term.length));
    }
  }

  // Coverage score (what % of query terms appear)
  const coverageScore = matchedTerms / queryTerms.length;

  // Position bonus (terms appearing early get bonus)
  let positionBonus = 0;
  for (const term of queryTerms) {
    const index = lowerContent.indexOf(term);
    if (index !== -1 && index < 200) {
      positionBonus += 0.1 * (1 - index / 200);
    }
  }

  // Semantic signature similarity (if available)
  let signatureScore = 0;
  if (semanticSignature && semanticSignature.length > 0) {
    const querySignature = generateQuerySignature(queryTerms);
    signatureScore = cosineSimilarity(querySignature, semanticSignature);
  }

  // Combine scores
  const finalScore = (
    termScore * 0.3 +
    coverageScore * 0.35 +
    positionBonus * 0.15 +
    signatureScore * 0.2
  );

  return Math.min(1, Math.max(0, finalScore));
}

function generateQuerySignature(queryTerms: string[]): number[] {
  const keyTerms = [
    'fee', 'charge', 'penalty', 'interest', 'rate', 'premium',
    'exclusion', 'coverage', 'claim', 'benefit', 'liability',
    'termination', 'cancellation', 'renewal', 'default', 'payment',
    'loan', 'credit', 'insurance', 'policy', 'agreement', 'contract'
  ];

  const signature: number[] = [];
  
  for (const term of keyTerms) {
    const hasMatch = queryTerms.some(q => q.includes(term) || term.includes(q));
    signature.push(hasMatch ? 1 : 0);
  }

  // Placeholder values for text features
  signature.push(0.5);
  signature.push(0.5);

  return signature;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
