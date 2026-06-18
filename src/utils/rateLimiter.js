/**
 * Client-Side Rate Limiter
 * Provides basic protection against rapid requests
 * 
 * ⚠️ IMPORTANT: This is NOT a replacement for server-side rate limiting.
 * This is a UX improvement and basic client-side protection only.
 * A determined attacker can bypass this by clearing localStorage or using multiple browsers.
 * 
 * USAGE:
 * import { rateLimiter } from '../utils/rateLimiter';
 * 
 * if (!rateLimiter.isAllowed('action_name', 5, 60000)) {
 *     alert('Too many requests. Please wait.');
 *     return;
 * }
 */

class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.storageKey = 'tm_rate_limits';
        this.loadFromStorage();
    }

    /**
     * Load rate limit data from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.requests = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Rate limiter storage error:', error);
        }
    }

    /**
     * Save rate limit data to localStorage
     */
    saveToStorage() {
        try {
            const data = Object.fromEntries(this.requests);
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Rate limiter storage error:', error);
        }
    }

    /**
     * Check if action is allowed
     * @param {string} key - Unique identifier (e.g., 'login', 'certificate_download', 'test_submit')
     * @param {number} maxRequests - Maximum requests allowed in the time window
     * @param {number} windowMs - Time window in milliseconds (default: 60000 = 1 minute)
     * @returns {boolean} Whether the action is allowed
     */
    isAllowed(key, maxRequests = 5, windowMs = 60000) {
        const now = Date.now();
        const requestLog = this.requests.get(key) || [];

        // Remove old requests outside the time window
        const validRequests = requestLog.filter(timestamp => now - timestamp < windowMs);

        if (validRequests.length >= maxRequests) {
            return false;
        }

        // Add current request
        validRequests.push(now);
        this.requests.set(key, validRequests);
        this.saveToStorage();

        return true;
    }

    /**
     * Get remaining time until next allowed request
     * @param {string} key - Unique identifier
     * @param {number} windowMs - Time window in milliseconds
     * @returns {number} Milliseconds until next allowed request (0 if allowed now)
     */
    getRetryAfter(key, windowMs = 60000) {
        const requestLog = this.requests.get(key) || [];
        if (requestLog.length === 0) return 0;

        const now = Date.now();
        const oldestRequest = Math.min(...requestLog);
        const retryAfter = windowMs - (now - oldestRequest);

        return Math.max(0, retryAfter);
    }

    /**
     * Get retry time in human-readable format
     * @param {string} key - Unique identifier
     * @param {number} windowMs - Time window in milliseconds
     * @returns {string} Human-readable retry time (e.g., "30 seconds", "2 minutes")
     */
    getRetryAfterFormatted(key, windowMs = 60000) {
        const ms = this.getRetryAfter(key, windowMs);
        if (ms === 0) return 'now';

        const seconds = Math.ceil(ms / 1000);
        if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;

        const minutes = Math.ceil(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    /**
     * Get remaining attempts
     * @param {string} key - Unique identifier
     * @param {number} maxRequests - Maximum requests allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {number} Number of remaining attempts
     */
    getRemainingAttempts(key, maxRequests = 5, windowMs = 60000) {
        const now = Date.now();
        const requestLog = this.requests.get(key) || [];
        const validRequests = requestLog.filter(timestamp => now - timestamp < windowMs);

        return Math.max(0, maxRequests - validRequests.length);
    }

    /**
     * Reset rate limit for a specific key
     * @param {string} key - Unique identifier
     */
    reset(key) {
        this.requests.delete(key);
        this.saveToStorage();
    }

    /**
     * Clear all rate limits
     */
    clearAll() {
        this.requests.clear();
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Get all active rate limits (for debugging)
     * @returns {object} All active rate limits
     */
    getAll() {
        return Object.fromEntries(this.requests);
    }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Export class for testing
export { RateLimiter };

/**
 * COMMON RATE LIMIT CONFIGURATIONS
 * Use these constants for consistency across the app
 */
export const RATE_LIMITS = {
    LOGIN: { key: 'login', max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    REGISTER: { key: 'register', max: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
    PASSWORD_RESET: { key: 'password_reset', max: 3, window: 60 * 60 * 1000 }, // 3 per hour
    CERTIFICATE_DOWNLOAD: { key: 'cert_download', max: 5, window: 60 * 1000 }, // 5 per minute
    TEST_SUBMIT: { key: 'test_submit', max: 10, window: 60 * 1000 }, // 10 per minute
    PROFILE_UPDATE: { key: 'profile_update', max: 5, window: 5 * 60 * 1000 }, // 5 per 5 minutes
};
