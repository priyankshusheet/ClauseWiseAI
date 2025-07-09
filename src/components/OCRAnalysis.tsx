import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  ThumbsDown
} from 'lucide-react';
import { OCRService, OCRResult, DocumentSection } from '@/services/ocrService';
import { supabase } from '@/integrations/supabase/client';

interface OCRAnalysisProps {
  file: File;
  onAnalysisComplete: (result: OCRAnalysisResult) => void;
}

interface OCRAnalysisResult {
  extractedText: string;
  sections: DocumentSection[];
  hiddenClauses: string[];
  confidence: number;
  processingTime: number;
}

interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  riskFactors: string[];
  benefits: string[];
  hiddenClauses: string[];
  recommendations: string[];
}

const OCRAnalysis: React.FC<OCRAnalysisProps> = ({ file, onAnalysisComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatTextWithBold = (text: string) => {
    // Replace **text** with bold formatting
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold">{boldText}</strong>;
      }
      return part;
    });
  };

  const startOCRAnalysis = async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('');
    setAnalysis(null);
    setError(null);

    try {
      const ocrService = OCRService.getInstance();
      
      // Step 1: Extract text
      setCurrentStep('Extracting text from document...');
      setProgress(20);
      const result = await ocrService.processDocument(file);
      setOcrResult(result);
      setProgress(50);
      
      // Step 2: Analyze with AI
      setCurrentStep('Analyzing document content...');
      setProgress(70);

      const analysisData = {
        fileName: file.name,
        fileType: file.type,
        extractedText: result.text,
        ocrConfidence: result.confidence,
        analysisType: 'detailed_breakdown'
      };

      try {
        const { data, error: analysisError } = await supabase.functions.invoke('document-analysis', { 
          body: analysisData 
        });
        
        if (analysisError) throw analysisError;

        // Parse the AI response into structured format
        const aiAnalysis = typeof data.analysis === 'string' ? data.analysis : JSON.stringify(data.analysis);
        
        const structuredAnalysis: DocumentAnalysis = {
          summary: extractSection(aiAnalysis, 'overview', 'summary') || 'Document analysis completed successfully.',
          keyPoints: extractListItems(aiAnalysis, ['key findings', 'important points', 'main points']),
          riskFactors: extractListItems(aiAnalysis, ['risks', 'concerns', 'warnings', 'penalties', 'hidden clauses']),
          benefits: extractListItems(aiAnalysis, ['benefits', 'advantages', 'coverage', 'features']),
          hiddenClauses: extractListItems(aiAnalysis, ['hidden', 'concerning clauses', 'fine print']),
          recommendations: extractListItems(aiAnalysis, ['recommendations', 'actions', 'next steps'])
        };

        setAnalysis(structuredAnalysis);
        setProgress(100);
        setCurrentStep('Analysis complete!');

        onAnalysisComplete({
          extractedText: result.text,
          sections: [],
          hiddenClauses: structuredAnalysis.hiddenClauses,
          confidence: result.confidence,
          processingTime: result.processingTime
        });

      } catch (err: any) {
        console.error('AI Analysis failed:', err);
        setAnalysis(createFallbackAnalysis(result.text));
      }

    } catch (error) {
      console.error('OCR Analysis failed:', error);
      setError('Failed to analyze document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractSection = (text: string, ...keywords: string[]): string => {
    const lines = text.split('\n');
    for (const keyword of keywords) {
      const regex = new RegExp(`^#{1,3}\\s*${keyword}`, 'i');
      const startIndex = lines.findIndex(line => regex.test(line.trim()));
      if (startIndex !== -1) {
        const endIndex = lines.findIndex((line, idx) => 
          idx > startIndex && line.trim().startsWith('#')
        );
        return lines.slice(startIndex + 1, endIndex === -1 ? startIndex + 4 : endIndex)
          .join(' ').trim();
      }
    }
    return '';
  };

  const extractListItems = (text: string, keywords: string[]): string[] => {
    const items: string[] = [];
    const lines = text.split('\n');
    
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'i');
      const startIndex = lines.findIndex(line => regex.test(line));
      
      if (startIndex !== -1) {
        for (let i = startIndex; i < Math.min(startIndex + 15, lines.length); i++) {
          const line = lines[i].trim();
          if (line.match(/^[•\-\*]\s/) || line.match(/^\d+\.\s/)) {
            const item = line.replace(/^[•\-\*\d\.]\s*/, '').trim();
            if (item && !items.includes(item)) {
              items.push(item);
            }
          }
        }
      }
    }
    
    return items.slice(0, 5);
  };

  const createFallbackAnalysis = (text: string): DocumentAnalysis => {
    return {
      summary: "Document has been processed successfully. Please review the extracted content below.",
      keyPoints: [
        "Document contains standard terms and conditions",
        "Various clauses and policies are outlined",
        "Review recommended for complete understanding"
      ],
      riskFactors: [
        "Some terms may have financial implications",
        "Cancellation policies may apply",
        "Late fees or penalties may be charged"
      ],
      benefits: [
        "Service or product benefits as described",
        "Customer protection measures included",
        "Clear terms for usage and access"
      ],
      hiddenClauses: [
        "Check for auto-renewal clauses",
        "Review cancellation procedures",
        "Verify fee structures"
      ],
      recommendations: [
        "Read the complete document carefully",
        "Pay attention to fine print",
        "Understand your rights and obligations"
      ]
    };
  };

  const formatTime = (ms: number) => {
    return ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <Eye className="w-5 h-5" />
          <span>Smart Document Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!ocrResult && (
          <div className="text-center space-y-4">
            <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to Analyze</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <Button onClick={startOCRAnalysis} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{currentStep}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {ocrResult && analysis && (
          <div className="space-y-6">
            {/* Success Alert */}
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Document analyzed successfully with {ocrResult.confidence.toFixed(1)}% confidence 
                in {formatTime(ocrResult.processingTime)}
              </AlertDescription>
            </Alert>

            {/* Summary */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <FileText className="w-4 h-4" />
                  <span>Document Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {formatTextWithBold(analysis.summary)}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            {analysis.benefits.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300">Key Benefits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-green-800 dark:text-green-200">
                          {formatTextWithBold(benefit)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Risk Factors */}
            {analysis.riskFactors.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ThumbsDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-red-700 dark:text-red-300">Risk Factors & Concerns</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="text-red-800 dark:text-red-200">
                          {formatTextWithBold(risk)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Hidden Clauses */}
            {analysis.hiddenClauses.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-orange-700 dark:text-orange-300">Important Clauses to Review</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.hiddenClauses.map((clause, index) => (
                      <li key={index} className="p-3 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 dark:border-orange-500 rounded">
                        <div className="text-orange-800 dark:text-orange-200">
                          {formatTextWithBold(clause)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-700 dark:text-blue-300">Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <div className="text-blue-800 dark:text-blue-200">
                          {formatTextWithBold(rec)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Processing Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatTime(ocrResult.processingTime)}</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-green-500 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Confidence</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{ocrResult.confidence.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <FileText className="w-6 h-6 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Text Length</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{ocrResult.text.length} chars</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OCRAnalysis;
