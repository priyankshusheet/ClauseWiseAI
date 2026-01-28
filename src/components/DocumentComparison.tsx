import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GitCompare, 
  ArrowLeftRight, 
  Plus, 
  Minus, 
  Edit3, 
  AlertTriangle,
  CheckCircle,
  Link2,
  Link2Off
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentData {
  id: string;
  fileName: string;
  extractedText: string;
  riskScore?: number;
  riskLevel?: string;
  sections?: { title: string; content: string }[];
}

interface DiffResult {
  type: 'unchanged' | 'added' | 'removed' | 'modified' | 'semantic';
  lineNumber: number;
  leftContent?: string;
  rightContent?: string;
  explanation?: string;
}

interface DocumentComparisonProps {
  documentA: DocumentData;
  documentB: DocumentData;
  onClose?: () => void;
}

const DocumentComparison: React.FC<DocumentComparisonProps> = ({
  documentA,
  documentB,
  onClose
}) => {
  const [syncScroll, setSyncScroll] = useState(true);
  const [diffResults, setDiffResults] = useState<DiffResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Synchronized scrolling
  const handleScroll = useCallback((source: 'left' | 'right') => {
    if (!syncScroll || isScrolling.current) return;
    
    isScrolling.current = true;
    const sourceRef = source === 'left' ? leftScrollRef : rightScrollRef;
    const targetRef = source === 'left' ? rightScrollRef : leftScrollRef;
    
    if (sourceRef.current && targetRef.current) {
      const scrollPercentage = sourceRef.current.scrollTop / 
        (sourceRef.current.scrollHeight - sourceRef.current.clientHeight);
      targetRef.current.scrollTop = scrollPercentage * 
        (targetRef.current.scrollHeight - targetRef.current.clientHeight);
    }
    
    setTimeout(() => { isScrolling.current = false; }, 50);
  }, [syncScroll]);

  // Compute diff on mount
  useEffect(() => {
    computeDiff();
  }, [documentA, documentB]);

  const computeDiff = () => {
    setIsAnalyzing(true);
    
    // Split into lines/paragraphs
    const linesA = documentA.extractedText.split('\n').filter(l => l.trim());
    const linesB = documentB.extractedText.split('\n').filter(l => l.trim());
    
    const results: DiffResult[] = [];
    
    // Simple LCS-based diff algorithm
    const lcs = computeLCS(linesA, linesB);
    
    let i = 0, j = 0, k = 0;
    
    while (i < linesA.length || j < linesB.length) {
      if (k < lcs.length && i < linesA.length && linesA[i] === lcs[k]) {
        if (j < linesB.length && linesB[j] === lcs[k]) {
          results.push({
            type: 'unchanged',
            lineNumber: results.length + 1,
            leftContent: linesA[i],
            rightContent: linesB[j],
          });
          i++; j++; k++;
        } else {
          results.push({
            type: 'added',
            lineNumber: results.length + 1,
            rightContent: linesB[j],
          });
          j++;
        }
      } else if (j < linesB.length && k < lcs.length && linesB[j] === lcs[k]) {
        results.push({
          type: 'removed',
          lineNumber: results.length + 1,
          leftContent: linesA[i],
        });
        i++;
      } else if (i < linesA.length && j < linesB.length) {
        // Check for semantic similarity (same intent, different wording)
        const similarity = computeSimilarity(linesA[i], linesB[j]);
        if (similarity > 0.6) {
          results.push({
            type: 'semantic',
            lineNumber: results.length + 1,
            leftContent: linesA[i],
            rightContent: linesB[j],
            explanation: 'Similar meaning, different wording',
          });
        } else {
          results.push({
            type: 'modified',
            lineNumber: results.length + 1,
            leftContent: linesA[i],
            rightContent: linesB[j],
          });
        }
        i++; j++;
      } else if (i < linesA.length) {
        results.push({
          type: 'removed',
          lineNumber: results.length + 1,
          leftContent: linesA[i],
        });
        i++;
      } else {
        results.push({
          type: 'added',
          lineNumber: results.length + 1,
          rightContent: linesB[j],
        });
        j++;
      }
    }
    
    setDiffResults(results);
    setIsAnalyzing(false);
  };

  const computeLCS = (a: string[], b: string[]): string[] => {
    const dp: number[][] = Array(a.length + 1).fill(null).map(() => 
      Array(b.length + 1).fill(0)
    );
    
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i-1] === b[j-1]) {
          dp[i][j] = dp[i-1][j-1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
      }
    }
    
    const result: string[] = [];
    let i = a.length, j = b.length;
    while (i > 0 && j > 0) {
      if (a[i-1] === b[j-1]) {
        result.unshift(a[i-1]);
        i--; j--;
      } else if (dp[i-1][j] > dp[i][j-1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return result;
  };

  const computeSimilarity = (a: string, b: string): number => {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
    const union = new Set([...wordsA, ...wordsB]).size;
    return intersection / union;
  };

  const stats = {
    added: diffResults.filter(d => d.type === 'added').length,
    removed: diffResults.filter(d => d.type === 'removed').length,
    modified: diffResults.filter(d => d.type === 'modified').length,
    semantic: diffResults.filter(d => d.type === 'semantic').length,
  };

  const getDiffColor = (type: DiffResult['type']) => {
    switch (type) {
      case 'added': return 'bg-success/20 border-l-4 border-success';
      case 'removed': return 'bg-destructive/20 border-l-4 border-destructive';
      case 'modified': return 'bg-warning/20 border-l-4 border-warning';
      case 'semantic': return 'bg-primary/20 border-l-4 border-primary';
      default: return '';
    }
  };

  return (
    <Card className="w-full h-full flex flex-col bg-card">
      <CardHeader className="border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            Document Comparison
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={syncScroll ? "default" : "outline"}
              size="sm"
              onClick={() => setSyncScroll(!syncScroll)}
            >
              {syncScroll ? <Link2 className="w-4 h-4 mr-1" /> : <Link2Off className="w-4 h-4 mr-1" />}
              Sync Scroll
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'split' ? 'unified' : 'split')}
            >
              <ArrowLeftRight className="w-4 h-4 mr-1" />
              {viewMode === 'split' ? 'Unified' : 'Split'}
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="secondary" className="gap-1">
            <Plus className="w-3 h-3 text-success" />
            {stats.added} added
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Minus className="w-3 h-3 text-destructive" />
            {stats.removed} removed
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Edit3 className="w-3 h-3 text-warning" />
            {stats.modified} modified
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <ArrowLeftRight className="w-3 h-3 text-primary" />
            {stats.semantic} semantic
          </Badge>
        </div>

        {/* Document headers */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium truncate">{documentA.fileName}</p>
            <div className="flex items-center gap-2 mt-1">
              {documentA.riskLevel && (
                <Badge variant={
                  documentA.riskLevel === 'high' ? 'destructive' :
                  documentA.riskLevel === 'medium' ? 'default' : 'secondary'
                }>
                  Risk: {documentA.riskScore}/100
                </Badge>
              )}
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium truncate">{documentB.fileName}</p>
            <div className="flex items-center gap-2 mt-1">
              {documentB.riskLevel && (
                <Badge variant={
                  documentB.riskLevel === 'high' ? 'destructive' :
                  documentB.riskLevel === 'medium' ? 'default' : 'secondary'
                }>
                  Risk: {documentB.riskScore}/100
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Analyzing differences...</p>
            </div>
          </div>
        ) : viewMode === 'split' ? (
          <div className="grid grid-cols-2 h-full divide-x divide-border">
            <ScrollArea 
              className="h-full"
              ref={leftScrollRef}
              onScroll={() => handleScroll('left')}
            >
              <div className="p-4 space-y-1">
                {diffResults.map((diff, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-2 rounded text-sm ${
                      diff.type === 'removed' || diff.type === 'modified' || diff.type === 'semantic'
                        ? getDiffColor(diff.type)
                        : diff.type === 'added' ? 'opacity-30' : ''
                    }`}
                  >
                    <span className="text-muted-foreground mr-2 text-xs">{diff.lineNumber}</span>
                    {diff.leftContent || (diff.type === 'added' ? '—' : '')}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
            <ScrollArea 
              className="h-full"
              ref={rightScrollRef}
              onScroll={() => handleScroll('right')}
            >
              <div className="p-4 space-y-1">
                {diffResults.map((diff, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-2 rounded text-sm ${
                      diff.type === 'added' || diff.type === 'modified' || diff.type === 'semantic'
                        ? getDiffColor(diff.type)
                        : diff.type === 'removed' ? 'opacity-30' : ''
                    }`}
                  >
                    <span className="text-muted-foreground mr-2 text-xs">{diff.lineNumber}</span>
                    {diff.rightContent || (diff.type === 'removed' ? '—' : '')}
                    {diff.type === 'semantic' && diff.explanation && (
                      <span className="ml-2 text-xs text-primary italic">({diff.explanation})</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              {diffResults.map((diff, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-2 rounded text-sm ${getDiffColor(diff.type)}`}
                >
                  <div className="flex items-start gap-2">
                    {diff.type === 'added' && <Plus className="w-4 h-4 text-success shrink-0 mt-0.5" />}
                    {diff.type === 'removed' && <Minus className="w-4 h-4 text-destructive shrink-0 mt-0.5" />}
                    {diff.type === 'modified' && <Edit3 className="w-4 h-4 text-warning shrink-0 mt-0.5" />}
                    {diff.type === 'semantic' && <ArrowLeftRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      {diff.type === 'modified' || diff.type === 'semantic' ? (
                        <>
                          <p className="line-through opacity-60">{diff.leftContent}</p>
                          <p>{diff.rightContent}</p>
                          {diff.explanation && (
                            <p className="text-xs text-primary mt-1 italic">{diff.explanation}</p>
                          )}
                        </>
                      ) : (
                        <p>{diff.leftContent || diff.rightContent}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentComparison;
