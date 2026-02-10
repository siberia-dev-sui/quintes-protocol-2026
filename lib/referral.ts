/**
 * Generates a cryptographically secure referral code.
 * 
 * SECURITY: Uses Web Crypto API (crypto.getRandomValues) instead of
 * Node.js crypto.randomBytes — works in both browser AND server.
 * 
 * Format: 8 characters, uppercase hexadecimal (0-9, A-F)
 * Entropy: 32 bits (4 bytes) = 4.29 billion possible codes
 */
export function generateReferralCode(): string {
    // Use Web Crypto API (works in browser + Node 18+)
    const bytes = new Uint8Array(4);
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
        globalThis.crypto.getRandomValues(bytes);
    } else {
        // Fallback for environments without Web Crypto (extremely rare)
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

/**
 * Validates a referral code format.
 * @param code - The code to validate
 * @returns true if valid 8-char uppercase hex
 */
export function isValidReferralCode(code: string): boolean {
    return /^[0-9A-F]{8}$/.test(code);
}
