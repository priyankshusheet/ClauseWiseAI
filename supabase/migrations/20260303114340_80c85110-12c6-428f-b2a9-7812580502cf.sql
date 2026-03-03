-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;

-- Step 2: Create user_memories table with vector column
CREATE TABLE public.user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'general',
  metadata JSONB DEFAULT '{}',
  embedding extensions.vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 3: Enable RLS
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS policies
CREATE POLICY "Users can view their own memories"
ON public.user_memories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories"
ON public.user_memories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
ON public.user_memories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
ON public.user_memories FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Updated_at trigger
CREATE TRIGGER update_user_memories_updated_at
BEFORE UPDATE ON public.user_memories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();