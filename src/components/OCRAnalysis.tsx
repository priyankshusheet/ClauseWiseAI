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

interface Insights {
  proposal: string;
  pros: string[];
  cons: string[];
  hiddenClauses: string[];
  error?: string;
}

const OCRAnalysis: React.FC<OCRAnalysisProps> = ({ file, onAnalysisComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [simpleSummary, setSimpleSummary] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<Insights | null>(null);

  const [hiddenClauses, setHiddenClauses] = useState<string[]>([]);
  const [insightError, setInsightError] = useState<string | null>(null);

  const startOCRAnalysis = async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('');
    setAiInsights(null);
    setInsightError(null);

    try {
      const ocrService = OCRService.getInstance();
      
      // Step 1: Extract text
      setCurrentStep('Extracting text from document...');
      setProgress(20);
      const result = await ocrService.processDocument(file);
      setOcrResult(result);
      setProgress(40);
      
      // Step 2: Call AI for proposal, pros, cons, hidden clauses, etc.
      setCurrentStep('Summarizing document...');
      setProgress(60);

      const analysisData = {
        fileName: file.name,
        fileType: file.type,
        extractedText: result.text,
        ocrConfidence: result.confidence,
        analysisType: 'breakdown'
      };

      let aiResult: Insights = {
        proposal: '',
        pros: [],
        cons: [],
        hiddenClauses: [],
      };

      try {
        // Call custom AI summary endpoint
        // We'll use the existing function and parse its response for our keys.
        const { data, error } = await supabase.functions.invoke('document-analysis', { body: analysisData });
        if (error) {
          throw error;
        }

        // Try to parse results into proposal, pros/cons, hidden clauses
        // For maximum robustness, we heuristically extract these fields.
        let proposal = '';
        let pros: string[] = [];
        let cons: string[] = [];
        let detectedClauses: string[] = [];

        // Try to extract as much as possible based on field keys or text
        if (typeof data === "object" && data !== null) {
          if (data.summary) proposal = data.summary;
          if (Array.isArray(data.findings)) {
            // Heuristically split findings into pros/cons
            const proList: string[] = [];
            const conList: string[] = [];
            (data.findings as string[]).forEach((item: string) => {
              // Treat findings with "no issues"/"standard"/"favorable"/"simple"/"clear" as pros
              if (
                /no\s+issues|standard|favorable|simple|clear|well\-defined|transparent|easy|no additional/i.test(item)
              ) {
                proList.push(item);
              } else {
                conList.push(item);
              }
            });
            pros = proList;
            cons = conList;
            detectedClauses = data.hiddenClauses || data.issues || [];
            // If no explicit hidden clauses, treat "conList" as hidden clauses.
            if (!detectedClauses.length) detectedClauses = conList;
          }
        }

        // Fallback heuristics
        if (!proposal && typeof data.summary === "string")
          proposal = data.summary;
        if (!pros.length && Array.isArray(data.pros))
          pros = data.pros;
        if (!cons.length && Array.isArray(data.cons))
          cons = data.cons;
        if (!detectedClauses.length && Array.isArray(data.hiddenClauses))
          detectedClauses = data.hiddenClauses;

        aiResult = { proposal, pros, cons, hiddenClauses: detectedClauses };
      } catch (err: any) {
        setInsightError("Could not analyze document with AI. Raw OCR text may be shown instead.");
        aiResult = {
          proposal: '',
          pros: [],
          cons: [],
          hiddenClauses: [],
          error: String(err.message || err)
        };
      }

      setAiInsights(aiResult);
      setProgress(90);

      // Continue with section/hidden clause detection as before
      setCurrentStep('Identifying document sections...');
      setProgress(95);
      const documentSections = ocrService.identifyDocumentSections(result.text);
      setSections(documentSections);

      setCurrentStep('Analysis complete!');
      setProgress(100);

      onAnalysisComplete({
        extractedText: result.text,
        sections: documentSections,
        hiddenClauses: aiResult.hiddenClauses,
        confidence: result.confidence,
        processingTime: result.processingTime
      });
    } catch (error) {
      console.error('OCR Analysis failed:', error);
      setCurrentStep('Analysis failed');
      setInsightError('Failed to complete OCR analysis.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSimpleSummary = (fullText: string): string => {
    if (!fullText) return "No text could be extracted from this document.";

    // Take first ~3 sentences/lines, filter out boilerplate/legal headers
    const lines = fullText
      .replace(/\r/g, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 20); // Ignore very short lines
    const summaryCandidates = lines.slice(0, 3);
    let summary = summaryCandidates.join(' ');
    if (summary.length > 450) summary = summary.substring(0, 450) + '...';
    if (!summary) summary = "Couldn't extract a simple summary from this document.";
    return "In simple terms: " + summary;
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

            {/* --- AI SIMPLE LANGUAGE OUTPUT --- */}
            {aiInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>What does this document say?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiInsights.proposal && (
                    <div>
                      <h4 className="font-semibold mb-1">Proposal</h4>
                      <p className="text-gray-800">{aiInsights.proposal}</p>
                    </div>
                  )}
                  {!!aiInsights.pros?.length && (
                    <div>
                      <h4 className="font-semibold mb-1 text-green-700">Pros</h4>
                      <ul className="list-disc pl-5 text-green-900">
                        {aiInsights.pros.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!!aiInsights.cons?.length && (
                    <div>
                      <h4 className="font-semibold mb-1 text-red-700">Cons</h4>
                      <ul className="list-disc pl-5 text-red-900">
                        {aiInsights.cons.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!!aiInsights.hiddenClauses?.length && (
                    <div>
                      <h4 className="font-semibold mb-1 text-orange-600">Potential Hidden Clauses</h4>
                      <ul className="list-disc pl-5 text-orange-900">
                        {aiInsights.hiddenClauses.map((clause, i) => (
                          <li key={i}>{clause}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.error && (
                    <p className="text-sm text-red-600 mt-2">{aiInsights.error}</p>
                  )}
                  {insightError && (
                    <p className="text-sm text-red-500">{insightError}</p>
                  )}
                </CardContent>
              </Card>
            )}

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
