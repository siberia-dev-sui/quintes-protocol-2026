import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use SERVICE_ROLE key here (never exposed to client)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Sanitize input to prevent XSS/injection in DB
function sanitize(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    return value.replace(/[<>/'"\\]/g, '').trim().slice(0, 255) || null;
}

export async function POST(req: Request) {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error('Missing Supabase credentials for backend insert');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    try {
        const body = await req.json();
        const { wallet_address, protected_data_address, referral_code } = body;

        // --- SECURE SERVER-SIDE EXTRACTION (Cannot be faked by client) ---
        // Get User-Agent from request headers (server-side, not body)
        const user_agent = req.headers.get('user-agent') ?? null;

        // Get IP from headers safely (Vercel sets x-forwarded-for)
        const forwardedFor = req.headers.get('x-forwarded-for');
        const realIp = req.headers.get('x-real-ip');
        const ip_address = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || null);

        // --- VALIDATION ---
        if (!wallet_address || !ethers.isAddress(wallet_address)) {
            return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
        }
        if (!protected_data_address || !ethers.isAddress(protected_data_address)) {
            return NextResponse.json({ error: 'Invalid protected data address' }, { status: 400 });
        }

        // Sanitize optional fields
        const safe_referral_code = sanitize(referral_code);
        const safe_wallet = ethers.getAddress(wallet_address); // Normalize checksum
        const safe_protected = ethers.getAddress(protected_data_address);

        // Insert using Admin privileges (bypasses RLS)
        const { error } = await supabaseAdmin.from('whitelist_participants').insert([{
            wallet_address: safe_wallet,
            protected_data_address: safe_protected,
            referral_code: safe_referral_code,
            status: 'active',
            ip_address,
            user_agent,
        }]);

        if (error) {
            // Duplicate wallet (unique constraint)
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Wallet already registered' }, { status: 409 });
            }
            console.error('Supabase insert error in API:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
