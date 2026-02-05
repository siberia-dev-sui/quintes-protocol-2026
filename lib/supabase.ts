import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * SECURITY: Now uses validated environment variables from lib/env.ts
 * The app will crash at build/start time if credentials are missing,
 * preventing silent failures in production.
 * 
 * NOTE: Import this client where you need database operations.
 * For server-side operations, consider using a service role key in
 * a separate server-only client.
 */

// Validated environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Runtime check - this should never happen if env.ts validation is imported
// somewhere in the app initialization, but provides a safety net
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '❌ Supabase credentials are missing.\n' +
        'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
        'are set in .env.local\n' +
        'Get them from: Supabase Dashboard → Settings → API'
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
