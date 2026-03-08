import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, DollarSign, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TLDRSummaryProps {
  clauses: { text: string; category: string; riskLevel: string; explanation: string }[];
  riskScore: number;
  riskLevel: string;
  keyTerms?: { term: string; value: string; importance: string }[];
  financialImplications?: { item: string; amount: string; frequency: string; impact: string }[];
  consumerRights?: string[];
  recommendations?: { action: string; priority: string; reason: string }[];
}

const TLDRSummary: React.FC<TLDRSummaryProps> = ({
  clauses, riskScore, riskLevel, keyTerms, financialImplications, consumerRights, recommendations,
}) => {
  // Generate smart bullet points from the analysis data
  const bullets: { icon: React.ReactNode; text: string; type: 'warning' | 'safe' | 'info' }[] = [];

  // High risk clauses
  const highRisk = clauses.filter(c => c.riskLevel?.toLowerCase() === 'high');
  const mediumRisk = clauses.filter(c => c.riskLevel?.toLowerCase() === 'medium');

  if (highRisk.length > 0) {
    highRisk.slice(0, 2).forEach(c => {
      bullets.push({
        icon: <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />,
        text: c.explanation || c.text,
        type: 'warning',
      });
    });
  }

  // Financial items with high impact
  if (financialImplications?.length) {
    const highImpact = financialImplications.filter(f => f.impact === 'high');
    highImpact.slice(0, 1).forEach(f => {
      bullets.push({
        icon: <DollarSign className="w-4 h-4 text-destructive shrink-0" />,
        text: `${f.item}: ${f.amount}${f.frequency ? ` (${f.frequency})` : ''}`,
        type: 'warning',
      });
    });
  }

  // Key terms with high importance
  if (keyTerms?.length) {
    const important = keyTerms.filter(k => k.importance === 'high');
    important.slice(0, 1).forEach(k => {
      bullets.push({
        icon: <Clock className="w-4 h-4 text-accent-foreground shrink-0" />,
        text: `${k.term}: ${k.value}`,
        type: 'info',
      });
    });
  }

  // Consumer rights (positive)
  if (consumerRights?.length) {
    bullets.push({
      icon: <CheckCircle className="w-4 h-4 text-secondary shrink-0" />,
      text: consumerRights[0],
      type: 'safe',
    });
  }

  // Top recommendation
  if (recommendations?.length) {
    const top = recommendations.find(r => r.priority === 'high') || recommendations[0];
    if (top) {
      bullets.push({
        icon: <Shield className="w-4 h-4 text-primary shrink-0" />,
        text: top.action,
        type: 'info',
      });
    }
  }

  // If medium risk and no high risk bullets
  if (bullets.length < 3 && mediumRisk.length > 0) {
    mediumRisk.slice(0, 2 - Math.min(bullets.length, 1)).forEach(c => {
      bullets.push({
        icon: <AlertTriangle className="w-4 h-4 text-accent-foreground shrink-0" />,
        text: c.explanation || c.text,
        type: 'info',
      });
    });
  }

  // Add overall score context
  if (bullets.length < 5) {
    bullets.push({
      icon: riskScore > 60
        ? <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
        : riskScore > 30
        ? <Zap className="w-4 h-4 text-accent-foreground shrink-0" />
        : <CheckCircle className="w-4 h-4 text-secondary shrink-0" />,
      text: riskScore > 60
        ? `Overall risk score is ${riskScore}/100 — review carefully before signing.`
        : riskScore > 30
        ? `Overall risk score is ${riskScore}/100 — some items need attention.`
        : `Overall risk score is ${riskScore}/100 — this document appears generally fair.`,
      type: riskScore > 60 ? 'warning' : riskScore > 30 ? 'info' : 'safe',
    });
  }

  // Limit to 5
  const finalBullets = bullets.slice(0, 5);

  if (finalBullets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">What you need to know in 30 seconds</h3>
            <Badge variant="outline" className="ml-auto text-xs">TL;DR</Badge>
          </div>
          <ul className="space-y-2.5">
            {finalBullets.map((bullet, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-2.5 rounded-lg border ${
                  bullet.type === 'warning' ? 'bg-destructive/5 border-destructive/20' :
                  bullet.type === 'safe' ? 'bg-secondary/5 border-secondary/20' :
                  'bg-muted/50 border-border'
                }`}
              >
                <span className="mt-0.5">{bullet.icon}</span>
                <span className="text-sm text-foreground leading-relaxed">{bullet.text}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TLDRSummary;
