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

/*
// =====================================================================
// PRESERVED: Original Implementation (Uncomment to re-enable)
// =====================================================================

import { JsonRpcProvider, Wallet, parseEther } from 'ethers';

const IEXEC_BELLECOUR_RPC = 'https://bellecour.iex.ec';
const SUBSIDY_AMOUNT = '0.002';

export async function POST(req: Request) {
    try {
        const { userAddress } = await req.json();

        if (!userAddress) {
            return NextResponse.json({ error: 'User address required' }, { status: 400 });
        }

        const sponsorKey = process.env.SPONSOR_PRIVATE_KEY;
        if (!sponsorKey) {
            console.error('SPONSOR_PRIVATE_KEY not set');
            return NextResponse.json({ error: 'Sponsorship unavailable: Server wallet not configured' }, { status: 503 });
        }

        const provider = new JsonRpcProvider(IEXEC_BELLECOUR_RPC);
        const wallet = new Wallet(sponsorKey, provider);

        const balance = await provider.getBalance(wallet.address);
        const amountToSend = parseEther(SUBSIDY_AMOUNT);

        if (balance < amountToSend) {
            console.error('Sponsor wallet empty');
            return NextResponse.json({ error: 'Sponsorship pool empty' }, { status: 503 });
        }

        const tx = await wallet.sendTransaction({
            to: userAddress,
            value: amountToSend
        });

        console.log(`Sponsored ${userAddress}: ${tx.hash}`);

        return NextResponse.json({ 
            success: true, 
            txHash: tx.hash,
            message: 'Gas subsidy sent'
        });

    } catch (error) {
        console.error('Sponsor API Error:', error);
        return NextResponse.json({ error: 'Sponsorship failed' }, { status: 500 });
    }
}
*/
