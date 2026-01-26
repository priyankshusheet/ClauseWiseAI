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

class AIService {
  private static instance: AIService;
  private abortController: AbortController | null = null;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
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

      // Handle error responses
      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        if (response.status === 402) {
          throw new Error('AI service quota exceeded. Please add credits to continue.');
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
      options.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async chat(
    messages: Message[],
    documentContext: DocumentContext | null
  ): Promise<string> {
    const response = await fetch(CHAT_URL, {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated.';
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
