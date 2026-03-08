import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DocumentComparison from '@/components/DocumentComparison';
import { FadeIn } from '@/components/PageTransition';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GitCompare, FileText, ArrowRight, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatDistanceToNow } from 'date-fns';
import { industryBaselines, type IndustryBaseline } from '@/data/industryBaselines';

interface Document {
  id: string;
  file_name: string;
  file_type: string | null;
  risk_score: number | null;
  risk_level: string | null;
  created_at: string;
  analysis_result: any;
}

const ComparePage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocA, setSelectedDocA] = useState<Document | null>(null);
  const [selectedDocB, setSelectedDocB] = useState<Document | null>(null);
  const [selectedBaseline, setSelectedBaseline] = useState<IndustryBaseline | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'documents' | 'baseline'>('documents');
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  // Handle pre-selected document from AnalysisDetail page
  useEffect(() => {
    const preSelectedId = localStorage.getItem('compareDocumentId');
    if (preSelectedId && documents.length > 0) {
      const doc = documents.find(d => d.id === preSelectedId);
      if (doc) {
        setSelectedDocA(doc);
        setMode('baseline'); // Default to baseline comparison when coming from analysis
        localStorage.removeItem('compareDocumentId');
      }
    }
  }, [documents]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('document_analyses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startComparison = () => {
    if (mode === 'documents' && selectedDocA && selectedDocB) {
      setIsComparing(true);
    } else if (mode === 'baseline' && selectedDocA && selectedBaseline) {
      setIsComparing(true);
    }
  };

  const closeComparison = () => setIsComparing(false);

  const getComparisonDocB = () => {
    if (mode === 'baseline' && selectedBaseline) {
      return {
        id: selectedBaseline.id,
        fileName: `📋 ${selectedBaseline.name}`,
        extractedText: selectedBaseline.extractedText,
        riskScore: selectedBaseline.riskScore,
        riskLevel: selectedBaseline.riskLevel,
      };
    }
    return {
      id: selectedDocB!.id,
      fileName: selectedDocB!.file_name,
      extractedText: selectedDocB!.analysis_result?.extractedText || 'No text available',
      riskScore: selectedDocB!.risk_score || undefined,
      riskLevel: selectedDocB!.risk_level || undefined,
    };
  };

  const canCompare = mode === 'documents'
    ? selectedDocA && selectedDocB
    : selectedDocA && selectedBaseline;

  const DocList = ({ onSelect, selected, disabled }: { onSelect: (d: Document) => void; selected: Document | null; disabled?: Document | null }) => (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {documents.map(doc => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc)}
          disabled={disabled?.id === doc.id}
          className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
            selected?.id === doc.id ? 'border-primary bg-primary/5'
            : disabled?.id === doc.id ? 'border-muted opacity-50 cursor-not-allowed'
            : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">{doc.file_name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {doc.risk_level && (
              <Badge variant={doc.risk_level === 'high' ? 'destructive' : doc.risk_level === 'medium' ? 'default' : 'secondary'} className="text-xs">
                {doc.risk_score}/100
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Document Comparison</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Compare documents side-by-side or against industry-standard baselines.
              </p>
            </div>
          </FadeIn>

          {!isComparing ? (
            <>
              <Tabs value={mode} onValueChange={(v) => { setMode(v as any); setSelectedBaseline(null); setSelectedDocB(null); }} className="mb-6">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="documents" className="gap-2">
                    <GitCompare className="w-4 h-4" /> Two Documents
                  </TabsTrigger>
                  <TabsTrigger value="baseline" className="gap-2">
                    <Shield className="w-4 h-4" /> vs Industry Standard
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Document A */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Your Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : documents.length === 0 ? (
                      <EmptyState type="compare" title="No documents" description="Upload documents first." />
                    ) : (
                      <DocList onSelect={setSelectedDocA} selected={selectedDocA} disabled={mode === 'documents' ? selectedDocB : undefined} />
                    )}
                  </CardContent>
                </Card>

                {/* Compare Button */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <GitCompare className="w-8 h-8 text-primary" />
                  </div>
                  <Button size="lg" onClick={startComparison} disabled={!canCompare} className="gap-2">
                    Compare <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {mode === 'baseline'
                      ? 'Select your document and an industry baseline'
                      : 'Select one document from each side'}
                  </p>
                </div>

                {/* Right panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {mode === 'baseline' ? 'Industry Baseline' : 'Document B'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mode === 'baseline' ? (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {industryBaselines.map(baseline => (
                          <button
                            key={baseline.id}
                            onClick={() => setSelectedBaseline(baseline)}
                            className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                              selectedBaseline?.id === baseline.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-secondary shrink-0" />
                              <span className="text-sm font-medium">{baseline.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{baseline.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs gap-1">
                                <CheckCircle className="w-2.5 h-2.5" /> {baseline.riskScore}/100
                              </Badge>
                              <Badge variant="outline" className="text-xs">{baseline.category}</Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : documents.length === 0 ? (
                      <EmptyState type="compare" title="No documents" description="Upload documents first." />
                    ) : (
                      <DocList onSelect={setSelectedDocB} selected={selectedDocB} disabled={selectedDocA} />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Baseline info banner */}
              {mode === 'baseline' && (
                <FadeIn delay={0.2}>
                  <Card className="mt-6 border-secondary/30 bg-secondary/5">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">How Industry Baseline Comparison Works</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          We compare your document against a "fair standard" template based on regulatory best practices.
                          The comparison highlights where your document deviates — more fees, fewer rights, stricter penalties, etc.
                          This helps you understand if your terms are consumer-friendly or need negotiation.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
            </>
          ) : (
            <div className="h-[700px]">
              <DocumentComparison
                documentA={{
                  id: selectedDocA!.id,
                  fileName: selectedDocA!.file_name,
                  extractedText: selectedDocA!.analysis_result?.extractedText || 'No text available',
                  riskScore: selectedDocA!.risk_score || undefined,
                  riskLevel: selectedDocA!.risk_level || undefined,
                }}
                documentB={getComparisonDocB()}
                onClose={closeComparison}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ComparePage;
