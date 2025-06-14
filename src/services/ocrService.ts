
export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
}

export interface DocumentSection {
  title: string;
  content: string;
  page?: number;
  confidence: number;
}

export class OCRService {
  private static instance: OCRService;

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async extractTextFromImage(file: File): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      // Dynamic import to handle cases where tesseract.js might not be available
      const Tesseract = await import('tesseract.js');
      
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m: any) => console.log('OCR Progress:', m)
      });

      const processingTime = Date.now() - startTime;
      
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        processingTime
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image. OCR service unavailable.');
    }
  }

  async extractTextFromPDF(file: File): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      // For client-side PDF processing, we'll use a different approach
      // Since pdf-parse requires Node.js, we'll implement a basic text extraction
      const arrayBuffer = await file.arrayBuffer();
      const text = await this.parsePDFBuffer(arrayBuffer);
      
      const processingTime = Date.now() - startTime;
      
      return {
        text,
        confidence: 95, // Assume high confidence for direct PDF text
        processingTime
      };
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private async parsePDFBuffer(buffer: ArrayBuffer): Promise<string> {
    // Basic PDF text extraction - for production, consider using PDF.js
    const uint8Array = new Uint8Array(buffer);
    const decoder = new TextDecoder('utf-8');
    let text = decoder.decode(uint8Array);
    
    // Extract readable text between stream objects
    const textMatches = text.match(/stream\s*(.*?)\s*endstream/gs);
    let extractedText = '';
    
    if (textMatches) {
      textMatches.forEach(match => {
        const content = match.replace(/stream\s*|\s*endstream/g, '');
        // Basic text extraction - this is simplified
        const readableText = content.replace(/[^\x20-\x7E]/g, ' ').trim();
        if (readableText.length > 10) {
          extractedText += readableText + ' ';
        }
      });
    }
    
    return extractedText || 'Unable to extract text from PDF';
  }

  async processDocument(file: File): Promise<OCRResult> {
    const fileType = file.type.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return this.extractTextFromPDF(file);
    } else if (fileType.includes('image')) {
      return this.extractTextFromImage(file);
    } else {
      // For other document types, try to read as text
      const text = await file.text();
      return {
        text,
        confidence: 100,
        processingTime: 0
      };
    }
  }

  identifyDocumentSections(text: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    
    // Common patterns for different document sections
    const patterns = {
      'Terms and Conditions': /(?:terms?\s*(?:and|&|\+)\s*conditions?|t\s*&\s*c|terms?\s*of\s*(?:service|use))/gi,
      'Privacy Policy': /privacy\s*policy|data\s*protection|personal\s*information/gi,
      'Fees and Charges': /(?:fees?\s*(?:and|&|\+)\s*charges?|pricing|cost|payment)/gi,
      'Cancellation Policy': /cancellation\s*policy|refund\s*policy|termination/gi,
      'Liability Clauses': /liability|limitation\s*of\s*liability|disclaimer/gi,
      'Auto-Renewal': /auto\s*renewal|automatic\s*renewal|subscription\s*renewal/gi,
      'Hidden Charges': /(?:hidden|additional|extra)\s*(?:charges?|fees?)|miscellaneous\s*charges?/gi,
      'Penalty Terms': /penalty|penalt(?:y|ies)|late\s*(?:fee|charge|payment)/gi,
      'Interest Rates': /interest\s*rate|apr|annual\s*percentage\s*rate/gi,
      'Coverage Exclusions': /exclusion|not\s*covered|limitation|restriction/gi
    };

    Object.entries(patterns).forEach(([sectionName, pattern]) => {
      const matches = [...text.matchAll(pattern)];
      
      matches.forEach(match => {
        const startIndex = match.index || 0;
        const contextStart = Math.max(0, startIndex - 200);
        const contextEnd = Math.min(text.length, startIndex + 800);
        const context = text.slice(contextStart, contextEnd);
        
        sections.push({
          title: sectionName,
          content: context.trim(),
          confidence: 85
        });
      });
    });

    return sections;
  }

  analyzeForHiddenClauses(text: string): string[] {
    const hiddenClausePatterns = [
      /(?:automatic|auto)\s*(?:renewal|billing)/gi,
      /(?:non-refundable|no\s*refund)/gi,
      /(?:binding\s*arbitration|dispute\s*resolution)/gi,
      /(?:data\s*sharing|third\s*party\s*disclosure)/gi,
      /(?:penalty|late\s*fee|additional\s*charge)/gi,
      /(?:minimum\s*spend|minimum\s*usage)/gi,
      /(?:early\s*termination|cancellation\s*fee)/gi,
      /(?:changes\s*to\s*terms|modification\s*of\s*agreement)/gi,
      /(?:force\s*majeure|act\s*of\s*god)/gi,
      /(?:limitation\s*of\s*liability|disclaimer\s*of\s*warranty)/gi
    ];

    const foundClauses: string[] = [];
    
    hiddenClausePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const clauseIndex = text.indexOf(match);
          const contextStart = Math.max(0, clauseIndex - 100);
          const contextEnd = Math.min(text.length, clauseIndex + 300);
          const context = text.slice(contextStart, contextEnd).trim();
          
          if (!foundClauses.some(clause => clause.includes(match))) {
            foundClauses.push(context);
          }
        });
      }
    });

    return foundClauses;
  }
}
