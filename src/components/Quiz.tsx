import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Trophy,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizProps {
  quizId: string;
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore?: number;
  onComplete?: (passed: boolean, score: number) => void;
}

const Quiz: React.FC<QuizProps> = ({
  quizId,
  moduleId,
  title,
  questions,
  passingScore = 70,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setShowResults(true);
    
    const correctCount = answers.filter(
      (answer, idx) => answer === questions[idx].correctAnswer
    ).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= passingScore;

    // Save to database
    if (user) {
      try {
        await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          quiz_id: quizId,
          module_id: moduleId,
          answers: answers,
          score: correctCount,
          max_score: questions.length,
          passed,
        });
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
      }
    }

    onComplete?.(passed, score);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + (isAnswered ? 1 : 0)) / questions.length) * 100;
  
  const correctCount = answers.filter(
    (answer, idx) => answer === questions[idx].correctAnswer
  ).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= passingScore;

  if (showResults) {
    return (
      <Card className={`${passed ? 'border-success' : 'border-destructive'}`}>
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-4"
          >
            {passed ? (
              <Trophy className="w-16 h-16 text-warning mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-destructive mx-auto" />
            )}
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>
          
          <p className="text-muted-foreground mb-4">
            You scored {correctCount} out of {questions.length} ({score}%)
          </p>

          <Badge variant={passed ? 'default' : 'destructive'} className="mb-6">
            {passed ? 'PASSED' : 'NOT PASSED'} (Required: {passingScore}%)
          </Badge>

          <div className="space-y-4">
            <div className="text-left">
              <h4 className="font-semibold mb-2">Question Review:</h4>
              {questions.map((q, idx) => {
                const isCorrect = answers[idx] === q.correctAnswer;
                return (
                  <div key={q.id} className="flex items-start gap-2 py-2 border-b last:border-0">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{q.question}</p>
                      {!isCorrect && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Correct: {q.options[q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button onClick={restartQuiz} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="secondary">
            {currentQuestion + 1} / {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <h3 className="font-medium">{question.question}</h3>
            </div>

            <div className="space-y-2">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = question.correctAnswer === idx;
                const showCorrect = isAnswered && isCorrect;
                const showIncorrect = isAnswered && isSelected && !isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    disabled={isAnswered}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      showCorrect
                        ? 'border-success bg-success/10'
                        : showIncorrect
                        ? 'border-destructive bg-destructive/10'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{option}</span>
                      {showCorrect && <CheckCircle className="w-4 h-4 text-success" />}
                      {showIncorrect && <XCircle className="w-4 h-4 text-destructive" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-muted rounded-lg"
              >
                <p className="text-sm font-medium mb-1">Explanation:</p>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end gap-2 pt-2">
          {!isAnswered ? (
            <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentQuestion < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                'See Results'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Quiz;
