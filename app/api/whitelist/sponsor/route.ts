import { NextResponse } from 'next/server';
import { JsonRpcProvider, Wallet, parseEther } from 'ethers';

/**
 * SPONSOR API ROUTE
 * Sends a small amount of xRLC to the user's wallet to pay for gas fees.
 * This enables the "Gasless" experience for the user.
 */

const IEXEC_BELLECOUR_RPC = 'https://bellecour.iex.ec';
// Send a tiny amount of xRLC for gas (0.002 xRLC is plenty for 2-3 iExec transactions)
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
            // Return specific error so frontend knows to prompt user or show specific msg
            return NextResponse.json({ error: 'Sponsorship unavailable: Server wallet not configured' }, { status: 503 });
        }

        // Initialize Provider & Signer
        const provider = new JsonRpcProvider(IEXEC_BELLECOUR_RPC);
        const wallet = new Wallet(sponsorKey, provider);

        // Check Sponsor Balance
        const balance = await provider.getBalance(wallet.address);
        const amountToSend = parseEther(SUBSIDY_AMOUNT);

        if (balance < amountToSend) {
            console.error('Sponsor wallet empty');
            return NextResponse.json({ error: 'Sponsorship pool empty' }, { status: 503 });
        }

        // Send xRLC (Subsidy)
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
