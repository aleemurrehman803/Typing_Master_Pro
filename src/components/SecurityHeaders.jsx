import { useEffect } from 'react';

/**
 * Security Headers Component
 * Adds additional client-side security measures
 * 
 * SECURITY FEATURES:
 * - Clickjacking prevention
 * - DevTools detection (production only)
 * - Right-click prevention (production only)
 */
const SecurityHeaders = () => {
    useEffect(() => {
        // SECURITY: Prevent clickjacking (iframe embedding)
        if (window.self !== window.top) {
            console.error('SECURITY: Clickjacking attempt detected. Redirecting...');
            window.top.location = window.self.location;
        }

        // SECURITY: Disable right-click in production (optional - can be removed if too restrictive)
        const handleContextMenu = (e) => {
            if (import.meta.env.VITE_ENV === 'production') {
                e.preventDefault();
                console.warn('Right-click disabled in production mode');
            }
        };

        // SECURITY: Basic DevTools detection
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                console.warn('⚠️ Developer tools detected. Security monitoring active.');
                // In production with backend, log this event to server
                if (import.meta.env.VITE_ENV === 'production') {
                    // TODO: Send to backend logging endpoint
                    // fetch('/api/security/log', { method: 'POST', body: JSON.stringify({ event: 'DEVTOOLS_DETECTED' }) });
                }
            }
        };

        // Apply security measures
        document.addEventListener('contextmenu', handleContextMenu);

        let devToolsInterval;
        if (import.meta.env.VITE_ENV === 'production') {
            devToolsInterval = setInterval(detectDevTools, 1000);
        }

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            if (devToolsInterval) {
                clearInterval(devToolsInterval);
            }
        };
    }, []);

    // This component doesn't render anything
    return null;
};

export default SecurityHeaders;
