import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FadeIn } from '@/components/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText, ArrowLeft, Clock, Eye, Zap, Loader2,
  AlertTriangle, CheckCircle, AlertCircle, Download,
  MessageCircle, Shield, DollarSign, Scale,
  ChevronDown, ChevronUp, Tag, GitCompare,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import RiskScoreGauge from '@/components/RiskScoreGauge';
import ClauseViewer from '@/components/ClauseViewer';
import PdfClauseAnnotator from '@/components/PdfClauseAnnotator';
import TLDRSummary from '@/components/TLDRSummary';
import NegotiateClause from '@/components/NegotiateClause';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const DOCUMENT_CATEGORIES = [
  'Loan Agreement', 'Insurance Policy', 'Credit Card Agreement',
  'Rental Agreement', 'Employment Contract', 'NDA',
  'Terms of Service', 'Investment Document', 'Tax Document', 'Other',
];

const AnalysisDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedClauses, setExpandedClauses] = useState<Record<number, boolean>>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!id || !user) return;
      const { data, error } = await supabase
        .from('document_analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) setAnalysis(data);
      setLoading(false);
    };
    fetch();
  }, [id, user]);

  const updateCategory = async (category: string) => {
    if (!id) return;
    await supabase.from('document_analyses').update({ document_category: category } as any).eq('id', id);
    setAnalysis((prev: any) => ({ ...prev, document_category: category }));
    setShowCategoryPicker(false);
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', badge: 'destructive' as const };
      case 'medium': return { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent-foreground', badge: 'default' as const };
      case 'low':
      case 'safe': return { bg: 'bg-secondary/10', border: 'border-secondary/30', text: 'text-secondary', badge: 'secondary' as const };
      default: return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', badge: 'outline' as const };
    }
  };

  const toggleClause = (i: number) => setExpandedClauses(prev => ({ ...prev, [i]: !prev[i] }));

  const downloadAnalysisReport = async () => {
    if (!analysis) return;
    const ar = analysis.analysis_result || {};

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const footerHeight = 22;
      const contentWidth = pageWidth - 2 * margin;

      const safeText = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

      let yPosition = margin;

      const addPage = () => {
        doc.addPage();
        yPosition = margin;
      };

      const ensureSpace = (needed: number) => {
        if (yPosition + needed > pageHeight - footerHeight) addPage();
      };

      const setTextStyle = (
        fontSize: number,
        style: 'normal' | 'bold' = 'normal',
        color: [number, number, number] = [30, 30, 30]
      ) => {
        doc.setFont('helvetica', style);
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
      };

      const drawLines = (lines: string[], x: number, yStart: number, lineH: number) => {
        let y = yStart;
        lines.forEach((line) => {
          doc.text(line, x, y);
          y += lineH;
        });
        return y;
      };

      const addRiskBadge = (riskLevel: string, x: number, y: number) => {
        const colors: Record<string, [number, number, number]> = {
          high: [220, 38, 38],
          medium: [217, 119, 6],
          low: [22, 163, 74],
          safe: [22, 163, 74],
        };
        const color = colors[riskLevel?.toLowerCase()] || [100, 100, 100];
        const label = (riskLevel || 'N/A').toUpperCase();

        setTextStyle(8, 'bold', [255, 255, 255]);
        const textWidth = doc.getTextWidth(label);
        doc.setFillColor(...color);
        doc.roundedRect(x, y - 4, textWidth + 8, 6, 1.5, 1.5, 'F');
        doc.text(label, x + 4, y);
      };

      const addSection = (title: string, iconColor: [number, number, number] = [67, 56, 202]) => {
        ensureSpace(25);
        yPosition += 5;
        doc.setFillColor(...iconColor);
        doc.roundedRect(margin - 2, yPosition - 4, 4, 4, 1, 1, 'F');
        setTextStyle(13, 'bold', [30, 30, 30]);
        doc.text(title, margin + 6, yPosition);
        yPosition += 10;
      };

      const addWrappedParagraph = (
        text: string,
        options?: {
          fontSize?: number;
          style?: 'normal' | 'bold';
          color?: [number, number, number];
          lineH?: number;
          gapAfter?: number;
        }
      ) => {
        const fontSize = options?.fontSize ?? 10;
        const style = options?.style ?? 'normal';
        const color = options?.color ?? [71, 85, 105];
        const lineH = options?.lineH ?? 6;
        const gapAfter = options?.gapAfter ?? 2;

        const clean = safeText(text).trim();
        if (!clean) return;

        setTextStyle(fontSize, style, color);
        const lines = doc.splitTextToSize(clean, contentWidth) as string[];
        lines.forEach((line) => {
          ensureSpace(lineH);
          doc.text(line, margin, yPosition);
          yPosition += lineH;
        });
        yPosition += gapAfter;
      };

      // Header
      doc.setFillColor(67, 56, 202);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 30, pageWidth, 8, 'F');

      setTextStyle(20, 'bold', [255, 255, 255]);
      doc.text('ClauseWise Analysis Report', margin, 18);
      setTextStyle(10, 'normal', [255, 255, 255]);
      doc.text(
        `Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        margin,
        28
      );

      yPosition = 50;

      // Document Info Card (fixed height, but with safe truncation)
      const fileNameSafe = safeText(analysis.file_name);
      const fileNameShort = fileNameSafe.length > 85 ? fileNameSafe.slice(0, 82) + '…' : fileNameSafe;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin - 5, yPosition - 5, contentWidth + 10, 35, 3, 3, 'FD');

      setTextStyle(10, 'normal', [71, 85, 105]);
      doc.text(`Document: ${fileNameShort}`, margin, yPosition + 5);
      doc.text(
        `Type: ${safeText(analysis.file_type) || 'Unknown'} | Size: ${analysis.file_size ? (analysis.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`,
        margin,
        yPosition + 12
      );
      doc.text(`Category: ${safeText((analysis as any).document_category) || 'Uncategorized'}`, margin, yPosition + 19);

      // Risk Score Display
      const riskX = pageWidth - margin - 50;
      setTextStyle(28, 'bold', (() => {
        const scoreColor: Record<string, [number, number, number]> = {
          high: [220, 38, 38],
          medium: [217, 119, 6],
          low: [22, 163, 74],
        };
        return scoreColor[safeText(analysis.risk_level).toLowerCase()] || [100, 100, 100];
      })());
      doc.text(`${analysis.risk_score || 0}`, riskX, yPosition + 8);
      setTextStyle(10, 'normal', [100, 100, 100]);
      doc.text('/100', riskX + 20, yPosition + 8);
      addRiskBadge(safeText(analysis.risk_level), riskX - 5, yPosition + 20);

      yPosition += 45;

      // Executive Summary
      if (ar.summary || analysis.analysis_summary) {
        addSection('Executive Summary', [67, 56, 202]);
        addWrappedParagraph(ar.summary || analysis.analysis_summary, { fontSize: 10 });
      }

      // Key Clauses
      const clauses = (ar.clauses || []) as any[];
      if (clauses.length > 0) {
        addSection('Key Clauses Analysis', [239, 68, 68]);

        const cardPaddingX = 4;
        const cardPaddingY = 5;
        const titleLineH = 5;
        const bodyLineH = 4;
        const explLineH = 3.5;

        clauses.forEach((clause: any, i: number) => {
          const riskLevel = safeText(clause.riskLevel) || 'N/A';
          const category = safeText(clause.category) || 'General';
          const title = `${i + 1}. ${category}`;

          const rawClauseText = safeText(clause.text).trim();
          const clauseText = rawClauseText || '(No clause text extracted)';
          const rawExplanation = safeText(clause.explanation).trim();
          const explanationText = rawExplanation ? `→ ${rawExplanation}` : '→ (No explanation provided)';

          setTextStyle(8, 'normal', [71, 85, 105]);
          const bodyLines = (doc.splitTextToSize(clauseText, contentWidth - 2 * cardPaddingX) as string[]).slice(0, 3);

          setTextStyle(7, 'normal', [100, 100, 100]);
          const explLines = (doc.splitTextToSize(explanationText, contentWidth - 2 * cardPaddingX) as string[]).slice(0, 2);

          const cardHeight =
            cardPaddingY +
            titleLineH +
            2 +
            bodyLines.length * bodyLineH +
            2 +
            explLines.length * explLineH +
            cardPaddingY;

          ensureSpace(cardHeight + 2);

          const riskColor: Record<string, [number, number, number]> = {
            high: [254, 226, 226],
            medium: [254, 243, 199],
            low: [220, 252, 231],
            safe: [220, 252, 231],
          };
          const borderColor: Record<string, [number, number, number]> = {
            high: [220, 38, 38],
            medium: [217, 119, 6],
            low: [22, 163, 74],
            safe: [22, 163, 74],
          };
          const bg = riskColor[riskLevel.toLowerCase()] || [248, 250, 252];
          const border = borderColor[riskLevel.toLowerCase()] || [200, 200, 200];

          doc.setFillColor(...bg);
          doc.setDrawColor(...border);
          doc.roundedRect(margin - 2, yPosition - 1, contentWidth + 4, cardHeight, 2, 2, 'FD');

          const titleY = yPosition + cardPaddingY;
          setTextStyle(9, 'bold', [30, 30, 30]);
          doc.text(title, margin + cardPaddingX, titleY);

          const badgeX = margin + cardPaddingX + doc.getTextWidth(title) + 4;
          const badgeY = titleY;
          if (badgeX < pageWidth - margin - 25) addRiskBadge(riskLevel, badgeX, badgeY);

          let cursorY = titleY + 6;
          setTextStyle(8, 'normal', [71, 85, 105]);
          cursorY = drawLines(bodyLines, margin + cardPaddingX, cursorY, bodyLineH);

          cursorY += 2;
          setTextStyle(7, 'normal', [100, 100, 100]);
          drawLines(explLines, margin + cardPaddingX, cursorY, explLineH);

          yPosition += cardHeight + 6;
        });
      }

      // Risk Factors
      const riskFactors = (ar.riskFactors || []) as any[];
      if (riskFactors.length > 0) {
        addSection('Risk Factors', [220, 38, 38]);
        riskFactors.forEach((rf: any) => {
          const factor = safeText(rf.factor).trim() || 'Risk factor';
          const detailsText = safeText(rf.details).trim();

          setTextStyle(8, 'normal', [71, 85, 105]);
          const detailLines = (doc.splitTextToSize(detailsText || '(No details provided)', contentWidth - 8) as string[]).slice(0, 2);
          const boxHeight = 10 + detailLines.length * 4;

          ensureSpace(boxHeight + 2);

          doc.setFillColor(254, 226, 226);
          doc.roundedRect(margin - 2, yPosition - 1, contentWidth + 4, boxHeight, 2, 2, 'F');

          setTextStyle(9, 'bold', [185, 28, 28]);
          doc.text(`⚠ ${factor}`, margin + 2, yPosition + 4);

          setTextStyle(8, 'normal', [71, 85, 105]);
          drawLines(detailLines, margin + 2, yPosition + 9, 4);

          yPosition += boxHeight + 6;
        });
      }

      // Recommendations
      const recommendations = (ar.recommendations || []) as any[];
      if (recommendations.length > 0) {
        addSection('Recommendations', [22, 163, 74]);
        recommendations.forEach((r: any) => {
          const action = safeText(r.action).trim() || 'Recommendation';
          const reasonText = safeText(r.reason).trim();

          setTextStyle(8, 'normal', [71, 85, 105]);
          const reasonLines = (doc.splitTextToSize(reasonText || '(No reason provided)', contentWidth - 8) as string[]).slice(0, 2);
          const boxHeight = 10 + reasonLines.length * 4;

          ensureSpace(boxHeight + 2);

          doc.setFillColor(220, 252, 231);
          doc.roundedRect(margin - 2, yPosition - 1, contentWidth + 4, boxHeight, 2, 2, 'F');

          setTextStyle(9, 'bold', [21, 128, 61]);
          doc.text(`✓ ${action}`, margin + 2, yPosition + 4);

          setTextStyle(8, 'normal', [71, 85, 105]);
          drawLines(reasonLines, margin + 2, yPosition + 9, 4);

          yPosition += boxHeight + 6;
        });
      }

      // Financial Implications
      const financialImplications = (ar.financialImplications || []) as any[];
      if (financialImplications.length > 0) {
        addSection('Financial Implications', [217, 119, 6]);

        ensureSpace(20);
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(margin - 2, yPosition - 3, contentWidth + 4, 8, 1, 1, 'F');
        setTextStyle(8, 'bold', [146, 64, 14]);
        doc.text('Item', margin + 2, yPosition + 2);
        doc.text('Amount', margin + 60, yPosition + 2);
        doc.text('Frequency', margin + 100, yPosition + 2);
        doc.text('Impact', margin + 140, yPosition + 2);
        yPosition += 10;

        financialImplications.forEach((fi: any) => {
          ensureSpace(10);
          setTextStyle(8, 'normal', [71, 85, 105]);
          doc.text(safeText(fi.item).substring(0, 25) || '', margin + 2, yPosition + 2);
          doc.text(safeText(fi.amount) || '', margin + 60, yPosition + 2);
          doc.text(safeText(fi.frequency) || '', margin + 100, yPosition + 2);
          addRiskBadge(safeText(fi.impact), margin + 140, yPosition + 2);
          yPosition += 8;
        });
      }

      // Footer (page numbers on every page)
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        setTextStyle(8, 'normal', [148, 163, 184]);
        doc.text('Generated by ClauseWise AI Document Analyzer', margin, pageHeight - 10);
        doc.text('This is AI-generated analysis, not legal advice.', margin, pageHeight - 5);
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 28, pageHeight - 10);
      }

      doc.save(
        `ClauseWise_${fileNameSafe.replace(/\.[^/.]+$/, '')}_Report_${new Date().toISOString().split('T')[0]}.pdf`
      );
      toast({ title: 'Report downloaded successfully' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: 'Failed to generate report', variant: 'destructive' });
    }
  };

  const handleCompareBaseline = () => {
    // Navigate to compare page with this document pre-selected
    localStorage.setItem('compareDocumentId', id || '');
    navigate('/compare');
  };

  const handleDiscuss = () => {
    if (!analysis) return;
    const ar = analysis.analysis_result || {};
    localStorage.setItem('documentContext', JSON.stringify({
      fileName: analysis.file_name,
      fileType: analysis.file_type,
      extractedText: ar.extractedText || analysis.analysis_summary || '',
      riskScore: analysis.risk_score,
      riskLevel: analysis.risk_level,
      analysisResult: ar,
      timestamp: new Date().toISOString(),
    }));
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navigation />
        <div className="pt-24 px-4 text-center">
          <p className="text-muted-foreground">Analysis not found.</p>
          <Button onClick={() => navigate('/history')} className="mt-4">Back to History</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const ar = analysis.analysis_result || {};
  const clauses = ar.clauses || [];
  const riskFactors = ar.riskFactors || [];
  const benefits = ar.benefits || [];
  const financialImplications = ar.financialImplications || [];
  const recommendations = ar.recommendations || [];
  const keyTerms = ar.keyTerms || [];
  const consumerRights = ar.consumerRights || [];
  const extractedText = ar.extractedText || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navigation />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            {/* Header */}
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="gap-1.5 mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to History
              </Button>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{analysis.file_name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                      {new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {analysis.file_type && <><span>•</span><span>{analysis.file_type}</span></>}
                    {analysis.file_size && <><span>•</span><span>{(analysis.file_size / 1024 / 1024).toFixed(2)} MB</span></>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={handleDiscuss} className="gap-1.5">
                    <MessageCircle className="w-4 h-4" /> Discuss
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadAnalysisReport} className="gap-1.5">
                    <Download className="w-4 h-4" /> Download Report
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCompareBaseline} className="gap-1.5">
                    <GitCompare className="w-4 h-4" /> Compare Baseline
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/upload')} className="gap-1.5">
                    <FileText className="w-4 h-4" /> Re-analyze
                  </Button>
                </div>
              </div>

              {/* Category tag */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {(analysis as any).document_category ? (
                  <Badge variant="outline" className="gap-1 cursor-pointer" onClick={() => setShowCategoryPicker(!showCategoryPicker)}>
                    <Tag className="w-3 h-3" />
                    {(analysis as any).document_category}
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setShowCategoryPicker(!showCategoryPicker)}>
                    <Tag className="w-3 h-3" /> Add Category
                  </Button>
                )}
                <AnimatePresence>
                  {showCategoryPicker && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex flex-wrap gap-1.5">
                      {DOCUMENT_CATEGORIES.map(cat => (
                        <Badge
                          key={cat}
                          variant={(analysis as any).document_category === cat ? 'default' : 'outline'}
                          className="cursor-pointer text-xs hover:bg-primary/10 transition-colors"
                          onClick={() => updateCategory(cat)}
                        >
                          {cat}
                        </Badge>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Risk Score Gauge */}
            {analysis.risk_score !== null && (
              <Card className={`mb-6 border-2 ${getRiskColor(analysis.risk_level).border} ${getRiskColor(analysis.risk_level).bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-6">
                    <RiskScoreGauge score={analysis.risk_score} riskLevel={analysis.risk_level || 'medium'} size={140} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Risk Assessment</p>
                      <Badge variant={getRiskColor(analysis.risk_level).badge} className="text-base px-4 py-1.5 mb-2">
                        {analysis.risk_level?.toUpperCase()} RISK
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analysis.risk_score <= 30 ? 'This document appears generally safe.' :
                         analysis.risk_score <= 60 ? 'Some clauses need attention.' :
                         'Multiple high-risk clauses detected.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TL;DR Summary */}
            {clauses.length > 0 && (
              <div className="mb-6">
                <TLDRSummary
                  clauses={clauses}
                  riskScore={analysis.risk_score || 0}
                  riskLevel={analysis.risk_level || 'medium'}
                  keyTerms={keyTerms}
                  financialImplications={financialImplications}
                  consumerRights={consumerRights}
                  recommendations={recommendations}
                />
              </div>
            )}

            {/* Summary */}
            {analysis.analysis_summary && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{ar.summary || analysis.analysis_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Interactive Clause Viewer */}
            {extractedText && clauses.length > 0 && (
              <div className="mb-6">
                <ClauseViewer extractedText={extractedText} clauses={clauses} />
              </div>
            )}

            {/* Clause Cards (fallback / additional view) */}
            {clauses.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" /> All Clauses
                    <Badge variant="outline" className="ml-auto">{clauses.length} found</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {clauses.map((clause: any, i: number) => {
                    const colors = getRiskColor(clause.riskLevel);
                    const isExpanded = expandedClauses[i];
                    return (
                      <div key={i} className={`border-l-4 ${colors.border} ${colors.bg} rounded-r-lg overflow-hidden`}>
                        <button onClick={() => toggleClause(i)} className="w-full p-3 text-left flex items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={colors.badge} className="text-xs">{clause.riskLevel?.toUpperCase()}</Badge>
                              <Badge variant="outline" className="text-xs">{clause.category}</Badge>
                              {clause.clauseNumber && <span className="text-xs text-muted-foreground">§{clause.clauseNumber}</span>}
                            </div>
                            <p className={`text-sm mt-1.5 ${colors.text} font-medium line-clamp-2`}>{clause.text}</p>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3">
                              <div className="pt-2 border-t border-border/50 space-y-2">
                                <p className="text-sm text-muted-foreground"><strong className="text-foreground">What this means:</strong> {clause.explanation}</p>
                                <NegotiateClause
                                  clauseText={clause.text}
                                  clauseCategory={clause.category}
                                  riskLevel={clause.riskLevel}
                                  explanation={clause.explanation}
                                  documentType={ar.documentType}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Key Terms */}
            {keyTerms.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Scale className="w-4 h-4 text-primary" /> Key Terms</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {keyTerms.map((kt: any, i: number) => (
                      <div key={i} className="flex items-start justify-between p-2.5 rounded-lg bg-muted/50 border border-border">
                        <div><span className="font-medium text-sm text-foreground">{kt.term}</span><p className="text-xs text-muted-foreground mt-0.5">{kt.value}</p></div>
                        <Badge variant={kt.importance === 'high' ? 'destructive' : kt.importance === 'medium' ? 'default' : 'secondary'} className="ml-2 text-xs shrink-0">{kt.importance}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Factors & Benefits side by side */}
            {(riskFactors.length > 0 || benefits.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {riskFactors.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-destructive"><AlertTriangle className="w-4 h-4" /> Risk Factors</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {riskFactors.map((rf: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/15">
                          <p className="text-sm font-medium text-foreground">{rf.factor}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{rf.details}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {benefits.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-secondary"><CheckCircle className="w-4 h-4" /> Benefits</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {benefits.map((b: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-secondary/5 border border-secondary/15">
                          <p className="text-sm font-medium text-foreground">{b.benefit}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{b.details}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Financial Implications */}
            {financialImplications.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4 text-accent-foreground" /> Financial Implications</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Item</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Amount</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Frequency</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Impact</th>
                      </tr></thead>
                      <tbody>
                        {financialImplications.map((fi: any, i: number) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-2 px-3 text-foreground">{fi.item}</td>
                            <td className="py-2 px-3 font-medium text-foreground">{fi.amount}</td>
                            <td className="py-2 px-3 text-muted-foreground">{fi.frequency}</td>
                            <td className="py-2 px-3">
                              <Badge variant={fi.impact === 'high' ? 'destructive' : fi.impact === 'medium' ? 'default' : 'secondary'} className="text-xs">{fi.impact}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Recommendations</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {recommendations.map((r: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-border bg-primary/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={r.priority === 'high' ? 'destructive' : r.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">{r.priority}</Badge>
                        <span className="text-sm font-medium text-foreground">{r.action}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Consumer Rights */}
            {consumerRights.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-2"><CardTitle className="text-base">Your Rights</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {consumerRights.map((right: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{right}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Trust Disclaimer */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">⚠️ Important:</strong> ClauseWise provides AI-assisted analysis for informational purposes only.
                This is <strong>not legal, financial, or professional advice.</strong> Always consult a qualified professional.{' '}
                <a href="/help" className="underline text-primary hover:text-primary/80 transition-colors">Learn more →</a>
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnalysisDetail;
