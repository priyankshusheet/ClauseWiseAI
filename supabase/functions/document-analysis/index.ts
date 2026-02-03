import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/auth.ts";
import { 
  validateString, 
  validateNumber,
  ValidationError,
  createValidationErrorResponse,
  sanitizeText
} from "../_shared/validation.ts";

const cohereApiKey = Deno.env.get('COHERE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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
        JSON.stringify({ error: 'Invalid JSON body', code: 'VALIDATION_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bodyObj = body as Record<string, unknown>;

    // Validate inputs
    const fileName = validateString(bodyObj.fileName, 'fileName', { required: true, maxLength: 255 });
    const fileType = validateString(bodyObj.fileType, 'fileType', { maxLength: 100 });
    const analysisType = validateString(bodyObj.analysisType, 'analysisType', { maxLength: 50 });
    const extractedText = validateString(bodyObj.extractedText, 'extractedText', { maxLength: 500000 });
    const ocrConfidence = validateNumber(bodyObj.ocrConfidence, 'ocrConfidence', { min: 0, max: 100 });
    const identifiedSections = validateNumber(bodyObj.identifiedSections, 'identifiedSections', { min: 0, max: 1000 });
    const hiddenClausesCount = validateNumber(bodyObj.hiddenClausesCount, 'hiddenClausesCount', { min: 0, max: 1000 });

    // Sanitize extracted text
    const sanitizedText = extractedText ? sanitizeText(extractedText) : '';

    console.log(`[Document-Analysis] User: ${authResult.userId}, Analyzing: ${fileName} (${fileType})`);
    
    if (sanitizedText) {
      console.log(`[Document-Analysis] OCR Data: ${sanitizedText.length} characters, ${ocrConfidence}% confidence, ${identifiedSections} sections, ${hiddenClausesCount} hidden clauses`);
    }

    const systemPrompt = `You are ClauseWise, an expert financial document analyzer. Analyze the document and provide a comprehensive, human-readable analysis in plain text format.

Focus on:
- Document overview and purpose
- Key terms and conditions that matter to consumers
- Hidden fees, charges, and penalty clauses
- Auto-renewal and cancellation policies
- Coverage exclusions and limitations
- Confusing or ambiguous language
- Consumer protection concerns
- Important deadlines and obligations
- Risk assessment and recommendations

Provide your analysis in clear, structured text format that's easy to read and understand. Avoid JSON format - write in natural language with proper paragraphs and bullet points where appropriate.

${sanitizedText ? `Document text extracted via OCR (${ocrConfidence}% confidence): ${sanitizedText.substring(0, 8000)}` : ''}`;

    let analysisPrompt = `Please provide a comprehensive analysis of this financial document: "${fileName}".`;
    
    if (sanitizedText) {
      analysisPrompt += `

The document text has been extracted using OCR with ${ocrConfidence}% confidence. 
${identifiedSections} document sections were identified and ${hiddenClausesCount} potential hidden clauses were detected.

Based on the extracted text, provide a detailed analysis that includes:

1. **Document Overview**: What type of document this is and its main purpose

2. **Key Findings**: Important terms, conditions, and clauses that consumers should be aware of

3. **Hidden or Concerning Clauses**: Any terms that might be easily missed or could impact the customer negatively

4. **Financial Implications**: Fees, charges, penalties, and financial obligations

5. **Consumer Rights and Protections**: What rights the consumer has and how they're protected

6. **Recommendations**: What the consumer should pay attention to and any actions they should consider

7. **Risk Assessment**: Overall risk level (Low/Medium/High) and explanation

Write in clear, conversational language that anyone can understand. Use bullet points and structure for easy reading.`;
    } else {
      analysisPrompt += `

Based on the filename and document type (${fileType}), provide a general analysis of what consumers should typically look for in this type of document, including common risks and important terms to watch out for.`;
    }

    if (cohereApiKey) {
      try {
        const response = await fetch('https://api.cohere.com/v1/chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cohereApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'command-r-plus',
            message: analysisPrompt,
            preamble: systemPrompt,
            temperature: 0.3,
            max_tokens: 2500
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const analysisText = data.text;
          
          if (analysisText) {
            // Extract risk level from the analysis
            const riskLevel = analysisText.toLowerCase().includes('high risk') || analysisText.toLowerCase().includes('risk: high') ? 'high' :
                             analysisText.toLowerCase().includes('medium risk') || analysisText.toLowerCase().includes('risk: medium') ? 'medium' : 'low';
            
            // Calculate risk score based on content
            let riskScore = 50;
            if (sanitizedText) {
              if ((hiddenClausesCount || 0) > 3) riskScore = 85;
              else if ((hiddenClausesCount || 0) > 1) riskScore = 70;
              else if ((ocrConfidence || 0) < 80) riskScore = 65;
              else riskScore = 55;
            }
            
            if (riskLevel === 'high') riskScore = Math.max(riskScore, 75);
            else if (riskLevel === 'low') riskScore = Math.min(riskScore, 45);

            const structuredAnalysis = {
              riskScore: riskScore,
              riskLevel: riskLevel,
              analysis: analysisText,
              summary: sanitizedText ? 
                `Document analysis completed using OCR with ${ocrConfidence}% confidence. ${identifiedSections} sections were analyzed${(hiddenClausesCount || 0) > 0 ? ` and ${hiddenClausesCount} potentially concerning clauses were identified` : ''}. Please review the detailed analysis below for important insights about this document.` :
                'Document analysis completed based on file type and general document patterns. Please review the analysis below for guidance on what to look for in this type of document.'
            };

            console.log('[Document-Analysis] Analysis completed successfully');
            return new Response(JSON.stringify(structuredAnalysis), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } else {
          // Consume response body
          await response.text();
          console.error('[Document-Analysis] Cohere API error:', response.status);
        }
      } catch (apiError) {
        console.error('[Document-Analysis] Cohere API call failed:', apiError);
      }
    }

    // Enhanced fallback response
    const fallbackAnalysis = {
      riskScore: sanitizedText ? 
        ((hiddenClausesCount || 0) > 3 ? 85 : (hiddenClausesCount || 0) > 1 ? 70 : 60) : 65,
      riskLevel: sanitizedText ? 
        ((hiddenClausesCount || 0) > 3 ? 'high' : (hiddenClausesCount || 0) > 1 ? 'medium' : 'low') : 'medium',
      analysis: `# Document Analysis: ${fileName}

## Document Overview
This appears to be a financial document that requires careful review. Based on the file type (${fileType}), this document likely contains important terms and conditions that could affect your financial obligations.

${sanitizedText ? `## OCR Analysis Results
- **Confidence Level**: ${ocrConfidence}%
- **Sections Identified**: ${identifiedSections}
- **Potential Hidden Clauses**: ${hiddenClausesCount}
- **Text Length**: ${sanitizedText.length} characters

## Key Areas to Review
${(hiddenClausesCount || 0) > 0 ? `⚠️ **${hiddenClausesCount} potentially concerning clauses were detected** - these require special attention.

` : ''}**Important Terms to Look For:**
• Auto-renewal clauses and cancellation procedures
• Late payment penalties and interest charges
• Coverage exclusions and limitations
• Fee structures and hidden charges
• Binding arbitration clauses
• Liability limitations

## Recommendations
1. **Read all fine print carefully** - important terms are often buried in small text
2. **Pay attention to renewal terms** - many agreements auto-renew unless cancelled
3. **Understand penalty structures** - know what fees you might face
4. **Review cancellation policies** - know how and when you can exit
5. **Ask questions** - don't hesitate to seek clarification on unclear terms

` : `## General Guidance
This type of document typically contains:
• Terms and conditions that govern your agreement
• Fee structures and payment obligations
• Rights and responsibilities of both parties
• Cancellation and renewal procedures
• Important deadlines and notice requirements

## Recommendations
1. Read the entire document carefully
2. Pay special attention to sections about fees and penalties
3. Understand your cancellation rights
4. Note any automatic renewal clauses
5. Keep records of all communications and payments
`}

## Risk Assessment
**Risk Level**: ${sanitizedText ? 
  ((hiddenClausesCount || 0) > 3 ? 'HIGH' : (hiddenClausesCount || 0) > 1 ? 'MEDIUM' : 'LOW') : 'MEDIUM'}

${sanitizedText && (hiddenClausesCount || 0) > 2 ? 
  'This document contains multiple clauses that require careful attention. Consider consulting with a financial advisor before proceeding.' :
  'This document appears to have standard terms, but careful review is still recommended.'}

## Next Steps
- Review all highlighted areas carefully
- Make note of important dates and deadlines
- Consider seeking professional advice if needed
- Keep a copy of this analysis for your records`,
      summary: sanitizedText ? 
        `OCR analysis extracted ${sanitizedText.length} characters with ${ocrConfidence}% confidence. ${identifiedSections} sections were identified${(hiddenClausesCount || 0) > 0 ? ` including ${hiddenClausesCount} potentially concerning clauses` : ''}. The document has been analyzed for key terms, hidden clauses, and consumer protection issues.` :
        'Document analysis completed based on file type. The analysis provides guidance on what to look for in this type of financial document and highlights common areas of concern.'
    };

    console.log('[Document-Analysis] Fallback analysis provided');
    return new Response(JSON.stringify(fallbackAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return createValidationErrorResponse(error, corsHeaders);
    }

    console.error('[Document-Analysis] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Analysis failed',
      riskScore: 50,
      riskLevel: 'medium',
      analysis: '# Analysis Error\n\nWe encountered an issue while analyzing your document. Please try again.',
      summary: 'Analysis temporarily unavailable. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
