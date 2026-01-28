import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Trophy, 
  Star, 
  CheckCircle, 
  BookOpen,
  Target,
  Clock,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  totalTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Lesson {
  id: string;
  title: string;
  duration: number;
  hasQuiz: boolean;
}

interface UserProgress {
  moduleId: string;
  lessonId?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  quizScores: { quizId: string; score: number; maxScore: number }[];
  completedAt?: string;
}

// Module data
const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'insurance-basics',
    title: 'Insurance Policy Fundamentals',
    description: 'Learn to read and understand insurance policies',
    totalTime: 45,
    difficulty: 'beginner',
    lessons: [
      { id: 'ins-1', title: 'Policy Structure Overview', duration: 10, hasQuiz: true },
      { id: 'ins-2', title: 'Understanding Premiums & Deductibles', duration: 12, hasQuiz: true },
      { id: 'ins-3', title: 'Exclusions & Waiting Periods', duration: 15, hasQuiz: true },
      { id: 'ins-4', title: 'Claims Process', duration: 8, hasQuiz: false },
    ],
  },
  {
    id: 'loan-analysis',
    title: 'Loan Agreement Analysis',
    description: 'Master the art of analyzing loan terms',
    totalTime: 60,
    difficulty: 'intermediate',
    lessons: [
      { id: 'loan-1', title: 'Interest Rate Types', duration: 15, hasQuiz: true },
      { id: 'loan-2', title: 'Understanding EMI Calculations', duration: 15, hasQuiz: true },
      { id: 'loan-3', title: 'Prepayment & Penalties', duration: 15, hasQuiz: true },
      { id: 'loan-4', title: 'Collateral & Security', duration: 15, hasQuiz: false },
    ],
  },
  {
    id: 'credit-cards',
    title: 'Credit Card Terms Decoded',
    description: 'Navigate credit card agreements confidently',
    totalTime: 40,
    difficulty: 'beginner',
    lessons: [
      { id: 'cc-1', title: 'APR & Interest Calculations', duration: 12, hasQuiz: true },
      { id: 'cc-2', title: 'Fees: Annual, Late, Foreign', duration: 10, hasQuiz: true },
      { id: 'cc-3', title: 'Rewards & Cashback Programs', duration: 10, hasQuiz: false },
      { id: 'cc-4', title: 'Credit Limit & Utilization', duration: 8, hasQuiz: true },
    ],
  },
  {
    id: 'risk-identification',
    title: 'Advanced Risk Identification',
    description: 'Identify hidden risks like a professional',
    totalTime: 75,
    difficulty: 'advanced',
    lessons: [
      { id: 'risk-1', title: 'Red Flags in Financial Documents', duration: 20, hasQuiz: true },
      { id: 'risk-2', title: 'Legal Language Interpretation', duration: 20, hasQuiz: true },
      { id: 'risk-3', title: 'Comparative Analysis Techniques', duration: 20, hasQuiz: true },
      { id: 'risk-4', title: 'Negotiation Strategies', duration: 15, hasQuiz: false },
    ],
  },
];

const LearningProgress: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const progress: UserProgress[] = (data || []).map((p: any) => ({
        moduleId: p.module_id,
        lessonId: p.lesson_id,
        status: p.status,
        progressPercentage: p.progress_percentage,
        quizScores: p.quiz_scores || [],
        completedAt: p.completed_at,
      }));

      setUserProgress(progress);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string): number => {
    const moduleProgress = userProgress.find(p => p.moduleId === moduleId && !p.lessonId);
    return moduleProgress?.progressPercentage || 0;
  };

  const getModuleStatus = (moduleId: string): UserProgress['status'] => {
    const moduleProgress = userProgress.find(p => p.moduleId === moduleId && !p.lessonId);
    return moduleProgress?.status || 'not_started';
  };

  const getTotalProgress = (): number => {
    const completedModules = userProgress.filter(p => p.status === 'completed' && !p.lessonId).length;
    return Math.round((completedModules / LEARNING_MODULES.length) * 100);
  };

  const getTotalQuizScore = (): { earned: number; total: number } => {
    let earned = 0;
    let total = 0;
    
    userProgress.forEach(p => {
      p.quizScores.forEach(q => {
        earned += q.score;
        total += q.maxScore;
      });
    });

    return { earned, total };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success/10 text-success';
      case 'intermediate': return 'bg-warning/10 text-warning';
      case 'advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalProgress = getTotalProgress();
  const quizScore = getTotalQuizScore();

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Learning Journey</h2>
                <p className="text-muted-foreground text-sm">
                  Track your progress across all modules
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{totalProgress}%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>

          <Progress value={totalProgress} className="h-3 mb-4" />

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-background rounded-lg">
              <Trophy className="w-5 h-5 text-warning mx-auto mb-1" />
              <p className="font-semibold">{userProgress.filter(p => p.status === 'completed' && !p.lessonId).length}</p>
              <p className="text-xs text-muted-foreground">Modules Done</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Star className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-semibold">
                {quizScore.total > 0 ? Math.round((quizScore.earned / quizScore.total) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Quiz Avg</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Clock className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="font-semibold">
                {userProgress.reduce((acc, p) => acc + (p.progressPercentage > 0 ? 15 : 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Mins Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Learning Modules
        </h3>

        {LEARNING_MODULES.map((module, idx) => {
          const progress = getModuleProgress(module.id);
          const status = getModuleStatus(module.id);

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={status === 'completed' ? 'border-success/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{module.title}</h4>
                        <Badge className={getDifficultyColor(module.difficulty)}>
                          {module.difficulty}
                        </Badge>
                        {status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-primary">{progress}%</p>
                      <p className="text-xs text-muted-foreground">{module.totalTime} min</p>
                    </div>
                  </div>

                  <Progress value={progress} className="h-2 mb-3" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {module.lessons.length} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {module.lessons.filter(l => l.hasQuiz).length} quizzes
                      </span>
                    </div>
                    <Button size="sm" variant={status === 'not_started' ? 'default' : 'outline'}>
                      {status === 'not_started' ? 'Start' : status === 'completed' ? 'Review' : 'Continue'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your document analysis history and learning patterns
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Understanding Auto-Renewal Clauses</p>
                <p className="text-xs text-muted-foreground">Frequently found in your documents</p>
              </div>
              <Button size="sm" variant="outline">Learn</Button>
            </div>
            <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Penalty Fee Negotiation</p>
                <p className="text-xs text-muted-foreground">High-impact skill for your risk profile</p>
              </div>
              <Button size="sm" variant="outline">Learn</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningProgress;
