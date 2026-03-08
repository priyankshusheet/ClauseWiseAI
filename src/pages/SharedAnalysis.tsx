import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FadeIn } from '@/components/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import RiskScoreGauge from '@/components/RiskScoreGauge';

interface SharedData {
  file_name: string;
  risk_score: number | null;
  risk_level: string | null;
  analysis_summary: string | null;
  analysis_result: any;
  created_at: string;
}

const SharedAnalysis = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShared = async () => {
      if (!shareId) { setError('Invalid link'); setLoading(false); return; }

      try {
        // Fetch share record to get document_id
        const { data: share, error: shareErr } = await supabase
          .from('document_shares')
          .select('document_id, permission, expires_at')
          .eq('id', shareId)
          .single();

        if (shareErr || !share) { setError('Share link not found or expired.'); setLoading(false); return; }

        if (share.expires_at && new Date(share.expires_at) < new Date()) {
          setError('This share link has expired.'); setLoading(false); return;
        }

        // Fetch the analysis
        const { data: analysis, error: docErr } = await supabase
          .from('document_analyses')
          .select('file_name, risk_score, risk_level, analysis_summary, analysis_result, created_at')
          .eq('id', share.document_id)
          .single();

        if (docErr || !analysis) { setError('Analysis not found.'); setLoading(false); return; }

        setData(analysis);
      } catch {
        setError('Failed to load shared analysis.');
      } finally {
        setLoading(false);
      }
    };

    fetchShared();
  }, [shareId]);

  const getRiskColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'high': return { bg: 'bg-destructive/10', border: 'border-destructive/30', badge: 'destructive' as const };
      case 'medium': return { bg: 'bg-accent/10', border: 'border-accent/30', badge: 'default' as const };
      default: return { bg: 'bg-secondary/10', border: 'border-secondary/30', badge: 'secondary' as const };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navigation />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading shared analysis...</p>
            </div>
          ) : error ? (
            <FadeIn>
              <Card className="text-center py-16">
                <CardContent>
                  <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">Unable to Load</h2>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <Button onClick={() => navigate('/')}>Go Home</Button>
                </CardContent>
              </Card>
            </FadeIn>
          ) : data ? (
            <FadeIn>
              <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Badge variant="outline" className="mb-3">Shared Analysis</Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{data.file_name}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyzed on {new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Risk Score */}
              {data.risk_score !== null && (
                <Card className={`mb-6 border-2 ${getRiskColor(data.risk_level).border} ${getRiskColor(data.risk_level).bg}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-6">
                      <RiskScoreGauge score={data.risk_score} riskLevel={data.risk_level || 'medium'} size={120} />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Risk Assessment</p>
                        <Badge variant={getRiskColor(data.risk_level).badge} className="text-base px-4 py-1.5">
                          {data.risk_level?.toUpperCase()} RISK
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              {data.analysis_summary && (
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{data.analysis_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Key clauses from analysis_result */}
              {data.analysis_result?.clauses?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Key Clauses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data.analysis_result.clauses.map((clause: any, i: number) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        clause.riskLevel === 'high' ? 'bg-destructive/5 border-destructive/20' :
                        clause.riskLevel === 'medium' ? 'bg-accent/5 border-accent/20' :
                        'bg-secondary/5 border-secondary/20'
                      }`}>
                        <div className="flex items-start gap-2">
                          {clause.riskLevel === 'high' ? <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" /> :
                           clause.riskLevel === 'medium' ? <AlertCircle className="w-4 h-4 text-accent mt-0.5" /> :
                           <CheckCircle className="w-4 h-4 text-secondary mt-0.5" />}
                          <div>
                            <p className="text-sm font-medium text-foreground">{clause.category}</p>
                            <p className="text-xs text-muted-foreground mt-1">{clause.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">Want to analyze your own documents?</p>
                <Button onClick={() => navigate('/upload')}>Try ClauseWise Free</Button>
              </div>
            </FadeIn>
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SharedAnalysis;
