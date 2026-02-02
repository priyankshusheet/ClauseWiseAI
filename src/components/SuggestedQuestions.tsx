import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertTriangle, HelpCircle, MessageSquare, RefreshCw } from 'lucide-react';
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

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  documentContext,
  conversationHistory = [],
  onSelectQuestion,
  isProcessing = false
}) => {
  // Analyze conversation to understand context
  const conversationContext = useMemo(() => {
    if (conversationHistory.length === 0) return null;

    const recentMessages = conversationHistory.slice(-6); // Last 3 exchanges
    const allText = recentMessages.map(m => m.content.toLowerCase()).join(' ');
    
    // Detect topics discussed
    const topics = {
      fees: /fee|charge|cost|price|payment|penalty/i.test(allText),
      coverage: /coverage|cover|protect|insur|claim/i.test(allText),
      interest: /interest|rate|apr|percentage/i.test(allText),
      terms: /term|condition|clause|agreement|contract/i.test(allText),
      cancellation: /cancel|terminat|withdraw|exit/i.test(allText),
      renewal: /renew|auto.?renew|extend|continue/i.test(allText),
      risk: /risk|danger|warn|careful|concern/i.test(allText),
      comparison: /compare|vs|versus|better|alternative/i.test(allText),
      exclusion: /exclus|except|not cover|limit/i.test(allText),
      deadline: /deadline|time|period|expire|duration/i.test(allText),
    };

    // Get the last assistant message to understand what was just discussed
    const lastAssistantMessage = recentMessages.filter(m => !m.isUser).pop()?.content || '';
    
    // Get the last user question to avoid repeating similar questions
    const lastUserQuestion = recentMessages.filter(m => m.isUser).pop()?.content || '';

    return { topics, lastAssistantMessage, lastUserQuestion };
  }, [conversationHistory]);

  // Generate context-aware questions based on document AND conversation
  const generateQuestions = useMemo((): { question: string; icon: React.ReactNode; category: string }[] => {
    const questions: { question: string; icon: React.ReactNode; category: string }[] = [];

    // If there's conversation context, generate follow-up questions
    if (conversationContext && conversationHistory.length > 1) {
      const { topics, lastAssistantMessage, lastUserQuestion } = conversationContext;

      // Deep-dive questions based on topics discussed
      if (topics.fees && !topics.comparison) {
        questions.push({
          question: 'How do these fees compare to industry standards?',
          icon: <TrendingUp className="w-3 h-3" />,
          category: 'Follow-up',
        });
      }

      if (topics.coverage && !topics.exclusion) {
        questions.push({
          question: 'What specific exclusions should I watch out for?',
          icon: <AlertTriangle className="w-3 h-3" />,
          category: 'Follow-up',
        });
      }

      if (topics.risk && !topics.terms) {
        questions.push({
          question: 'Can you explain the specific terms causing this risk?',
          icon: <HelpCircle className="w-3 h-3" />,
          category: 'Clarify',
        });
      }

      if (topics.terms && !topics.cancellation) {
        questions.push({
          question: 'What are the cancellation and exit options?',
          icon: <RefreshCw className="w-3 h-3" />,
          category: 'Action',
        });
      }

      if (topics.interest || topics.fees) {
        questions.push({
          question: 'What is the total cost over the full term?',
          icon: <TrendingUp className="w-3 h-3" />,
          category: 'Calculate',
        });
      }

      if (topics.renewal) {
        questions.push({
          question: 'How can I opt out of automatic renewals?',
          icon: <AlertTriangle className="w-3 h-3" />,
          category: 'Action',
        });
      }

      if (topics.comparison) {
        questions.push({
          question: 'What questions should I ask the provider before signing?',
          icon: <MessageSquare className="w-3 h-3" />,
          category: 'Prepare',
        });
      }

      // Generic follow-up questions based on conversation flow
      if (lastAssistantMessage.length > 200) {
        questions.push({
          question: 'Can you summarize the key points more briefly?',
          icon: <Sparkles className="w-3 h-3" />,
          category: 'Clarify',
        });
      }

      // Suggest deeper exploration
      if (conversationHistory.length >= 4) {
        questions.push({
          question: 'Based on our discussion, what are the top 3 things I should negotiate?',
          icon: <TrendingUp className="w-3 h-3" />,
          category: 'Action',
        });
      }
    }

    // Document-specific questions (if document is loaded)
    if (documentContext) {
      const { documentType, riskLevel, riskScore, detectedClauses } = documentContext;

      // Only add document questions if we don't have enough conversation-based ones
      if (questions.length < 3) {
        // Risk-based questions
        if (riskLevel === 'high' || (riskScore && riskScore >= 70)) {
          if (!conversationContext?.topics.risk) {
            questions.push({
              question: 'What are the highest risk clauses in this document?',
              icon: <AlertTriangle className="w-3 h-3 text-destructive" />,
              category: 'Risk',
            });
          }
        }

        // Document type-specific questions
        if (documentType === 'insurance' && !conversationContext?.topics.exclusion) {
          questions.push({
            question: 'What exclusions should I be aware of?',
            icon: <AlertTriangle className="w-3 h-3" />,
            category: 'Insurance',
          });
        } else if (documentType === 'loan' && !conversationContext?.topics.fees) {
          questions.push({
            question: 'Are there any prepayment penalties?',
            icon: <AlertTriangle className="w-3 h-3" />,
            category: 'Loans',
          });
        } else if (documentType === 'creditCard' && !conversationContext?.topics.fees) {
          questions.push({
            question: 'What are the annual fees and how can I avoid them?',
            icon: <AlertTriangle className="w-3 h-3" />,
            category: 'Credit Cards',
          });
        }

        // Clause-based questions
        if (detectedClauses && detectedClauses.length > 0) {
          if (detectedClauses.some(c => c.toLowerCase().includes('auto-renewal')) && !conversationContext?.topics.renewal) {
            questions.push({
              question: 'How can I cancel auto-renewal?',
              icon: <Sparkles className="w-3 h-3" />,
              category: 'Terms',
            });
          }
        }
      }
    }

    // Default questions when no context
    if (questions.length === 0) {
      if (!documentContext) {
        // Generic questions when no document is loaded
        return [
          {
            question: 'What should I look for in an insurance policy?',
            icon: <HelpCircle className="w-3 h-3" />,
            category: 'General',
          },
          {
            question: 'How do I compare loan interest rates?',
            icon: <TrendingUp className="w-3 h-3" />,
            category: 'Loans',
          },
          {
            question: 'What are common hidden fees in credit cards?',
            icon: <AlertTriangle className="w-3 h-3" />,
            category: 'Credit Cards',
          },
          {
            question: 'Explain the concept of deductibles',
            icon: <Sparkles className="w-3 h-3" />,
            category: 'Insurance',
          },
        ];
      } else {
        // Document loaded but no conversation yet
        return [
          {
            question: 'Summarize the key terms in plain language',
            icon: <Sparkles className="w-3 h-3" />,
            category: 'Summary',
          },
          {
            question: 'What are the main risks in this document?',
            icon: <AlertTriangle className="w-3 h-3" />,
            category: 'Risk',
          },
          {
            question: 'What fees and charges apply?',
            icon: <TrendingUp className="w-3 h-3" />,
            category: 'Costs',
          },
          {
            question: 'What questions should I ask before signing?',
            icon: <HelpCircle className="w-3 h-3" />,
            category: 'Action',
          },
        ];
      }
    }

    // Always add a "what else" question if conversation is ongoing
    if (conversationHistory.length > 2 && questions.length < 4) {
      questions.push({
        question: 'What else should I know about this document?',
        icon: <MessageSquare className="w-3 h-3" />,
        category: 'Explore',
      });
    }

    return questions.slice(0, 4); // Limit to 4 questions for cleaner UI
  }, [documentContext, conversationContext, conversationHistory.length]);

  const questions = generateQuestions;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="w-3 h-3" />
        <span>{conversationHistory.length > 1 ? 'Continue the conversation' : 'Suggested questions'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((item, idx) => (
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
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
