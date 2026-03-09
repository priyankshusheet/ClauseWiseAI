import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, X, Copy, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface NegotiateClauseProps {
  clauseText: string;
  clauseCategory: string;
  riskLevel: string;
  explanation: string;
  documentType?: string;
}

const NegotiateClause: React.FC<NegotiateClauseProps> = ({
  clauseText, clauseCategory, riskLevel, explanation, documentType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateNegotiationAdvice = async () => {
    setIsLoading(true);
    setIsOpen(true);
    setResponse(null);
    
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const functionUrl = `https://${projectId}.supabase.co/functions/v1/ai-chat`;

      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an expert negotiation advisor specializing in financial and legal documents. Provide practical, specific negotiation language that a consumer can use. Be direct and actionable. Format with markdown.`,
            },
            {
              role: 'user',
              content: `I found this ${riskLevel}-risk clause in my ${documentType || 'financial'} document:

"${clauseText}"

Category: ${clauseCategory}
Risk explanation: ${explanation}

Please provide:
1. **Why this clause is problematic** (1-2 sentences)
2. **Specific counter-proposal language** I can use (exact words to say/write)
3. **Fallback position** if they won't change it
4. **Key leverage points** I can use in negotiation

Keep it practical and consumer-friendly.`,
            },
          ],
          stream: false,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error('Rate limit exceeded');
        if (res.status === 402) throw new Error('AI credits exhausted');
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '';
      
      if (content) {
        setResponse(content);
      } else {
        setResponse('Unable to generate negotiation advice. Please try the Chat feature to discuss this clause.');
      }
    } catch (err) {
      console.error('Negotiation advice error:', err);
      setResponse('Unable to generate negotiation advice right now. Please try the Chat feature to discuss this clause with AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      toast({ title: 'Copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (riskLevel?.toLowerCase() !== 'high' && riskLevel?.toLowerCase() !== 'medium') return null;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
        onClick={generateNegotiationAdvice}
        disabled={isLoading}
      >
        <MessageSquare className="w-3 h-3" />
        Negotiate This
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2"
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Negotiation Advice</span>
                    <Badge variant="outline" className="text-xs">AI-Generated</Badge>
                  </div>
                  <div className="flex gap-1">
                    {response && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyToClipboard}>
                        {copied ? <CheckCircle className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating negotiation strategy...
                  </div>
                ) : response ? (
                  <div className="prose prose-sm max-w-none text-foreground [&_strong]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                ) : null}

                <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
                  ⚠️ This is AI-generated advice, not legal counsel. Consult a professional for important negotiations.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NegotiateClause;
