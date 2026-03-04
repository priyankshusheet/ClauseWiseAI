import { supabase } from '@/integrations/supabase/client';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamingOptions {
  onDelta: (delta: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}

export interface DocumentContext {
  fileName: string;
  fileType: string;
  riskScore?: number;
  riskLevel?: string;
  ocrConfidence?: number;
  extractedText?: string;
  detectedClauses?: string[];
  sections?: { title: string; content: string }[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const ANALYSIS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-document`;

const FALLBACK_RESPONSES = {
  general: `I apologize, but I'm currently experiencing connectivity issues. Here are some general tips:

**For Insurance Documents (Indian Context):**
- Check for IRDAI-mandated free-look period (typically 15-30 days)
- Review pre-existing disease waiting periods
- Verify claim settlement ratio and process

**For Loan Agreements (RBI Guidelines):**
- Check interest rate type (fixed vs floating, linked to repo rate)
- Review prepayment/foreclosure charges (RBI mandates zero charges on floating rate)
- Verify processing fees and GST applicability

**For Credit Cards (RBI Norms):**
- Review annual fees, reward expiry terms
- Check minimum amount due (MAD) calculation
- Verify billing cycle and interest-free period

Please try again in a moment.`,

  documentAnalysis: (fileName: string) => `## Document Analysis: ${fileName}

Unable to perform full AI analysis. Here's a checklist for Indian financial documents:

### IRDAI / Insurance
- Free-look period (15-30 days for new policies)
- Waiting period for pre-existing conditions
- Exclusions and sub-limits

### RBI / Banking & Loans
- Prepayment penalty (should be NIL for floating rate home loans)
- Penal interest charges
- CIBIL score requirements

### SEBI / Investments
- Exit load and lock-in periods
- TDS applicability
- KYC compliance

*Note: This is a basic checklist. Please try again for AI-powered analysis.*`,
};

// Get user's country preference
function getUserCountry(): string {
  return localStorage.getItem('clausewise_country') || 'IN';
}

class AIService {
  private static instance: AIService;
  private abortController: AbortController | null = null;
  private retryCount = 0;
  private maxRetries = 2;
  private retryDelay = 1000;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = this.maxRetries): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (response.status >= 400 && response.status < 500 && response.status !== 429) return response;
        if (!response.ok && attempt < retries) {
          const waitTime = response.status === 429 
            ? (parseInt(response.headers.get('Retry-After') || '5') * 1000)
            : this.retryDelay * Math.pow(2, attempt);
          console.log(`[AIService] Retry ${attempt + 1}/${retries} after ${waitTime}ms`);
          await this.delay(waitTime);
          continue;
        }
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < retries) {
          const waitTime = this.retryDelay * Math.pow(2, attempt);
          await this.delay(waitTime);
        }
      }
    }
    throw lastError || new Error('Request failed after retries');
  }

  async streamChat(messages: Message[], documentContext: DocumentContext | null, options: StreamingOptions): Promise<void> {
    this.cancel();
    this.abortController = new AbortController();

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages,
          documentContext,
          stream: true,
          country: getUserCountry(),
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) throw new Error('Rate limit exceeded. Please wait.');
        if (response.status === 402) throw new Error('AI service quota exceeded.');
        if (response.status === 503 || response.status === 500) {
          this.provideFallbackResponse(options, documentContext);
          return;
        }
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { options.onDone(); return; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) options.onDelta(content);
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      if (buffer.trim()) {
        for (const line of buffer.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) options.onDelta(content);
          } catch { /* ignore */ }
        }
      }

      options.onDone();
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error('Stream chat error:', error);
      if (this.shouldUseFallback(error)) {
        this.provideFallbackResponse(options, documentContext);
        return;
      }
      options.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private shouldUseFallback(error: unknown): boolean {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      return msg.includes('network') || msg.includes('failed to fetch') || msg.includes('503') || msg.includes('service unavailable');
    }
    return false;
  }

  private provideFallbackResponse(options: StreamingOptions, documentContext: DocumentContext | null): void {
    const response = documentContext ? FALLBACK_RESPONSES.documentAnalysis(documentContext.fileName) : FALLBACK_RESPONSES.general;
    const words = response.split(' ');
    let index = 0;
    const streamWord = () => {
      if (index < words.length) { options.onDelta(words[index] + ' '); index++; setTimeout(streamWord, 20); }
      else { options.onDone(); }
    };
    streamWord();
  }

  async chat(messages: Message[], documentContext: DocumentContext | null): Promise<string> {
    try {
      const response = await this.fetchWithRetry(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages, documentContext, stream: false, country: getUserCountry() }),
      });

      if (!response.ok) {
        if (response.status === 503 || response.status === 500) {
          return documentContext ? FALLBACK_RESPONSES.documentAnalysis(documentContext.fileName) : FALLBACK_RESPONSES.general;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated.';
    } catch (error) {
      console.error('Chat error:', error);
      if (this.shouldUseFallback(error)) {
        return documentContext ? FALLBACK_RESPONSES.documentAnalysis(documentContext.fileName) : FALLBACK_RESPONSES.general;
      }
      throw error;
    }
  }

  async analyzeDocument(
    fileName: string,
    fileType: string,
    extractedText: string,
    ocrConfidence: number,
    documentType?: string
  ): Promise<{
    success: boolean;
    analysis: string;
    riskScore: number;
    riskLevel: string;
    documentType: string;
    classifiedClauses: any[];
    patternRisks: any[];
    metadata: any;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { fileName, fileType, extractedText, ocrConfidence, documentType, country: getUserCountry() },
      });
      if (error) throw new Error(error.message || 'Document analysis failed');
      return data;
    } catch (error) {
      console.error('Document analysis error:', error);
      return this.createFallbackAnalysis(fileName, extractedText, ocrConfidence);
    }
  }

  private createFallbackAnalysis(fileName: string, extractedText: string, ocrConfidence: number) {
    const lowerText = extractedText.toLowerCase();
    const highRiskPatterns = ['penalty', 'exclusion', 'waiver', 'liability', 'default', 'pre-existing', 'waiting period', 'non-refundable'];
    const mediumRiskPatterns = ['fee', 'charge', 'interest', 'renewal', 'termination', 'cancellation', 'deductible'];

    const highRiskCount = highRiskPatterns.filter(p => lowerText.includes(p)).length;
    const mediumRiskCount = mediumRiskPatterns.filter(p => lowerText.includes(p)).length;

    const riskScore = Math.min(100, 30 + (highRiskCount * 12) + (mediumRiskCount * 5));
    const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

    let documentType = 'unknown';
    if (lowerText.includes('insurance') || lowerText.includes('policy') || lowerText.includes('premium')) documentType = 'insurance';
    else if (lowerText.includes('loan') || lowerText.includes('emi') || lowerText.includes('mortgage')) documentType = 'loan';
    else if (lowerText.includes('credit card') || lowerText.includes('credit limit')) documentType = 'creditCard';

    return {
      success: true,
      analysis: FALLBACK_RESPONSES.documentAnalysis(fileName),
      riskScore,
      riskLevel,
      documentType,
      classifiedClauses: [],
      patternRisks: highRiskPatterns.filter(p => lowerText.includes(p)).map(p => ({ level: 'high', matches: [p], pattern: p })),
      metadata: { fileName, ocrConfidence, textLength: extractedText.length, isFallback: true },
    };
  }

  async generateEmbeddings(text: string, documentId: string, chunkingStrategy: 'semantic' | 'clause' | 'fixed' = 'semantic') {
    const { data, error } = await supabase.functions.invoke('generate-embeddings', { body: { text, documentId, chunkingStrategy } });
    if (error) throw new Error(error.message || 'Embedding generation failed');
    return data;
  }

  async semanticSearch(query: string, documentChunks: any[], options: { topK?: number; includeContext?: boolean; minSimilarity?: number } = {}) {
    const { data, error } = await supabase.functions.invoke('semantic-search', { body: { query, documentChunks, ...options } });
    if (error) throw new Error(error.message || 'Semantic search failed');
    return data;
  }

  cancel(): void {
    if (this.abortController) { this.abortController.abort(); this.abortController = null; }
  }
}

export const aiService = AIService.getInstance();
