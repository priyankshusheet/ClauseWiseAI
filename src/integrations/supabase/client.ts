// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lyxybuizijsdfmrdbsxo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eHlidWl6aWpzZGZtcmRic3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDQzMTUsImV4cCI6MjA2MzY4MDMxNX0.LtawR6tWbOIIsug2P7Lw184deNw5zC38CPoDxZH6cKk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);