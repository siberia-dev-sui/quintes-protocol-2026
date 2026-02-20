/**
 * =====================================================================
 * DEPRECATED: Sponsor API Route - Gasless Mode
 * =====================================================================
 * 
 * STATUS: INACTIVE (User Pays Gas mode is active)
 * 
 * This API route was used for the gasless/sponsor flow where a backend wallet
 * (SPONSOR_PRIVATE_KEY) paid gas on behalf of users.
 * 
 * Current flow: Users pay their own gas fees in xRLC on iExec Bellecour.
 * Gas costs on Bellecour are extremely low (~$0.00001 per transaction).
 * 
 * TO RE-ENABLE:
 * 1. Uncomment the implementation below
 * 2. Configure SPONSOR_PRIVATE_KEY in Vercel
 * 3. Fund the sponsor wallet with xRLC
 * 4. Uncomment the frontend call in whitelist-section.tsx
 * 
 * @deprecated User Pays Gas mode is now active
 * =====================================================================
 */

import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        {
            error: 'Gasless mode is disabled. Users pay their own gas fees on iExec Bellecour.',
            message: 'Gas costs are very low (~$0.00001). Please sign the transaction in MetaMask.',
            mode: 'user-pays-gas'
        },
        { status: 410 } // 410 Gone - Resource no longer available
    );
}

export async function GET() {
    return NextResponse.json({
        status: 'deprecated',
        mode: 'user-pays-gas',
        message: 'Gasless sponsor mode is disabled. Users pay gas directly on iExec Bellecour.',
        gasInfo: 'Gas costs on Bellecour are extremely low (~$0.00001 per transaction)'
    });
}

// =====================================================================
// SECURITY UPDATE (Phase 2): 
// Deprecated implementation removed completely.
// Storing this code as a comment exposed an unnecessary attack vector 
// (e.g. accidental reactivation without proper rate-limiting protections).
// =====================================================================
