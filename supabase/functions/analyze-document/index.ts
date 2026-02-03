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

// Industry-specific risk patterns
const RISK_PATTERNS = {
  insurance: {
    high: [
      /pre-existing\s*condition\s*exclusion/gi,
      /waiting\s*period\s*of\s*(\d+)\s*(year|month)/gi,
      /claim\s*rejection|claim\s*denied/gi,
      /permanent\s*exclusion/gi,
      /suicide\s*clause/gi,
      /war\s*and\s*terrorism/gi,
    ],
    medium: [
      /co-payment|co-pay|coinsurance/gi,
      /deductible|excess/gi,
      /sub-limit|sublimit/gi,
      /network\s*hospital/gi,
      /cashless\s*claim/gi,
    ],
    low: [
      /free\s*look\s*period/gi,
      /grace\s*period/gi,
      /renewal\s*guarantee/gi,
      /portability/gi,
    ],
  },
  loan: {
    high: [
      /prepayment\s*penalty|foreclosure\s*charge/gi,
      /floating\s*rate|variable\s*rate/gi,
      /penal\s*interest|penalty\s*interest/gi,
      /processing\s*fee.*non-refundable/gi,
      /cross-default|acceleration\s*clause/gi,
    ],
    medium: [
      /processing\s*fee/gi,
      /documentation\s*charge/gi,
      /late\s*payment\s*fee/gi,
      /cheque\s*bounce|ecs\s*return/gi,
    ],
    low: [
      /part-payment|partial\s*prepayment/gi,
      /emi\s*flexibility/gi,
      /step-up\s*emi/gi,
    ],
  },
  creditCard: {
    high: [
      /revolving\s*credit|finance\s*charge/gi,
      /cash\s*advance\s*fee/gi,
      /overlimit\s*fee/gi,
      /foreign\s*transaction.*fee/gi,
      /annual\s*percentage\s*rate.*(\d{2,})%/gi,
    ],
    medium: [
      /annual\s*fee|membership\s*fee/gi,
      /late\s*payment\s*fee/gi,
      /minimum\s*amount\s*due/gi,
      /reward\s*expiry|point\s*expiry/gi,
    ],
    low: [
      /fuel\s*surcharge\s*waiver/gi,
      /lounge\s*access/gi,
      /cashback/gi,
      /reward\s*point/gi,
    ],
  },
};

// Clause classification categories
const CLAUSE_CATEGORIES = [
  { name: "Fees & Charges", keywords: ["fee", "charge", "cost", "payment", "premium", "processing"] },
  { name: "Penalties", keywords: ["penalty", "late", "overdue", "default", "bounce", "penal"] },
  { name: "Exclusions", keywords: ["exclusion", "excluded", "not covered", "exception", "limitation"] },
  { name: "Liability", keywords: ["liability", "responsible", "indemnify", "waiver", "disclaimer"] },
  { name: "Termination", keywords: ["termination", "cancellation", "closure", "surrender", "exit"] },
  { name: "Auto-Renewal", keywords: ["auto-renewal", "automatic", "renewal", "recurring", "subscription"] },
  { name: "Coverage", keywords: ["coverage", "covered", "benefit", "sum assured", "insured"] },
  { name: "Interest", keywords: ["interest", "rate", "apr", "emi", "repayment"] },
];

const VALID_DOCUMENT_TYPES = ['insurance', 'loan', 'creditCard', 'unknown'] as const;
const VALID_LANGUAGES = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'] as const;

