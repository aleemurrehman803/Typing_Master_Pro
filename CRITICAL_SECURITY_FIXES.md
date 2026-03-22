# 🔧 CRITICAL SECURITY FIXES - IMPLEMENTATION GUIDE

## ⚠️ URGENT: These fixes MUST be applied before production launch

---

## FIX #1: Add Missing Environment Variables

### Create `.env.production` file:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# JWT Secret (Generate with: openssl rand -base64 64)
VITE_JWT_SECRET=your-64-character-random-secret-here

# Encryption Key (Generate with: openssl rand -base64 64)
VITE_ENCRYPTION_KEY=your-64-character-encryption-key-here

# Sentry Error Tracking (Optional but recommended)
VITE_SENTRY_DSN=https://your-sentry-dsn-here

# Environment
VITE_ENV=production
```

### Update `.env` for development:

```env
# Development Environment Variables
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=dev-anon-key
VITE_JWT_SECRET=dev-jwt-secret-change-in-production
VITE_ENCRYPTION_KEY=dev-encryption-key-change-in-production
VITE_ENV=development
```

---

## FIX #2: Re-enable Content Security Policy

### File: `index.html` (Lines 34-37)

**Replace:**
```html
<!-- Note: CSP is commented out for development. Re-enable for production with proper Vite directives -->
<!-- <meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.supabase.in;" /> -->
```

**With:**
```html
<!-- Security: Content Security Policy (Production) -->
<meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; 
             script-src 'self'; 
             style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
             img-src 'self' data: https:; 
             font-src 'self' data: https://fonts.gstatic.com; 
             connect-src 'self' https://*.supabase.co https://*.supabase.in https://worldtimeapi.org; 
             frame-ancestors 'none'; 
             base-uri 'self'; 
             form-action 'self';" />
