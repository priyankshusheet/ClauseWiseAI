export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  language?: string;
  segments?: OCRSegment[];
}

export interface OCRSegment {
  text: string;
  confidence: number;
  bbox?: { x: number; y: number; width: number; height: number };
}

export interface DocumentSection {
  title: string;
  content: string;
  page?: number;
  confidence: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface ImagePreprocessingOptions {
  denoise?: boolean;
  enhanceContrast?: boolean;
  correctOrientation?: boolean;
  normalizeResolution?: boolean;
}

// Supported OCR languages
const SUPPORTED_LANGUAGES: Record<string, string> = {
  'eng': 'English',
  'hin': 'Hindi',
  'spa': 'Spanish',
  'fra': 'French',
  'deu': 'German',
  'ita': 'Italian',
  'por': 'Portuguese',
  'rus': 'Russian',
  'jpn': 'Japanese',
  'kor': 'Korean',
  'chi_sim': 'Chinese (Simplified)',
  'chi_tra': 'Chinese (Traditional)',
  'ara': 'Arabic',
};

export class EnhancedOCRService {
  private static instance: EnhancedOCRService;
  private workerPool: any[] = [];
  private maxWorkers = 2;

  public static getInstance(): EnhancedOCRService {
    if (!EnhancedOCRService.instance) {
      EnhancedOCRService.instance = new EnhancedOCRService();
    }
    return EnhancedOCRService.instance;
  }

  async extractTextFromImage(
    file: File,
    options: {
      language?: string;
      preprocessing?: ImagePreprocessingOptions;
    } = {}
  ): Promise<OCRResult> {
    const startTime = Date.now();
    const { language = 'eng', preprocessing = {} } = options;

    try {
      // Preprocess image if needed
      const processedFile = await this.preprocessImage(file, preprocessing);
      
      // Dynamic import for Tesseract
      const Tesseract = await import('tesseract.js');

      // Detect language if auto
      let detectedLanguage = language;
      if (language === 'auto') {
        detectedLanguage = await this.detectLanguage(processedFile);
      }

      const result = await Tesseract.recognize(processedFile, detectedLanguage, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      // Extract segments with confidence
      const resultData = result.data as any;
      const segments: OCRSegment[] = (resultData.words || []).map((word: any) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox ? {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
        } : undefined,
      })) || [];

      const processingTime = Date.now() - startTime;

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        processingTime,
        language: detectedLanguage,
        segments,
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image. OCR service unavailable.');
    }
  }

