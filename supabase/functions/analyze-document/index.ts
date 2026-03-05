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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

const MULTIMODAL_ANALYSIS_PROMPT = `You are an expert financial document analyst. You are given an image/scan of a financial document. Perform BOTH text extraction (OCR) and comprehensive analysis in a SINGLE pass.

Your response MUST follow this EXACT structure:

## Extracted Text
[Transcribe ALL visible text from the document faithfully. Include every clause, term, number, and fine print you can read.]

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

Be specific, cite clause numbers when possible, and use plain language. Pay special attention to tables, charts, and handwritten annotations.`;

const TEXT_ANALYSIS_PROMPT = `You are an expert financial document analyst. Analyze the provided document text and provide a comprehensive, structured analysis.

Format your response EXACTLY as follows:

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
    const authResult = await requireAuth(req, corsHeaders);
    if (authResult instanceof Response) return authResult;

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
    
    // NEW: Accept base64 file data for multimodal analysis
    const fileBase64 = bodyObj.fileBase64 as string | undefined;
    const fileMimeType = bodyObj.fileMimeType as string | undefined;

    const sanitizedText = extractedText ? sanitizeText(extractedText) : '';
    const isMultimodal = !!fileBase64 && !!fileMimeType;

    console.log(`[Analyze-Document] User: ${authResult.userId}, Processing: ${fileName}, multimodal: ${isMultimodal}`);

    let aiAnalysis: string | null = null;
    let extractedFromVision = '';

    // MULTIMODAL PATH: Use Gemini Vision for combined OCR + AI analysis
    if (isMultimodal) {
      const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
      
      if (geminiApiKey) {
        try {
          console.log(`[Analyze-Document] Using Gemini Vision for multimodal analysis`);
          
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
                    {
                      inline_data: {
                        mime_type: fileMimeType,
                        data: fileBase64,
                      }
                    },
                    {
                      text: `Analyze this financial document: "${fileName}". ${MULTIMODAL_ANALYSIS_PROMPT}`
                    }
                  ]
                }],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 8000,
                }
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            aiAnalysis = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
            
            if (aiAnalysis) {
              // Extract the OCR text from the multimodal response
              const extractedMatch = aiAnalysis.match(/## Extracted Text\n([\s\S]*?)(?=\n## )/);
              if (extractedMatch) {
                extractedFromVision = extractedMatch[1].trim();
              }
              console.log(`[Analyze-Document] Gemini Vision analysis complete`);
            }
          } else {
            const errText = await response.text();
            console.error(`[Analyze-Document] Gemini Vision error: ${response.status} - ${errText.substring(0, 200)}`);
          }
        } catch (e) {
          console.error(`[Analyze-Document] Gemini Vision exception:`, e);
        }
      }

      // Fallback: try OpenAI Vision
      if (!aiAnalysis) {
        const openaiKey = Deno.env.get("OPENAI_API_KEY");
        if (openaiKey) {
          try {
            console.log(`[Analyze-Document] Falling back to OpenAI Vision`);
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{
                  role: "user",
                  content: [
                    {
                      type: "image_url",
                      image_url: { url: `data:${fileMimeType};base64,${fileBase64}` }
                    },
                    {
                      type: "text",
                      text: `Analyze this financial document: "${fileName}". ${MULTIMODAL_ANALYSIS_PROMPT}`
                    }
                  ]
                }],
                max_tokens: 8000,
                temperature: 0.2,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              aiAnalysis = data.choices?.[0]?.message?.content || null;
              if (aiAnalysis) {
                const extractedMatch = aiAnalysis.match(/## Extracted Text\n([\s\S]*?)(?=\n## )/);
                if (extractedMatch) extractedFromVision = extractedMatch[1].trim();
                console.log(`[Analyze-Document] OpenAI Vision analysis complete`);
              }
            }
          } catch (e) {
            console.error(`[Analyze-Document] OpenAI Vision exception:`, e);
          }
        }
      }
    }

    // TEXT-ONLY PATH: Use text-based AI analysis (original flow)
    const textForAnalysis = sanitizedText || extractedFromVision;
    
    if (!aiAnalysis && textForAnalysis) {
      aiAnalysis = await performTextAIAnalysis(fileName!, textForAnalysis, ocrConfidence || 0, documentType || 'unknown');
    }

    // Pattern-based analysis on whatever text we have
    const analysisText = textForAnalysis || '';
    const classifiedClauses = classifyClauses(analysisText);
    const detectedType = documentType || detectDocumentType(analysisText);
    const patternRisks = analyzeRiskPatterns(analysisText, detectedType);
    const riskScore = calculateRiskScore(patternRisks, ocrConfidence || (isMultimodal ? 90 : 0), classifiedClauses);
    const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

    const latency = Date.now() - startTime;
    console.log(`[Analyze-Document] Complete (${latency}ms), risk: ${riskScore}/100 (${riskLevel}), multimodal: ${isMultimodal}`);

    return new Response(JSON.stringify({
      success: true,
      analysis: aiAnalysis || createFallbackAnalysis(fileName!, analysisText, ocrConfidence || 0),
      riskScore,
      riskLevel,
      documentType: detectedType,
      classifiedClauses,
      patternRisks,
      // Return vision-extracted text so client can use it
      extractedText: extractedFromVision || sanitizedText || '',
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

// Text-based AI analysis with provider fallback
async function performTextAIAnalysis(
  fileName: string,
  text: string,
  ocrConfidence: number,
  documentType: string,
): Promise<string | null> {
  const contextPrompt = `Analyze this financial document: "${fileName}"
