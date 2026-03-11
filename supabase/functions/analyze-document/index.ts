import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { optionalAuth } from "../_shared/auth.ts";
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

const STRUCTURED_ANALYSIS_PROMPT = `You are an expert financial document analyst. Analyze the document and return a JSON object with this EXACT structure. Do NOT wrap in markdown code blocks. Return ONLY valid JSON:

{
  "extractedText": "Full text extracted from the document",
  "documentType": "insurance|loan|creditCard|investment|unknown",
  "summary": "2-3 sentence executive summary",
  "riskScore": 0-100,
  "riskLevel": "low|medium|high",
  "keyTerms": [
    {"term": "Term name", "value": "Term value/detail", "importance": "high|medium|low"}
  ],
  "clauses": [
    {
      "text": "Exact clause text from document",
      "category": "Fees|Penalties|Exclusions|Coverage|Liability|Termination|Auto-Renewal|Interest|Rights",
      "riskLevel": "high|medium|low|safe",
      "explanation": "Plain language explanation of what this means for the consumer",
      "clauseNumber": "Section/clause number if available"
    }
  ],
  "riskFactors": [
    {"factor": "Description of risk", "severity": "high|medium|low", "details": "Why this matters"}
  ],
  "benefits": [
    {"benefit": "Description of benefit", "details": "Why this is good for the consumer"}
  ],
  "financialImplications": [
    {"item": "Fee/charge name", "amount": "Amount if specified", "frequency": "one-time|monthly|annual|per-event", "impact": "high|medium|low"}
  ],
  "recommendations": [
    {"action": "What to do", "priority": "high|medium|low", "reason": "Why"}
  ],
  "consumerRights": ["List of consumer rights/protections found"]
}

Be thorough, cite specific clause numbers, and identify ALL fees, penalties, exclusions, and auto-renewal terms. Pay special attention to tables, charts, and fine print.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const authResult = await optionalAuth(req);

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
    const fileName = validateString(bodyObj.fileName, 'fileName', { required: true, maxLength: 255 });
    const fileType = validateString(bodyObj.fileType, 'fileType', { maxLength: 100 });
    const extractedText = validateString(bodyObj.extractedText, 'extractedText', { maxLength: 500000 });
    const ocrConfidence = validateNumber(bodyObj.ocrConfidence, 'ocrConfidence', { min: 0, max: 100 });
    const documentType = validateEnum(bodyObj.documentType, 'documentType', VALID_DOCUMENT_TYPES);
    
    const fileBase64 = bodyObj.fileBase64 as string | undefined;
    const fileMimeType = bodyObj.fileMimeType as string | undefined;

    const sanitizedText = extractedText ? sanitizeText(extractedText) : '';
    const isMultimodal = !!fileBase64 && !!fileMimeType;

    console.log(`[Analyze-Document] Processing: ${fileName}, multimodal: ${isMultimodal}`);

    let structuredResult: any = null;
    let rawAnalysis: string | null = null;

    // Direct Gemini Vision for multimodal
    if (!structuredResult && isMultimodal) {
      const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
      if (geminiApiKey) {
        try {
          console.log(`[Analyze-Document] Fallback to Gemini Vision`);
          const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": geminiApiKey,
              },
              body: JSON.stringify({
                contents: [{
                  role: "user",
                  parts: [
                    { inline_data: { mime_type: fileMimeType, data: fileBase64 } },
                    { text: `Analyze this financial document "${fileName}". ${STRUCTURED_ANALYSIS_PROMPT}` }
                  ]
                }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 8000 },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            rawAnalysis = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
            if (rawAnalysis) {
              structuredResult = parseAIResponse(rawAnalysis);
              console.log(`[Analyze-Document] Gemini Vision analysis complete`);
            }
          }
        } catch (e) {
          console.error(`[Analyze-Document] Gemini Vision exception:`, e);
        }
      }
    }

    // TEXT-ONLY PATH
    const textForAnalysis = sanitizedText || structuredResult?.extractedText || '';
    
    if (!structuredResult && textForAnalysis) {
      structuredResult = await performTextAnalysis(fileName!, textForAnalysis, ocrConfidence || 0, documentType || 'unknown');
    }

    // Pattern-based analysis
    const analysisText = textForAnalysis || '';
    const classifiedClauses = classifyClauses(analysisText);
    const detectedType = structuredResult?.documentType || documentType || detectDocumentType(analysisText);
    const patternRisks = analyzeRiskPatterns(analysisText, detectedType);
    const patternRiskScore = calculateRiskScore(patternRisks, ocrConfidence || (isMultimodal ? 90 : 0), classifiedClauses);

    // Merge AI structured result with pattern analysis
    const finalResult = structuredResult || createFallbackStructuredResult(fileName!, analysisText);
    
    // Use AI risk score if available, otherwise pattern-based
    const riskScore = finalResult.riskScore || patternRiskScore;
    const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

    const latency = Date.now() - startTime;
    console.log(`[Analyze-Document] Complete (${latency}ms), risk: ${riskScore}/100 (${riskLevel})`);

    return new Response(JSON.stringify({
      success: true,
      structured: true,
      ...finalResult,
      riskScore,
      riskLevel,
      documentType: detectedType,
      classifiedClauses,
      patternRisks,
      extractedText: finalResult.extractedText || sanitizedText || '',
      multimodal: isMultimodal,
      metadata: {
        fileName,
        fileType,
        ocrConfidence: isMultimodal ? 95 : ocrConfidence,
        textLength: analysisText.length,
        processingTime: latency,
        analysisMethod: isMultimodal ? 'multimodal-vision' : 'text-analysis',
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

    return new Response(JSON.stringify({ 
      error: "Analysis failed. Please try again.",
      code: "INTERNAL_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function parseAIResponse(rawText: string): any {
  // Try to extract JSON from the response
  let jsonStr = rawText.trim();
  
  // Remove markdown code blocks if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Try to find JSON object in the text
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        console.warn('[Analyze-Document] Could not parse AI response as JSON');
        return null;
      }
    }
    return null;
  }
}

async function performTextAnalysis(
  fileName: string,
  text: string,
  ocrConfidence: number,
  documentType: string
): Promise<any> {
  const contextPrompt = `Analyze this financial document: "${fileName}"
