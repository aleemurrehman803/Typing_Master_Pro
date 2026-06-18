/**
 * PHASE 1: Expert Web Worker Engine (Engine Migration)
 * Decouples typing logic from the main UI thread to prevent stutter.
 */

// Simulation of standardized WPM calculation (Feature 39)
const calculateWpm = (charCount, seconds) => {
    if (seconds <= 0) return 0;
    const standardWords = charCount / 5;
    return Math.round(standardWords / (seconds / 60));
};

/**
 * FEATURE 17: N-Gram Latency Histograms (expert)
 * Maps user speed across letter pairs.
 */
const analyzeNGrams = (keystrokes) => {
    const bigrams = {};
    for (let i = 1; i < keystrokes.length; i++) {
        const pair = (keystrokes[i - 1].char + keystrokes[i].char).toLowerCase();
        const delay = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;
        if (!bigrams[pair]) bigrams[pair] = { count: 0, avg: 0 };
        bigrams[pair].avg = ((bigrams[pair].avg * bigrams[pair].count) + delay) / (bigrams[pair].count + 1);
        bigrams[pair].count++;
    }
    return bigrams;
};

// Simulation of Anti-Cheat Cadence Analysis (Feature 1)

const analyzeIntegrity = (keystrokes) => {
    if (keystrokes.length < 15) return { isBot: false, score: 100, variance: 0, bigramSuspect: 0 };

    // Feature 1: Variance Analysis
    const intervals = [];
    for (let i = 1; i < keystrokes.length; i++) {
        intervals.push(keystrokes[i].timestamp - keystrokes[i - 1].timestamp);
    }

    const mean = intervals.reduce((a, b) => a + b) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Feature 2: Bigram Consistency Analysis
    const bigrams = {};
    let suspectScore = 0;
    for (let i = 1; i < keystrokes.length; i++) {
        const pair = (keystrokes[i - 1].char + keystrokes[i].char).toLowerCase();
        const d = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;
        if (!bigrams[pair]) bigrams[pair] = [];
        bigrams[pair].push(d);
    }

    Object.keys(bigrams).forEach(p => {
        const delays = bigrams[p];
        if (delays.length >= 3) {
            const m = delays.reduce((a, b) => a + b) / delays.length;
            const v = delays.reduce((a, b) => a + Math.pow(b - m, 2), 0) / delays.length;
            const sd = Math.sqrt(v);
            if (sd < 1.5) suspectScore += 20;
        }
    });

    const finalIntegrity = Math.max(0, Math.min(100, (stdDev * 5) - suspectScore));

    return {
        isBot: stdDev < 3 || suspectScore > 40,
        score: Math.round(finalIntegrity),
        variance: stdDev.toFixed(2),
        bigramSuspect: suspectScore
    };
};


import { HashChain } from '../utils/hashChain.js';
import { isFeatureEnabled } from '../utils/featureFlags.js';
import { calculateShadowWpm, verifyShadowStability } from './shadowScorer.js';

// Worker State
let referenceText = "";
let typedBuffer = "";
let startTime = 0;
let keystrokes = [];

/** @type {HashChain} */
let hashChain = null;

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'INIT':
            referenceText = payload.text;
            typedBuffer = "";
            keystrokes = [];
            startTime = 0;

            if (isFeatureEnabled('ENABLE_CRYPTO_HASHING')) {
                hashChain = new HashChain();
                await hashChain.initialize();
                // Send the nonce back to the main thread (could be used for server validation)
                self.postMessage({ type: 'CRYPTO_INIT', payload: { nonce: hashChain.nonce } });
            }
            break;

        case 'PROCESS_INPUT':
            const { value, timestamp } = payload;

            // Log keystroke for anti-cheat
            if (value.length > typedBuffer.length) {
                const char = value.slice(-1);
                keystrokes.push({ char, timestamp });

                if (hashChain) {
                    await hashChain.addKeystroke(char, timestamp);
                }
            }

            typedBuffer = value;
            if (startTime === 0 && value.length > 0) startTime = timestamp;

            // Calculate live stats
            const elapsedSeconds = startTime > 0 ? (timestamp - startTime) / 1000 : 0;

            // String diffing logic
            let errorCount = 0;
            for (let i = 0; i < typedBuffer.length; i++) {
                if (typedBuffer[i] !== referenceText[i]) errorCount++;
            }

            const accuracy = typedBuffer.length > 0
                ? Math.max(0, Math.round(((typedBuffer.length - errorCount) / typedBuffer.length) * 100))
                : 0;

            const wpm = calculateWpm(typedBuffer.length, elapsedSeconds);

            // Phase 4: Shadow Scoring (Safe Extension)
            let shadowStats = null;
            if (isFeatureEnabled('SHADOW_SCORING')) {
                const shadowWpm = calculateShadowWpm(typedBuffer, elapsedSeconds, keystrokes);
                shadowStats = verifyShadowStability(wpm, shadowWpm);
            }

            self.postMessage({
                type: 'STATS_UPDATE',
                payload: {
                    wpm,
                    accuracy,
                    errors: errorCount,
                    totalChars: typedBuffer.length,
                    isFinished: typedBuffer.length >= referenceText.length,
                    shadowStats // Sending back for analytics (invisible to user)
                }
            });
            break;

        case 'FINALIZE':
            const integrity = analyzeIntegrity(keystrokes);
            const nGrams = analyzeNGrams(keystrokes);

            let proof = null;
            if (hashChain) {
                proof = hashChain.getProof();
            }

            self.postMessage({
                type: 'FINAL_RESULTS',
                payload: {
                    integrity,
                    nGrams,
                    totalKeystrokes: keystrokes.length,
                    proof // Layer 2 Security Proof
                }
            });
            break;

    }
};
