type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Secure Logger Utility
 * 
 * SECURITY: Prevents PII (Personally Identifiable Information) from leaking
 * to browser console in production. Only logs in development.
 * 
 * In production, only error-level logs are output (for debugging critical issues).
 * For full production logging, integrate with Sentry, Datadog, or similar.
 */
export const logger = {
    /**
     * Info level - development only
     */
    info: (msg: string, data?: unknown) => {
        if (isDev) {
            console.log(`[INFO] ${msg}`, data ?? '');
        }
    },

    /**
     * Warning level - development only
     */
    warn: (msg: string, data?: unknown) => {
        if (isDev) {
            console.warn(`[WARN] ${msg}`, data ?? '');
        }
    },

    /**
     * Error level - always logs (for critical issue debugging)
     * TODO: Send to Sentry/Datadog in production
     */
    error: (msg: string, data?: unknown) => {
        console.error(`[ERROR] ${msg}`, data ?? '');
        // In production, this is where you'd call Sentry.captureException()
    },

    /**
     * Debug level - development only, most verbose
     */
    debug: (msg: string, data?: unknown) => {
        if (isDev) {
            console.debug(`[DEBUG] ${msg}`, data ?? '');
        }
    },
};

// Export a sanitization helper for when you DO need to log user data
export function sanitizeForLog(email?: string): string {
    if (!email) return '[no email]';
    const [local, domain] = email.split('@');
    if (!domain) return '[invalid email]';
    return `${local.substring(0, 2)}***@${domain}`;
}
