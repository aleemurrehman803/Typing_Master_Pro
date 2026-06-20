import CryptoJS from 'crypto-js';
import { getDeviceKey } from './deviceKey';

const getStorageSecret = () => {
    return getDeviceKey();
};

let activeSecret = getStorageSecret();

export const setDynamicSecret = (secret) => {
    activeSecret = secret;
};

const LEGACY_STORAGE_SECRET = 'tm-pro-secure-v1-alpha';

/**
 * FEATURE 10: Encrypted Local Storage
 * Prevents users from manually editing stats or coins in localStorage.
 */
export const secureStorage = {
    set: (key, value) => {
        try {
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), activeSecret).toString();
            localStorage.setItem(`tm_secure_${key}`, encrypted);
        } catch (e) {
            console.error('SECURE_STORAGE_ERROR:', e);
        }
    },
    get: (key) => {
        try {
            const encrypted = localStorage.getItem(`tm_secure_${key}`);
            if (!encrypted) return null;

            // Try activeSecret decryption
            let decrypted = null;
            try {
                const bytes = CryptoJS.AES.decrypt(encrypted, activeSecret);
                decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            } catch {
                // Ignore and fallback
            }

            // Fallback decryption using legacy key
            if (decrypted === null && activeSecret !== LEGACY_STORAGE_SECRET) {
                try {
                    const bytes = CryptoJS.AES.decrypt(encrypted, LEGACY_STORAGE_SECRET);
                    decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    if (decrypted !== null) {
                        // Migrate legacy to new dynamic storage key
                        console.info(`Migrating tm_secure_${key} to dynamic storage secret...`);
                        secureStorage.set(key, decrypted);
                    }
                } catch {
                    // Ignored
                }
            }

            return decrypted;
        } catch {
            console.warn('SECURE_STORAGE_CORRUPTED');
            return null;
        }
    }
};

/**
 * FEATURE 1: Keystroke Cadence Analysis
 * FEATURE 2: Inter-Keystroke Interval (IKI) Analysis
 * Analyzes rhythm variance to detect bot-like perfection.
 */
export const analyzeTypingIntegrity = (keystrokes) => {
    if (keystrokes.length < 20) return { isBot: false, score: 100 };

    const intervals = [];
    for (let i = 1; i < keystrokes.length; i++) {
        intervals.push(keystrokes[i].timestamp - keystrokes[i - 1].timestamp);
    }

    const mean = intervals.reduce((a, b) => a + b) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // ANTI-CHEAT: Humans have natural jitter (stdDev > 10ms). 
    // If timing is too perfect (stdDev < 3ms), it's almost certainly a script.
    const isBot = stdDev < 3;

    return {
        isBot,
        variance: stdDev.toFixed(2),
        integrityScore: Math.min(100, Math.max(0, stdDev * 5))
    };
};

/**
 * FEATURE 2: Bigram Cadence Analysis (expert)
 * Detects if specific letter pairs are typed with inhuman consistency.
 */
export const analyzeBigramCadence = (keystrokes) => {
    const bigrams = {};

    for (let i = 1; i < keystrokes.length; i++) {
        const pair = (keystrokes[i - 1].char + keystrokes[i].char).toLowerCase();
        const delay = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;

        if (!bigrams[pair]) bigrams[pair] = [];
        bigrams[pair].push(delay);
    }

    let suspicionScore = 0;
    Object.keys(bigrams).forEach(pair => {
        const delays = bigrams[pair];
        if (delays.length >= 3) {
            const mean = delays.reduce((a, b) => a + b) / delays.length;
            const variance = delays.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / delays.length;
            const stdDev = Math.sqrt(variance);

            // If the same bigram is typed with < 1ms variance multiple times, it's a macro
            if (stdDev < 1.5) suspicionScore += 25;
        }
    });

    return suspicionScore;
};

/**
 * FEATURE 9: Score Manifest Signing (expert)
 * Creates a temper-proof cryptographic proof of the session.
 */
export const generateScoreManifest = async (stats, keystrokes) => {
    const manifest = {
        stats,
        cadence: keystrokes.map(k => ({ t: Math.round(k.timestamp), c: k.char })),
        v: '4.0.0-PRO',
        ts: Date.now()
    };

    const manifestString = JSON.stringify(manifest);

    // Simple HMAC-like signature for demo; in high-pro we'd use SubtleCrypto RSA
    const signature = CryptoJS.HmacSHA256(manifestString, activeSecret).toString();

    return {
        ...manifest,
        sig: signature
    };
};


/**
 * FEATURE 39: Standardized Word Calculation
 * Standardizes 5 characters = 1 word for professional accuracy.
 */
export const calculateStandardWpm = (charCount, seconds) => {
    if (seconds <= 0) return 0;
    const minutes = seconds / 60;
    const standardWords = charCount / 5;
    return Math.round(standardWords / minutes);
};
