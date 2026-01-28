import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DocumentComparison from '@/components/DocumentComparison';
import { FadeIn } from '@/components/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitCompare, FileText, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatDistanceToNow } from 'date-fns';

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
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

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
    if (selectedDocA && selectedDocB) {
      setIsComparing(true);
    }
  };

  const closeComparison = () => {
    setIsComparing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Document Comparison
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Compare two documents side-by-side to identify differences and changes.
              </p>
            </div>
          </FadeIn>

          {!isComparing ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Document A Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Document A</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No documents available. Upload documents first.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {documents.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocA(doc)}
                          disabled={selectedDocB?.id === doc.id}
                          className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                            selectedDocA?.id === doc.id
                              ? 'border-primary bg-primary/5'
                              : selectedDocB?.id === doc.id
                              ? 'border-muted opacity-50 cursor-not-allowed'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium truncate">{doc.file_name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {doc.risk_level && (
                              <Badge variant={
                                doc.risk_level === 'high' ? 'destructive' :
                                doc.risk_level === 'medium' ? 'default' : 'secondary'
                              } className="text-xs">
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
                  )}
                </CardContent>
              </Card>

              {/* Compare Button */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <GitCompare className="w-8 h-8 text-primary" />
                </div>
                <Button
                  size="lg"
                  onClick={startComparison}
                  disabled={!selectedDocA || !selectedDocB}
                  className="gap-2"
                >
                  Compare
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Select one document from each side
                </p>
              </div>

              {/* Document B Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Document B</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No documents available. Upload documents first.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {documents.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocB(doc)}
                          disabled={selectedDocA?.id === doc.id}
                          className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                            selectedDocB?.id === doc.id
                              ? 'border-primary bg-primary/5'
                              : selectedDocA?.id === doc.id
                              ? 'border-muted opacity-50 cursor-not-allowed'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium truncate">{doc.file_name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {doc.risk_level && (
                              <Badge variant={
                                doc.risk_level === 'high' ? 'destructive' :
                                doc.risk_level === 'medium' ? 'default' : 'secondary'
                              } className="text-xs">
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
                  )}
                </CardContent>
              </Card>
            </div>
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
                documentB={{
                  id: selectedDocB!.id,
                  fileName: selectedDocB!.file_name,
                  extractedText: selectedDocB!.analysis_result?.extractedText || 'No text available',
                  riskScore: selectedDocB!.risk_score || undefined,
                  riskLevel: selectedDocB!.risk_level || undefined,
                }}
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
