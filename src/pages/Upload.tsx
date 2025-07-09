
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2, Eye } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import OCRAnalysis from '@/components/OCRAnalysis';
import { Link } from 'react-router-dom';

interface AnalysisResult {
  riskScore: number;
  riskLevel: string;
  analysis: string;
  summary: string;
}

interface OCRAnalysisResult {
  extractedText: string;
  sections: any[];
  hiddenClauses: string[];
  confidence: number;
  processingTime: number;
}

const UploadPage = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRAnalysisResult | null>(null);
  const [showOCR, setShowOCR] = useState(false);
  const { toast } = useToast();

  const handleDragEvents = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFileSelection(files[0]);
      }
    }
  };

  const processFileSelection = (file: File) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
    
    const isValidFile = allowedTypes.includes(file.type) || 
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (isValidFile) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setOcrResult(null);
      setShowOCR(false);
      toast({
        title: "File ready for analysis",
        description: `${file.name} has been selected successfully.`,
      });
    } else {
      toast({
        title: "Unsupported file format",
        description: "Please upload a PDF, DOC, or text document.",
        variant: "destructive",
      });
    }
  };

  const startOCRAnalysis = () => {
    setShowOCR(true);
  };

  const handleOCRComplete = (result: OCRAnalysisResult) => {
    setOcrResult(result);
    toast({
      title: "OCR Analysis Complete",
      description: `Extracted ${result.extractedText.length} characters with ${result.confidence.toFixed(1)}% confidence`,
    });
  };

  const formatTextWithBold = (text: string) => {
    // Replace **text** with bold formatting for display
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold">{boldText}</strong>;
      }
      return part;
    });
  };

  const startAIAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const analysisData = {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        analysisType: 'comprehensive',
        ...(ocrResult && {
          extractedText: ocrResult.extractedText,
          ocrConfidence: ocrResult.confidence,
          identifiedSections: ocrResult.sections.length,
          hiddenClausesCount: ocrResult.hiddenClauses.length
        })
      };

      const { data, error } = await supabase.functions.invoke('document-analysis', {
        body: analysisData
      });

      if (error) throw error;

      // Ensure we get proper risk assessment from the backend
      let processedResult = {
        riskScore: data.riskScore || 50,
        riskLevel: data.riskLevel || 'medium',
        analysis: data.analysis || 'Analysis completed successfully.',
        summary: data.summary || 'Document has been analyzed.'
      };

      // If risk score is still default, calculate based on content
      if (processedResult.riskScore === 50 && ocrResult) {
        if (ocrResult.hiddenClauses.length > 3) {
          processedResult.riskScore = 85;
          processedResult.riskLevel = 'high';
        } else if (ocrResult.hiddenClauses.length > 1) {
          processedResult.riskScore = 70;
          processedResult.riskLevel = 'medium';
        } else if (ocrResult.confidence < 80) {
          processedResult.riskScore = 65;
          processedResult.riskLevel = 'medium';
        } else {
          processedResult.riskScore = 35;
          processedResult.riskLevel = 'low';
        }
      }

      setAnalysisResult(processedResult);
      toast({
        title: "Analysis completed",
        description: "Your document has been thoroughly analyzed.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Unable to process the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskStyling = (riskLevel: string) => {
    const level = riskLevel?.toLowerCase();
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const features = [
    {
      icon: '🔍',
      title: 'Advanced OCR Scanning',
      description: 'Extract text from PDFs and images with high accuracy using state-of-the-art OCR technology.',
      bgColor: 'bg-blue-100'
    },
    {
      icon: '⚡',
      title: 'Real-time Analysis',
      description: 'Get comprehensive analysis results within seconds of upload with AI-powered insights.',
      bgColor: 'bg-green-100'
    },
    {
      icon: '🛡️',
      title: 'Hidden Clause Detection',
      description: 'Automatically identify potentially problematic clauses and terms that might be easily missed.',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              OCR-Powered Document Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload any document format for intelligent text extraction and comprehensive analysis of terms, conditions, and hidden clauses
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>File Upload & OCR Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                {...handleDragEvents}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedFile.name}</h3>
                      <p className="text-gray-600">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      {!showOCR && (
                        <Button onClick={startOCRAnalysis}>
                          <Eye className="w-4 h-4 mr-2" />
                          Start OCR Analysis
                        </Button>
                      )}
                      {ocrResult && (
                        <Button onClick={startAIAnalysis} disabled={isAnalyzing}>
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            'AI Analysis'
                          )}
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setSelectedFile(null)}>
                        Select Different File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload Document for OCR Analysis</h3>
                      <p className="text-gray-600">Drag and drop your file here or click to browse</p>
                    </div>
                    <Button
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="mx-auto"
                    >
                      Choose File
                    </Button>
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && processFileSelection(e.target.files[0])}
                    />
                    <p className="text-sm text-gray-500">
                      Supported: PDF, DOC, DOCX, TXT, JPG, PNG (Maximum 10MB)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* OCR Analysis Component */}
          {showOCR && selectedFile && (
            <div className="mb-8">
              <OCRAnalysis file={selectedFile} onAnalysisComplete={handleOCRComplete} />
            </div>
          )}

          {/* AI Analysis Results */}
          {analysisResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>AI Analysis Results</span>
                    {ocrResult && (
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        OCR Enhanced
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
                      <p className="text-gray-600">Overall document complexity and risk evaluation</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{analysisResult.riskScore}/100</div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskStyling(analysisResult.riskLevel)}`}>
                        {analysisResult.riskLevel.charAt(0).toUpperCase() + analysisResult.riskLevel.slice(1)} Risk
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Comprehensive Analysis</h3>
                    <div className="prose max-w-none">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {formatTextWithBold(analysisResult.analysis)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OCR-specific findings */}
                  {ocrResult && ocrResult.hiddenClauses.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-red-500" />
                        OCR-Detected Hidden Clauses
                      </h3>
                      <div className="space-y-3">
                        {ocrResult.hiddenClauses.slice(0, 3).map((clause, index) => (
                          <div key={index} className="p-3 bg-red-50 border-l-4 border-red-400 rounded-lg">
                            <span className="text-red-800 text-sm">{clause}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Executive Summary</h3>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-gray-700">{formatTextWithBold(analysisResult.summary)}</div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 pt-4">
                    <Link to="/chat">
                      <Button>
                        Discuss This Document
                      </Button>
                    </Link>
                    <Button variant="outline">
                      Download Analysis Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UploadPage;
