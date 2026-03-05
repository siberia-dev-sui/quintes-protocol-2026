/**
 * =====================================================================
 * Sponsor Client - JIT (Just-In-Time) Gasless Funder
 * =====================================================================
 *
 * STATUS: ACTIVE
 *
 * Calls the backend Sponsor API to fund the user's wallet with micro-amounts
 * of ETH (for Arbitrum gas) and RLC (for iExec fees) before they execute
 * the iExec DataProtector/Web3Mail transaction flow.
 *
 * This makes the experience 100% free for the user while keeping the
 * full security of iExec's local EOA-based encryption.
 *
 * =====================================================================
 */

const SPONSOR_API_URL = '/api/whitelist/sponsor';

export interface SponsorResult {
    success: boolean;
    message?: string;
    funded?: { eth: string; rlc: string };
    txHashes?: { eth: string | null; rlc: string | null };
    error?: string;
}

/**
 * Requests the backend to fund the user's wallet with ETH and RLC (JIT).
 * This is the secure, anti-bot protected gateway to gasless iExec transactions.
 */
export async function requestSponsoredWhitelist(
    userAddress: string
): Promise<SponsorResult> {
    try {
        const response = await fetch(SPONSOR_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userAddress })
        });

        const data = await response.json();

        if (!response.ok && response.status !== 429) {
            // 429 = already sponsored (not a failure, continue the flow)
            console.warn('[Sponsor] API error:', data.error);
            return {
                success: false,
                error: data.error || 'Failed to request sponsorship'
            };
        }

        if (response.status === 429) {
            // User was already sponsored recently — that's fine, they have funds
            console.info('[Sponsor] Already sponsored, proceeding with existing funds');
            return { success: true, message: 'Using existing funds' };
        }

        return {
            success: true,
            message: data.message,
            funded: data.funded,
            txHashes: data.txHashes,
        };
    } catch (error) {
        console.error('[Sponsor] Network error:', error);
        // Non-fatal: the user might have their own funds
        return {
            success: false,
            error: 'Network error requesting sponsorship'
        };
    }
}
