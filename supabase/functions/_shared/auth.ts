// Shared authentication utilities for edge functions
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

export interface AuthResult {
  userId: string;
  supabase: SupabaseClient;
}

/**
 * Validates authentication using Bearer token
 * Returns user ID and authenticated Supabase client
 */
export async function requireAuth(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<AuthResult | Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Authentication required', code: 'UNAUTHORIZED' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Create client with the user's token for proper RLS
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  // Validate the token using getClaims (faster than getUser)
  const { data, error } = await supabase.auth.getClaims(token);
  
  if (error || !data?.claims) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const userId = data.claims.sub;
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Invalid token claims', code: 'UNAUTHORIZED' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return { userId, supabase };
}

/**
 * Optional authentication - returns user info if authenticated, null otherwise
 */
export async function optionalAuth(
  req: Request
): Promise<{ userId: string | null; supabase: SupabaseClient }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const authHeader = req.headers.get('Authorization');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: authHeader ? { Authorization: authHeader } : {} }
  });

  if (!authHeader?.startsWith('Bearer ')) {
    return { userId: null, supabase };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data, error } = await supabase.auth.getClaims(token);
    
    if (error || !data?.claims?.sub) {
      return { userId: null, supabase };
    }

    return { userId: data.claims.sub, supabase };
  } catch {
    return { userId: null, supabase };
  }
}

/**
 * Creates a service role Supabase client for admin operations
 */
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  return createClient(supabaseUrl, supabaseServiceKey);
}
