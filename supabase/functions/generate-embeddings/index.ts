import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/auth.ts";
import { 
  validateString, 
  validateNumber,
  validateEnum,
  ValidationError,
  createValidationErrorResponse,
  sanitizeText
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Semantic chunking configuration
const CHUNK_CONFIG = {
  maxChunkSize: 1500,
  minChunkSize: 200,
  overlapSize: 100,
  semanticSeparators: [
    '\n\n\n',      // Triple newline (major section break)
    '\n\n',        // Double newline (paragraph break)
    '.\n',         // End of sentence with newline
    '. ',          // End of sentence
    ';\n',         // Semicolon with newline
    '; ',          // Semicolon
    ',\n',         // Comma with newline
    ', ',          // Comma
    ' ',           // Space (last resort)
  ],
};

const VALID_STRATEGIES = ['semantic', 'fixed', 'clause'] as const;

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
    const text = validateString(bodyObj.text, 'text', { required: true, maxLength: 1000000 });
    const documentId = validateString(bodyObj.documentId, 'documentId', { maxLength: 100 });
    const chunkingStrategy = validateEnum(bodyObj.chunkingStrategy, 'chunkingStrategy', VALID_STRATEGIES, { defaultValue: 'semantic' });

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required", code: "VALIDATION_ERROR" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize text
    const sanitizedText = sanitizeText(text);

    console.log(`[Embeddings] User: ${authResult.userId}, Processing ${sanitizedText.length} chars with ${chunkingStrategy} strategy`);

    // Step 1: Chunk the document
    const chunks = chunkDocument(sanitizedText, chunkingStrategy!);
    console.log(`[Embeddings] Created ${chunks.length} chunks`);

    // Step 2: Generate embeddings for each chunk
    const embeddedChunks = chunks.map((chunk, index) => ({
      id: `${documentId || 'doc'}-chunk-${index}`,
      content: chunk.content,
      metadata: {
        ...chunk.metadata,
        documentId,
        chunkIndex: index,
        totalChunks: chunks.length,
      },
      semanticSignature: generateSemanticSignature(chunk.content),
    }));

    return new Response(JSON.stringify({
      success: true,
      chunks: embeddedChunks,
      metadata: {
        documentId,
        totalChunks: chunks.length,
        chunkingStrategy,
        averageChunkSize: Math.round(sanitizedText.length / chunks.length),
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    if (e instanceof ValidationError) {
      return createValidationErrorResponse(e, corsHeaders);
    }

    console.error("[Embeddings] Error:", e);
    return new Response(
      JSON.stringify({ error: "Embedding generation failed", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface Chunk {
  content: string;
  metadata: {
    startIndex: number;
    endIndex: number;
    sectionType?: string;
    hasClause?: boolean;
  };
}

function chunkDocument(text: string, strategy: string): Chunk[] {
  if (strategy === 'fixed') {
    return fixedSizeChunking(text);
  } else if (strategy === 'clause') {
    return clauseBasedChunking(text);
  }
  return semanticChunking(text);
}

function semanticChunking(text: string): Chunk[] {
  const chunks: Chunk[] = [];
  let currentPosition = 0;

  while (currentPosition < text.length) {
    const remainingText = text.slice(currentPosition);
    
    if (remainingText.length <= CHUNK_CONFIG.maxChunkSize) {
      // Last chunk
      chunks.push({
        content: remainingText.trim(),
        metadata: {
          startIndex: currentPosition,
          endIndex: text.length,
        }
      });
      break;
    }

    // Find the best split point
    let splitPoint = CHUNK_CONFIG.maxChunkSize;
    
    for (const separator of CHUNK_CONFIG.semanticSeparators) {
      const searchArea = remainingText.slice(CHUNK_CONFIG.minChunkSize, CHUNK_CONFIG.maxChunkSize);
      const lastIndex = searchArea.lastIndexOf(separator);
      
      if (lastIndex !== -1) {
        splitPoint = CHUNK_CONFIG.minChunkSize + lastIndex + separator.length;
        break;
      }
    }

    const chunkContent = remainingText.slice(0, splitPoint).trim();
    
    if (chunkContent.length >= CHUNK_CONFIG.minChunkSize) {
      chunks.push({
        content: chunkContent,
        metadata: {
          startIndex: currentPosition,
          endIndex: currentPosition + splitPoint,
          sectionType: detectSectionType(chunkContent),
          hasClause: detectClausePresence(chunkContent),
        }
      });
    }

    // Move position with overlap
    currentPosition += splitPoint - CHUNK_CONFIG.overlapSize;
  }

  return chunks;
}

function clauseBasedChunking(text: string): Chunk[] {
  const chunks: Chunk[] = [];
  
  // Split by common clause patterns
  const clausePatterns = [
    /(?:^|\n)\s*(?:\d+[\.\)]\s*|[a-z][\.\)]\s*|[-•]\s*)/gim,
    /(?:^|\n)\s*(?:ARTICLE|SECTION|CLAUSE|PART)\s*\d*/gi,
  ];

  let segments = [text];
  
  for (const pattern of clausePatterns) {
    const newSegments: string[] = [];
    for (const segment of segments) {
      const parts = segment.split(pattern).filter(p => p.trim().length > 50);
      newSegments.push(...parts);
    }
    if (newSegments.length > segments.length) {
      segments = newSegments;
    }
  }

  let currentIndex = 0;
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (trimmed.length >= CHUNK_CONFIG.minChunkSize) {
      const startIndex = text.indexOf(trimmed, currentIndex);
      chunks.push({
        content: trimmed.slice(0, CHUNK_CONFIG.maxChunkSize),
        metadata: {
          startIndex: startIndex !== -1 ? startIndex : currentIndex,
          endIndex: startIndex !== -1 ? startIndex + trimmed.length : currentIndex + trimmed.length,
          sectionType: detectSectionType(trimmed),
          hasClause: true,
        }
      });
      if (startIndex !== -1) currentIndex = startIndex + trimmed.length;
    }
  }

  return chunks.length > 0 ? chunks : semanticChunking(text);
}

function fixedSizeChunking(text: string): Chunk[] {
  const chunks: Chunk[] = [];
  const chunkSize = CHUNK_CONFIG.maxChunkSize;
  const overlap = CHUNK_CONFIG.overlapSize;

  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const content = text.slice(i, i + chunkSize).trim();
    if (content.length >= CHUNK_CONFIG.minChunkSize) {
      chunks.push({
        content,
        metadata: {
          startIndex: i,
          endIndex: Math.min(i + chunkSize, text.length),
        }
      });
    }
  }

  return chunks;
}

function detectSectionType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('definition') || lowerText.includes('meaning of')) return 'definitions';
  if (lowerText.includes('premium') || lowerText.includes('fee') || lowerText.includes('charge')) return 'fees';
  if (lowerText.includes('exclusion') || lowerText.includes('not covered') || lowerText.includes('exception')) return 'exclusions';
  if (lowerText.includes('claim') || lowerText.includes('procedure')) return 'claims';
  if (lowerText.includes('termination') || lowerText.includes('cancellation')) return 'termination';
  if (lowerText.includes('coverage') || lowerText.includes('benefit') || lowerText.includes('insured')) return 'coverage';
  if (lowerText.includes('interest') || lowerText.includes('rate') || lowerText.includes('apr')) return 'interest';
  if (lowerText.includes('penalty') || lowerText.includes('late') || lowerText.includes('default')) return 'penalties';
  
  return 'general';
}

function detectClausePresence(text: string): boolean {
  const clauseIndicators = [
    /(?:^|\n)\s*\d+[\.\)]/,
    /(?:^|\n)\s*[a-z][\.\)]/i,
    /(?:^|\n)\s*[-•]/,
    /shall\s|must\s|will\s|agree\sto/i,
    /subject\s*to|provided\s*that|notwithstanding/i,
  ];

  return clauseIndicators.some(pattern => pattern.test(text));
}

function generateSemanticSignature(text: string): number[] {
  const keyTerms = [
    'fee', 'charge', 'penalty', 'interest', 'rate', 'premium',
    'exclusion', 'coverage', 'claim', 'benefit', 'liability',
    'termination', 'cancellation', 'renewal', 'default', 'payment',
    'loan', 'credit', 'insurance', 'policy', 'agreement', 'contract'
  ];

  const lowerText = text.toLowerCase();
  const signature: number[] = [];

  for (const term of keyTerms) {
    const count = (lowerText.match(new RegExp(term, 'g')) || []).length;
    signature.push(Math.min(count / 5, 1)); // Normalize to 0-1
  }

  // Add text length and density features
  signature.push(Math.min(text.length / 2000, 1));
  signature.push((text.match(/[.!?]/g) || []).length / Math.max(text.length / 100, 1));
  
  return signature;
}
