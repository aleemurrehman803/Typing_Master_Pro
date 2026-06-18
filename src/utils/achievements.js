/**
 * Badge Definitions
 * List of all available achievements in the system.
 */
export const BADGES = [
    { id: 'speed_30', name: 'Speedster I', description: 'Reach 30 WPM', icon: '🚀', threshold: 30, type: 'wpm' },
    { id: 'speed_50', name: 'Speedster II', description: 'Reach 50 WPM', icon: '⚡', threshold: 50, type: 'wpm' },
    { id: 'speed_80', name: 'Speedster III', description: 'Reach 80 WPM', icon: '🔥', threshold: 80, type: 'wpm' },
    { id: 'acc_95', name: 'Precision Master', description: '95% Accuracy', icon: '🎯', threshold: 95, type: 'accuracy' },
    { id: 'acc_100', name: 'Perfectionist', description: '100% Accuracy', icon: '💎', threshold: 100, type: 'accuracy' },
    { id: 'survivor', name: 'Survivor', description: 'Complete a Sudden Death test', icon: '💀', threshold: 0, type: 'mode' },
];

/**
 * Check Achievements
 * Evaluates test results against badge thresholds to determine new unlocks.
 * 
 * @param {number} wpm - Words Per Minute achieved.
 * @param {number} accuracy - Accuracy percentage achieved.
 * @param {string[]} currentBadges - List of badge IDs the user already owns.
 * @returns {string[]} - List of newly unlocked badge IDs.
 */
export const checkAchievements = (wpm, accuracy, currentBadges = []) => {
    const newBadges = [];

    BADGES.forEach(badge => {
        // Skip if already owned
        if (currentBadges.includes(badge.id)) return;

        // Check WPM threshold
        if (badge.type === 'wpm' && wpm >= badge.threshold) {
            newBadges.push(badge.id);
        }

        // Check Accuracy threshold
        if (badge.type === 'accuracy' && accuracy >= badge.threshold) {
            newBadges.push(badge.id);
        }
    });

    return newBadges;
};
