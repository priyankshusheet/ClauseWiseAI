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
  Settings2,
  DollarSign,
  Shield,
  Scale,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { enhancedOCRService } from '@/services/enhancedOCRService';
import { pdfService } from '@/services/pdfService';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import RiskScoreGauge from '@/components/RiskScoreGauge';

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
  structuredAnalysis?: any;
}

interface StructuredAnalysis {
  summary: string;
  documentType: string;
  riskScore: number;
  riskLevel: string;
  keyTerms: { term: string; value: string; importance: string }[];
  clauses: { text: string; category: string; riskLevel: string; explanation: string; clauseNumber?: string }[];
  riskFactors: { factor: string; severity: string; details: string }[];
  benefits: { benefit: string; details: string }[];
  financialImplications: { item: string; amount: string; frequency: string; impact: string }[];
  recommendations: { action: string; priority: string; reason: string }[];
  consumerRights: string[];
  extractedText: string;
}

const OCRAnalysis: React.FC<OCRAnalysisProps> = ({ file, onAnalysisComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysis, setAnalysis] = useState<StructuredAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [expandedClauses, setExpandedClauses] = useState<Record<number, boolean>>({});
  
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [enablePreprocessing, setEnablePreprocessing] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const fileToBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const startOCRAnalysis = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('');
    setAnalysis(null);
    setError(null);

    const startTime = Date.now();

    try {
      const fileType = file.type.toLowerCase();
      const isPDF = fileType.includes('pdf');
      const isImage = fileType.includes('image');
      const canUseMultimodal = isImage || (isPDF && file.size < 10 * 1024 * 1024);

      let extractedText = '';

      if (canUseMultimodal) {
        setCurrentStep('Preparing document for AI analysis...');
        setProgress(15);

        const base64Data = await fileToBase64(file);
        setProgress(30);
        setCurrentStep('Running unified OCR + AI analysis...');

        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-document', {
          body: {
            fileName: file.name,
            fileType: file.type,
            fileBase64: base64Data,
            fileMimeType: file.type,
          },
        });

        if (!analysisError && analysisData?.success) {
          setProgress(85);
          setCurrentStep('Processing results...');

          extractedText = analysisData.extractedText || '';
          const conf = analysisData.metadata?.ocrConfidence || 95;
          const pTime = analysisData.metadata?.processingTime || (Date.now() - startTime);
          
          setConfidence(conf);
          setProcessingTime(pTime);

          const structured: StructuredAnalysis = {
            summary: analysisData.summary || 'Document analyzed successfully.',
            documentType: analysisData.documentType || 'unknown',
            riskScore: analysisData.riskScore || 50,
            riskLevel: analysisData.riskLevel || 'medium',
            keyTerms: analysisData.keyTerms || [],
            clauses: analysisData.clauses || [],
            riskFactors: analysisData.riskFactors || [],
            benefits: analysisData.benefits || [],
            financialImplications: analysisData.financialImplications || [],
            recommendations: analysisData.recommendations || [],
            consumerRights: analysisData.consumerRights || [],
            extractedText,
          };

          setAnalysis(structured);
          setProgress(100);
          setCurrentStep('Analysis complete!');

          const sections = enhancedOCRService.identifyDocumentSections(extractedText);
          const hiddenClauses = enhancedOCRService.analyzeForHiddenClauses(extractedText);

          onAnalysisComplete({
            extractedText,
            sections: sections.map(s => ({ title: s.title, content: s.content, riskLevel: s.riskLevel })),
            hiddenClauses,
            confidence: conf,
            processingTime: pTime,
            language: selectedLanguage,
            documentType: structured.documentType,
            structuredAnalysis: structured,
          });

          setIsProcessing(false);
          return;
        }
      }

      // FALLBACK: Traditional OCR path
      setCurrentStep(isPDF ? 'Extracting text from PDF...' : 'Processing image with OCR...');
      setProgress(15);

      if (isPDF) {
        const pdfResult = await pdfService.extractTextWithFallback(file);
        extractedText = pdfResult.text;
        setConfidence(pdfResult.confidence);
        setProcessingTime(pdfResult.processingTime);
        setProgress(40);

        if (pdfResult.confidence < 50 || extractedText.length < 200) {
          setCurrentStep('Low confidence, applying OCR...');
          const ocrResult = await enhancedOCRService.extractTextFromImage(file, {
            language: selectedLanguage,
            preprocessing: enablePreprocessing ? { enhanceContrast: true, denoise: true, normalizeResolution: true } : {},
          });
          if (ocrResult.text.length > extractedText.length) {
            extractedText = ocrResult.text;
            setConfidence(ocrResult.confidence);
          }
        }
      } else if (isImage) {
        setProgress(20);
        const ocrResult = await enhancedOCRService.extractTextFromImage(file, {
          language: selectedLanguage === 'auto' ? 'auto' : selectedLanguage,
          preprocessing: enablePreprocessing ? { enhanceContrast: true, denoise: true, normalizeResolution: true } : {},
        });
        extractedText = ocrResult.text;
        setConfidence(ocrResult.confidence);
        setProcessingTime(ocrResult.processingTime);
      } else {
        extractedText = await file.text();
        setConfidence(100);
      }

      setProgress(50);
      setCurrentStep('Running AI analysis on extracted text...');

      // Send extracted text for structured analysis
      const { data: textAnalysis, error: textError } = await supabase.functions.invoke('analyze-document', {
        body: {
          fileName: file.name,
          fileType: file.type,
          extractedText,
          ocrConfidence: confidence,
        },
      });

      setProgress(85);

      if (!textError && textAnalysis?.success) {
        const structured: StructuredAnalysis = {
          summary: textAnalysis.summary || 'Document analyzed.',
          documentType: textAnalysis.documentType || 'unknown',
          riskScore: textAnalysis.riskScore || 50,
          riskLevel: textAnalysis.riskLevel || 'medium',
          keyTerms: textAnalysis.keyTerms || [],
          clauses: textAnalysis.clauses || [],
          riskFactors: textAnalysis.riskFactors || [],
          benefits: textAnalysis.benefits || [],
          financialImplications: textAnalysis.financialImplications || [],
          recommendations: textAnalysis.recommendations || [],
          consumerRights: textAnalysis.consumerRights || [],
          extractedText,
        };
        setAnalysis(structured);
      }

      setProgress(100);
      setCurrentStep('Analysis complete!');
      setProcessingTime(Date.now() - startTime);

      const sections = enhancedOCRService.identifyDocumentSections(extractedText);
      const hiddenClauses = enhancedOCRService.analyzeForHiddenClauses(extractedText);

      onAnalysisComplete({
        extractedText,
        sections: sections.map(s => ({ title: s.title, content: s.content, riskLevel: s.riskLevel })),
        hiddenClauses,
        confidence,
        processingTime: Date.now() - startTime,
        language: selectedLanguage,
        structuredAnalysis: analysis,
      });

    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [file, selectedLanguage, enablePreprocessing, onAnalysisComplete, fileToBase64, confidence, analysis]);

  const formatTime = (ms: number) => ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  
  const languages = enhancedOCRService.getSupportedLanguages();

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', badge: 'destructive' as const };
      case 'medium': return { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning', badge: 'default' as const };
      case 'low': return { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', badge: 'secondary' as const };
      case 'safe': return { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', badge: 'secondary' as const };
      default: return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', badge: 'outline' as const };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-destructive/15 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/15 text-warning border-warning/20';
      case 'low': return 'bg-primary/15 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'medium': return <DollarSign className="w-4 h-4 text-warning" />;
      default: return <DollarSign className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const toggleClause = (index: number) => {
    setExpandedClauses(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary" />
            <span>Smart Document Analysis</span>
          </div>
          {!isProcessing && !analysis && (
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings2 className="w-4 h-4 mr-1" />
              Settings
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && !analysis && (
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
                  <label htmlFor="preprocessing" className="text-sm">Enable image preprocessing</label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial State */}
        {!analysis && !isProcessing && (
          <div className="text-center space-y-4">
            <div className="p-6 border-2 border-dashed border-border rounded-lg">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Ready to Analyze</h3>
              <p className="text-muted-foreground mb-4">
                File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                {file.type.includes('pdf') && (
                  <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" />PDF</Badge>
                )}
                {file.type.includes('image') && (
                  <Badge variant="secondary"><ImageIcon className="w-3 h-3 mr-1" />Image</Badge>
                )}
                <Badge variant="secondary">
                  <Globe className="w-3 h-3 mr-1" />
                  {selectedLanguage === 'auto' ? 'Auto-detect' : languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}
                </Badge>
                <Badge variant="outline" className="text-primary border-primary/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Unified AI Analysis
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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

        {/* ===== STRUCTURED RESULTS ===== */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Success Banner */}
            <Alert className="border-success/50 bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Document analyzed with {confidence.toFixed(0)}% confidence in {formatTime(processingTime)}
              </AlertDescription>
            </Alert>

            {/* Risk Score Hero with Gauge */}
            <Card className={`border-2 ${getRiskColor(analysis.riskLevel).border} ${getRiskColor(analysis.riskLevel).bg}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-6">
                  <RiskScoreGauge
                    score={analysis.riskScore}
                    riskLevel={analysis.riskLevel}
                    size={140}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Risk Assessment</p>
                    <Badge variant={getRiskColor(analysis.riskLevel).badge} className="text-base px-4 py-1.5 mb-2">
                      {analysis.riskLevel?.toUpperCase()} RISK
                    </Badge>
                    {analysis.documentType && analysis.documentType !== 'unknown' && (
                      <p className="text-xs text-muted-foreground mt-2 capitalize">{analysis.documentType} Document</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {analysis.riskScore <= 30 ? 'This document appears generally safe.' :
                       analysis.riskScore <= 60 ? 'Some clauses need attention.' :
                       'Multiple high-risk clauses detected.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>

            {/* Key Terms */}
            {analysis.keyTerms && analysis.keyTerms.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    Key Terms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {analysis.keyTerms.map((kt, i) => (
                      <div key={i} className="flex items-start justify-between p-2.5 rounded-lg bg-muted/50 border border-border">
                        <div className="flex-1">
                          <span className="font-medium text-sm text-foreground">{kt.term}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{kt.value}</p>
                        </div>
                        <Badge variant={kt.importance === 'high' ? 'destructive' : kt.importance === 'medium' ? 'default' : 'secondary'} className="ml-2 text-xs shrink-0">
                          {kt.importance}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clauses with Color Coding */}
            {analysis.clauses && analysis.clauses.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    Document Clauses
                    <Badge variant="outline" className="ml-auto">{analysis.clauses.length} found</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.clauses.map((clause, i) => {
                    const colors = getRiskColor(clause.riskLevel);
                    const isExpanded = expandedClauses[i];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`border-l-4 ${colors.border} ${colors.bg} rounded-r-lg overflow-hidden`}
                      >
                        <button
                          onClick={() => toggleClause(i)}
                          className="w-full p-3 text-left flex items-start gap-2"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={colors.badge} className="text-xs">
                                {clause.riskLevel?.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{clause.category}</Badge>
                              {clause.clauseNumber && (
                                <span className="text-xs text-muted-foreground">§{clause.clauseNumber}</span>
                              )}
                            </div>
                            <p className={`text-sm mt-1.5 ${colors.text} font-medium line-clamp-2`}>
                              {clause.text}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                          )}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-3 pb-3"
                            >
                              <div className="pt-2 border-t border-border/50">
                                <p className="text-sm text-foreground mb-2 italic">"{clause.text}"</p>
                                <p className="text-sm text-muted-foreground">
                                  <strong className="text-foreground">What this means:</strong> {clause.explanation}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Financial Implications */}
            {analysis.financialImplications && analysis.financialImplications.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-warning">
                    <DollarSign className="w-4 h-4" />
                    Financial Implications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Fee/Charge</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Frequency</th>
                          <th className="text-center py-2 px-3 font-medium text-muted-foreground">Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.financialImplications.map((fi, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2 px-3 text-foreground font-medium">{fi.item}</td>
                            <td className="py-2 px-3 text-foreground">{fi.amount || 'Not specified'}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className="text-xs capitalize">{fi.frequency}</Badge>
                            </td>
                            <td className="py-2 px-3 text-center">{getImpactIcon(fi.impact)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Factors & Benefits side by side */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Risk Factors */}
              {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                      <ThumbsDown className="w-4 h-4" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.riskFactors.map((rf, i) => (
                      <div key={i} className={`p-2.5 rounded-lg border ${getRiskColor(rf.severity).bg} ${getRiskColor(rf.severity).border}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className={`w-3.5 h-3.5 ${getRiskColor(rf.severity).text}`} />
                          <span className={`text-sm font-medium ${getRiskColor(rf.severity).text}`}>{rf.factor}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-5">{rf.details}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {analysis.benefits && analysis.benefits.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-success">
                      <ThumbsUp className="w-4 h-4" />
                      Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.benefits.map((b, i) => (
                      <div key={i} className="p-2.5 rounded-lg border bg-success/5 border-success/20">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-3.5 h-3.5 text-success" />
                          <span className="text-sm font-medium text-success">{b.benefit}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-5">{b.details}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-primary">
                    <Zap className="w-4 h-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                      <div className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{rec.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Consumer Rights */}
            {analysis.consumerRights && analysis.consumerRights.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-primary">
                    <Shield className="w-4 h-4" />
                    Your Rights & Protections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {analysis.consumerRights.map((right, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{right}</span>
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
                  <p className="font-semibold">{formatTime(processingTime)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-semibold">{confidence.toFixed(0)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Clauses Found</p>
                  <p className="font-semibold">{analysis.clauses?.length || 0}</p>
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
