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

// Fallback responses for when AI service is unavailable
const FALLBACK_RESPONSES = {
  general: `I apologize, but I'm currently experiencing connectivity issues. Here are some general tips while I reconnect:

**For Insurance Documents:**
- Look for exclusion clauses and waiting periods
- Check premium payment terms and penalties
- Review claim procedures and documentation requirements

**For Loan Agreements:**
- Pay attention to interest rate type (fixed vs floating)
- Check prepayment penalties and charges
- Review late payment fees and grace periods

**For Credit Cards:**
- Look for annual fees and reward expiry terms
- Check cash advance fees and foreign transaction charges
- Review minimum payment requirements

Please try again in a moment, or contact support if the issue persists.`,

  documentAnalysis: (fileName: string) => `## Document Analysis: ${fileName}

I'm currently unable to perform a full AI analysis, but here's what you can check manually:

### Key Areas to Review
- **Fees and Charges**: Look for processing fees, penalties, and hidden costs
- **Terms and Conditions**: Pay attention to renewal, cancellation, and modification terms
- **Risk Factors**: Check exclusions, limitations, and liability clauses
- **Important Dates**: Note any deadlines, waiting periods, or expiry dates

### Recommendations
1. Read all sections carefully, especially the fine print
2. Highlight any unclear terms and seek clarification
3. Compare with similar products from other providers
4. Consult a professional for complex documents

*Note: This is a basic analysis. Please try again later for AI-powered insights.*`,
};

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

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = this.maxRetries
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // Don't retry on client errors (4xx) except rate limits
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          return response;
        }
        
        // Retry on server errors or rate limits
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
          console.log(`[AIService] Network error, retry ${attempt + 1}/${retries} after ${waitTime}ms`);
          await this.delay(waitTime);
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async streamChat(
    messages: Message[],
    documentContext: DocumentContext | null,
    options: StreamingOptions
  ): Promise<void> {
    // Cancel any existing request
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
        }),
        signal: this.abortController.signal,
      });

      // Handle error responses with fallback
      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        if (response.status === 402) {
          throw new Error('AI service quota exceeded. Please add credits to continue.');
        }
        if (response.status === 503 || response.status === 500) {
          // Use fallback for service unavailable
          console.warn('[AIService] Service unavailable, using fallback response');
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

        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          // Handle CRLF
          if (line.endsWith('\r')) {
            line = line.slice(0, -1);
          }

          // Skip comments and empty lines
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            options.onDone();
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              options.onDelta(content);
            }
          } catch {
            // Incomplete JSON, put back and wait for more data
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        for (const line of buffer.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              options.onDelta(content);
            }
          } catch {
            // Ignore incomplete data
          }
        }
      }

      options.onDone();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Request was cancelled
        return;
      }
      
      console.error('Stream chat error:', error);
      
      // Check if we should provide fallback
      if (this.shouldUseFallback(error)) {
        console.warn('[AIService] Using fallback response due to error');
        this.provideFallbackResponse(options, documentContext);
        return;
      }
      
      options.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private shouldUseFallback(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Use fallback for network errors or service unavailable
      return message.includes('network') || 
             message.includes('failed to fetch') ||
             message.includes('503') ||
             message.includes('service unavailable');
    }
    return false;
  }

  private provideFallbackResponse(options: StreamingOptions, documentContext: DocumentContext | null): void {
    const response = documentContext 
      ? FALLBACK_RESPONSES.documentAnalysis(documentContext.fileName)
      : FALLBACK_RESPONSES.general;
    
    // Simulate streaming for better UX
    const words = response.split(' ');
    let index = 0;
    
    const streamWord = () => {
      if (index < words.length) {
        options.onDelta(words[index] + ' ');
        index++;
        setTimeout(streamWord, 20);
      } else {
        options.onDone();
      }
    };
    
    streamWord();
  }

  async chat(
    messages: Message[],
    documentContext: DocumentContext | null
  ): Promise<string> {
    try {
      const response = await this.fetchWithRetry(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages,
          documentContext,
          stream: false,
        }),
      });

      if (!response.ok) {
        // Use fallback for service errors
        if (response.status === 503 || response.status === 500) {
          console.warn('[AIService] Service unavailable, using fallback');
          return documentContext 
            ? FALLBACK_RESPONSES.documentAnalysis(documentContext.fileName)
            : FALLBACK_RESPONSES.general;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated.';
    } catch (error) {
      console.error('Chat error:', error);
      
      // Return fallback on network errors
      if (this.shouldUseFallback(error)) {
        return documentContext 
          ? FALLBACK_RESPONSES.documentAnalysis(documentContext.fileName)
          : FALLBACK_RESPONSES.general;
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
        body: {
          fileName,
          fileType,
          extractedText,
          ocrConfidence,
          documentType,
        },
      });

      if (error) {
        throw new Error(error.message || 'Document analysis failed');
      }

      return data;
    } catch (error) {
      console.error('Document analysis error:', error);
      
      // Return fallback analysis
      return this.createFallbackAnalysis(fileName, extractedText, ocrConfidence);
    }
  }

  private createFallbackAnalysis(
    fileName: string,
    extractedText: string,
    ocrConfidence: number
  ): {
    success: boolean;
    analysis: string;
    riskScore: number;
    riskLevel: string;
    documentType: string;
    classifiedClauses: any[];
    patternRisks: any[];
    metadata: any;
  } {
    // Basic pattern detection for risk assessment
    const lowerText = extractedText.toLowerCase();
    const highRiskPatterns = [
      'penalty', 'exclusion', 'waiver', 'liability', 'default',
      'pre-existing', 'waiting period', 'non-refundable'
    ];
    const mediumRiskPatterns = [
      'fee', 'charge', 'interest', 'renewal', 'termination',
      'cancellation', 'deductible'
    ];

    const highRiskCount = highRiskPatterns.filter(p => lowerText.includes(p)).length;
    const mediumRiskCount = mediumRiskPatterns.filter(p => lowerText.includes(p)).length;

    const riskScore = Math.min(100, 30 + (highRiskCount * 12) + (mediumRiskCount * 5));
    const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

    // Detect document type
    let documentType = 'unknown';
    if (lowerText.includes('insurance') || lowerText.includes('policy') || lowerText.includes('premium')) {
      documentType = 'insurance';
    } else if (lowerText.includes('loan') || lowerText.includes('emi') || lowerText.includes('mortgage')) {
      documentType = 'loan';
    } else if (lowerText.includes('credit card') || lowerText.includes('credit limit')) {
      documentType = 'creditCard';
    }

    return {
      success: true,
      analysis: FALLBACK_RESPONSES.documentAnalysis(fileName),
      riskScore,
      riskLevel,
      documentType,
      classifiedClauses: [],
      patternRisks: highRiskPatterns
        .filter(p => lowerText.includes(p))
        .map(p => ({ level: 'high', matches: [p], pattern: p })),
      metadata: {
        fileName,
        ocrConfidence,
        textLength: extractedText.length,
        isFallback: true,
      },
    };
  }

  async generateEmbeddings(
    text: string,
    documentId: string,
    chunkingStrategy: 'semantic' | 'clause' | 'fixed' = 'semantic'
  ): Promise<{
    success: boolean;
    chunks: any[];
    metadata: any;
  }> {
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
      body: {
        text,
        documentId,
        chunkingStrategy,
      },
    });

    if (error) {
      throw new Error(error.message || 'Embedding generation failed');
    }

    return data;
  }

  async semanticSearch(
    query: string,
    documentChunks: any[],
    options: {
      topK?: number;
      includeContext?: boolean;
      minSimilarity?: number;
    } = {}
  ): Promise<{
    success: boolean;
    results: any[];
    ragContext: string;
    query: { original: string; expanded: string[] };
    metadata: any;
  }> {
    const { data, error } = await supabase.functions.invoke('semantic-search', {
      body: {
        query,
        documentChunks,
        ...options,
      },
    });

    if (error) {
      throw new Error(error.message || 'Semantic search failed');
    }

    return data;
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export const aiService = AIService.getInstance();
