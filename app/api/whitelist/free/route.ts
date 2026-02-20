import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use SERVICE_ROLE key here (never exposed to client)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error('Missing Supabase credentials for backend insert');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    try {
        const body = await req.json();
        const { email, user_agent } = body;

        // Get IP from headers safely
        const forwardedFor = req.headers.get('x-forwarded-for');
        const realIp = req.headers.get('x-real-ip');
        const ip_address = forwardedFor ? forwardedFor.split(',')[0] : (realIp || null);

        // Basic validation
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Insert using Admin privileges into the free whitelist table
        // Ensure this table 'free_whitelist' exists in your Supabase project
        const { error } = await supabaseAdmin.from('free_whitelist').insert([{
            email,
            status: 'active',
            ip_address,
            user_agent
        }]);

        if (error) {
            // Check for duplicate emails (optional)
            if (error.code === '23505') { // Unique constraint violation in Postgres
                return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
            }
            console.error('Supabase insert error in Free API:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Free API Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
