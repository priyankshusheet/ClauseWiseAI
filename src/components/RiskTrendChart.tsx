import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

interface RiskTrendChartProps {
  portfolioId?: string;
}

const RiskTrendChart: React.FC<RiskTrendChartProps> = ({ portfolioId }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchRiskData();
  }, [user, portfolioId]);

  const fetchRiskData = async () => {
    try {
      let query = supabase
        .from('document_analyses')
        .select('id, file_name, risk_score, risk_level, created_at, document_category')
        .eq('user_id', user!.id)
        .not('risk_score', 'is', null)
        .order('created_at', { ascending: true });

      // If portfolio, filter by portfolio documents
      if (portfolioId) {
        const { data: portfolioDocs } = await supabase
          .from('portfolio_documents')
          .select('document_id')
          .eq('portfolio_id', portfolioId);
        
        if (portfolioDocs?.length) {
          const docIds = portfolioDocs.map(d => d.document_id);
          query = query.in('id', docIds);
        }
      }

      const { data: analyses, error } = await query;
      if (error) throw error;

      const chartData = (analyses || []).map(a => ({
        date: format(new Date(a.created_at), 'MMM dd'),
        fullDate: format(new Date(a.created_at), 'MMM dd, yyyy'),
        score: a.risk_score,
        name: a.file_name?.substring(0, 20) || 'Document',
        level: a.risk_level,
        category: (a as any).document_category || 'Uncategorized',
      }));

      setData(chartData);
    } catch (err) {
      console.error('Error fetching risk trend data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || data.length === 0) return null;

  const avgScore = Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length);
  const latestScore = data[data.length - 1]?.score || 0;
  const firstScore = data[0]?.score || 0;
  const trend = latestScore - firstScore;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-xs text-muted-foreground">{d.fullDate}</p>
        <p className="text-sm font-medium text-foreground">{d.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={d.level === 'high' ? 'destructive' : d.level === 'medium' ? 'default' : 'secondary'} className="text-xs">
            {d.score}/100
          </Badge>
          <span className="text-xs text-muted-foreground">{d.category}</span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Risk Score Trend
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-sm font-bold text-foreground">{avgScore}/100</p>
            </div>
            <Badge variant={trend > 10 ? 'destructive' : trend < -10 ? 'secondary' : 'outline'} className="gap-1">
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {trend > 0 ? '+' : ''}{trend}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="url(#riskGradient)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {data.length} documents analyzed over time
        </p>
      </CardContent>
    </Card>
  );
};

export default RiskTrendChart;
