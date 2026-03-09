-- Table to store AI-generated Top 10 lists per category
CREATE TABLE public.top_10_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL UNIQUE,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  generated_by text DEFAULT 'ai',
  refresh_frequency text DEFAULT 'weekly',
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.top_10_lists ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (public data)
CREATE POLICY "Anyone can view top 10 lists"
ON public.top_10_lists
FOR SELECT
TO public
USING (true);

-- Only authenticated users can refresh (we'll use edge function with service role)
CREATE POLICY "Service role can manage top 10 lists"
ON public.top_10_lists
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Seed with initial categories
INSERT INTO public.top_10_lists (category, products, metadata) VALUES
('credit-cards', '[]'::jsonb, '{"title": "Top 10 Credit Cards", "icon": "💳"}'::jsonb),
('health-insurance', '[]'::jsonb, '{"title": "Top 10 Health Insurance", "icon": "🏥"}'::jsonb),
('life-insurance', '[]'::jsonb, '{"title": "Top 10 Life Insurance", "icon": "🛡️"}'::jsonb),
('loans', '[]'::jsonb, '{"title": "Top 10 Loans", "icon": "🏠"}'::jsonb),
('ulips', '[]'::jsonb, '{"title": "Top 10 ULIPs", "icon": "📈"}'::jsonb),
('mutual-funds', '[]'::jsonb, '{"title": "Top 10 Mutual Funds", "icon": "💰"}'::jsonb)
ON CONFLICT (category) DO NOTHING;