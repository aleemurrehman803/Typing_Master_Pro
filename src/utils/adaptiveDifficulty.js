/**
 * Adaptive Difficulty System
 *
 * Analyses the user's recent typing history and recommends the best
 * paragraph difficulty for their current skill level.
 *
 * Thresholds (based on last-10-test averages):
 *  - beginner    : avgWpm < 40  OR avgAccuracy < 85
 *  - intermediate: avgWpm 40-69 AND avgAccuracy 85-94
 *  - hard        : avgWpm >= 70 AND avgAccuracy >= 95
 */

import { DIFFICULTY_TEXTS } from './testContent';

// ─── Thresholds ───────────────────────────────────────────────────────────────
const THRESHOLDS = {
    intermediate: { minWpm: 40, minAccuracy: 85 },
    hard:         { minWpm: 70, minAccuracy: 95 },
};

/**
 * Returns the recommended difficulty string for a user.
 * @param {Object} stats - User stats object from auth store
 * @returns {'beginner'|'intermediate'|'hard'}
 */
export const getAdaptiveDifficulty = (stats) => {
    if (!stats) return 'beginner';

    const history = Array.isArray(stats.history) ? stats.history : [];
    const slice   = history.slice(-10);

    if (slice.length === 0) return 'beginner';

    const avgWpm = Math.round(
        slice.reduce((s, t) => s + (t.wpm || 0), 0) / slice.length
    );
    const avgAcc = Math.round(
        slice.reduce((s, t) => s + (t.accuracy || 0), 0) / slice.length
    );

    if (avgWpm >= THRESHOLDS.hard.minWpm && avgAcc >= THRESHOLDS.hard.minAccuracy) {
        return 'hard';
    }
    if (avgWpm >= THRESHOLDS.intermediate.minWpm && avgAcc >= THRESHOLDS.intermediate.minAccuracy) {
        return 'intermediate';
    }
    return 'beginner';
};

/**
 * Returns a random paragraph text string matched to the user's skill level.
 * @param {Object} stats - User stats object
 * @returns {string} Paragraph text
 */
export const getAdaptiveText = (stats) => {
    const diff  = getAdaptiveDifficulty(stats);
    const texts = DIFFICULTY_TEXTS[diff] || DIFFICULTY_TEXTS.beginner;
    return texts[Math.floor(Math.random() * texts.length)];
};

/**
 * Human-readable label + emoji for a difficulty.
 * @param {'beginner'|'intermediate'|'hard'} diff
 */
export const getDifficultyMeta = (diff) => {
    const map = {
        beginner:     { label: 'Easy',   emoji: '🌱', color: '#10b981' },
        intermediate: { label: 'Medium', emoji: '⚡', color: '#f59e0b' },
        hard:         { label: 'Hard',   emoji: '🔥', color: '#ef4444' },
    };
    return map[diff] || map.beginner;
};

export default { getAdaptiveDifficulty, getAdaptiveText, getDifficultyMeta };
