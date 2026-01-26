import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

export interface PDFExtractionResult {
  text: string;
  pages: PageContent[];
  metadata: PDFMetadata;
  confidence: number;
  processingTime: number;
}

export interface PageContent {
  pageNumber: number;
  text: string;
  textItems: TextItem[];
  hasImages: boolean;
  dimensions: { width: number; height: number };
}

export interface TextItem {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
  isEncrypted: boolean;
}

export class PDFService {
  private static instance: PDFService;

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async extractText(file: File): Promise<PDFExtractionResult> {
    const startTime = Date.now();
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const metadata = await this.extractMetadata(pdf);
      const pages: PageContent[] = [];
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const pageContent = await this.extractPageContent(page, i);
        pages.push(pageContent);
        fullText += pageContent.text + '\n\n';
      }

      // Calculate confidence based on text extraction quality
      const confidence = this.calculateConfidence(pages, fullText);

      const processingTime = Date.now() - startTime;

      return {
        text: fullText.trim(),
        pages,
        metadata,
        confidence,
        processingTime,
      };
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractMetadata(pdf: pdfjsLib.PDFDocumentProxy): Promise<PDFMetadata> {
    try {
      const metadata = await pdf.getMetadata();
      const info = metadata.info as any;

      return {
        title: info?.Title || undefined,
        author: info?.Author || undefined,
        subject: info?.Subject || undefined,
        creator: info?.Creator || undefined,
        producer: info?.Producer || undefined,
        creationDate: info?.CreationDate ? new Date(info.CreationDate) : undefined,
        modificationDate: info?.ModDate ? new Date(info.ModDate) : undefined,
        pageCount: pdf.numPages,
        isEncrypted: false,
      };
    } catch {
      return {
        pageCount: pdf.numPages,
        isEncrypted: false,
      };
    }
  }

  private async extractPageContent(page: pdfjsLib.PDFPageProxy, pageNumber: number): Promise<PageContent> {
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const textItems: TextItem[] = textContent.items
      .filter((item: any): item is any => 'str' in item)
      .map((item: any) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        fontSize: Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]),
        fontName: item.fontName,
      }));

    // Reconstruct text with proper ordering
    const sortedItems = [...textItems].sort((a, b) => {
      // Sort by Y (top to bottom) then X (left to right)
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 5) return yDiff;
      return a.x - b.x;
    });

    // Group by lines
    const lines: TextItem[][] = [];
    let currentLine: TextItem[] = [];
    let lastY = -1;

    for (const item of sortedItems) {
      if (lastY === -1 || Math.abs(item.y - lastY) > 5) {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = [item];
        lastY = item.y;
      } else {
        currentLine.push(item);
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Build text from lines
    const text = lines
      .map(line => line.map(item => item.text).join(' '))
      .join('\n');

    // Check for images (simplified)
    const hasImages = false; // Would need operator list parsing

    return {
      pageNumber,
      text,
      textItems,
      hasImages,
      dimensions: { width: viewport.width, height: viewport.height },
    };
  }

  private calculateConfidence(pages: PageContent[], fullText: string): number {
    let confidence = 100;

    // Check for text density
    const avgTextPerPage = fullText.length / pages.length;
    if (avgTextPerPage < 100) confidence -= 30;
    else if (avgTextPerPage < 500) confidence -= 15;

    // Check for garbled text (high ratio of special characters)
    const specialCharRatio = (fullText.match(/[^\w\s.,;:!?'"()-]/g) || []).length / fullText.length;
    if (specialCharRatio > 0.3) confidence -= 25;
    else if (specialCharRatio > 0.15) confidence -= 10;

    // Check for word-like patterns
    const words = fullText.match(/\b[a-zA-Z]{3,}\b/g) || [];
    const wordRatio = words.length / (fullText.length / 5);
    if (wordRatio < 0.3) confidence -= 20;

    // Check for consistent line structure
    const lineCount = fullText.split('\n').filter(l => l.trim().length > 0).length;
    const avgLineLength = fullText.length / Math.max(lineCount, 1);
    if (avgLineLength > 500 || avgLineLength < 10) confidence -= 10;

    return Math.max(0, Math.min(100, confidence));
  }

  async extractTextWithFallback(file: File): Promise<PDFExtractionResult> {
    try {
      const result = await this.extractText(file);
      
      // If confidence is too low, we might need OCR
      if (result.confidence < 50 && result.text.length < 500) {
        console.log('PDF text extraction low confidence, may need OCR');
      }
      
      return result;
    } catch (error) {
      console.error('PDF extraction error, using fallback:', error);
      
      // Return minimal result for fallback handling
      return {
        text: '',
        pages: [],
        metadata: { pageCount: 0, isEncrypted: false },
        confidence: 0,
        processingTime: 0,
      };
    }
  }
}

export const pdfService = PDFService.getInstance();
