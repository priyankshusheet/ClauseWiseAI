import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  Eye,
  Shield,
} from 'lucide-react';

interface Clause {
  text: string;
  category: string;
  riskLevel: string;
  explanation: string;
  clauseNumber?: string;
}

interface ClauseViewerProps {
  extractedText: string;
  clauses: Clause[];
}

const ClauseViewer: React.FC<ClauseViewerProps> = ({ extractedText, clauses }) => {
  const [selectedClause, setSelectedClause] = useState<number | null>(null);

  const getRiskStyle = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return { bg: 'bg-destructive/20', border: 'border-destructive/40', text: 'text-destructive', hoverBg: 'hover:bg-destructive/30', markBg: 'bg-destructive/15' };
      case 'medium': return { bg: 'bg-accent/20', border: 'border-accent/40', text: 'text-accent-foreground', hoverBg: 'hover:bg-accent/30', markBg: 'bg-accent/15' };
      case 'low':
      case 'safe': return { bg: 'bg-secondary/20', border: 'border-secondary/40', text: 'text-secondary-foreground', hoverBg: 'hover:bg-secondary/30', markBg: 'bg-secondary/15' };
      default: return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', hoverBg: 'hover:bg-muted', markBg: 'bg-muted' };
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-accent-foreground" />;
      default: return <CheckCircle className="w-4 h-4 text-secondary" />;
    }
  };

  // Build highlighted document text
  const renderHighlightedText = () => {
    if (!extractedText || !clauses.length) {
      return <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{extractedText || 'No text extracted.'}</p>;
    }

    // Find clause positions in text
    type Match = { start: number; end: number; clauseIndex: number };
    const matches: Match[] = [];
    
    clauses.forEach((clause, idx) => {
      if (!clause.text) return;
      // Search for clause text (first 80 chars to handle truncation)
      const searchText = clause.text.substring(0, 80).trim();
      if (searchText.length < 10) return;
      const pos = extractedText.toLowerCase().indexOf(searchText.toLowerCase());
      if (pos !== -1) {
        matches.push({ start: pos, end: pos + clause.text.length, clauseIndex: idx });
      }
    });

    // Sort by position
    matches.sort((a, b) => a.start - b.start);

    // Build segments
    const segments: React.ReactNode[] = [];
    let lastEnd = 0;

    matches.forEach((match, i) => {
      // Text before this match
      if (match.start > lastEnd) {
        segments.push(
          <span key={`text-${i}`} className="text-muted-foreground">
            {extractedText.substring(lastEnd, match.start)}
          </span>
        );
      }

      const clause = clauses[match.clauseIndex];
      const style = getRiskStyle(clause.riskLevel);
      const isSelected = selectedClause === match.clauseIndex;

      segments.push(
        <mark
          key={`clause-${i}`}
          className={`${style.markBg} ${isSelected ? `ring-2 ring-primary ${style.bg}` : ''} rounded px-0.5 cursor-pointer transition-all duration-200 ${style.hoverBg}`}
          onClick={() => setSelectedClause(isSelected ? null : match.clauseIndex)}
          title={`${clause.category} — ${clause.riskLevel} risk`}
        >
          {extractedText.substring(match.start, Math.min(match.end, extractedText.length))}
        </mark>
      );

      lastEnd = Math.min(match.end, extractedText.length);
    });

    // Remaining text
    if (lastEnd < extractedText.length) {
      segments.push(
        <span key="text-end" className="text-muted-foreground">
          {extractedText.substring(lastEnd)}
        </span>
      );
    }

    return (
      <p className="text-sm whitespace-pre-wrap leading-relaxed font-mono">
        {segments.length > 0 ? segments : <span className="text-muted-foreground">{extractedText}</span>}
      </p>
    );
  };

  const selected = selectedClause !== null ? clauses[selectedClause] : null;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Interactive Document Viewer
          <Badge variant="outline" className="ml-auto text-xs">{clauses.length} clauses flagged</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Click highlighted text to see risk details</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 relative">
          {/* Document text with highlights */}
          <ScrollArea className={`${selected ? 'w-3/5' : 'w-full'} h-[500px] transition-all duration-300`}>
            <div className="pr-4">
              {renderHighlightedText()}
            </div>
          </ScrollArea>

          {/* Sidebar with clause detail */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '40%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l border-border pl-4 overflow-hidden"
              >
                <div className="sticky top-0 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(selected.riskLevel)}
                      <Badge variant={selected.riskLevel === 'high' ? 'destructive' : selected.riskLevel === 'medium' ? 'default' : 'secondary'}>
                        {selected.riskLevel?.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedClause(null)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div>
                    <Badge variant="outline" className="mb-2 text-xs">{selected.category}</Badge>
                    {selected.clauseNumber && (
                      <span className="text-xs text-muted-foreground ml-2">§{selected.clauseNumber}</span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs font-medium text-foreground mb-1">Clause Text</p>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">"{selected.text}"</p>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-primary" />
                      What This Means
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{selected.explanation}</p>
                  </div>

                  {/* Navigate clauses */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      disabled={selectedClause === 0}
                      onClick={() => setSelectedClause(prev => Math.max(0, (prev || 0) - 1))}
                    >
                      ← Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      disabled={selectedClause === clauses.length - 1}
                      onClick={() => setSelectedClause(prev => Math.min(clauses.length - 1, (prev || 0) + 1))}
                    >
                      Next →
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    {(selectedClause || 0) + 1} of {clauses.length}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clause legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/20 border border-destructive/40" /> High Risk</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent/20 border border-accent/40" /> Medium Risk</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-secondary/20 border border-secondary/40" /> Low/Safe</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClauseViewer;
