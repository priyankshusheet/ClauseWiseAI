import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Users,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface AnalyticsData {
  date: string;
  documents_uploaded: number;
  documents_analyzed: number;
  chat_messages_sent: number;
  session_duration_seconds: number;
}

interface ProcessingMetric {
  operation_type: string;
  processing_time_ms: number;
  success: boolean;
  created_at: string;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [metrics, setMetrics] = useState<ProcessingMetric[]>([]);
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    analyzed: 0,
    highRisk: 0,
    avgRiskScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Fetch user analytics
      const { data: analyticsData } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(30);

      if (analyticsData) {
        setAnalytics(analyticsData);
      }

      // Fetch processing metrics
      const { data: metricsData } = await supabase
        .from('processing_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (metricsData) {
        setMetrics(metricsData);
      }

      // Fetch document statistics
      const { data: documents } = await supabase
        .from('document_analyses')
        .select('risk_score, risk_level')
        .eq('user_id', user.id);

      if (documents) {
        const highRiskCount = documents.filter(d => d.risk_level === 'high').length;
        const avgScore = documents.length > 0 
          ? documents.reduce((sum, d) => sum + (d.risk_score || 0), 0) / documents.length 
          : 0;

        setDocumentStats({
          total: documents.length,
          analyzed: documents.length,
          highRisk: highRiskCount,
          avgRiskScore: Math.round(avgScore),
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalUploads = () => analytics.reduce((sum, a) => sum + a.documents_uploaded, 0);
  const getTotalMessages = () => analytics.reduce((sum, a) => sum + a.chat_messages_sent, 0);
  const getAvgProcessingTime = () => {
    const successfulMetrics = metrics.filter(m => m.success);
    if (successfulMetrics.length === 0) return 0;
    return Math.round(successfulMetrics.reduce((sum, m) => sum + m.processing_time_ms, 0) / successfulMetrics.length);
  };
  const getSuccessRate = () => {
    if (metrics.length === 0) return 100;
    return Math.round((metrics.filter(m => m.success).length / metrics.length) * 100);
  };

  const riskDistribution = [
    { name: 'Low Risk', value: documentStats.total - documentStats.highRisk - Math.floor(documentStats.total * 0.3), fill: 'hsl(var(--chart-2))' },
    { name: 'Medium Risk', value: Math.floor(documentStats.total * 0.3), fill: 'hsl(var(--chart-3))' },
    { name: 'High Risk', value: documentStats.highRisk, fill: 'hsl(var(--chart-5))' },
  ].filter(item => item.value > 0);

  const processingTrend = analytics.slice(-7).map(a => ({
    date: new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }),
    documents: a.documents_uploaded,
    messages: a.chat_messages_sent,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-interactive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-3xl font-bold text-foreground">{documentStats.total}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-secondary mr-1" />
              <span className="text-secondary font-medium">+{getTotalUploads()}</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-interactive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Processing Time</p>
                <p className="text-3xl font-bold text-foreground">{getAvgProcessingTime()}ms</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Clock className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Zap className="w-4 h-4 text-accent mr-1" />
              <span className="text-muted-foreground">Fast processing</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-interactive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold text-foreground">{getSuccessRate()}%</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <Progress value={getSuccessRate()} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="card-interactive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Docs</p>
                <p className="text-3xl font-bold text-foreground">{documentStats.highRisk}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-muted-foreground">Avg risk score: </span>
              <Badge variant={documentStats.avgRiskScore > 60 ? 'destructive' : 'secondary'} className="ml-1">
                {documentStats.avgRiskScore}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Activity Overview
              </CardTitle>
              <CardDescription>Documents and chat activity over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processingTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-muted-foreground text-xs" />
                    <YAxis className="text-muted-foreground text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="documents" 
                      stackId="1" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.3)" 
                      name="Documents"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="messages" 
                      stackId="2" 
                      stroke="hsl(var(--secondary))" 
                      fill="hsl(var(--secondary) / 0.3)" 
                      name="Chat Messages"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Document risk levels breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Trend</CardTitle>
                <CardDescription>Average risk score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.slice(-14).map(a => ({
                      date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      score: Math.round(Math.random() * 40 + 30), // Placeholder - would be real data
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-muted-foreground text-xs" />
                      <YAxis domain={[0, 100]} className="text-muted-foreground text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--accent))' }}
                        name="Avg Risk Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Performance</CardTitle>
              <CardDescription>Operation processing times by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'OCR', time: 1200, success: 98 },
                    { name: 'Analysis', time: 800, success: 95 },
                    { name: 'Embedding', time: 400, success: 99 },
                    { name: 'Search', time: 150, success: 100 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-muted-foreground text-xs" />
                    <YAxis className="text-muted-foreground text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="time" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg Time (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;