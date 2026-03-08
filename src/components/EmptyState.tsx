import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  type: 'history' | 'portfolio' | 'compare';
  title: string;
  description: string;
  children?: React.ReactNode;
}

const illustrations: Record<string, React.FC<{ className?: string }>> = {
  history: ({ className }) => (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stack of documents with clock */}
      <rect x="50" y="40" width="80" height="100" rx="6" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
      <rect x="58" y="48" width="80" height="100" rx="6" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
      <rect x="66" y="56" width="80" height="100" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
      {/* Lines on top doc */}
      <rect x="78" y="72" width="44" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.3)" />
      <rect x="78" y="82" width="36" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.2)" />
      <rect x="78" y="92" width="48" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.2)" />
      <rect x="78" y="102" width="28" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.15)" />
      {/* Clock overlay */}
      <circle cx="140" cy="50" r="22" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2.5" />
      <line x1="140" y1="50" x2="140" y2="38" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="140" y1="50" x2="150" y2="54" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
      <circle cx="140" cy="50" r="2" fill="hsl(var(--primary))" />
    </svg>
  ),
  portfolio: ({ className }) => (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Folder shape */}
      <path d="M30 50 L30 140 C30 143 33 146 36 146 L164 146 C167 146 170 143 170 140 L170 60 C170 57 167 54 164 54 L105 54 L95 40 L36 40 C33 40 30 43 30 46 Z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
      {/* Documents inside */}
      <rect x="55" y="70" width="35" height="50" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
      <rect x="62" y="78" width="20" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.3)" />
      <rect x="62" y="84" width="16" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.2)" />
      <rect x="110" y="70" width="35" height="50" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
      <rect x="117" y="78" width="20" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.3)" />
      <rect x="117" y="84" width="16" height="3" rx="1.5" fill="hsl(var(--muted-foreground) / 0.2)" />
      {/* Plus circle */}
      <circle cx="100" cy="130" r="14" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
      <line x1="94" y1="130" x2="106" y2="130" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="124" x2="100" y2="136" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  compare: ({ className }) => (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left doc */}
      <rect x="20" y="30" width="65" height="100" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
      <rect x="30" y="44" width="35" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.3)" />
      <rect x="30" y="54" width="28" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.2)" />
      <rect x="30" y="64" width="40" height="4" rx="2" fill="hsl(var(--destructive) / 0.4)" />
      <rect x="30" y="74" width="32" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.2)" />
      <rect x="30" y="84" width="38" height="4" rx="2" fill="hsl(var(--secondary) / 0.5)" />
      {/* Right doc */}
      <rect x="115" y="30" width="65" height="100" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
      <rect x="125" y="44" width="35" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.3)" />
      <rect x="125" y="54" width="28" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.2)" />
      <rect x="125" y="64" width="40" height="4" rx="2" fill="hsl(var(--secondary) / 0.5)" />
      <rect x="125" y="74" width="32" height="4" rx="2" fill="hsl(var(--muted-foreground) / 0.2)" />
      <rect x="125" y="84" width="38" height="4" rx="2" fill="hsl(var(--destructive) / 0.4)" />
      {/* Arrows between */}
      <path d="M90 65 L110 65" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrow)" />
      <path d="M110 85 L90 85" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        </marker>
      </defs>
    </svg>
  ),
};

const EmptyState: React.FC<EmptyStateProps> = ({ type, title, description, children }) => {
  const Illustration = illustrations[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
      >
        <Illustration className="w-48 h-40 mb-6" />
      </motion.div>
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">{description}</p>
      {children}
    </motion.div>
  );
};

export default EmptyState;
