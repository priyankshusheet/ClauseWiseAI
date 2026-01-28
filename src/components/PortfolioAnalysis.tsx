import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  riskScore?: number;
  riskLevel?: string;
  analysis?: string;
}

interface PortfolioInsights {
  averageRiskScore: number;
  highRiskCount: number;
  commonRisks: string[];
  inconsistencies: string[];
  recommendations: string[];
}

interface PortfolioAnalysisProps {
  onDocumentSelect?: (doc: Document) => void;
}

const PortfolioAnalysis: React.FC<PortfolioAnalysisProps> = ({ onDocumentSelect }) => {
  const [portfolioName, setPortfolioName] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState<PortfolioInsights | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newDocs: Document[] = files.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      fileSize: file.size,
      status: 'pending',
      progress: 0,
    }));

    setDocuments(prev => [...prev, ...newDocs]);

    toast({
      title: `${files.length} document(s) added`,
      description: 'Click "Analyze All" to start batch processing',
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [toast]);

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const analyzeAllDocuments = async () => {
    if (documents.length === 0) return;

    setIsProcessing(true);

    // Simulate batch processing
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, status: 'processing', progress: 0 } : d
      ));

      // Simulate progress updates
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, progress: p } : d
        ));
      }

      // Generate mock analysis results
      const riskScore = Math.floor(Math.random() * 60) + 20;
      const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { 
          ...d, 
          status: 'complete', 
          progress: 100,
          riskScore,
          riskLevel,
          analysis: `Analysis complete for ${doc.fileName}`,
        } : d
      ));
    }

    // Generate portfolio insights
    generatePortfolioInsights();
    setIsProcessing(false);

    toast({
      title: 'Batch analysis complete',
      description: `Analyzed ${documents.length} documents`,
    });
  };

  const generatePortfolioInsights = () => {
    const completedDocs = documents.filter(d => d.status === 'complete');
    if (completedDocs.length === 0) return;

    const avgRisk = Math.round(
      completedDocs.reduce((sum, d) => sum + (d.riskScore || 0), 0) / completedDocs.length
    );

    setInsights({
      averageRiskScore: avgRisk,
      highRiskCount: completedDocs.filter(d => d.riskLevel === 'high').length,
      commonRisks: [
        'Auto-renewal clauses detected in 3 documents',
        'Penalty terms present in 2 documents',
        'Variable interest rates in 2 documents',
      ],
      inconsistencies: [
        'Conflicting cancellation terms between Document A and B',
        'Coverage limits vary significantly across policies',
      ],
      recommendations: [
        'Review auto-renewal terms before signing',
        'Compare penalty structures across documents',
        'Negotiate consistent terms for coverage limits',
      ],
    });
  };

  const savePortfolio = async () => {
    if (!user || !portfolioName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert([{
          user_id: user.id,
          name: portfolioName,
          document_count: documents.length,
          aggregate_risk_score: insights?.averageRiskScore,
          aggregate_risk_level: insights?.averageRiskScore 
            ? (insights.averageRiskScore >= 70 ? 'high' : insights.averageRiskScore >= 40 ? 'medium' : 'low')
            : null,
          insights: insights as any,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Portfolio saved',
        description: `"${portfolioName}" has been saved successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error saving portfolio',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const overallRiskLevel = insights?.averageRiskScore 
    ? (insights.averageRiskScore >= 70 ? 'high' : insights.averageRiskScore >= 40 ? 'medium' : 'low')
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            Portfolio Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Portfolio name..."
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              className="flex-1"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt"
              multiple
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Documents
            </Button>
          </div>

          {documents.length > 0 && (
            <div className="flex gap-2">
              <Button 
                onClick={analyzeAllDocuments}
                disabled={isProcessing || documents.every(d => d.status === 'complete')}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze All ({documents.length})
                  </>
                )}
              </Button>
              {insights && (
                <Button variant="outline" onClick={savePortfolio} disabled={!portfolioName.trim()}>
                  Save Portfolio
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {doc.status === 'processing' && (
                        <Progress value={doc.progress} className="h-1 mt-1" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === 'pending' && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      {doc.status === 'processing' && (
                        <Badge variant="default" className="gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {doc.progress}%
                        </Badge>
                      )}
                      {doc.status === 'complete' && doc.riskLevel && (
                        <Badge variant={
                          doc.riskLevel === 'high' ? 'destructive' :
                          doc.riskLevel === 'medium' ? 'default' : 'secondary'
                        }>
                          {doc.riskScore}/100
                        </Badge>
                      )}
                      {doc.status === 'error' && (
                        <Badge variant="destructive">Error</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDocument(doc.id)}
                        disabled={doc.status === 'processing'}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Insights */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-2 ${
            overallRiskLevel === 'high' ? 'border-destructive/50' :
            overallRiskLevel === 'medium' ? 'border-warning/50' : 'border-success/50'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Portfolio Insights
                </span>
                <Badge variant={
                  overallRiskLevel === 'high' ? 'destructive' :
                  overallRiskLevel === 'medium' ? 'default' : 'secondary'
                } className="text-lg px-4">
                  {insights.averageRiskScore}/100 Average Risk
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-foreground">{documents.length}</p>
                    <p className="text-sm text-muted-foreground">Documents</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-destructive">{insights.highRiskCount}</p>
                    <p className="text-sm text-muted-foreground">High Risk</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-foreground">{insights.averageRiskScore}</p>
                    <p className="text-sm text-muted-foreground">Avg. Score</p>
                  </CardContent>
                </Card>
              </div>

              {/* Common Risks */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Common Risk Patterns
                </h4>
                <ul className="space-y-1">
                  {insights.commonRisks.map((risk, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-warning rounded-full mt-2 shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inconsistencies */}
              {insights.inconsistencies.length > 0 && (
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    Inconsistencies Detected
                  </h4>
                  <ul className="space-y-1">
                    {insights.inconsistencies.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-success rounded-full mt-2 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default PortfolioAnalysis;
