import { z } from 'zod';

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z
        .string()
        .url('Invalid Supabase URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z
        .string()
        .min(20, 'Invalid Supabase Anon Key'),
});

const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const env = parsed.success
    ? parsed.data
    : {
        NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-key',
    };
