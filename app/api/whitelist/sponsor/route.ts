/**
 * =====================================================================
 * Sponsor API Route - JIT (Just-In-Time) Gasless Funder
 * =====================================================================
 *
 * ARCHITECTURE: "Backend Funder" Pattern
 *
 * This route funds the user's EOA wallet with a micro-amount of ETH
 * (for Arbitrum gas) and RLC (for iExec API fees) just before they
 * execute the iExec DataProtector/Web3Mail transactions.
 *
 * This makes the experience 100% free for the user while keeping the
 * security model of iExec's DataProtector intact (EOA-based encryption).
 *
 * ANTI-BOT SECURITY LAYERS:
 * 1. Rate-limit by IP address (max 1 per 24h) via Supabase
 * 2. Rate-limit by wallet address (max 1 per 24h) via Supabase
 * 3. Validates the Sponsor's own balance before sending to prevent
 *    complete drainage.
 * 4. Validates the recipient wallet already has enough funds (skip if so).
 * =====================================================================
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

// --- CONFIGURATION ---
const ARBITRUM_RPC = 'https://arb1.arbitrum.io/rpc';
const RLC_CONTRACT_ADDRESS = '0xe649e6a1f2afc63ca268c2363691cecaf75cf47c'; // RLC on Arbitrum One

// Amount to fund per user
const ETH_TO_FUND = '0.0005';    // ~$1 USD - covers several Arbitrum transactions
const RLC_TO_FUND = '0.35';       // 0.35 RLC: 0.15 for iExec escrow deposit + 0.1 for workerpool + 0.1 margin
const RLC_DECIMALS = 18;

// Minimum sponsor balance before we refuse to send (emergency cutoff)
const MIN_SPONSOR_ETH_BALANCE = '0.01'; // If we have less than this, stop sending

// Rate limiting window (24 hours in milliseconds)
const RATE_LIMIT_WINDOW_HOURS = 24;

// ERC-20 minimal ABI for RLC balance check and transfer
const ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
];

export async function POST(req: Request) {
    // --- 1. VALIDATE ENVIRONMENT ---
    const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!sponsorPrivateKey) {
        console.error('[Sponsor] SPONSOR_PRIVATE_KEY not configured');
        return NextResponse.json({ error: 'Sponsorship not configured' }, { status: 503 });
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error('[Sponsor] Supabase credentials not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // --- 2. PARSE REQUEST ---
    let userAddress: string;
    try {
        const body = await req.json();
        userAddress = body.userAddress;
        if (!userAddress || !ethers.isAddress(userAddress)) {
            return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
        }
        userAddress = ethers.getAddress(userAddress); // Normalize checksum
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // --- 3. EXTRACT IP ADDRESS ---
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || 'unknown');

    // --- 4. SUPABASE RATE LIMITING (Global State - Safe on Vercel) ---
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

    // Check for rate limit by IP
    const { data: ipRateCheck, error: ipCheckError } = await supabaseAdmin
        .from('sponsor_logs')
        .select('id')
        .eq('ip_address', ipAddress)
        .gte('created_at', windowStart)
        .limit(1);

    if (ipCheckError) {
        console.error('[Sponsor] Supabase IP check error:', ipCheckError);
        return NextResponse.json({ error: 'Rate limit check failed' }, { status: 500 });
    }

    if (ipRateCheck && ipRateCheck.length > 0) {
        console.warn(`[Sponsor] Rate limit hit by IP: ${ipAddress}`);
        return NextResponse.json(
            { error: 'Sponsorship already used from this IP in the last 24 hours' },
            { status: 429 }
        );
    }

    // Check for rate limit by wallet address
    const { data: walletRateCheck, error: walletCheckError } = await supabaseAdmin
        .from('sponsor_logs')
        .select('id')
        .eq('wallet_address', userAddress)
        .gte('created_at', windowStart)
        .limit(1);

    if (walletCheckError) {
        console.error('[Sponsor] Supabase wallet check error:', walletCheckError);
        return NextResponse.json({ error: 'Rate limit check failed' }, { status: 500 });
    }

    if (walletRateCheck && walletRateCheck.length > 0) {
        console.warn(`[Sponsor] Rate limit hit by wallet: ${userAddress}`);
        return NextResponse.json(
            { error: 'This wallet has already been sponsored in the last 24 hours' },
            { status: 429 }
        );
    }

    // --- 5. INITIALIZE ETHERS AND SPONSOR WALLET ---
    const provider = new ethers.JsonRpcProvider(ARBITRUM_RPC);
    let sponsorWallet: ethers.Wallet;
    try {
        sponsorWallet = new ethers.Wallet(sponsorPrivateKey, provider);
    } catch {
        console.error('[Sponsor] Failed to initialize sponsor wallet (check private key format)');
        return NextResponse.json({ error: 'Sponsorship configuration error' }, { status: 500 });
    }

    // --- 6. EMERGENCY BALANCE CHECK (Protect the Sponsor Wallet) ---
    const sponsorEthBalance = await provider.getBalance(sponsorWallet.address);
    const minBalance = ethers.parseEther(MIN_SPONSOR_ETH_BALANCE);

    if (sponsorEthBalance < minBalance) {
        console.error(`[Sponsor] ⚠️ Sponsor wallet balance critically low: ${ethers.formatEther(sponsorEthBalance)} ETH`);
        return NextResponse.json(
            { error: 'Sponsorship temporarily unavailable - please try again later' },
            { status: 503 }
        );
    }

    // --- 7. CHECK IF USER ALREADY HAS ENOUGH FUNDS (Avoid waste) ---
    const userEthBalance = await provider.getBalance(userAddress);
    const ethToFundWei = ethers.parseEther(ETH_TO_FUND);
    const userAlreadyFunded = userEthBalance >= ethToFundWei;

    let ethTxHash: string | null = null;
    let rlcTxHash: string | null = null;
    const errors: string[] = [];

    // --- 8. SEND ETH FOR GAS (if needed) ---
    if (!userAlreadyFunded) {
        try {
            console.log(`[Sponsor] Sending ${ETH_TO_FUND} ETH to ${userAddress}...`);
            const ethTx = await sponsorWallet.sendTransaction({
                to: userAddress,
                value: ethToFundWei,
                gasLimit: 21000, // Standard ETH transfer gas
            });
            ethTxHash = ethTx.hash;
            console.log(`[Sponsor] ETH tx sent: ${ethTxHash}`);
        } catch (err) {
            console.error('[Sponsor] Failed to send ETH:', err);
            errors.push('ETH transfer failed');
        }
    } else {
        console.log(`[Sponsor] User ${userAddress} already has sufficient ETH, skipping ETH transfer.`);
    }

    // --- 9. SEND RLC FOR IEXEC FEES ---
    try {
        const rlcContract = new ethers.Contract(RLC_CONTRACT_ADDRESS, ERC20_ABI, sponsorWallet);
        const rlcAmountWei = ethers.parseUnits(RLC_TO_FUND, RLC_DECIMALS);

        // Check if user already has RLC
        const userRlcBalance: bigint = await rlcContract.balanceOf(userAddress);
        if (userRlcBalance < rlcAmountWei) {
            console.log(`[Sponsor] Sending ${RLC_TO_FUND} RLC to ${userAddress}...`);
            const rlcTx = await rlcContract.transfer(userAddress, rlcAmountWei);
            rlcTxHash = rlcTx.hash;
            console.log(`[Sponsor] RLC tx sent: ${rlcTxHash}`);
        } else {
            console.log(`[Sponsor] User ${userAddress} already has sufficient RLC, skipping RLC transfer.`);
        }
    } catch (err) {
        console.error('[Sponsor] Failed to send RLC:', err);
        errors.push('RLC transfer failed');
    }

    // If BOTH transfers failed, don't log and return error
    if (errors.length === 2) {
        return NextResponse.json({ error: 'Sponsorship transfer failed. Please try again.' }, { status: 500 });
    }

    // --- 10. LOG TO SUPABASE (Persist the rate limit record) ---
    const { error: logError } = await supabaseAdmin
        .from('sponsor_logs')
        .insert([{
            wallet_address: userAddress,
            ip_address: ipAddress,
            eth_amount: ethToFundWei.toString(),
            rlc_amount: ethers.parseUnits(RLC_TO_FUND, RLC_DECIMALS).toString(),
            eth_tx_hash: ethTxHash,
            rlc_tx_hash: rlcTxHash,
            status: errors.length === 0 ? 'success' : 'partial',
        }]);

    if (logError) {
        // Non-fatal: log the error but proceed (money was already sent)
        console.error('[Sponsor] Failed to log to Supabase (non-fatal):', logError);
    }

    console.log(`[Sponsor] ✅ Successfully sponsored wallet: ${userAddress}`);

    return NextResponse.json({
        success: true,
        message: 'Wallet funded successfully! You can now proceed with the iExec transaction.',
        funded: {
            eth: userAlreadyFunded ? '0 (already funded)' : ETH_TO_FUND,
            rlc: RLC_TO_FUND,
        },
        txHashes: {
            eth: ethTxHash,
            rlc: rlcTxHash,
        }
    });
}

// Health check
export async function GET() {
    return NextResponse.json({
        status: 'active',
        mode: 'jit-funder',
        network: 'arbitrum-one',
        description: 'JIT Gasless Funder - funds user wallets with ETH and RLC before iExec transactions',
    });
}
