-- Fix remaining error-level RLS issues

-- 1. Profiles table - users should only see their own profile (not all authenticated users)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can only view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- 2. Document analyses - strengthen the RLS policy
-- Users can only see their own documents OR documents shared with them
DROP POLICY IF EXISTS "Users can view their own document analyses" ON public.document_analyses;
CREATE POLICY "Users can view own or shared document analyses"
ON public.document_analyses FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.document_shares ds
    WHERE ds.document_id = document_analyses.id
    AND ds.shared_with::uuid = auth.uid()
    AND (ds.expires_at IS NULL OR ds.expires_at > now())
  )
);