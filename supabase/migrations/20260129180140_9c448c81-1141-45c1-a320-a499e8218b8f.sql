-- =============================================
-- PHASE 4: Enterprise Features Database Schema
-- =============================================

-- 1. Audit Logs (Immutable compliance logging)
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs are append-only (no UPDATE or DELETE)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 2. API Keys for public API access
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read'],
  rate_limit_per_hour INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own API keys"
  ON public.api_keys FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Webhooks configuration
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own webhooks"
  ON public.webhooks FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Webhook delivery logs
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_number INTEGER DEFAULT 1,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their webhook deliveries"
  ON public.webhook_deliveries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.webhooks 
    WHERE webhooks.id = webhook_deliveries.webhook_id 
    AND webhooks.user_id = auth.uid()
  ));

-- 5. Analysis Templates
CREATE TABLE public.analysis_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  document_types TEXT[],
  analysis_depth TEXT DEFAULT 'standard',
  risk_thresholds JSONB DEFAULT '{"low": 30, "medium": 60, "high": 80}',
  output_format JSONB DEFAULT '{}',
  rules JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analysis_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates"
  ON public.analysis_templates FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates"
  ON public.analysis_templates FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_analysis_templates_updated_at
  BEFORE UPDATE ON public.analysis_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. User Analytics (aggregated, privacy-safe)
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  documents_uploaded INTEGER DEFAULT 0,
  documents_analyzed INTEGER DEFAULT 0,
  chat_messages_sent INTEGER DEFAULT 0,
  features_used JSONB DEFAULT '{}',
  session_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON public.user_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
  ON public.user_analytics FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_analytics_updated_at
  BEFORE UPDATE ON public.user_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Processing Metrics
CREATE TABLE public.processing_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  document_id UUID REFERENCES public.document_analyses(id) ON DELETE SET NULL,
  operation_type TEXT NOT NULL,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.processing_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metrics"
  ON public.processing_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON public.processing_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all metrics"
  ON public.processing_metrics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_processing_metrics_created_at ON public.processing_metrics(created_at DESC);

-- 8. Data Retention Policies
CREATE TABLE public.retention_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_type TEXT NOT NULL,
  retention_days INTEGER NOT NULL DEFAULT 365,
  auto_delete BOOLEAN DEFAULT false,
  archive_before_delete BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own retention policies"
  ON public.retention_policies FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_retention_policies_updated_at
  BEFORE UPDATE ON public.retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Data Export Requests (GDPR compliance)
CREATE TABLE public.data_export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  export_type TEXT DEFAULT 'full',
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own export requests"
  ON public.data_export_requests FOR ALL
  USING (auth.uid() = user_id);

-- 10. Deletion Requests (GDPR right-to-delete)
CREATE TABLE public.deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  resources_deleted JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own deletion requests"
  ON public.deletion_requests FOR ALL
  USING (auth.uid() = user_id);

-- Insert default system templates
INSERT INTO public.analysis_templates (user_id, name, description, industry, document_types, analysis_depth, is_public) VALUES
  (NULL, 'Insurance Policy Standard', 'Standard analysis for insurance policy documents', 'insurance', ARRAY['insurance', 'policy'], 'comprehensive', true),
  (NULL, 'Loan Agreement Review', 'Detailed review of loan agreements and terms', 'loans', ARRAY['loan', 'agreement'], 'comprehensive', true),
  (NULL, 'Credit Card Terms Analysis', 'Analysis of credit card terms and conditions', 'credit_cards', ARRAY['credit_card', 'terms'], 'standard', true),
  (NULL, 'Quick Risk Scan', 'Fast preliminary risk assessment', 'general', ARRAY['any'], 'basic', true),
  (NULL, 'Legal Document Deep Dive', 'Comprehensive legal document analysis', 'legal', ARRAY['contract', 'legal'], 'comprehensive', true);