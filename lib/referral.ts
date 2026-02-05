import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure referral code.
 * 
 * SECURITY: Uses crypto.randomBytes() instead of Math.random()
 * Math.random() is predictable (PRNG) and can be exploited by attackers
 * to guess valid referral codes in a financial/Web3 protocol.
 * 
 * Format: 8 characters, uppercase hexadecimal (0-9, A-F)
 * Entropy: 32 bits (4 bytes) = 4.29 billion possible codes
 */
export function generateReferralCode(): string {
    // 4 bytes = 8 hex characters, cryptographically secure
    return randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Validates a referral code format.
 * @param code - The code to validate
 * @returns true if valid 8-char uppercase hex
 */
export function isValidReferralCode(code: string): boolean {
    return /^[0-9A-F]{8}$/.test(code);
}
