/**
 * Phase 4 & 10: Shadow Scoring System
 * 
 * This module implements the "Refactor by Duplication" pattern.
 * It contains a NEW version of the WPM calculation logic that we want to test.
 * It runs in parallel with the existing logic (Shadow Mode) to verify correctness
 * without risking the user's actual score.
 * 
 * ALGORITHM CHANGE:
 * Standard WPM (old): (Chars / 5) / Minutes
 * Shadow WPM (new): Uses a weighted character system (e.g., capitals are harder).
 */

export const calculateShadowWpm = (typedBuffer, elapsedSeconds, keystrokes) => {
    if (elapsedSeconds <= 0) return 0;

    // Advanced Weighted Score (New Formula Proposal)
    let weightedCount = 0;

    // 1. Base Score
    weightedCount += typedBuffer.length;

    // 2. Weights for difficulty
    for (const char of typedBuffer) {
        if (/[A-Z]/.test(char)) weightedCount += 0.5; // Capitals cost 50% more effort
        if (/[0-9]/.test(char)) weightedCount += 0.8; // Numbers cost 80% more effort
        if (/[^a-zA-Z0-9\s]/.test(char)) weightedCount += 1.0; // Symbols cost 100% more
    }

    const standardWords = weightedCount / 5;
    const minutes = elapsedSeconds / 60;

    return Math.round(standardWords / minutes);
};

export const verifyShadowStability = (mainWpm, shadowWpm) => {
    const diff = Math.abs(mainWpm - shadowWpm);
    // If the new formula deviates by > 20%, flag it as unstable
    return {
        shadowWpm,
        diff,
        isStable: diff < (mainWpm * 0.2)
    };
};
