-- Create similarity search function for user memories
CREATE OR REPLACE FUNCTION public.match_user_memories(
  query_embedding extensions.vector,
  match_user_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  memory_type TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  SET LOCAL search_path = extensions, public;
  RETURN QUERY
  SELECT
    um.id,
    um.content,
    um.memory_type,
    um.metadata,
    (1 - (um.embedding <=> match_user_memories.query_embedding))::FLOAT AS similarity
  FROM public.user_memories um
  WHERE um.user_id = match_user_memories.match_user_id
    AND (1 - (um.embedding <=> match_user_memories.query_embedding))::FLOAT > match_user_memories.match_threshold
  ORDER BY um.embedding <=> match_user_memories.query_embedding
  LIMIT match_user_memories.match_count;
END;
$$;