  private async preprocessImage(file: File, options: ImagePreprocessingOptions): Promise<File> {
    if (!options.enhanceContrast && !options.denoise && !options.normalizeResolution) {
      return file;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;

      const img = await this.loadImage(file);
      
      // Set canvas dimensions
      let { width, height } = img;
      
      // Normalize resolution (target ~300 DPI equivalent)
      if (options.normalizeResolution) {
        const maxDim = 3000;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        } else if (width < 1000 && height < 1000) {
          // Upscale small images
          const scale = 1500 / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Enhance contrast
      if (options.enhanceContrast) {
        this.applyContrastEnhancement(data);
      }

      // Basic denoise (simple averaging)
      if (options.denoise) {
        this.applyDenoise(data, width, height);
      }

      ctx.putImageData(imageData, 0, 0);

      // Convert back to file
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/png' }));
          } else {
            resolve(file);
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      return file;
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private applyContrastEnhancement(data: Uint8ClampedArray): void {
    // Find min/max luminance
    let min = 255, max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      min = Math.min(min, luminance);
      max = Math.max(max, luminance);
    }

    // Apply contrast stretch
    const range = max - min || 1;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = ((data[i] - min) / range) * 255;
      data[i + 1] = ((data[i + 1] - min) / range) * 255;
      data[i + 2] = ((data[i + 2] - min) / range) * 255;
    }
  }

  private applyDenoise(data: Uint8ClampedArray, width: number, height: number): void {
    // Simple 3x3 median filter for noise reduction
    const original = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        for (let c = 0; c < 3; c++) {
          const neighbors: number[] = [];
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c;
              neighbors.push(original[nIdx]);
            }
          }
          neighbors.sort((a, b) => a - b);
          data[idx + c] = neighbors[4]; // Median
        }
      }
    }
  }

  private async detectLanguage(file: File): Promise<string> {
    // Simple language detection based on character patterns
    // For full detection, you'd use a dedicated language detection service
    try {
      const Tesseract = await import('tesseract.js');
      
      // Quick scan with English
      const result = await Tesseract.recognize(file, 'eng', {
        logger: () => {},
      });

      const text = result.data.text.toLowerCase();
      
      // Check for non-Latin scripts
      if (/[\u4e00-\u9fff]/.test(text)) return 'chi_sim';
      if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'jpn';
      if (/[\uac00-\ud7af]/.test(text)) return 'kor';
      if (/[\u0600-\u06ff]/.test(text)) return 'ara';
      if (/[\u0400-\u04ff]/.test(text)) return 'rus';
      if (/[\u0900-\u097f]/.test(text)) return 'hin';
      
      return 'eng';
    } catch {
      return 'eng';
    }
  }

  identifyDocumentSections(text: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    
    const patterns = {
      'Terms and Conditions': { 
        pattern: /(?:terms?\s*(?:and|&|\+)\s*conditions?|t\s*&\s*c|terms?\s*of\s*(?:service|use))/gi,
        risk: 'medium' as const
      },
      'Privacy Policy': { 
        pattern: /privacy\s*policy|data\s*protection|personal\s*information/gi,
        risk: 'low' as const
      },
      'Fees and Charges': { 
        pattern: /(?:fees?\s*(?:and|&|\+)\s*charges?|pricing|cost|payment)/gi,
        risk: 'high' as const
      },
      'Cancellation Policy': { 
        pattern: /cancellation\s*policy|refund\s*policy|termination/gi,
        risk: 'high' as const
      },
      'Liability Clauses': { 
        pattern: /liability|limitation\s*of\s*liability|disclaimer/gi,
        risk: 'high' as const
      },
      'Auto-Renewal': { 
        pattern: /auto\s*renewal|automatic\s*renewal|subscription\s*renewal/gi,
        risk: 'high' as const
      },
      'Hidden Charges': { 
        pattern: /(?:hidden|additional|extra)\s*(?:charges?|fees?)|miscellaneous\s*charges?/gi,
        risk: 'high' as const
      },
      'Penalty Terms': { 
        pattern: /penalty|penalt(?:y|ies)|late\s*(?:fee|charge|payment)/gi,
        risk: 'high' as const
      },
      'Interest Rates': { 
        pattern: /interest\s*rate|apr|annual\s*percentage\s*rate/gi,
        risk: 'medium' as const
      },
      'Coverage Exclusions': { 
        pattern: /exclusion|not\s*covered|limitation|restriction/gi,
        risk: 'high' as const
      }
    };

    Object.entries(patterns).forEach(([sectionName, { pattern, risk }]) => {
      const matches = [...text.matchAll(pattern)];
      
      matches.forEach(match => {
        const startIndex = match.index || 0;
        const contextStart = Math.max(0, startIndex - 200);
        const contextEnd = Math.min(text.length, startIndex + 800);
        const context = text.slice(contextStart, contextEnd);
        
        sections.push({
          title: sectionName,
          content: context.trim(),
          confidence: 85,
          riskLevel: risk,
        });
      });
    });

    return sections;
  }

  analyzeForHiddenClauses(text: string): { clause: string; category: string; severity: 'low' | 'medium' | 'high' }[] {
    const hiddenClausePatterns = [
      { pattern: /(?:automatic|auto)\s*(?:renewal|billing)/gi, category: 'Auto-Renewal', severity: 'high' as const },
      { pattern: /(?:non-refundable|no\s*refund)/gi, category: 'Refund Policy', severity: 'high' as const },
      { pattern: /(?:binding\s*arbitration|dispute\s*resolution)/gi, category: 'Legal', severity: 'medium' as const },
      { pattern: /(?:data\s*sharing|third\s*party\s*disclosure)/gi, category: 'Privacy', severity: 'medium' as const },
      { pattern: /(?:penalty|late\s*fee|additional\s*charge)/gi, category: 'Fees', severity: 'high' as const },
      { pattern: /(?:minimum\s*spend|minimum\s*usage)/gi, category: 'Requirements', severity: 'medium' as const },
      { pattern: /(?:early\s*termination|cancellation\s*fee)/gi, category: 'Termination', severity: 'high' as const },
      { pattern: /(?:changes\s*to\s*terms|modification\s*of\s*agreement)/gi, category: 'Terms', severity: 'medium' as const },
      { pattern: /(?:force\s*majeure|act\s*of\s*god)/gi, category: 'Legal', severity: 'low' as const },
      { pattern: /(?:limitation\s*of\s*liability|disclaimer\s*of\s*warranty)/gi, category: 'Liability', severity: 'high' as const },
      { pattern: /(?:pre-existing\s*condition)/gi, category: 'Exclusions', severity: 'high' as const },
      { pattern: /(?:waiting\s*period)/gi, category: 'Coverage', severity: 'medium' as const },
    ];

    const foundClauses: { clause: string; category: string; severity: 'low' | 'medium' | 'high' }[] = [];
    
    hiddenClausePatterns.forEach(({ pattern, category, severity }) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const clauseIndex = text.indexOf(match);
          const contextStart = Math.max(0, clauseIndex - 100);
          const contextEnd = Math.min(text.length, clauseIndex + 300);
          const context = text.slice(contextStart, contextEnd).trim();
          
          if (!foundClauses.some(c => c.clause.includes(match))) {
            foundClauses.push({ clause: context, category, severity });
          }
        });
      }
    });

    return foundClauses;
  }

  checkConfidenceThreshold(confidence: number): {
    isReliable: boolean;
    warning?: string;
    recommendation: string;
  } {
    if (confidence >= 90) {
      return {
        isReliable: true,
        recommendation: 'High confidence extraction. Results are reliable.',
      };
    } else if (confidence >= 75) {
      return {
        isReliable: true,
        warning: 'Some sections may have minor inaccuracies.',
        recommendation: 'Review highlighted sections for accuracy.',
      };
    } else if (confidence >= 50) {
      return {
        isReliable: false,
        warning: 'Moderate confidence. Results may contain errors.',
        recommendation: 'Cross-reference with original document. Consider manual review.',
      };
    } else {
      return {
        isReliable: false,
        warning: 'Low confidence extraction. Results likely contain significant errors.',
        recommendation: 'Manual document review strongly recommended. Consider re-scanning with better quality.',
      };
    }
  }

  getSupportedLanguages(): { code: string; name: string }[] {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({ code, name }));
  }
}

export const enhancedOCRService = EnhancedOCRService.getInstance();

// Legacy export for backward compatibility
export const OCRService = EnhancedOCRService;
