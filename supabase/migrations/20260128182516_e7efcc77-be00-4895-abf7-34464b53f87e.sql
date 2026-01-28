-- Document versions table for version tracking
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.document_analyses(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  extracted_text TEXT,
  analysis_result JSONB,
  risk_score INTEGER,
  risk_level TEXT,
  changes_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(document_id, version_number)
);

-- Portfolios for multi-document grouping
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  aggregate_risk_score INTEGER,
  aggregate_risk_level TEXT,
  document_count INTEGER DEFAULT 0,
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Portfolio documents junction table
CREATE TABLE public.portfolio_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.document_analyses(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(portfolio_id, document_id)
);

-- Document shares for collaboration
CREATE TABLE public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.document_analyses(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with UUID NOT NULL,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(document_id, shared_with)
);

-- Comments and annotations
CREATE TABLE public.document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.document_analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.document_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  clause_reference TEXT,
  position_start INTEGER,
  position_end INTEGER,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Learning progress tracking
CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  lesson_id TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  quiz_scores JSONB DEFAULT '[]'::jsonb,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, module_id, lesson_id)
);

-- Quiz attempts
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Document versions policies
CREATE POLICY "Users can view versions of their documents" ON public.document_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.document_analyses WHERE id = document_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.document_shares WHERE document_id = document_versions.document_id AND shared_with = auth.uid())
  );

CREATE POLICY "Users can insert versions for their documents" ON public.document_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.document_analyses WHERE id = document_id AND user_id = auth.uid())
  );

-- Portfolios policies
CREATE POLICY "Users can manage their own portfolios" ON public.portfolios
  FOR ALL USING (auth.uid() = user_id);

-- Portfolio documents policies
CREATE POLICY "Users can manage their portfolio documents" ON public.portfolio_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.portfolios WHERE id = portfolio_id AND user_id = auth.uid())
  );

-- Document shares policies
CREATE POLICY "Users can view shares for their documents" ON public.document_shares
  FOR SELECT USING (shared_by = auth.uid() OR shared_with = auth.uid());

CREATE POLICY "Users can create shares for their documents" ON public.document_shares
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.document_analyses WHERE id = document_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own shares" ON public.document_shares
  FOR DELETE USING (shared_by = auth.uid());

-- Comments policies
CREATE POLICY "Users can view comments on accessible documents" ON public.document_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.document_analyses WHERE id = document_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.document_shares WHERE document_id = document_comments.document_id AND shared_with = auth.uid())
  );

CREATE POLICY "Users can create comments on accessible documents" ON public.document_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (SELECT 1 FROM public.document_analyses WHERE id = document_id AND user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.document_shares WHERE document_id = document_comments.document_id AND shared_with = auth.uid() AND permission IN ('comment', 'edit'))
    )
  );

CREATE POLICY "Users can update their own comments" ON public.document_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON public.document_comments
  FOR DELETE USING (user_id = auth.uid());

-- Learning progress policies
CREATE POLICY "Users can manage their learning progress" ON public.learning_progress
  FOR ALL USING (auth.uid() = user_id);

-- Quiz attempts policies
CREATE POLICY "Users can manage their quiz attempts" ON public.quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

-- Add update triggers
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_comments_updated_at
  BEFORE UPDATE ON public.document_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();