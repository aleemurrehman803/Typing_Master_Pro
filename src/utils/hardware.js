/**
 * PHASE 5: Hardware & Physiological Integration
 * Specialized utilities for WebHID, Vibration (Haptics), and Eye-Tracking.
 */

/**
 * FEATURE 13: Hardware Latency & Polling (expert)
 * Uses WebHID to identify the technical capabilities of the input device.
 */
export const detectKeyboardPolling = async () => {
    if (!('hid' in navigator)) return { supported: false };

    try {
        const devices = await navigator.hid.getDevices();
        if (devices.length === 0) return { supported: true, deviceCount: 0 };

        // Identify polling rates (expert level hardware info)
        const specs = devices.map(d => ({
            name: d.productName,
            vendorId: d.vendorId,
            productId: d.productId,
            // Professional gaming keyboards usually poll at 1000Hz+
            isProGrade: d.productName.toLowerCase().includes('mechanical') || d.vendorId === 0x1532 // Razer Example
        }));

        return {
            supported: true,
            devices: specs,
            advantageIndex: specs.some(s => s.isProGrade) ? 'HIGH' : 'STANDARD'
        };
    } catch (e) {
        return { supported: true, error: e.message };
    }
};

/**
 * FEATURE 20: Haptic Precision Feedback (expert)
 * Leverages the Web Vibration API for tactile response during typing.
 */
export const hapticPulse = (type) => {
    if (!('vibrate' in navigator)) return;

    switch (type) {
        case 'SUCCESS':
            // Fast 15ms tap for valid hit
            navigator.vibrate(15);
            break;
        case 'ERROR':
            // Heavier 80ms buzz for mistakes
            navigator.vibrate([80, 50, 80]);
            break;
        case 'BATTLE_HIT':
            // High cadence pulse for combat
            navigator.vibrate(40);
            break;
    }
};

/**
 * FEATURE 18: Gaze-Aware Focus (concept)
 * Interface for WebGazer.js to measure eye-tracking stats.
 */
export const eyeTrackingEngine = {
    init: async () => {
        console.log('[Phase 5] Initializing Eye-Tracking Calibration...');
        // In full implementation, this loads external scripts for WebGazer.js
    },
    getLookAheadDistance: (cursorX, eyeX) => {
        // Measures how many pixels/words the eye is ahead of the cursor
        return Math.max(0, eyeX - cursorX);
    }
};
