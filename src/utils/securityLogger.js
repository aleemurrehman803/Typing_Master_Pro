/**
 * Security Event Logger
 * Logs suspicious activities for monitoring and forensics
 * 
 * ⚠️ IMPORTANT: In production, these logs should be sent to a backend server
 * for proper security monitoring and alerting.
 * 
 * USAGE:
 * import { securityLogger } from '../utils/securityLogger';
 * 
 * securityLogger.log('FAILED_LOGIN', { email: 'user@example.com', reason: 'Invalid password' });
 */

class SecurityLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100; // Keep last 100 events in memory
        this.storageKey = 'tm_security_logs';
        this.loadFromStorage();
    }

    /**
     * Load logs from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logs = JSON.parse(stored);
                // Keep only recent logs
                this.trimLogs();
            }
        } catch (error) {
            console.error('Security logger storage error:', error);
            this.logs = [];
        }
    }

    /**
     * Save logs to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        } catch (error) {
            console.error('Security logger storage error:', error);
        }
    }

    /**
     * Trim logs to max size
     */
    trimLogs() {
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    /**
     * Log a security event
     * @param {string} eventType - Type of event (e.g., 'FAILED_LOGIN', 'IMPOSSIBLE_WPM', 'SUSPICIOUS_ACTIVITY')
     * @param {object} details - Event details
     * @param {string} severity - Severity level: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
     * @returns {object} The logged event
     */
    log(eventType, details = {}, severity = 'MEDIUM') {
        const event = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: eventType,
            severity,
            timestamp: new Date().toISOString(),
            timestampMs: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            ...details
        };

        this.logs.push(event);
        this.trimLogs();
        this.saveToStorage();

        // Console output based on severity
        const consoleMethod = {
            'LOW': 'log',
            'MEDIUM': 'warn',
            'HIGH': 'warn',
            'CRITICAL': 'error'
        }[severity] || 'log';

        console[consoleMethod](`[SECURITY ${severity}] ${eventType}`, event);

        // In production, send critical events to backend immediately
        if (import.meta.env.VITE_ENV === 'production' && (severity === 'HIGH' || severity === 'CRITICAL')) {
            this.sendToBackend(event);
        }

        return event;
    }

    /**
     * Send event to backend (placeholder)
     * @param {object} event - Security event
     */
    async sendToBackend(event) {
        try {
            // TODO: Replace with actual backend endpoint when available
            // const response = await fetch('/api/security/log', {
            //     method: 'POST',
            //     headers: { 
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify(event)
            // });

            console.log('[SECURITY] Would send to backend:', event);

            // For now, just log to console
            if (import.meta.env.VITE_ENV === 'production') {
                // In production, you could use a third-party service like Sentry
                // Sentry.captureMessage(`Security Event: ${event.type}`, {
                //     level: event.severity.toLowerCase(),
                //     extra: event
                // });
            }
        } catch (error) {
            console.error('[SECURITY] Failed to send log to backend:', error);
        }
    }

    /**
     * Get all logs
     * @returns {array} All security logs
     */
    getLogs() {
        return [...this.logs];
    }

    /**
     * Get logs by type
     * @param {string} eventType - Event type to filter
     * @returns {array} Filtered logs
     */
    getLogsByType(eventType) {
        return this.logs.filter(log => log.type === eventType);
    }

    /**
     * Get logs by severity
     * @param {string} severity - Severity level to filter
     * @returns {array} Filtered logs
     */
    getLogsBySeverity(severity) {
        return this.logs.filter(log => log.severity === severity);
    }

    /**
     * Get logs within time range
     * @param {number} startTime - Start timestamp (ms)
     * @param {number} endTime - End timestamp (ms)
     * @returns {array} Filtered logs
     */
    getLogsByTimeRange(startTime, endTime) {
        return this.logs.filter(log =>
            log.timestampMs >= startTime && log.timestampMs <= endTime
        );
    }

    /**
     * Get recent logs
     * @param {number} count - Number of recent logs to return
     * @returns {array} Recent logs
     */
    getRecentLogs(count = 10) {
        return this.logs.slice(-count);
    }

    /**
     * Get critical events
     * @returns {array} All critical events
     */
    getCriticalEvents() {
        return this.logs.filter(log => log.severity === 'CRITICAL');
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Export logs as JSON
     * @returns {string} JSON string of logs
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Export logs as CSV
     * @returns {string} CSV string of logs
     */
    exportLogsCSV() {
        if (this.logs.length === 0) return '';

        const headers = ['ID', 'Type', 'Severity', 'Timestamp', 'URL', 'Details'];
        const rows = this.logs.map(log => [
            log.id,
            log.type,
            log.severity,
            log.timestamp,
            log.url,
            JSON.stringify(log).replace(/"/g, '""') // Escape quotes
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
    }

    /**
     * Get statistics
     * @returns {object} Log statistics
     */
    getStatistics() {
        const stats = {
            total: this.logs.length,
            byType: {},
            bySeverity: {
                LOW: 0,
                MEDIUM: 0,
                HIGH: 0,
                CRITICAL: 0
            },
            last24Hours: 0,
            lastHour: 0
        };

        const now = Date.now();
        const hour = 60 * 60 * 1000;
        const day = 24 * hour;

        this.logs.forEach(log => {
            // Count by type
            stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;

            // Count by severity
            stats.bySeverity[log.severity]++;

            // Count by time
            const age = now - log.timestampMs;
            if (age < hour) stats.lastHour++;
            if (age < day) stats.last24Hours++;
        });

        return stats;
    }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();

// Export class for testing
export { SecurityLogger };

/**
 * COMMON SECURITY EVENT TYPES
 * Use these constants for consistency
 */
export const SECURITY_EVENTS = {
    // Authentication
    FAILED_LOGIN: 'FAILED_LOGIN',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    SESSION_EXPIRED: 'SESSION_EXPIRED',

    // Fraud Detection
    IMPOSSIBLE_WPM: 'IMPOSSIBLE_WPM',
    BOT_DETECTED: 'BOT_DETECTED',
    SUSPICIOUS_TYPING_PATTERN: 'SUSPICIOUS_TYPING_PATTERN',
    RAPID_REQUESTS: 'RAPID_REQUESTS',

    // Data Manipulation
    STORAGE_TAMPERING: 'STORAGE_TAMPERING',
    INVALID_SCORE: 'INVALID_SCORE',
    CERTIFICATE_FRAUD: 'CERTIFICATE_FRAUD',

    // System
    DEVTOOLS_DETECTED: 'DEVTOOLS_DETECTED',
    CLICKJACKING_ATTEMPT: 'CLICKJACKING_ATTEMPT',
    CSP_VIOLATION: 'CSP_VIOLATION',

    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SPAM_DETECTED: 'SPAM_DETECTED'
};
