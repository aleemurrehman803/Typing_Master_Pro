import { useState, useEffect, useCallback, useRef } from 'react';
import { hapticPulse } from '../utils/hardware';
import { isFeatureEnabled } from '../utils/featureFlags';

/**
 * @typedef {import('../types/global').TypingStats} TypingStats
 * @typedef {import('../types/global').IntegrityScore} IntegrityScore
 * @typedef {import('../types/global').Keystroke} Keystroke
 */

/**
 * PHASE 1: useTypingEngine (Expert Worker Edition)
 * Offloads all computation to src/workers/typingWorker.js
 * 
 * @param {string} text - The reference text to type.
 * @param {number} duration - Test duration in seconds.
 * @returns {Object} - The engine state and control functions.
 */
const useTypingEngine = (text, duration = 60) => {
    // UI-Specific State
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [typedText, setTypedText] = useState('');

    // Engine Stats from Worker
    /** @type {[TypingStats, Function]} */
    const [stats, setStats] = useState({ wpm: 0, accuracy: 0, errors: 0, totalChars: 0 });

    /** @type {[IntegrityScore, Function]} */
    const [integrity, setIntegrity] = useState({ isBot: false, score: 100, variance: 0, bigramSuspect: 0 });

    const [nGrams, setNGrams] = useState({});

    /** @type {[Keystroke[], Function]} */
    const [keystrokes, setKeystrokes] = useState([]);


    const workerRef = useRef(null);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);

    // Initialize Worker
    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/typingWorker.js', import.meta.url), {
            type: 'module'
        });

        workerRef.current.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'STATS_UPDATE') {
                // Feature 20: Haptic feedback based on real-time worker analysis
                if (payload.errors > stats.errors) {
                    hapticPulse('ERROR');
                } else if (payload.wpm > stats.wpm || payload.accuracy >= stats.accuracy) {
                    // Subtle tap on progress (throttled)
                    if (Math.random() > 0.8) hapticPulse('SUCCESS');
                }

                setStats(payload);

                // 🟥 Level 1 Constraint: Accuracy Lock 
                // Using payload because 'stats' state is stale
                if (isFeatureEnabled('ENABLE_ACCURACY_LOCK')) {
                    if (payload.totalChars > 20 && payload.accuracy < 90) {
                        setIsFinished(true); // Stop test
                        setIsActive(false);  // Stop timer
                        clearInterval(intervalRef.current);
                        // We need a way to tell the UI *why* it finished
                        setStats(prev => ({ ...prev, failedByAccuracy: true }));
                    }
                }

                if (payload.isFinished && !isFinished) {
                    finishTest();
                }
            } else if (type === 'FINAL_RESULTS') {
                setIntegrity(payload.integrity);
                setNGrams(payload.nGrams);
            }
        };


        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Sync reference text with worker
    useEffect(() => {
        workerRef.current?.postMessage({ type: 'INIT', payload: { text } });
    }, [text]);

    const finishTest = useCallback(() => {
        clearInterval(intervalRef.current);
        setIsActive(false);
        setIsFinished(true);
        workerRef.current?.postMessage({ type: 'FINALIZE' });
    }, []);

    const startTest = useCallback(() => {
        if (!isActive && !isFinished) {
            setIsActive(true);
            startTimeRef.current = performance.now();
            intervalRef.current = setInterval(() => {
                const now = performance.now();
                const elapsed = Math.round((now - startTimeRef.current) / 1000);
                const remaining = Math.max(0, duration - elapsed);
                setTimeLeft(remaining);
                if (remaining <= 0) finishTest();
            }, 1000);
        }
    }, [isActive, isFinished, duration, finishTest]);

    const resetTest = useCallback(() => {
        clearInterval(intervalRef.current);
        setIsActive(false);
        setIsFinished(false);
        setTimeLeft(duration);
        setTypedText('');
        setStats({ wpm: 0, accuracy: 0, errors: 0, totalChars: 0 });
        workerRef.current?.postMessage({ type: 'INIT', payload: { text } });
    }, [duration, text]);

    const handleInput = useCallback((value) => {
        if (isFinished) return;
        if (!isActive) startTest();

        setTypedText(value);

        // Delegate heavy lifting to worker
        workerRef.current?.postMessage({
            type: 'PROCESS_INPUT',
            payload: {
                value,
                timestamp: performance.now()
            }
        });

        // Keep a local reference if needed for dependencies, 
        // though ideally we should rely on worker stats.
        // For now, valid to just update the timestamp to trigger effect
        setKeystrokes(prev => [...prev, { char: value.slice(-1), timestamp: performance.now(), isCorrect: true }]);

        // Automatic Completion Check (Backup for Worker)
        // If user has typed enough characters (ignoring trailing spaces in reference), finish!
        if (value.length >= text.trimEnd().length) {
            finishTest();
        }
    }, [isActive, isFinished, startTest, text, finishTest]);

    return {
        timeLeft,
        isActive,
        isFinished,
        typedText,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        errors: stats.errors,
        failedByAccuracy: stats.failedByAccuracy, // 🔒 Level 1
        integrity,
        nGrams, // Feature 17: Exposed for tutor AI
        keystrokes, // Exposed for dependency tracking
        handleInput,
        resetTest,
        startTest,
        finishTest
    };
};


export default useTypingEngine;
