/**
 * TypeMaster Pro - Event Telemetry & Observability Wrapper
 * Handles DAU/WAU tracking, page views, custom client actions, and application crash diagnostics.
 */

class AnalyticsService {
    constructor() {
        this.events = [];
        this.maxEvents = 100;
        this.storageKey = 'tm_analytics_events';
        this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.events = JSON.parse(stored);
                this.trimEvents();
            }
        } catch (e) {
            console.error('[Analytics] Failed to load local events cache:', e);
            this.events = [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.events));
        } catch (e) {
            console.error('[Analytics] Failed to save events cache:', e);
        }
    }

    trimEvents() {
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
    }

    /**
     * Stamped DAU/WAU active checks
     */
    checkActiveTelemetry(userId = 'guest') {
        try {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Calculate week identifier: YYYY-W[weekNum]
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const pastDaysOfYear = (now - startOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
            const weekStr = `${now.getFullYear()}-W${weekNum}`;

            const cachedDay = localStorage.getItem(`tm_last_active_day_${userId}`);
            const cachedWeek = localStorage.getItem(`tm_last_active_week_${userId}`);

            if (cachedDay !== todayStr) {
                localStorage.setItem(`tm_last_active_day_${userId}`, todayStr);
                this.trackEvent('DAILY_ACTIVE_USER', { userId, date: todayStr }, false);
            }

            if (cachedWeek !== weekStr) {
                localStorage.setItem(`tm_last_active_week_${userId}`, weekStr);
                this.trackEvent('WEEKLY_ACTIVE_USER', { userId, week: weekStr }, false);
            }
        } catch (e) {
            console.error('[Analytics] Active user check failed:', e);
        }
    }

    /**
     * Track user page view
     * @param {string} path - URL path
     * @param {object} properties - Additional metadata
     */
    trackPageView(path, properties = {}) {
        this.checkActiveTelemetry();
        const event = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'page_view',
            timestamp: new Date().toISOString(),
            path,
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            ...properties
        };

        this.events.push(event);
        this.trimEvents();
        this.saveToStorage();

        console.log(`%c[Analytics] Page View: ${path}`, 'color: #3b82f6; font-weight: bold;', event);
        this.sendToMockBackend(event);
    }

    /**
     * Track custom client events
     * @param {string} eventName - Name of the action
     * @param {object} properties - Context details
     * @param {boolean} triggerActiveCheck - Trigger user active count
     */
    trackEvent(eventName, properties = {}, triggerActiveCheck = true) {
        if (triggerActiveCheck) {
            this.checkActiveTelemetry();
        }
        
        const event = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'event',
            name: eventName,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            ...properties
        };

        this.events.push(event);
        this.trimEvents();
        this.saveToStorage();

        console.log(`%c[Analytics] Event: ${eventName}`, 'color: #10b981; font-weight: bold;', event);
        this.sendToMockBackend(event);
    }

    /**
     * Log application errors
     * @param {Error|string} error - Caught error
     * @param {object} context - Component crash stack or method parameters
     */
    trackError(error, context = {}) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';

        const event = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'error',
            timestamp: new Date().toISOString(),
            message: errorMsg,
            stack: errorStack,
            url: window.location.href,
            ...context
        };

        this.events.push(event);
        this.trimEvents();
        this.saveToStorage();

        console.error(`[Analytics Error Logged]`, event);
        this.sendToMockBackend(event);
    }

    /**
     * Identify session characteristics
     * @param {string} userId - User UUID
     * @param {object} traits - User properties
     */
    identify(userId, traits = {}) {
        this.checkActiveTelemetry(userId);
        this.trackEvent('IDENTIFY', { userId, ...traits }, false);
    }

    sendToMockBackend(event) {
        // Production integrations go here (e.g. Sentry / PostHog)
        if (import.meta.env.VITE_ENV === 'production') {
            // fetch('/api/analytics/collect', { method: 'POST', body: JSON.stringify(event) }).catch(...)
        }
    }
}

export const analytics = new AnalyticsService();
