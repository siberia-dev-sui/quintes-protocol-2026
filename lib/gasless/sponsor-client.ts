/**
 * DEPRECATED: Sponsor Client - Gasless mode disabled
 * 
 * This module was used for the gasless/sponsor flow where a backend wallet
 * paid gas on behalf of users. This feature has been disabled.
 * 
 * Current flow: Users pay their own gas fees in xRLC on iExec Bellecour.
 * 
 * @deprecated Use direct iExec SDK in frontend instead
 */

// All exports commented out - not in use

/*
const SPONSOR_API_URL = '/api/whitelist/sponsor';

export interface SponsorResult {
    success: boolean;
    protectedDataAddress?: string;
    error?: string;
}

export async function requestSponsoredWhitelist(
    email: string,
    userAddress: string,
    signature?: string
): Promise<SponsorResult> {
    // ... deprecated code
}

export async function checkSponsorHealth(): Promise<{
    available: boolean;
    message?: string;
}> {
    // ... deprecated code
}
*/

export { }; // Empty export to keep TypeScript happy