Document type: ${documentType}
OCR Confidence: ${ocrConfidence}%

Document text (first 12000 chars):
${text.substring(0, 12000)}`;

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
            messages: [{ role: "system", content: TEXT_ANALYSIS_PROMPT }, { role: "user", content: contextPrompt }],
            temperature: 0.2, max_tokens: 4000,
          }),
        });
        if (!r.ok) return null;
        const d = await r.json();
        return d.choices?.[0]?.message?.content || null;
      }
    },
    {
      name: "Cohere",
      call: async () => {
        const key = Deno.env.get("COHERE_API_KEY");
        if (!key) return null;
        const r = await fetch("https://api.cohere.com/v2/chat", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "command-a-03-2025",
            messages: [{ role: "system", content: TEXT_ANALYSIS_PROMPT }, { role: "user", content: contextPrompt }],
            temperature: 0.2, max_tokens: 4000,
          }),
        });
        if (!r.ok) return null;
        const d = await r.json();
        return d.message?.content?.[0]?.text || null;
      }
    },
    {
      name: "OpenAI",
      call: async () => {
        const key = Deno.env.get("OPENAI_API_KEY");
        if (!key) return null;
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: TEXT_ANALYSIS_PROMPT }, { role: "user", content: contextPrompt }],
            temperature: 0.2, max_tokens: 4000,
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
            systemInstruction: { parts: [{ text: TEXT_ANALYSIS_PROMPT }] },
            generationConfig: { temperature: 0.2, maxOutputTokens: 4000 },
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
      console.log(`[Analyze-Document] Trying ${provider.name}...`);
      const result = await provider.call();
      if (result) {
        console.log(`[Analyze-Document] ${provider.name} succeeded`);
        return result;
      }
    } catch (e) {
      console.error(`[Analyze-Document] ${provider.name} failed:`, e);
    }
  }

  return null;
}

function createFallbackAnalysis(fileName: string, text: string, ocrConfidence: number): string {
  return `## Document Analysis: ${fileName}

## Document Overview
This financial document requires careful review.

## Key Areas to Review
- Fees and charges
- Terms and conditions
- Risk factors and exclusions
- Important dates and deadlines

## Recommendations
1. Read all sections carefully, especially the fine print
2. Highlight any unclear terms and seek clarification
3. Compare with similar products from other providers
4. Consult a professional for complex documents

*Note: Full AI analysis was unavailable. This is a basic analysis.*`;
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
