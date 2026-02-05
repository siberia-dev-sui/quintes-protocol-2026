/**
 * Sponsor Client - Handles request for gas sponsorship (subsidy)
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
