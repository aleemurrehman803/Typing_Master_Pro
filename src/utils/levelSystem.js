/**
 * Level Progression System
 * 
 * Manages user progression through typing skill levels:
 * - Level 1: Beginner (Accuracy-focused)
 * - Level 2: Intermediate (Speed-focused)
 * - Level 3: Advanced (Mastery-focused)
 */

/**
 * User level definitions
 */
export const LEVELS = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4
};

/**
 * Level requirements and thresholds
 */
export const LEVEL_REQUIREMENTS = {
    [LEVELS.BEGINNER]: {
        name: 'Beginner',
        minTests: 0,
        minWpm: 0,
        minAccuracy: 0,
        description: 'Focus on accuracy and proper technique',
        features: {
            accuracyLock: true,
            slowMode: true,
            visualGuides: true,
            softErrors: true,
            competitionDisabled: true
        }
    },
    [LEVELS.INTERMEDIATE]: {
        name: 'Intermediate',
        minTests: 10,
        minWpm: 40,
        minAccuracy: 90,
        description: 'Build speed while maintaining accuracy',
        features: {
            accuracyLock: false,
            slowMode: false,
            visualGuides: false,
            softErrors: false,
            competitionDisabled: false,
            speedChallenges: true,
            multiplayer: true,
            leaderboards: true
        }
    },
    [LEVELS.ADVANCED]: {
        name: 'Advanced',
        minTests: 50,
        minWpm: 70,
        minAccuracy: 95,
        description: 'Master advanced techniques and compete',
        features: {
            certificationExams: true,
            customLayouts: true,
            aiTutor: true,
            teamCompetitions: true
        }
    },
    [LEVELS.EXPERT]: {
        name: 'Expert',
        minTests: 100,
        minWpm: 100,
        minAccuracy: 98,
        description: 'Elite typing mastery',
        features: {
            apiAccess: true,
            mentorship: true,
            customChallenges: true
        }
    }
};

/**
 * Calculate user's current level based on stats
 * @param {Object} userStats - User statistics object
 * @returns {number} Current level (1-4)
 */
export const calculateUserLevel = (userStats) => {
    if (!userStats || !userStats.history || userStats.history.length === 0) {
        return LEVELS.BEGINNER;
    }

    const recentTests = userStats.history.slice(-10);
    const totalTests = userStats.history.length;

    // Calculate averages from recent tests
    const avgAccuracy = recentTests.reduce((sum, test) => sum + (test.accuracy || 0), 0) / recentTests.length;
    const avgWpm = recentTests.reduce((sum, test) => sum + (test.wpm || 0), 0) / recentTests.length;

    // Check for integrity violations
    const hasViolations = userStats.integrityViolations > 0;
    if (hasViolations) {
        return LEVELS.BEGINNER; // Reset to beginner if cheating detected
    }

    // Determine level based on requirements
    if (totalTests >= LEVEL_REQUIREMENTS[LEVELS.EXPERT].minTests &&
        avgWpm >= LEVEL_REQUIREMENTS[LEVELS.EXPERT].minWpm &&
        avgAccuracy >= LEVEL_REQUIREMENTS[LEVELS.EXPERT].minAccuracy) {
        return LEVELS.EXPERT;
    }

    if (totalTests >= LEVEL_REQUIREMENTS[LEVELS.ADVANCED].minTests &&
        avgWpm >= LEVEL_REQUIREMENTS[LEVELS.ADVANCED].minWpm &&
        avgAccuracy >= LEVEL_REQUIREMENTS[LEVELS.ADVANCED].minAccuracy) {
        return LEVELS.ADVANCED;
    }

    if (totalTests >= LEVEL_REQUIREMENTS[LEVELS.INTERMEDIATE].minTests &&
        avgWpm >= LEVEL_REQUIREMENTS[LEVELS.INTERMEDIATE].minWpm &&
        avgAccuracy >= LEVEL_REQUIREMENTS[LEVELS.INTERMEDIATE].minAccuracy) {
        return LEVELS.INTERMEDIATE;
    }

    return LEVELS.BEGINNER;
};

/**
 * Check if user can unlock next level
 * @param {Object} userStats - User statistics object
 * @param {number} currentLevel - Current user level
 * @returns {Object} { canUnlock: boolean, nextLevel: number, progress: Object }
 */
