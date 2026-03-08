import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PortfolioAnalysis from '@/components/PortfolioAnalysis';
import RiskTrendChart from '@/components/RiskTrendChart';
import { FadeIn } from '@/components/PageTransition';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, FileText, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Portfolio {
  id: string;
  name: string;
  document_count: number;
  aggregate_risk_score: number | null;
  aggregate_risk_level: string | null;
  created_at: string;
}

const PortfolioPage = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | undefined>(undefined);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchPortfolios();
  }, [user]);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePortfolio = async (id: string) => {
    try {
      const { error } = await supabase.from('portfolios').delete().eq('id', id);
      if (error) throw error;
      setPortfolios(prev => prev.filter(p => p.id !== id));
      if (selectedPortfolioId === id) setSelectedPortfolioId(undefined);
      toast({ title: 'Portfolio deleted' });
    } catch (error) {
      toast({ title: 'Error deleting portfolio', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Portfolio Analysis</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Analyze multiple documents together and track risk trends over time.
              </p>
            </div>
          </FadeIn>

          {/* Risk Trend Chart — full width */}
          <FadeIn delay={0.1}>
            <div className="mb-8">
              <RiskTrendChart portfolioId={selectedPortfolioId} />
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* New Portfolio */}
            <div className="lg:col-span-2">
              <PortfolioAnalysis />
            </div>

            {/* Saved Portfolios */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FolderOpen className="w-5 h-5" />
                    Saved Portfolios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : portfolios.length === 0 ? (
                    <EmptyState type="portfolio" title="No portfolios yet" description="Group documents together for aggregate risk insights." />
                  ) : (
                    <div className="space-y-3">
                      {portfolios.map(portfolio => (
                        <div
                          key={portfolio.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedPortfolioId === portfolio.id
                              ? 'bg-primary/10 border-2 border-primary/30'
                              : 'bg-muted border-2 border-transparent hover:border-border'
                          }`}
                          onClick={() => setSelectedPortfolioId(
                            selectedPortfolioId === portfolio.id ? undefined : portfolio.id
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{portfolio.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {portfolio.document_count} documents •{' '}
                                {formatDistanceToNow(new Date(portfolio.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            {portfolio.aggregate_risk_level && (
                              <Badge variant={
                                portfolio.aggregate_risk_level === 'high' ? 'destructive' :
                                portfolio.aggregate_risk_level === 'medium' ? 'default' : 'secondary'
                              }>
                                {portfolio.aggregate_risk_score}/100
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant={selectedPortfolioId === portfolio.id ? 'default' : 'outline'}
                              className="text-xs"
                              onClick={() => setSelectedPortfolioId(
                                selectedPortfolioId === portfolio.id ? undefined : portfolio.id
                              )}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              {selectedPortfolioId === portfolio.id ? 'Viewing' : 'View Trend'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs text-destructive"
                              onClick={() => deletePortfolio(portfolio.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PortfolioPage;
