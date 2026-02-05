/**
 * =====================================================================
 * DEPRECATED: Sponsor Client - Gasless Mode
 * =====================================================================
 * 
 * STATUS: INACTIVE (User Pays Gas mode is active)
 * 
 * This module was used for the gasless/sponsor flow where a backend wallet
 * paid gas on behalf of users.
 * 
 * Current flow: Users pay their own gas fees in xRLC on iExec Bellecour.
 * Gas costs on Bellecour are extremely low (~$0.00001 per transaction).
 * 
 * TO RE-ENABLE:
 * 1. Uncomment the import in whitelist-section.tsx
 * 2. Uncomment the sponsorship call in joinVerifiedWhitelist
 * 3. Configure SPONSOR_PRIVATE_KEY in Vercel
 * 4. Fund the sponsor wallet with xRLC
 * 
 * @deprecated User Pays Gas mode is now active
 * =====================================================================
 */

const SPONSOR_API_URL = '/api/whitelist/sponsor';

export interface SponsorResult {
    success: boolean;
    message?: string;
    txHash?: string;
    error?: string;
}

/**
 * Requests the backend to sponsor (fund) the user's wallet with xRLC for gas.
 * This effectively makes the transaction "gasless" for the user.
 * 
 * @deprecated Currently not in use - User Pays Gas mode active
 */
export async function requestSponsoredWhitelist(
    email: string,
    userAddress: string
): Promise<SponsorResult> {
    try {
        const response = await fetch(SPONSOR_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, userAddress })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to request sponsorship'
            };
        }

        return {
            success: true,
            message: data.message,
            txHash: data.txHash
        };
    } catch (error) {
        console.error('Sponsorship request failed:', error);
        return {
            success: false,
            error: 'Network error requesting sponsorship'
        };
    }
}
