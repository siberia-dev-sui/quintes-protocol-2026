import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * NOTE: During build time on Vercel, env vars might not be available.
 * We use fallback values for build, then validate at runtime.
 */

// Get env vars with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we have real credentials
const hasRealCredentials = !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder');

if (!hasRealCredentials && typeof window !== 'undefined') {
    // Only warn in browser, not during build
    console.warn(
        '⚠️ Supabase URL or Anon Key is missing. Database operations will fail.\n' +
        'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.'
    );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export a type-safe helper for checking connection
export async function checkSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
        // Simple health check - try to query the auth endpoint
        const { error } = await supabase.auth.getSession();
        if (error) {
            return { connected: false, error: error.message };
        }
        return { connected: true };
    } catch (err) {
        return {
            connected: false,
            error: err instanceof Error ? err.message : 'Unknown connection error'
        };
    }
}
