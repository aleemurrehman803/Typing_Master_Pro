/**
 * Feature Flags Configuration
 *
 * This module controls the activation of new features and refactors.
 * It strictly adheres to the "Phase 0" rule of the Developer Roadmap:
 * "Only extend, wrap, or refactor behind feature flags".
 *
 * Usage:
 * import { isFeatureEnabled, getUserFeatureFlags } from '../utils/featureFlags';
 * if (isFeatureEnabled('NEW_TYPING_ENGINE')) { ... }
 * const flags = getUserFeatureFlags(2); // Get level-2 feature set
 */

// ─── Static Base Flags ────────────────────────────────────────────────────────
const FLAGS = {
    // Phase 1: TypeScript Migration
    STRICT_TYPE_LOGGING: false,

    // Phase 4: Typing Engine
    SHADOW_SCORING: false,

    // Phase 5: Layer 2 Security (Active)
    ENABLE_CRYPTO_HASHING: true,
    ENHANCED_HARDWARE_DETECTION: true,

    // Phase 6: Voice Dictation (Experimental)
    VOICE_DICTATION: false,

    // ✅ LEVEL 1: BEGINNER FEATURES (Default for new users)
    ENABLE_ACCURACY_LOCK: true,
    ENABLE_SLOW_MODE: true,
    ENABLE_VISUAL_GUIDES: true,
    ENABLE_SOFT_ERRORS: true,
    DISABLE_COMPETITION: true,

    // 🎯 LEVEL 2: INTERMEDIATE FEATURES (Auto-unlocked at Level 2)
    ENABLE_SPEED_CHALLENGES: false,
    ENABLE_MULTIPLAYER: false,
    ENABLE_LEADERBOARDS: false,
    ENABLE_ADVANCED_STATS: false,
    ENABLE_CODE_MODE_PRO: false,
    ENABLE_ADAPTIVE_DIFFICULTY: false,

    // 🔥 LEVEL 3: ADVANCED FEATURES
    ENABLE_CERTIFICATION_EXAMS: false,
    ENABLE_AI_TUTOR: false,
    ENABLE_CUSTOM_LAYOUTS: false,

    // 👑 LEVEL 4: EXPERT FEATURES
    ENABLE_API_ACCESS: false,
    ENABLE_MENTORSHIP: false,
};

// ─── Level-based Feature Overrides ────────────────────────────────────────────

/**
 * Returns the full feature flag set for a given user level.
 * Higher levels inherit all lower-level features.
 *
 * @param {number} level - User level (1–4)
 * @returns {Object} - Merged feature flags object for that level
 */
export const getUserFeatureFlags = (level = 1) => {
    const base = { ...FLAGS };

    if (level >= 2) {
        // Level 2: Unlock competition + speed features, remove training wheels
        base.ENABLE_ACCURACY_LOCK = false;
        base.ENABLE_SLOW_MODE = false;
        base.ENABLE_VISUAL_GUIDES = false;
        base.ENABLE_SOFT_ERRORS = false;
        base.DISABLE_COMPETITION = false;
        base.ENABLE_SPEED_CHALLENGES = true;
        base.ENABLE_MULTIPLAYER = true;
        base.ENABLE_LEADERBOARDS = true;
        base.ENABLE_ADVANCED_STATS = true;
        base.ENABLE_CODE_MODE_PRO = true;
        base.ENABLE_ADAPTIVE_DIFFICULTY = true;
    }

    if (level >= 3) {
        // Level 3: Unlock advanced mastery features
        base.ENABLE_CERTIFICATION_EXAMS = true;
        base.ENABLE_AI_TUTOR = true;
        base.ENABLE_CUSTOM_LAYOUTS = true;
    }

    if (level >= 4) {
        // Level 4: Expert unlock
        base.ENABLE_API_ACCESS = true;
        base.ENABLE_MENTORSHIP = true;
    }

    return base;
};

/**
 * Checks if a specific feature flag is enabled using the static FLAGS.
 * For level-aware checks, use getUserFeatureFlags(level)[featureName].
 *
 * @param {string} featureName - The key of the feature flag.
 * @returns {boolean} - True if enabled, false otherwise.
 */
export const isFeatureEnabled = (featureName) => {
    return FLAGS[featureName] || false;
};

/**
 * Returns all active feature flags from the static set.
 * Useful for debugging and admin panels.
 */
export const getActiveFeatures = () => {
    return Object.keys(FLAGS).filter(key => FLAGS[key]);
};

export default FLAGS;
