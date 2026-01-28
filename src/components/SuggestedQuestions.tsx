import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuggestedQuestionsProps {
  documentContext?: {
    fileName?: string;
    documentType?: string;
    riskLevel?: string;
    riskScore?: number;
    detectedClauses?: string[];
  };
  onSelectQuestion: (question: string) => void;
  isProcessing?: boolean;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  documentContext,
  onSelectQuestion,
  isProcessing = false
}) => {
  // Generate context-aware questions based on document
  const generateQuestions = (): { question: string; icon: React.ReactNode; category: string }[] => {
    const questions: { question: string; icon: React.ReactNode; category: string }[] = [];

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
    }

    // Document-specific questions
    const { documentType, riskLevel, riskScore, detectedClauses } = documentContext;

    // Risk-based questions
    if (riskLevel === 'high' || (riskScore && riskScore >= 70)) {
      questions.push({
        question: 'What are the highest risk clauses in this document?',
        icon: <AlertTriangle className="w-3 h-3 text-destructive" />,
        category: 'Risk',
      });
      questions.push({
        question: 'How can I negotiate these risky terms?',
        icon: <TrendingUp className="w-3 h-3" />,
        category: 'Action',
      });
    }

    // Document type-specific questions
    if (documentType === 'insurance') {
      questions.push({
        question: 'What exclusions should I be aware of?',
        icon: <AlertTriangle className="w-3 h-3" />,
        category: 'Insurance',
      });
      questions.push({
        question: 'Is the waiting period reasonable?',
        icon: <HelpCircle className="w-3 h-3" />,
        category: 'Insurance',
      });
    } else if (documentType === 'loan') {
      questions.push({
        question: 'Are there any prepayment penalties?',
        icon: <AlertTriangle className="w-3 h-3" />,
        category: 'Loans',
      });
      questions.push({
        question: 'How does the interest rate compare to market average?',
        icon: <TrendingUp className="w-3 h-3" />,
        category: 'Loans',
      });
    } else if (documentType === 'creditCard') {
      questions.push({
        question: 'What are the annual fees and how can I avoid them?',
        icon: <AlertTriangle className="w-3 h-3" />,
        category: 'Credit Cards',
      });
      questions.push({
        question: 'What happens if I miss a payment?',
        icon: <HelpCircle className="w-3 h-3" />,
        category: 'Credit Cards',
      });
    }

    // Clause-based questions
    if (detectedClauses && detectedClauses.length > 0) {
      if (detectedClauses.some(c => c.toLowerCase().includes('auto-renewal'))) {
        questions.push({
          question: 'How can I cancel auto-renewal?',
          icon: <Sparkles className="w-3 h-3" />,
          category: 'Terms',
        });
      }
      if (detectedClauses.some(c => c.toLowerCase().includes('penalty'))) {
        questions.push({
          question: 'What penalties apply and how can I avoid them?',
          icon: <AlertTriangle className="w-3 h-3" />,
          category: 'Fees',
        });
      }
    }

    // Always add general questions
    questions.push({
      question: 'Summarize the key terms in plain language',
      icon: <Sparkles className="w-3 h-3" />,
      category: 'Summary',
    });
    questions.push({
      question: 'What questions should I ask before signing?',
      icon: <HelpCircle className="w-3 h-3" />,
      category: 'Action',
    });

    return questions.slice(0, 6); // Limit to 6 questions
  };

  const questions = generateQuestions();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="w-3 h-3" />
        <span>Suggested questions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((item, idx) => (
          <motion.div
            key={idx}
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