```

---

## FIX #3: Add Fail-Safe for Missing Secrets

### File: `src/utils/crypto.js` (Line 63)

**Replace:**
```javascript
const secret = import.meta.env.VITE_JWT_SECRET || 'typemaster-secret-key-change-in-production';
```

**With:**
```javascript
const secret = import.meta.env.VITE_JWT_SECRET;
if (!secret || secret.length < 32 || secret.includes('change-in-production')) {
    throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET not properly configured. Application cannot start.');
}
```

### File: `src/utils/crypto.js` (Line 125)

**Replace:**
```javascript
export const encryptData = (data, key = import.meta.env.VITE_ENCRYPTION_KEY || 'default-encryption-key') => {
```

**With:**
```javascript
export const encryptData = (data, key = import.meta.env.VITE_ENCRYPTION_KEY) => {
    if (!key || key.length < 32) {
        throw new Error('CRITICAL: Encryption key not configured');
    }
```

---

## FIX #4: Add HTTPS Enforcement

### File: `vite.config.js`

**Add after line 14:**
```javascript
server: {
    port: 5173,
    open: true,
    // HTTPS enforcement for production
    https: process.env.NODE_ENV === 'production',
},
preview: {
    port: 4173,
    https: true,
    headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
},
```

---

## FIX #5: Add Error Monitoring (Sentry)

### Install Sentry:
```bash
npm install @sentry/react
```

### File: `src/main.jsx`

**Add at the top (after imports):**
```javascript
import * as Sentry from "@sentry/react";

// Initialize Sentry for production error tracking
if (import.meta.env.VITE_ENV === 'production') {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.VITE_ENV,
        tracesSampleRate: 1.0,
        integrations: [
            new Sentry.BrowserTracing(),
            new Sentry.Replay({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
    });
}
```

---

## FIX #6: Add Security Headers Component

### Create new file: `src/components/SecurityHeaders.jsx`

```javascript
import { useEffect } from 'react';

/**
 * Security Headers Component
 * Adds additional client-side security measures
 */
const SecurityHeaders = () => {
    useEffect(() => {
        // Prevent clickjacking
        if (window.self !== window.top) {
            window.top.location = window.self.location;
        }

        // Disable right-click in production (optional)
        if (import.meta.env.VITE_ENV === 'production') {
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }

        // Detect DevTools (basic)
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                console.warn('Developer tools detected. Monitoring enabled.');
                // In production, you could log this to your backend
            }
        };

        if (import.meta.env.VITE_ENV === 'production') {
            setInterval(detectDevTools, 1000);
        }

        return () => {
            document.removeEventListener('contextmenu', () => {});
        };
    }, []);

    return null;
};

export default SecurityHeaders;
```

### Add to `App.jsx` (after DeviceRestriction):

```javascript
import SecurityHeaders from './components/SecurityHeaders';

// Inside the return statement:
<DeviceRestriction>
    <SecurityHeaders />
    <ErrorBoundary>
        {/* rest of the app */}
    </ErrorBoundary>
</DeviceRestriction>
```

---

## FIX #7: Add Rate Limiting Utility

### Create new file: `src/utils/rateLimiter.js`

```javascript
/**
 * Client-Side Rate Limiter
 * Provides basic protection against rapid requests
 * NOTE: This is NOT a replacement for server-side rate limiting
 */

class RateLimiter {
    constructor() {
        this.requests = new Map();
    }

    /**
     * Check if action is allowed
     * @param {string} key - Unique identifier (e.g., 'login', 'certificate_download')
     * @param {number} maxRequests - Maximum requests allowed
     * @param {number} windowMs - Time window in milliseconds
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

        return true;
    }

    /**
     * Get remaining time until next allowed request
     * @param {string} key - Unique identifier
     * @param {number} windowMs - Time window in milliseconds
     * @returns {number} Milliseconds until next allowed request
     */
    getRetryAfter(key, windowMs = 60000) {
        const requestLog = this.requests.get(key) || [];
        if (requestLog.length === 0) return 0;

        const oldestRequest = Math.min(...requestLog);
        const retryAfter = windowMs - (Date.now() - oldestRequest);

        return Math.max(0, retryAfter);
    }

    /**
     * Reset rate limit for a key
     * @param {string} key - Unique identifier
     */
    reset(key) {
        this.requests.delete(key);
    }

    /**
     * Clear all rate limits
     */
    clearAll() {
        this.requests.clear();
    }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Export class for testing
export { RateLimiter };
```

### Usage Example in `Certificates.jsx`:

```javascript
import { rateLimiter } from '../utils/rateLimiter';

const handleDownloadCertificate = () => {
    // Rate limit: 3 downloads per minute
    if (!rateLimiter.isAllowed('certificate_download', 3, 60000)) {
        const retryAfter = Math.ceil(rateLimiter.getRetryAfter('certificate_download', 60000) / 1000);
        alert(`Please wait ${retryAfter} seconds before downloading another certificate.`);
        return;
    }

    // Proceed with download
    downloadCertificate();
};
```

---

## FIX #8: Add Suspicious Activity Logger

### Create new file: `src/utils/securityLogger.js`

```javascript
/**
 * Security Event Logger
 * Logs suspicious activities for monitoring
 */

class SecurityLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100; // Keep last 100 events
    }

    /**
     * Log a security event
     * @param {string} eventType - Type of event (e.g., 'FAILED_LOGIN', 'IMPOSSIBLE_WPM')
     * @param {object} details - Event details
     */
    log(eventType, details = {}) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...details
        };

        this.logs.push(event);

        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console log in development
        if (import.meta.env.VITE_ENV !== 'production') {
            console.warn('[SECURITY]', event);
        }

        // In production, send to backend
        if (import.meta.env.VITE_ENV === 'production') {
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
            // TODO: Replace with actual backend endpoint
            // await fetch('/api/security/log', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(event)
            // });
            console.log('[SECURITY] Would send to backend:', event);
        } catch (error) {
            console.error('[SECURITY] Failed to send log:', error);
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
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Export logs as JSON
     * @returns {string} JSON string of logs
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();

// Export class for testing
export { SecurityLogger };
```

### Usage in `useAuthStore.js`:

```javascript
import { securityLogger } from '../utils/securityLogger';

// In login function (after failed attempt):
securityLogger.log('FAILED_LOGIN', {
    email: normalizedEmail,
    attemptCount: loginAttempts.count + 1,
    reason: 'Invalid credentials'
});

// In updateStats function (after WPM check):
if (payload.wpm > MAX_PHYSICAL_WPM) {
    securityLogger.log('IMPOSSIBLE_WPM', {
        wpm: payload.wpm,
        userId: user.id,
        accuracy: payload.accuracy
    });
    console.error('CRITICAL: Impossible WPM detected.');
    return { success: false, error: 'Suspicious score detected.' };
}
```

---

## FIX #9: Add Production Build Check

### Create new file: `src/utils/productionCheck.js`

```javascript
/**
 * Production Readiness Check
 * Validates that all required environment variables are set
 */

export const checkProductionReadiness = () => {
    const errors = [];
    const warnings = [];

    // Check required environment variables
    const requiredVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_JWT_SECRET',
        'VITE_ENCRYPTION_KEY'
    ];

    requiredVars.forEach(varName => {
        const value = import.meta.env[varName];
        
        if (!value) {
            errors.push(`Missing required environment variable: ${varName}`);
        } else if (value.includes('your-') || value.includes('change-in-production')) {
            errors.push(`Placeholder value detected in ${varName}. Update with real credentials.`);
        } else if (value.length < 20) {
            warnings.push(`${varName} seems too short. Ensure it's properly configured.`);
        }
    });

    // Check if CSP is enabled
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
        warnings.push('Content Security Policy is not enabled');
    }

    // Check if HTTPS
    if (import.meta.env.VITE_ENV === 'production' && window.location.protocol !== 'https:') {
        errors.push('Application must run over HTTPS in production');
    }

    return {
        ready: errors.length === 0,
        errors,
        warnings
    };
};

