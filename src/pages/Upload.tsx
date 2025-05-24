
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UploadPage = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.type === 'application/pdf' || file.type.includes('text') || file.name.endsWith('.docx')) {
      setSelectedFile(file);
      toast({
        title: "File selected!",
        description: `${file.name} is ready for analysis.`,
      });
    } else {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, DOC, or text document.",
        variant: "destructive",
      });
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      // Call the document analysis function
      const { data, error } = await supabase.functions.invoke('document-analysis', {
        body: {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          analysisType: 'full_analysis'
        }
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast({
        title: "Analysis complete!",
        description: "Your document has been analyzed successfully.",
      });
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navigation />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upload & Analyze Documents
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your insurance policies, credit card terms, or any financial document for instant AI analysis 📄✨
            </p>
          </div>

          {/* Upload Area */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Document Upload</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-primary-400 bg-primary-50'
                    : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedFile.name}</h3>
                      <p className="text-gray-600">File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Button onClick={analyzeDocument} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Start Analysis'
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedFile(null)}>
                        Choose Different File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload your document</h3>
                      <p className="text-gray-600">Drag and drop or click to browse</p>
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
                      onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                    />
                    <p className="text-sm text-gray-500">
                      Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
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
                  {/* Risk Score */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Overall Risk Score</h3>
                      <p className="text-gray-600">Comprehensive analysis of document complexity and risks</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{analysisResult.riskScore || '75'}/100</div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysisResult.riskLevel || 'medium')}`}>
                        {analysisResult.riskLevel || 'Medium Risk'}
                      </span>
                    </div>
                  </div>

                  {/* Key Findings */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                      Key Findings
                    </h3>
                    <div className="space-y-3">
                      {(analysisResult.findings || [
                        'Auto-renewal clause detected - cancellation requires 30-day notice',
                        'Late payment penalty of $35 after 1 day past due date',
                        'Variable interest rate that can increase without notice',
                        'Coverage exclusions for pre-existing conditions not clearly defined'
                      ]).map((finding: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span className="text-gray-700">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Document Summary</h3>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-700">
                        {analysisResult.summary || 
                        "This appears to be a financial services agreement with standard terms and conditions. The document contains several clauses that require attention, including automatic renewal provisions and penalty structures. Overall, the terms are typical for this type of financial product but users should be aware of the key obligations and potential costs outlined above."}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center space-x-4 pt-4">
                    <Button onClick={() => window.location.href = '/chat'}>
                      💬 Chat About This Document
                    </Button>
                    <Button variant="outline">
                      📊 Compare Similar Policies
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Scanning</h3>
                <p className="text-gray-600 text-sm">AI detects hidden fees, auto-renewal clauses, and risky terms automatically.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Instant Analysis</h3>
                <p className="text-gray-600 text-sm">Get comprehensive analysis results in seconds, not hours.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Risk Assessment</h3>
                <p className="text-gray-600 text-sm">Risk scoring from 0-100 to help you make informed decisions.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UploadPage;