export const checkLevelUnlock = (userStats, currentLevel) => {
    const nextLevel = currentLevel + 1;

    if (nextLevel > LEVELS.EXPERT) {
        return {
            canUnlock: false,
            nextLevel: null,
            progress: null,
            message: 'You have reached the maximum level!'
        };
    }

    const requirements = LEVEL_REQUIREMENTS[nextLevel];
    const recentTests = (userStats.history || []).slice(-10);
    const totalTests = (userStats.history || []).length;

    const avgAccuracy = recentTests.length > 0
        ? recentTests.reduce((sum, test) => sum + (test.accuracy || 0), 0) / recentTests.length
        : 0;
    const avgWpm = recentTests.length > 0
        ? recentTests.reduce((sum, test) => sum + (test.wpm || 0), 0) / recentTests.length
        : 0;

    const progress = {
        tests: {
            current: totalTests,
            required: requirements.minTests,
            percentage: Math.min(100, (totalTests / requirements.minTests) * 100)
        },
        wpm: {
            current: Math.round(avgWpm),
            required: requirements.minWpm,
            percentage: Math.min(100, (avgWpm / requirements.minWpm) * 100)
        },
        accuracy: {
            current: Math.round(avgAccuracy),
            required: requirements.minAccuracy,
            percentage: Math.min(100, (avgAccuracy / requirements.minAccuracy) * 100)
        }
    };

    const canUnlock =
        totalTests >= requirements.minTests &&
        avgWpm >= requirements.minWpm &&
        avgAccuracy >= requirements.minAccuracy &&
        (userStats.integrityViolations || 0) === 0;

    return {
        canUnlock,
        nextLevel,
        progress,
        requirements,
        message: canUnlock
            ? `Congratulations! You can now unlock ${requirements.name} level!`
            : `Keep practicing to unlock ${requirements.name} level!`
    };
};

/**
 * Get feature flags for a specific level
 * @param {number} level - User level (1-4)
 * @returns {Object} Feature flags object
 */
export const getLevelFeatures = (level) => {
    const levelConfig = LEVEL_REQUIREMENTS[level];
    return levelConfig ? levelConfig.features : LEVEL_REQUIREMENTS[LEVELS.BEGINNER].features;
};

/**
 * Get level badge/icon
 * @param {number} level - User level (1-4)
 * @returns {Object} Badge configuration
 */
export const getLevelBadge = (level) => {
    const badges = {
        [LEVELS.BEGINNER]: {
            emoji: '🌱',
            color: 'green',
            gradient: 'from-green-400 to-emerald-500',
            title: 'Beginner',
            description: 'Learning the fundamentals'
        },
        [LEVELS.INTERMEDIATE]: {
            emoji: '⚡',
            color: 'blue',
            gradient: 'from-blue-400 to-indigo-500',
            title: 'Intermediate',
            description: 'Building speed and skill'
        },
        [LEVELS.ADVANCED]: {
            emoji: '🔥',
            color: 'orange',
            gradient: 'from-orange-400 to-red-500',
            title: 'Advanced',
            description: 'Mastering the craft'
        },
        [LEVELS.EXPERT]: {
            emoji: '👑',
            color: 'purple',
            gradient: 'from-purple-400 to-pink-500',
            title: 'Expert',
            description: 'Elite typing mastery'
        }
    };

    return badges[level] || badges[LEVELS.BEGINNER];
};

/**
 * Calculate XP (experience points) for a test
 * @param {Object} testResult - Test result object
 * @returns {number} XP earned
 */
export const calculateXP = (testResult) => {
    const { wpm, accuracy, duration } = testResult;

    // Base XP from WPM
    let xp = wpm * 2;

    // Accuracy bonus (up to 50% extra)
    const accuracyBonus = (accuracy / 100) * 0.5;
    xp *= (1 + accuracyBonus);

    // Duration bonus (longer tests = more XP)
    const durationMinutes = duration / 60;
    xp *= Math.min(2, 1 + (durationMinutes * 0.1));

    // Perfect accuracy bonus
    if (accuracy === 100) {
        xp *= 1.5;
    }

    return Math.round(xp);
};

/**
 * Get motivational message based on progress
 * @param {Object} progress - Progress object from checkLevelUnlock
 * @returns {string} Motivational message
 */
export const getMotivationalMessage = (progress) => {
    const avgProgress = (
        progress.tests.percentage +
        progress.wpm.percentage +
        progress.accuracy.percentage
    ) / 3;

    if (avgProgress >= 90) {
        return "You're almost there! Just a little more practice!";
    } else if (avgProgress >= 70) {
        return "Great progress! Keep up the excellent work!";
    } else if (avgProgress >= 50) {
        return "You're halfway there! Stay consistent!";
    } else if (avgProgress >= 25) {
        return "Good start! Practice makes perfect!";
    } else {
        return "Welcome! Let's build your typing skills together!";
    }
};

export default {
    LEVELS,
    LEVEL_REQUIREMENTS,
    calculateUserLevel,
    checkLevelUnlock,
    getLevelFeatures,
    getLevelBadge,
    calculateXP,
    getMotivationalMessage
};