Document type: ${documentType}
OCR Confidence: ${ocrConfidence}%

Document text (first 15000 chars):
${text.substring(0, 15000)}

${STRUCTURED_ANALYSIS_PROMPT}`;

  // Primary providers
  const providers = [
    {
      name: "Groq",
      call: async () => {
        const key = Deno.env.get("GROQ_API_KEY");
        if (!key) return null;
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: contextPrompt }],
            temperature: 0.2, max_tokens: 6000,
          }),
        });
        if (!r.ok) return null;
        const d = await r.json();
        return d.choices?.[0]?.message?.content || null;
      }
    },
    {
      name: "Gemini",
      call: async () => {
        const key = Deno.env.get("GEMINI_API_KEY");
        if (!key) return null;
        const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: contextPrompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 6000 },
          }),
        });
        if (!r.ok) return null;
        const d = await r.json();
        return d.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    },
  ];

  for (const provider of providers) {
    try {
      const result = await provider.call();
      if (result) {
        const parsed = parseAIResponse(result);
        if (parsed) return parsed;
      }
    } catch (e) {
      console.error(`[Analyze-Document] ${provider.name} failed:`, e);
    }
  }

  return null;
}

function createFallbackStructuredResult(fileName: string, text: string): any {
  return {
    summary: `Document "${fileName}" has been processed. Review the extracted content for important terms and conditions.`,
    keyTerms: [],
    clauses: [],
    riskFactors: [{ factor: "Unable to perform full AI analysis", severity: "medium", details: "Manual review recommended" }],
    benefits: [],
    financialImplications: [],
    recommendations: [
      { action: "Read all sections carefully", priority: "high", reason: "AI analysis was limited" },
      { action: "Consult a financial advisor", priority: "medium", reason: "Professional review recommended for complex documents" }
    ],
    consumerRights: [],
    extractedText: text,
  };
}

function detectDocumentType(text: string): string {
  const lowerText = text.toLowerCase();
  const scores = { insurance: 0, loan: 0, creditCard: 0 };

  if (lowerText.includes('policy') || lowerText.includes('insured') || lowerText.includes('claim')) scores.insurance += 3;
  if (lowerText.includes('sum assured') || lowerText.includes('premium') || lowerText.includes('coverage')) scores.insurance += 2;
  if (lowerText.includes('loan') || lowerText.includes('emi') || lowerText.includes('principal')) scores.loan += 3;
  if (lowerText.includes('interest rate') || lowerText.includes('tenure') || lowerText.includes('disbursement')) scores.loan += 2;
  if (lowerText.includes('credit card') || lowerText.includes('card member')) scores.creditCard += 3;
  if (lowerText.includes('credit limit') || lowerText.includes('billing cycle')) scores.creditCard += 2;

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
      if (category.keywords.some(keyword => lowerSentence.includes(keyword)) && sentence.trim().length < 500) {
        matchingClauses.push(sentence.trim());
      }
    }
    if (matchingClauses.length > 0) {
      let riskLevel = 'low';
      if (['Penalties', 'Exclusions', 'Liability'].includes(category.name)) riskLevel = 'high';
      else if (['Fees & Charges', 'Auto-Renewal', 'Termination'].includes(category.name)) riskLevel = 'medium';
      results.push({ category: category.name, clauses: matchingClauses.slice(0, 5), riskLevel });
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
        risks.push({ level, matches: [...new Set(matches)].slice(0, 3), pattern: pattern.source });
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
  let score = 30;
  for (const risk of patternRisks) {
    if (risk.level === 'high') score += 15 * Math.min(risk.matches.length, 3);
    else if (risk.level === 'medium') score += 8 * Math.min(risk.matches.length, 3);
    else score -= 3 * Math.min(risk.matches.length, 2);
  }
  for (const clause of classifiedClauses) {
    if (clause.riskLevel === 'high') score += 5 * Math.min(clause.clauses.length, 3);
    else if (clause.riskLevel === 'medium') score += 3 * Math.min(clause.clauses.length, 3);
  }
  if (ocrConfidence < 70) score += 10;
  else if (ocrConfidence < 85) score += 5;
  return Math.max(0, Math.min(100, score));
}
