import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface RiskScoreGaugeProps {
  score: number;
  riskLevel: string;
  size?: number;
}

const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, riskLevel, size = 160 }) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  
  const getColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'hsl(var(--destructive))';
      case 'medium': return 'hsl(var(--accent))';
      case 'low':
      case 'safe': return 'hsl(var(--secondary))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const getTrackColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'hsl(var(--destructive) / 0.15)';
      case 'medium': return 'hsl(var(--accent) / 0.15)';
      case 'low':
      case 'safe': return 'hsl(var(--secondary) / 0.15)';
      default: return 'hsl(var(--muted))';
    }
  };

  const activeColor = getColor(riskLevel);
  const trackColor = getTrackColor(riskLevel);

  // Donut data: filled portion + remaining
  const data = [
    { value: clampedScore },
    { value: 100 - clampedScore },
  ];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius="72%"
            outerRadius="100%"
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            <Cell fill={activeColor} />
            <Cell fill={trackColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold"
          style={{ color: activeColor }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
        >
          {clampedScore}
        </motion.span>
        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  );
};

export default RiskScoreGauge;
