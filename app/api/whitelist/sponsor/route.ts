/**
 * DEPRECATED: Sponsor API Route - Gasless mode disabled
 * 
 * This API route was used for the gasless/sponsor flow where a backend wallet
 * (SPONSOR_PRIVATE_KEY) paid gas on behalf of users.
 * 
 * Current flow: Users pay their own gas fees in xRLC on iExec Bellecour
 * directly in the frontend via MetaMask.
 * 
 * @deprecated This route is no longer active
 */

import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        {
            error: 'Gasless mode is disabled. Users pay their own gas fees.',
            message: 'Please use the frontend to sign transactions directly with MetaMask.'
        },
        { status: 410 } // 410 Gone - Resource no longer available
    );
}

export async function GET() {
    return NextResponse.json({
        status: 'deprecated',
        message: 'Gasless sponsor mode has been disabled. Users now pay gas directly.',
        alternative: 'Connect wallet via frontend and pay xRLC gas on iExec Bellecour'
    });
}