const DOCUMENT_ANALYSIS_PROMPT = `You are an expert financial document analyst. Analyze the provided document text and provide a comprehensive, structured analysis.

Format your response EXACTLY as follows (use these exact headers):

## Document Overview
[Brief summary of document type and purpose]

## Key Terms & Conditions
- [List important terms]

## Risk Assessment
**Risk Level: [Low/Medium/High]**
**Risk Score: [0-100]**

### High Risk Factors
- [List high risk items if any]

### Medium Risk Factors
- [List medium risk items if any]

### Low Risk Factors
- [List low risk items if any]

## Hidden or Concerning Clauses
- [List any hidden fees, auto-renewal, penalties]

## Financial Implications
- [List fees, charges, penalties with amounts]

## Consumer Rights
- [List consumer protections and rights]

## Recommendations
1. [Action item 1]
2. [Action item 2]
3. [Action item 3]

Be specific, cite clause numbers when possible, and use plain language.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

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
    const fileName = validateString(bodyObj.fileName, 'fileName', { required: true, maxLength: 255 });
    const fileType = validateString(bodyObj.fileType, 'fileType', { maxLength: 100 });
    const extractedText = validateString(bodyObj.extractedText, 'extractedText', { maxLength: 500000 });
    const ocrConfidence = validateNumber(bodyObj.ocrConfidence, 'ocrConfidence', { min: 0, max: 100 });
    const documentType = validateEnum(bodyObj.documentType, 'documentType', VALID_DOCUMENT_TYPES);
    const language = validateEnum(bodyObj.language, 'language', VALID_LANGUAGES, { defaultValue: 'en' });

    // Sanitize extracted text
    const sanitizedText = extractedText ? sanitizeText(extractedText) : '';

    console.log(`[Analyze-Document] User: ${authResult.userId}, Processing: ${fileName} (${fileType}), confidence: ${ocrConfidence}%`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured", code: "SERVICE_ERROR" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Classify clauses
    const classifiedClauses = classifyClauses(sanitizedText);
    
    // Step 2: Pattern-based risk analysis
    const detectedType = documentType || detectDocumentType(sanitizedText);
    const patternRisks = analyzeRiskPatterns(sanitizedText, detectedType);
    
    // Step 3: AI-powered deep analysis
    const aiAnalysis = await performAIAnalysis(
      LOVABLE_API_KEY,
      fileName!,
      sanitizedText,
      ocrConfidence || 0,
      detectedType,
      classifiedClauses,
      patternRisks
    );

    // Step 4: Calculate final risk score
    const riskScore = calculateRiskScore(patternRisks, ocrConfidence || 0, classifiedClauses);
    const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

    const latency = Date.now() - startTime;
    console.log(`[Analyze-Document] Complete (${latency}ms), risk: ${riskScore}/100 (${riskLevel})`);

    return new Response(JSON.stringify({
      success: true,
      analysis: aiAnalysis,
      riskScore,
      riskLevel,
      documentType: detectedType,
      classifiedClauses,
      patternRisks,
      metadata: {
        fileName,
        fileType,
        ocrConfidence,
        textLength: sanitizedText?.length || 0,
        processingTime: latency,
        language,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    const latency = Date.now() - startTime;
    
    if (e instanceof ValidationError) {
      return createValidationErrorResponse(e, corsHeaders);
    }

    console.error(`[Analyze-Document] Error (${latency}ms):`, e);

    if (e instanceof Error) {
      if (e.message?.includes("429") || e.message?.includes("rate limit")) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded",
          code: "RATE_LIMIT",
          retryAfter: 30
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (e.message?.includes("402")) {
        return new Response(JSON.stringify({ 
          error: "AI quota exceeded",
          code: "QUOTA_EXCEEDED"
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ 
      error: "Analysis failed. Please try again.",
      code: "INTERNAL_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function detectDocumentType(text: string): string {
  const lowerText = text.toLowerCase();
  
  const scores = {
    insurance: 0,
    loan: 0,
    creditCard: 0,
  };

  // Insurance indicators
  if (lowerText.includes('policy') || lowerText.includes('insured') || lowerText.includes('claim')) scores.insurance += 3;
  if (lowerText.includes('sum assured') || lowerText.includes('premium') || lowerText.includes('coverage')) scores.insurance += 2;
  if (lowerText.includes('exclusion') || lowerText.includes('waiting period')) scores.insurance += 2;

  // Loan indicators
  if (lowerText.includes('loan') || lowerText.includes('emi') || lowerText.includes('principal')) scores.loan += 3;
  if (lowerText.includes('interest rate') || lowerText.includes('tenure') || lowerText.includes('disbursement')) scores.loan += 2;
  if (lowerText.includes('mortgage') || lowerText.includes('collateral') || lowerText.includes('prepayment')) scores.loan += 2;

  // Credit card indicators
  if (lowerText.includes('credit card') || lowerText.includes('card member')) scores.creditCard += 3;
  if (lowerText.includes('credit limit') || lowerText.includes('billing cycle') || lowerText.includes('reward point')) scores.creditCard += 2;
  if (lowerText.includes('annual fee') || lowerText.includes('minimum due') || lowerText.includes('cash advance')) scores.creditCard += 2;

  const maxScore = Math.max(scores.insurance, scores.loan, scores.creditCard);
  if (maxScore < 3) return 'unknown';
  
  if (scores.insurance === maxScore) return 'insurance';
  if (scores.loan === maxScore) return 'loan';
  return 'creditCard';
}

function classifyClauses(text: string): { category: string; clauses: string[]; riskLevel: string }[] {
  const results: { category: string; clauses: string[]; riskLevel: string }[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

  for (const category of CLAUSE_CATEGORIES) {
    const matchingClauses: string[] = [];
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      const hasMatch = category.keywords.some(keyword => lowerSentence.includes(keyword));
      
      if (hasMatch && sentence.trim().length < 500) {
        matchingClauses.push(sentence.trim());
      }
    }

    if (matchingClauses.length > 0) {
      // Determine risk level based on category
      let riskLevel = 'low';
      if (['Penalties', 'Exclusions', 'Liability'].includes(category.name)) riskLevel = 'high';
      else if (['Fees & Charges', 'Auto-Renewal', 'Termination'].includes(category.name)) riskLevel = 'medium';

      results.push({
        category: category.name,
        clauses: matchingClauses.slice(0, 5), // Limit to 5 per category
        riskLevel,
      });
    }
  }

  return results;
}

function analyzeRiskPatterns(text: string, documentType: string): { level: string; matches: string[]; pattern: string }[] {
  const risks: { level: string; matches: string[]; pattern: string }[] = [];
  const patterns = RISK_PATTERNS[documentType as keyof typeof RISK_PATTERNS];
  
  if (!patterns) return risks;

  for (const [level, regexPatterns] of Object.entries(patterns)) {
    for (const pattern of regexPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        risks.push({
          level,
          matches: [...new Set(matches)].slice(0, 3),
          pattern: pattern.source,
        });
      }
    }
  }

  return risks;
}

function calculateRiskScore(
  patternRisks: { level: string; matches: string[] }[],
  ocrConfidence: number,
  classifiedClauses: { riskLevel: string; clauses: string[] }[]
): number {
  let score = 30; // Base score

  // Pattern-based scoring
  for (const risk of patternRisks) {
    if (risk.level === 'high') score += 15 * Math.min(risk.matches.length, 3);
    else if (risk.level === 'medium') score += 8 * Math.min(risk.matches.length, 3);
    else score -= 3 * Math.min(risk.matches.length, 2);
  }

  // Clause-based scoring
  for (const clause of classifiedClauses) {
    if (clause.riskLevel === 'high') score += 5 * Math.min(clause.clauses.length, 3);
    else if (clause.riskLevel === 'medium') score += 3 * Math.min(clause.clauses.length, 3);
  }

  // Confidence penalty
  if (ocrConfidence < 70) score += 10;
  else if (ocrConfidence < 85) score += 5;

  return Math.max(0, Math.min(100, score));
}

async function performAIAnalysis(
  apiKey: string,
  fileName: string,
  extractedText: string,
  ocrConfidence: number,
  documentType: string,
  classifiedClauses: any[],
  patternRisks: any[]
): Promise<string> {
  const contextSummary = `
Document: ${fileName}
Type: ${documentType}
OCR Confidence: ${ocrConfidence}%
Detected Risk Patterns: ${patternRisks.filter(r => r.level === 'high').length} high, ${patternRisks.filter(r => r.level === 'medium').length} medium
Classified Clauses: ${classifiedClauses.map(c => `${c.category} (${c.clauses.length})`).join(', ')}

Document Text (first 12000 chars):
${extractedText?.substring(0, 12000) || 'No text extracted'}`;

  const response = await fetch("https://ai.gateway.clausewiseai.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: DOCUMENT_ANALYSIS_PROMPT },
        { role: "user", content: contextSummary }
      ],
      temperature: 0.2,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    // Consume response body to prevent resource leak
    await response.text();
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Analysis could not be completed.";
}
