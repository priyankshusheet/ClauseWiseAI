import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertTriangle, HelpCircle, MessageSquare, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConversationMessage {
  content: string;
  isUser: boolean;
}

interface SuggestedQuestionsProps {
  documentContext?: {
    fileName?: string;
    documentType?: string;
    riskLevel?: string;
    riskScore?: number;
    detectedClauses?: string[];
  };
  conversationHistory?: ConversationMessage[];
  onSelectQuestion: (question: string) => void;
  isProcessing?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'sparkles': <Sparkles className="w-3 h-3" />,
  'trending-up': <TrendingUp className="w-3 h-3" />,
  'alert-triangle': <AlertTriangle className="w-3 h-3" />,
  'help-circle': <HelpCircle className="w-3 h-3" />,
  'message-square': <MessageSquare className="w-3 h-3" />,
  'refresh-cw': <RefreshCw className="w-3 h-3" />,
};

const SUGGESTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-suggestions`;

// Default questions when no context
const DEFAULT_QUESTIONS = [
  { question: 'What should I look for in an insurance policy?', icon: <HelpCircle className="w-3 h-3" />, category: 'General' },
  { question: 'How do I compare loan interest rates?', icon: <TrendingUp className="w-3 h-3" />, category: 'Loans' },
  { question: 'What are common hidden fees in credit cards?', icon: <AlertTriangle className="w-3 h-3" />, category: 'Credit Cards' },
  { question: 'Explain the concept of deductibles', icon: <Sparkles className="w-3 h-3" />, category: 'Insurance' },
];

const DOCUMENT_DEFAULT_QUESTIONS = [
  { question: 'Summarize the key terms in plain language', icon: <Sparkles className="w-3 h-3" />, category: 'Summary' },
  { question: 'What are the main risks in this document?', icon: <AlertTriangle className="w-3 h-3" />, category: 'Risk' },
  { question: 'What fees and charges apply?', icon: <TrendingUp className="w-3 h-3" />, category: 'Costs' },
  { question: 'What questions should I ask before signing?', icon: <HelpCircle className="w-3 h-3" />, category: 'Action' },
];

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  documentContext,
  conversationHistory = [],
  onSelectQuestion,
  isProcessing = false
}) => {
  const [aiSuggestions, setAiSuggestions] = useState<{ question: string; icon: React.ReactNode; category: string }[] | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Track the last assistant message count to trigger fetching
  const assistantMessageCount = useMemo(
    () => conversationHistory.filter(m => !m.isUser).length,
    [conversationHistory]
  );

  const fetchAiSuggestions = useCallback(async () => {
    if (conversationHistory.length < 2) return;
    
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(SUGGESTIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          conversationHistory: conversationHistory.slice(-6),
          documentContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          const mapped = data.suggestions.map((s: any) => ({
            question: s.question,
            icon: ICON_MAP[s.icon] || <Sparkles className="w-3 h-3" />,
            category: s.category || 'Follow-up',
          }));
          setAiSuggestions(mapped);
        }
      }
    } catch (e) {
      console.warn('[SuggestedQuestions] Failed to fetch AI suggestions:', e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [conversationHistory, documentContext]);

  // Fetch new suggestions whenever a new assistant message arrives
  useEffect(() => {
    if (assistantMessageCount > 1 && !isProcessing) {
      setAiSuggestions(null);
      fetchAiSuggestions();
    }
  }, [assistantMessageCount, isProcessing]);

  // Determine which questions to show
  const questions = useMemo(() => {
    if (aiSuggestions && aiSuggestions.length > 0) return aiSuggestions;
    if (conversationHistory.length <= 1) {
      return documentContext ? DOCUMENT_DEFAULT_QUESTIONS : DEFAULT_QUESTIONS;
    }
    return null; // Will show loading or nothing
  }, [aiSuggestions, conversationHistory.length, documentContext]);

  if (!questions && !isLoadingSuggestions) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="w-3 h-3" />
        <span>{conversationHistory.length > 1 ? 'Continue the conversation' : 'Suggested questions'}</span>
        {isLoadingSuggestions && <Loader2 className="w-3 h-3 animate-spin" />}
      </div>
      <div className="flex flex-wrap gap-2">
        {isLoadingSuggestions && !questions ? (
          // Skeleton pills while loading
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-8 w-48 rounded-md bg-muted animate-pulse" />
          ))
        ) : (
          questions?.map((item, idx) => (
            <motion.div
              key={`${item.question}-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectQuestion(item.question)}
                disabled={isProcessing}
                className="h-auto py-2 px-3 text-left text-xs font-normal whitespace-normal"
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.question}
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
