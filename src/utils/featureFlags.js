/**
 * Feature Flags Configuration
 * 
 * This module controls the activation of new features and refactors.
 * It strictly adheres to the "Phase 0" rule of the Developer Roadmap:
 * "Only extend, wrap, or refactor behind feature flags".
 * 
 * Usage:
 * import { isFeatureEnabled } from '../utils/featureFlags';
 * if (isFeatureEnabled('NEW_TYPING_ENGINE')) { ... }
 */

const FLAGS = {
    // Phase 1: TypeScript Migration
    STRICT_TYPE_LOGGING: false,

    // Phase 4: Typing Engine
    SHADOW_SCORING: false,

    // Phase 5: Layer 2 Security (Active)
    ENABLE_CRYPTO_HASHING: true,
    ENHANCED_HARDWARE_DETECTION: true,

    // Phase 6: Voice Dictation (Experimental - Optional Level 6)
    VOICE_DICTATION: false,

    // ✅ LEVEL 1: BEGINNER FEATURES (Default for new users)
    ENABLE_ACCURACY_LOCK: true,       // Gating progress based on 90% accuracy
    ENABLE_SLOW_MODE: true,           // Enforcing slow, deliberate typing
    ENABLE_VISUAL_GUIDES: true,       // Finger placement and home row highlights
    ENABLE_SOFT_ERRORS: true,         // No visual punishment for errors, just guidance
    DISABLE_COMPETITION: true,        // Hides Leaderboards/Multiplayer for beginners

    // 🎯 LEVEL 2: INTERMEDIATE FEATURES (Unlock at Level 2)
    ENABLE_SPEED_CHALLENGES: true,    // WPM target mode with progress tracking
    ENABLE_MULTIPLAYER: true,         // Battle Arena real-time duels
    ENABLE_LEADERBOARDS: true,        // Competitive rankings and submissions
    ENABLE_ADVANCED_STATS: true,      // N-gram analysis and weak key detection
    ENABLE_CODE_MODE_PRO: true,       // Enhanced code typing with syntax
    ENABLE_ADAPTIVE_DIFFICULTY: true, // Auto-adjust text difficulty

    // 🔥 LEVEL 3: ADVANCED FEATURES (Future)
    ENABLE_CERTIFICATION_EXAMS: false,
    ENABLE_AI_TUTOR: false,
    ENABLE_CUSTOM_LAYOUTS: false,
};

/**
 * Checks if a specific feature flag is enabled.
 * 
 * @param {string} featureName - The key of the feature flag.
 * @returns {boolean} - True if enabled, false otherwise.
 */
export const isFeatureEnabled = (featureName) => {
    // In production, we might want to fetch these from a remote config
    // For now, we use the local const.
    return FLAGS[featureName] || false;
};

/**
 * Returns all active feature flags.
 * Useful for debugging and admin panels.
 */
export const getActiveFeatures = () => {
    return Object.keys(FLAGS).filter(key => FLAGS[key]);
};

export default FLAGS;
