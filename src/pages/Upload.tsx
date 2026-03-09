import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2, Eye, Download, Bookmark, History, Search, Zap, Shield, LogIn } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import OCRAnalysis, { OCRAnalysisResult } from '@/components/OCRAnalysis';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { useFileValidation } from '@/hooks/useFileValidation';
import { FadeIn } from '@/components/PageTransition';
import { useTrialUsage } from '@/hooks/useTrialUsage';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocalOCRResult {
  extractedText: string;
  sections: any[];
  hiddenClauses: { clause: string; category: string; severity: string }[] | string[];
  confidence: number;
  processingTime: number;
  language?: string;
  documentType?: string;
  pageCount?: number;
  structuredAnalysis?: any;
}

const UploadPage = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<LocalOCRResult | null>(null);
  const [showOCR, setShowOCR] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveAnalysis, toggleSaved } = useAnalysisHistory();
  const { validateWithToast } = useFileValidation();
  const { canAnalyzeDocument, remainingDocuments, recordDocumentAnalysis, limits } = useTrialUsage();

  const handleDragEvents = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); },
    onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) processFileSelection(files[0]);
    }
  };

  const processFileSelection = async (file: File) => {
    const isValid = await validateWithToast(file);
    if (isValid) {
      setSelectedFile(file);
      setOcrResult(null);
      setSavedAnalysisId(null);
      toast({ title: "File accepted", description: `Starting analysis of ${file.name}...` });
      
      // Auto-start analysis immediately
      if (!user && !canAnalyzeDocument) {
        toast({ title: "Trial Limit Reached", description: "Please sign in to continue.", variant: "destructive" });
        setShowOCR(false);
        return;
      }
      setShowOCR(true);
    }
  };

  const handleOCRComplete = async (result: OCRAnalysisResult) => {
    const localResult: LocalOCRResult = { ...result };
    setOcrResult(localResult);

    if (!user) recordDocumentAnalysis();

    const sanitizeFileNameForStorage = (name: string) =>
      name.replace(/[^a-zA-Z0-9._-]+/g, "_");

    // Auto-save to history
    if (user && selectedFile && result.structuredAnalysis) {
      setIsSaving(true);
      const sa = result.structuredAnalysis;

      try {
        const savedRecord = await saveAnalysis({
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          risk_score: sa.riskScore || 50,
          risk_level: sa.riskLevel || 'medium',
          analysis_summary: sa.summary || 'Analysis complete',
          analysis_result: sa as unknown as Record<string, unknown>,
          ocr_result: result as unknown as Record<string, unknown>,
          is_saved: false,
        });

        if (savedRecord) {
          setSavedAnalysisId(savedRecord.id);

          // Attach original file to the saved analysis so Analysis History can render the PDF annotator.
          // Stored as: documents/{user_id}/{analysis_id}/{fileName}
          try {
            const storageFileName = sanitizeFileNameForStorage(selectedFile.name);
            const storagePath = `${user.id}/${savedRecord.id}/${storageFileName}`;

            const { error: uploadError } = await supabase.storage
              .from('documents')
              .upload(storagePath, selectedFile, {
                upsert: true,
                contentType: selectedFile.type || undefined,
              });

            if (uploadError) throw uploadError;

            const analysisWithSourceFile = {
              ...(sa as Record<string, unknown>),
              sourceFile: {
                bucket: 'documents',
                path: storagePath,
                originalName: selectedFile.name,
                mimeType: selectedFile.type,
                size: selectedFile.size,
              },
            };

            const { error: updateError } = await supabase
              .from('document_analyses')
              .update({ analysis_result: analysisWithSourceFile } as any)
              .eq('id', savedRecord.id);

            if (updateError) throw updateError;
          } catch (e) {
            console.error('[Upload] Failed to attach original file to analysis:', e);
            toast({
              title: 'Saved, but PDF viewer unavailable',
              description: 'We saved the analysis, but could not attach the original PDF for inline highlights.',
              variant: 'destructive',
            });
          }
        }
      } finally {
        setIsSaving(false);
      }
    }

    toast({ title: "Analysis Complete", description: `Analyzed with ${result.confidence.toFixed(0)}% confidence` });
  };

  const handleDiscussDocument = () => {
    if (selectedFile && ocrResult) {
      const documentContext = {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        extractedText: ocrResult.extractedText,
        riskScore: ocrResult.structuredAnalysis?.riskScore,
        riskLevel: ocrResult.structuredAnalysis?.riskLevel,
        ocrResult: {
          extractedText: ocrResult.extractedText,
          confidence: ocrResult.confidence,
          sections: ocrResult.sections,
          hiddenClauses: ocrResult.hiddenClauses,
        },
        analysisResult: ocrResult.structuredAnalysis,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('documentContext', JSON.stringify(documentContext));
      navigate('/chat');
      toast({ title: "Document loaded in chat", description: "You can now discuss this document with full context." });
    }
  };

  const handleSaveToggle = async () => {
    if (savedAnalysisId) {
      await toggleSaved(savedAnalysisId, true);
      toast({ title: "Analysis saved", description: "Added to your saved items." });
    }
  };

  const downloadAnalysisReport = async () => {
    if (!ocrResult?.structuredAnalysis || !selectedFile) return;
    const sa = ocrResult.structuredAnalysis;

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      const addWrappedText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont(undefined as any, isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (yPosition > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); yPosition = margin; }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 3;
      };

      // Header
      doc.setFillColor(67, 56, 202);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined as any, 'bold');
      doc.text('ClauseWise - Document Analysis Report', margin, 20);
      yPosition = 45;
      doc.setTextColor(0, 0, 0);

      addWrappedText('Document Information', 14, true);
      addWrappedText(`File Name: ${selectedFile.name}`);
      addWrappedText(`Analysis Date: ${new Date().toLocaleDateString()}`);
      addWrappedText(`Risk Score: ${sa.riskScore}/100 (${sa.riskLevel?.toUpperCase()} RISK)`);
      yPosition += 5;

      addWrappedText('Executive Summary', 14, true);
      addWrappedText(sa.summary || 'N/A');
      yPosition += 5;

      if (sa.clauses?.length) {
        addWrappedText('Key Clauses', 14, true);
        sa.clauses.forEach((c: any, i: number) => {
          const riskLabel = c.riskLevel?.toUpperCase() || 'N/A';
          addWrappedText(`${i + 1}. [${riskLabel}] ${c.category}: ${c.text?.substring(0, 200)}`, 9);
          addWrappedText(`   → ${c.explanation}`, 9);
        });
      }

      if (sa.recommendations?.length) {
        yPosition += 5;
        addWrappedText('Recommendations', 14, true);
        sa.recommendations.forEach((r: any, i: number) => {
          addWrappedText(`${i + 1}. [${r.priority?.toUpperCase()}] ${r.action} — ${r.reason}`, 9);
        });
      }

      const finalY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by ClauseWise', margin, finalY);

      doc.save(`ClauseWise_${selectedFile.name.replace(/\.[^/.]+$/, "")}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: "Report downloaded" });
    } catch (error) {
      console.error('PDF error:', error);
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const features = [
    { icon: Search, title: 'Unified OCR + AI', description: 'Combined multimodal analysis extracts and analyzes in one step.' },
    { icon: Zap, title: 'Structured Results', description: 'Get color-coded clauses, risk factors, and financial implications.' },
    { icon: Shield, title: 'Hidden Clause Detection', description: 'AI identifies problematic clauses with severity ratings.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              AI-Powered Document Analysis
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload any financial document for comprehensive multimodal analysis with color-coded risk assessment
            </p>
          </div>

          {!user && (
            <Alert className="mb-6 bg-primary/5 border-primary/20">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-foreground">
                  <strong>Free Trial:</strong> {remainingDocuments} of {limits.documents} analyses remaining.
                </span>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="ml-4">
                    <LogIn className="w-4 h-4 mr-2" />Sign in for unlimited
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Upload className="w-5 h-5" />
                <span>Upload & Analyze</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver ? 'border-primary bg-primary/5'
                    : selectedFile ? 'border-secondary bg-secondary/5'
                    : 'border-border hover:border-primary'
                }`}
                {...handleDragEvents}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 text-secondary mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{selectedFile.name}</h3>
                      <p className="text-muted-foreground">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      {showOCR && <p className="text-sm text-primary mt-1">Analysis in progress...</p>}
                    </div>
                    <Button variant="outline" onClick={() => { setSelectedFile(null); setShowOCR(false); setOcrResult(null); }}>
                      Select Different File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Upload Document</h3>
                      <p className="text-muted-foreground">Drag and drop or click to browse</p>
                    </div>
                    <Button
                      onClick={() => document.getElementById('file-input')?.click()}
                      disabled={!user && !canAnalyzeDocument}
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
                    <p className="text-sm text-muted-foreground">
                      Supported: PDF, DOC, DOCX, TXT, JPG, PNG (Maximum 10MB)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Component - unified single step */}
          {showOCR && selectedFile && (
            <div className="mb-8">
              <OCRAnalysis file={selectedFile} onAnalysisComplete={handleOCRComplete} />
            </div>
          )}

          {/* Action Buttons after analysis */}
          {ocrResult && (
            <Card className="mb-8">
              <CardContent className="py-6">
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={handleDiscussDocument}>
                    <FileText className="w-4 h-4 mr-2" />
                    Discuss This Document
                  </Button>
                  <Button variant="outline" onClick={downloadAnalysisReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                  {savedAnalysisId && (
                    <Button variant="outline" onClick={handleSaveToggle}>
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save Analysis
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => navigate('/history')}>
                    <History className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full card-interactive border-border">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UploadPage;
