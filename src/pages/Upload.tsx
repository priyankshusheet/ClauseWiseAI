
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
  riskScore: number;
  riskLevel: string;
  findings: string[];
  summary: string;
}

const UploadPage = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
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

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('document-analysis', {
        body: {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;

      setAnalysisResult(data);
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
      title: 'Advanced Scanning',
      description: 'Detects hidden fees, auto-renewal clauses, and potentially risky terms.',
      bgColor: 'bg-blue-100'
    },
    {
      icon: '⚡',
      title: 'Real-time Analysis',
      description: 'Get comprehensive analysis results within seconds of upload.',
      bgColor: 'bg-green-100'
    },
    {
      icon: '🛡️',
      title: 'Risk Evaluation',
      description: 'Comprehensive risk scoring to help you make informed decisions.',
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
              Document Analysis Platform
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload insurance policies, credit agreements, or financial documents for comprehensive analysis
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>File Upload</span>
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
                      <Button onClick={startAnalysis} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze Document'
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedFile(null)}>
                        Select Different File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
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
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={(e) => e.target.files?.[0] && processFileSelection(e.target.files[0])}
                    />
                    <p className="text-sm text-gray-500">
                      Supported: PDF, DOC, DOCX, TXT (Maximum 10MB)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {analysisResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Analysis Results</span>
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
                        {analysisResult.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                      Important Findings
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.findings.map((finding, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span className="text-gray-700">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Executive Summary</h3>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-700">{analysisResult.summary}</p>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 pt-4">
                    <Button onClick={() => window.location.href = '/chat'}>
                      Discuss This Document
                    </Button>
                    <Button variant="outline">
                      Compare Similar Documents
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
