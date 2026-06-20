/**
 * Client-Side Rate Limiter & Request Throttler
 * Prevents rapid abuse of network API requests in local-mode simulation 
 * and adds pre-flight rate limiting before hitting backend tables.
 */

class RateLimiter {
    constructor() {
        this.requests = {}; // Store timestamps by key
    }

    /**
     * Check if a request exceeds rate limit thresholds
     * @param {string} key - Unique rate limit identifier (e.g., IP, endpoint, or action)
     * @param {number} limit - Max requests allowed in the window
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} True if allowed, False if throttled
     */
    isAllowed(key, limit = 60, windowMs = 60000) {
        const now = Date.now();
        if (!this.requests[key]) {
            this.requests[key] = [];
        }

        // Filter out expired timestamps
        this.requests[key] = this.requests[key].filter(timestamp => now - timestamp < windowMs);

        if (this.requests[key].length >= limit) {
            console.warn(`[Rate Limit Exceeded] key: ${key}, limit: ${limit}/${windowMs/1000}s`);
            return false;
        }

        this.requests[key].push(now);
        return true;
    }

    /**
     * Clear all recorded rate limits
     */
    reset() {
        this.requests = {};
    }
}

export const rateLimiter = new RateLimiter();
export default rateLimiter;
