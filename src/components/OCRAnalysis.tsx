
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
  Search
} from 'lucide-react';
import { OCRService, OCRResult, DocumentSection } from '@/services/ocrService';

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

const OCRAnalysis: React.FC<OCRAnalysisProps> = ({ file, onAnalysisComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [hiddenClauses, setHiddenClauses] = useState<string[]>([]);

  const startOCRAnalysis = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const ocrService = OCRService.getInstance();
      
      // Step 1: Extract text
      setCurrentStep('Extracting text from document...');
      setProgress(20);
      
      const result = await ocrService.processDocument(file);
      setOcrResult(result);
      setProgress(40);
      
      // Step 2: Identify sections
      setCurrentStep('Identifying document sections...');
      setProgress(60);
      
      const documentSections = ocrService.identifyDocumentSections(result.text);
      setSections(documentSections);
      setProgress(80);
      
      // Step 3: Analyze for hidden clauses
      setCurrentStep('Analyzing for hidden clauses...');
      setProgress(90);
      
      const foundHiddenClauses = ocrService.analyzeForHiddenClauses(result.text);
      setHiddenClauses(foundHiddenClauses);
      setProgress(100);
      
      setCurrentStep('Analysis complete!');
      
      // Call the completion handler
      onAnalysisComplete({
        extractedText: result.text,
        sections: documentSections,
        hiddenClauses: foundHiddenClauses,
        confidence: result.confidence,
        processingTime: result.processingTime
      });
      
    } catch (error) {
      console.error('OCR Analysis failed:', error);
      setCurrentStep('Analysis failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (ms: number) => {
    return ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>OCR Document Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!ocrResult && (
          <div className="text-center space-y-4">
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Ready to Analyze</h3>
              <p className="text-gray-600 mb-4">
                File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <Button onClick={startOCRAnalysis} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Start OCR Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">{currentStep}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {ocrResult && (
          <div className="space-y-6">
            {/* Extraction Results */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Text extraction completed with {ocrResult.confidence.toFixed(1)}% confidence 
                in {formatTime(ocrResult.processingTime)}
              </AlertDescription>
            </Alert>

            {/* Document Sections */}
            {sections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Identified Document Sections ({sections.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sections.slice(0, 5).map((section, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-900">{section.title}</h4>
                          <span className="text-sm text-blue-600">{section.confidence}% confidence</span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">{section.content}</p>
                      </div>
                    ))}
                    {sections.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{sections.length - 5} more sections identified
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hidden Clauses */}
            {hiddenClauses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>Potential Hidden Clauses ({hiddenClauses.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hiddenClauses.slice(0, 3).map((clause, index) => (
                      <div key={index} className="p-3 bg-red-50 border-l-4 border-red-400">
                        <p className="text-sm text-red-800">{clause}</p>
                      </div>
                    ))}
                    {hiddenClauses.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{hiddenClauses.length - 3} more potential issues found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Processing Time</p>
                  <p className="font-semibold">{formatTime(ocrResult.processingTime)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="font-semibold">{ocrResult.confidence.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Text Length</p>
                  <p className="font-semibold">{ocrResult.text.length} chars</p>
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