// Run check in production
if (import.meta.env.VITE_ENV === 'production') {
    const check = checkProductionReadiness();
    
    if (!check.ready) {
        console.error('❌ PRODUCTION READINESS CHECK FAILED:');
        check.errors.forEach(error => console.error(`  - ${error}`));
        
        // Optionally prevent app from loading
        // throw new Error('Production readiness check failed. See console for details.');
    }

    if (check.warnings.length > 0) {
        console.warn('⚠️ PRODUCTION WARNINGS:');
        check.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
}
```

### Add to `main.jsx`:

```javascript
import './utils/productionCheck';
```

---

## FIX #10: Update .gitignore

### File: `.gitignore`

**Add these lines:**
```
# Environment variables
.env
.env.local
.env.production
.env.development
*.env

# Security audit reports
SECURITY_*.md
audit-*.json

# Logs
logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/*
!.vscode/extensions.json
.idea
*.swp
*.swo

# Build artifacts
dist
dist-ssr
*.local

# Dependencies
node_modules

# Testing
coverage
.nyc_output
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Immediate (Today):
- [ ] Create `.env.production` with real credentials
- [ ] Re-enable CSP in `index.html`
- [ ] Add fail-safe checks in `crypto.js`
- [ ] Update `.gitignore`

### This Week:
- [ ] Install and configure Sentry
- [ ] Add `SecurityHeaders` component
- [ ] Implement `rateLimiter` utility
- [ ] Add `securityLogger` to critical functions
- [ ] Add production readiness check

### Before Launch:
- [ ] Test all features with CSP enabled
- [ ] Verify all environment variables are set
- [ ] Run security audit again
- [ ] Perform penetration testing
- [ ] Load test with 100+ concurrent users

---

## ⚠️ CRITICAL REMINDER

**These fixes improve security but DO NOT solve the fundamental issue:**

### ❌ **YOU STILL NEED A BACKEND SERVER**

All authentication, data storage, and validation MUST move to a server-side solution (Supabase or custom backend) before production launch.

**Timeline:** 3-4 weeks minimum for Supabase integration

---

**Last Updated:** February 1, 2026  
**Next Review:** After backend implementation
