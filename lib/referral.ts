/**
 * Generates a random alphanumeric referral code.
 * Format: 8 characters, uppercase, alphanumeric.
 */
export function generateReferralCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = 8;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}
