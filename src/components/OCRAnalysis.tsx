import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Clock,
  Zap,
  Search,
  ThumbsUp,
  ThumbsDown,
  Globe,
  ImageIcon,
  Settings2
} from 'lucide-react';
import { enhancedOCRService, EnhancedOCRService } from '@/services/enhancedOCRService';
import { pdfService, PDFExtractionResult } from '@/services/pdfService';
import { aiService } from '@/services/aiService';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface OCRAnalysisProps {
  file: File;
  onAnalysisComplete: (result: OCRAnalysisResult) => void;
}

export interface OCRAnalysisResult {
  extractedText: string;
  sections: { title: string; content: string; riskLevel?: string }[];
  hiddenClauses: { clause: string; category: string; severity: string }[];
  confidence: number;
  processingTime: number;
  language?: string;
  documentType?: string;
  pageCount?: number;
}

interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  riskFactors: string[];
  benefits: string[];
  hiddenClauses: string[];
  recommendations: string[];
  riskScore?: number;
  riskLevel?: string;
}

const OCRAnalysis: React.FC<OCRAnalysisProps> = ({ file, onAnalysisComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [extractionResult, setExtractionResult] = useState<{
    text: string;
    confidence: number;
    processingTime: number;
    pageCount?: number;
    language?: string;
  } | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidenceWarning, setConfidenceWarning] = useState<{
    isReliable: boolean;
    warning?: string;
    recommendation: string;
  } | null>(null);
  
  // OCR settings
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [enablePreprocessing, setEnablePreprocessing] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const startOCRAnalysis = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('');
    setAnalysis(null);
    setError(null);
    setConfidenceWarning(null);

    try {
      let extractedText = '';
      let confidence = 0;
      let processingTime = 0;
      let pageCount = 0;
      let detectedLanguage = selectedLanguage;

      const fileType = file.type.toLowerCase();
      const isPDF = fileType.includes('pdf');
      const isImage = fileType.includes('image');

      // Step 1: Text extraction
      setCurrentStep(isPDF ? 'Extracting text from PDF...' : 'Processing image with OCR...');
      setProgress(15);

      if (isPDF) {
        // Use PDF.js for structured extraction
        setCurrentStep('Parsing PDF structure...');
        const pdfResult = await pdfService.extractTextWithFallback(file);
        
        extractedText = pdfResult.text;
        confidence = pdfResult.confidence;
        processingTime = pdfResult.processingTime;
        pageCount = pdfResult.metadata.pageCount;

        setProgress(40);

        // If PDF extraction has low confidence, fall back to OCR
        if (confidence < 50 || extractedText.length < 200) {
          setCurrentStep('Low PDF confidence, applying OCR...');
          const ocrResult = await enhancedOCRService.extractTextFromImage(file, {
            language: selectedLanguage,
            preprocessing: enablePreprocessing ? {
              enhanceContrast: true,
              denoise: true,
              normalizeResolution: true,
            } : {},
          });
          
          if (ocrResult.text.length > extractedText.length) {
            extractedText = ocrResult.text;
            confidence = ocrResult.confidence;
          }
          detectedLanguage = ocrResult.language || selectedLanguage;
        }
      } else if (isImage) {
        // Use enhanced OCR with preprocessing
        setCurrentStep('Preprocessing image...');
        setProgress(20);

        const ocrResult = await enhancedOCRService.extractTextFromImage(file, {
          language: selectedLanguage === 'auto' ? 'auto' : selectedLanguage,
          preprocessing: enablePreprocessing ? {
            enhanceContrast: true,
            denoise: true,
            normalizeResolution: true,
          } : {},
        });

        extractedText = ocrResult.text;
        confidence = ocrResult.confidence;
        processingTime = ocrResult.processingTime;
        detectedLanguage = ocrResult.language || selectedLanguage;
      } else {
        // Plain text file
        extractedText = await file.text();
        confidence = 100;
        processingTime = 0;
      }

      setProgress(50);

      // Check confidence threshold
      const confidenceCheck = enhancedOCRService.checkConfidenceThreshold(confidence);
      setConfidenceWarning(confidenceCheck);

      setExtractionResult({
        text: extractedText,
        confidence,
        processingTime,
        pageCount: pageCount || undefined,
        language: detectedLanguage,
      });

      // Step 2: Identify sections and hidden clauses
      setCurrentStep('Analyzing document structure...');
      setProgress(65);

      const sections = enhancedOCRService.identifyDocumentSections(extractedText);
      const hiddenClauses = enhancedOCRService.analyzeForHiddenClauses(extractedText);

      // Step 3: AI-powered deep analysis
      setCurrentStep('Running AI analysis...');
      setProgress(80);

      try {
        const aiAnalysisResult = await aiService.analyzeDocument(
          file.name,
          file.type,
          extractedText,
          confidence,
        );

        // Parse AI analysis into structured format
        const structuredAnalysis: DocumentAnalysis = {
          summary: extractSummary(aiAnalysisResult.analysis),
          keyPoints: extractListFromMarkdown(aiAnalysisResult.analysis, ['key terms', 'key findings', 'important']),
          riskFactors: extractListFromMarkdown(aiAnalysisResult.analysis, ['risk', 'concern', 'warning']),
          benefits: extractListFromMarkdown(aiAnalysisResult.analysis, ['benefit', 'advantage', 'coverage']),
          hiddenClauses: extractListFromMarkdown(aiAnalysisResult.analysis, ['hidden', 'concerning clauses']),
          recommendations: extractListFromMarkdown(aiAnalysisResult.analysis, ['recommendation', 'action']),
          riskScore: aiAnalysisResult.riskScore,
          riskLevel: aiAnalysisResult.riskLevel,
        };

        setAnalysis(structuredAnalysis);
        setProgress(100);
        setCurrentStep('Analysis complete!');

        // Return complete result
        onAnalysisComplete({
          extractedText,
          sections: sections.map(s => ({
            title: s.title,
            content: s.content,
            riskLevel: s.riskLevel,
          })),
          hiddenClauses,
          confidence,
          processingTime,
          language: detectedLanguage,
          documentType: aiAnalysisResult.documentType,
          pageCount,
        });

      } catch (aiError: any) {
        console.error('AI Analysis failed:', aiError);
        
        // Fallback analysis
        setAnalysis(createFallbackAnalysis(extractedText, hiddenClauses));
        setProgress(100);
        setCurrentStep('Analysis complete (offline mode)');

        onAnalysisComplete({
          extractedText,
          sections: sections.map(s => ({
            title: s.title,
            content: s.content,
            riskLevel: s.riskLevel,
          })),
          hiddenClauses,
          confidence,
          processingTime,
          language: detectedLanguage,
          pageCount,
        });
      }

    } catch (err) {
      console.error('OCR Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [file, selectedLanguage, enablePreprocessing, onAnalysisComplete]);

  const extractSummary = (text: string): string => {
    const lines = text.split('\n');
    const overviewIndex = lines.findIndex(l => /overview|summary/i.test(l));
    if (overviewIndex !== -1) {
      const endIndex = lines.findIndex((l, i) => i > overviewIndex && l.startsWith('#'));
      return lines.slice(overviewIndex + 1, endIndex === -1 ? overviewIndex + 5 : endIndex)
        .join(' ')
        .trim()
        .substring(0, 500);
    }
    return text.substring(0, 300) + '...';
  };

  const extractListFromMarkdown = (text: string, keywords: string[]): string[] => {
    const items: string[] = [];
    const lines = text.split('\n');
    
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'i');
      const startIndex = lines.findIndex(line => regex.test(line));
      
      if (startIndex !== -1) {
        for (let i = startIndex; i < Math.min(startIndex + 15, lines.length); i++) {
          const line = lines[i].trim();
          if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
            const item = line.replace(/^[-•*\d.]\s*/, '').trim();
            if (item && !items.includes(item) && item.length > 5) {
              items.push(item);
            }
          }
        }
      }
    }
    
    return items.slice(0, 5);
  };

  const createFallbackAnalysis = (text: string, hiddenClauses: any[]): DocumentAnalysis => {
    return {
      summary: "Document has been processed. Please review the extracted content for important terms.",
      keyPoints: [
        "Document contains terms and conditions",
        "Review all sections carefully",
        "Pay attention to highlighted clauses",
      ],
      riskFactors: hiddenClauses.filter(c => c.severity === 'high').map(c => c.clause.substring(0, 100)),
      benefits: ["Standard document protections apply", "Review coverage details"],
      hiddenClauses: hiddenClauses.map(c => `${c.category}: ${c.clause.substring(0, 80)}...`),
      recommendations: [
        "Read the entire document carefully",
        "Pay attention to penalty and fee sections",
        "Review cancellation and renewal terms",
      ],
      riskScore: 50 + hiddenClauses.filter(c => c.severity === 'high').length * 10,
      riskLevel: hiddenClauses.filter(c => c.severity === 'high').length > 2 ? 'high' : 'medium',
    };
  };

  const formatTime = (ms: number) => ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  
  const languages = enhancedOCRService.getSupportedLanguages();

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary" />
            <span>Smart Document Analysis</span>
          </div>
          {!isProcessing && !extractionResult && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="w-4 h-4 mr-1" />
              Settings
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && !extractionResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-muted rounded-lg space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 rounded border border-border bg-background"
                  >
                    <option value="auto">Auto-detect</option>
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="preprocessing"
                    checked={enablePreprocessing}
                    onChange={(e) => setEnablePreprocessing(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="preprocessing" className="text-sm">
                    Enable image preprocessing
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial State */}
        {!extractionResult && !isProcessing && (
          <div className="text-center space-y-4">
            <div className="p-6 border-2 border-dashed border-border rounded-lg">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Ready to Analyze</h3>
              <p className="text-muted-foreground mb-4">
                File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                {file.type.includes('pdf') && (
                  <Badge variant="secondary">
                    <FileText className="w-3 h-3 mr-1" />
                    PDF.js
                  </Badge>
                )}
                {file.type.includes('image') && (
                  <Badge variant="secondary">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Tesseract OCR
                  </Badge>
                )}
                <Badge variant="secondary">
                  <Globe className="w-3 h-3 mr-1" />
                  {selectedLanguage === 'auto' ? 'Auto-detect' : languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}
                </Badge>
              </div>
              <Button onClick={startOCRAnalysis} disabled={isProcessing} size="lg">
                <Search className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{currentStep}</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">{progress}% complete</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {extractionResult && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Confidence Warning */}
            {confidenceWarning && !confidenceWarning.isReliable && (
              <Alert className="border-warning/50 bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning">
                  <strong>{confidenceWarning.warning}</strong>
                  <br />
                  {confidenceWarning.recommendation}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            <Alert className="border-success/50 bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Document analyzed with {extractionResult.confidence.toFixed(1)}% confidence 
                in {formatTime(extractionResult.processingTime)}
                {extractionResult.pageCount && ` • ${extractionResult.pageCount} pages`}
                {extractionResult.language && extractionResult.language !== 'eng' && ` • ${extractionResult.language.toUpperCase()}`}
              </AlertDescription>
            </Alert>

            {/* Risk Score Card */}
            {analysis.riskScore !== undefined && (
              <Card className={`border-2 ${
                analysis.riskLevel === 'high' ? 'border-destructive/50 bg-destructive/5' :
                analysis.riskLevel === 'medium' ? 'border-warning/50 bg-warning/5' :
                'border-success/50 bg-success/5'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Risk Assessment</p>
                      <p className="text-2xl font-bold">{analysis.riskScore}/100</p>
                    </div>
                    <Badge variant={
                      analysis.riskLevel === 'high' ? 'destructive' :
                      analysis.riskLevel === 'medium' ? 'default' : 'secondary'
                    } className="text-lg px-4 py-1">
                      {analysis.riskLevel?.toUpperCase()} RISK
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>

            {/* Benefits */}
            {analysis.benefits.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-success">
                    <ThumbsUp className="w-4 h-4" />
                    Key Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Risk Factors */}
            {analysis.riskFactors.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <ThumbsDown className="w-4 h-4" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.riskFactors.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Hidden Clauses */}
            {analysis.hiddenClauses.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    Important Clauses to Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.hiddenClauses.map((clause, i) => (
                      <li key={i} className="p-2 bg-warning/10 border-l-4 border-warning rounded text-sm">
                        {clause}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-primary">
                    <Zap className="w-4 h-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Processing Time</p>
                  <p className="font-semibold">{formatTime(extractionResult.processingTime)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-semibold">{extractionResult.confidence.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Text Length</p>
                  <p className="font-semibold">{extractionResult.text.length.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default OCRAnalysis;
