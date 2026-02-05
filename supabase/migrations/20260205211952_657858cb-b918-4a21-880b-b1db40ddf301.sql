-- Fix RLS policies for all exposed tables - using DROP IF EXISTS first
-- Tables identified as publicly accessible without proper authentication

-- 1. profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- 2. api_keys table
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;
CREATE POLICY "Users can view their own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

-- 3. webhooks table
DROP POLICY IF EXISTS "Users can view their own webhooks" ON public.webhooks;
CREATE POLICY "Users can view their own webhooks"
ON public.webhooks FOR SELECT
USING (auth.uid() = user_id);

-- 4. audit_logs table
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

-- 5. document_analyses table
DROP POLICY IF EXISTS "Users can view their own document analyses" ON public.document_analyses;
CREATE POLICY "Users can view their own document analyses"
ON public.document_analyses FOR SELECT
USING (auth.uid() = user_id);

-- 6. chat_sessions table
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
USING (auth.uid() = user_id);

-- 7. document_versions table
DROP POLICY IF EXISTS "Users can view their own document versions" ON public.document_versions;
CREATE POLICY "Users can view their own document versions"
ON public.document_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.document_analyses da
    WHERE da.id = document_versions.document_id
    AND da.user_id = auth.uid()
  )
);

-- 8. portfolios table
DROP POLICY IF EXISTS "Users can view their own portfolios" ON public.portfolios;
CREATE POLICY "Users can view their own portfolios"
ON public.portfolios FOR SELECT
USING (auth.uid() = user_id);

-- 9. document_shares table
DROP POLICY IF EXISTS "Users can view their document shares" ON public.document_shares;
CREATE POLICY "Users can view their document shares"
ON public.document_shares FOR SELECT
USING (auth.uid() = shared_by OR auth.uid() = shared_with::uuid);

-- 10. document_comments table
DROP POLICY IF EXISTS "Users can view document comments" ON public.document_comments;
CREATE POLICY "Users can view document comments"
ON public.document_comments FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.document_analyses da
    WHERE da.id = document_comments.document_id
    AND da.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.document_shares ds
    WHERE ds.document_id = document_comments.document_id
    AND ds.shared_with::uuid = auth.uid()
  )
);

-- 11. quiz_attempts table
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view their own quiz attempts"
ON public.quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

-- 12. learning_progress table
DROP POLICY IF EXISTS "Users can view their own learning progress" ON public.learning_progress;
CREATE POLICY "Users can view their own learning progress"
ON public.learning_progress FOR SELECT
USING (auth.uid() = user_id);

-- 13. user_analytics table
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_analytics;
CREATE POLICY "Users can view their own analytics"
ON public.user_analytics FOR SELECT
USING (auth.uid() = user_id);

-- 14. processing_metrics table
DROP POLICY IF EXISTS "Users can view their own processing metrics" ON public.processing_metrics;
CREATE POLICY "Users can view their own processing metrics"
ON public.processing_metrics FOR SELECT
USING (auth.uid() = user_id);

-- 15. webhook_deliveries table
DROP POLICY IF EXISTS "Users can view their webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "Users can view their webhook deliveries"
ON public.webhook_deliveries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.webhooks w
    WHERE w.id = webhook_deliveries.webhook_id
    AND w.user_id = auth.uid()
  )
);

-- 16. retention_policies table
DROP POLICY IF EXISTS "Users can view their own retention policies" ON public.retention_policies;
CREATE POLICY "Users can view their own retention policies"
ON public.retention_policies FOR SELECT
USING (auth.uid() = user_id);

-- 17. data_export_requests table
DROP POLICY IF EXISTS "Users can view their own data export requests" ON public.data_export_requests;
CREATE POLICY "Users can view their own data export requests"
ON public.data_export_requests FOR SELECT
USING (auth.uid() = user_id);

-- 18. deletion_requests table
DROP POLICY IF EXISTS "Users can view their own deletion requests" ON public.deletion_requests;
CREATE POLICY "Users can view their own deletion requests"
ON public.deletion_requests FOR SELECT
USING (auth.uid() = user_id);

-- 19. portfolio_documents table
DROP POLICY IF EXISTS "Users can view their portfolio documents" ON public.portfolio_documents;
CREATE POLICY "Users can view their portfolio documents"
ON public.portfolio_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = portfolio_documents.portfolio_id
    AND p.user_id = auth.uid()
  )
);

-- 20. user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 21. analysis_templates table
DROP POLICY IF EXISTS "Users can view public or their own templates" ON public.analysis_templates;
CREATE POLICY "Users can view public or their own templates"
ON public.analysis_templates FOR SELECT
USING (is_public = true OR auth.uid() = user_id);