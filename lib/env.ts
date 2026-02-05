import { z } from 'zod';

/**
 * Environment validation using Zod - "Fail Fast" pattern
 * If critical env vars are missing, the app crashes at build/start time
 * rather than failing silently at runtime.
 * 
 * ARCHITECTURE: Multi-chain support
 * - iExec Bellecour (134): Web3Mail, privacy protection, whitelist
 * - Arbitrum Sepolia (421614): Testnet for token/contracts
 * - Arbitrum One (42161): Mainnet for token/contracts
 */

// Define allowed chain IDs with their purposes
const SUPPORTED_CHAINS = {
    IEXEC_BELLECOUR: '134',
    ARBITRUM_SEPOLIA: '421614',
    ARBITRUM_ONE: '42161',
} as const;

const envSchema = z.object({
    // Supabase - Required for database operations
    NEXT_PUBLIC_SUPABASE_URL: z
        .string()
        .url('Invalid Supabase URL - get it from Supabase Dashboard → Settings → API'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z
        .string()
        .min(20, 'Invalid Supabase Anon Key - must be at least 20 characters'),

    // Chain configuration - defaults to iExec for Web3Mail features
    NEXT_PUBLIC_CHAIN_ID: z
        .string()
        .refine(
            (val) => Object.values(SUPPORTED_CHAINS).includes(val as any),
            `Chain ID must be one of: ${Object.values(SUPPORTED_CHAINS).join(', ')}`
        )
        .default(SUPPORTED_CHAINS.IEXEC_BELLECOUR),
});

// Parse with safeParse for build-time compatibility
// Vercel may not have env vars available during static generation
const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
});

// Provide fallback values for build time
export const env = parsed.success
    ? parsed.data
    : {
        NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-key',
        NEXT_PUBLIC_CHAIN_ID: SUPPORTED_CHAINS.IEXEC_BELLECOUR,
    };

// Export chain constants for use throughout the app
export { SUPPORTED_CHAINS };

// Type-safe chain ID getter
export function getChainId(): number {
    return parseInt(env.NEXT_PUBLIC_CHAIN_ID, 10);
}

// Check if current chain is iExec (for Web3Mail features)
export function isIExecChain(): boolean {
    return env.NEXT_PUBLIC_CHAIN_ID === SUPPORTED_CHAINS.IEXEC_BELLECOUR;
}

// Check if current chain is Arbitrum (for token features)
export function isArbitrumChain(): boolean {
    return (
        env.NEXT_PUBLIC_CHAIN_ID === SUPPORTED_CHAINS.ARBITRUM_SEPOLIA ||
        env.NEXT_PUBLIC_CHAIN_ID === SUPPORTED_CHAINS.ARBITRUM_ONE
    );
}
