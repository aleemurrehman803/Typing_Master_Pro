/**
 * Tutor Utility
 * Provides analysis and drill calculations for the typing engine.
 * This file resolves the missing import in Test.jsx
 */

/**
 * Analyzes N-Gram performance data
 * @param {Object} nGramData - The raw N-Gram data from the typing engine
 * @returns {Object} Analyzed statistics
 */
export const analyzeNGrams = (nGramData) => {
    // Placeholder implementation
    // In a full system, this would calculate specific transition optimizations
    return {
        ...nGramData,
        analyzedAt: Date.now()
    };
};

/**
 * Calculates and schedules the next practice drill for specific weak keys
 * @param {string} pair - The character pair (e.g., "th", "er") that is causing issues
 * @param {number} priorityScore - A score indicating how urgent this drill is (higher is more urgent)
 */
export const calculateNextDrill = (pair, priorityScore) => {
    try {
        // Retrieve existing recommended drills
        const existingDrills = JSON.parse(localStorage.getItem('recommended_drills') || '[]');

        // Check if we already have a drill queued for this pair
        const existingIndex = existingDrills.findIndex(d => d.pair === pair);

        if (existingIndex >= 0) {
            // Update priority if the new score is higher
            existingDrills[existingIndex].priority = Math.max(existingDrills[existingIndex].priority, priorityScore);
            existingDrills[existingIndex].timestamp = Date.now();
        } else {
            // Add new drill recommendation
            existingDrills.push({
                pair,
                priority: priorityScore,
                timestamp: Date.now()
            });
        }

        // Sort by priority and keep top 20 to prevent storage bloat
        const sortedDrills = existingDrills
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 20);

        localStorage.setItem('recommended_drills', JSON.stringify(sortedDrills));

        // console.debug(`[Tutor] Scheduled drill for '${pair}' (Priority: ${priorityScore.toFixed(2)})`);

    } catch (e) {
        console.warn('[Tutor] Failed to schedule drill:', e);
    }
};

/**
 * Generates an adaptive lesson based on the user's recorded weak keys.
 * Feature 1: Adaptive Learning AI
 */
export const generateAdaptiveLesson = () => {
    try {
        const existingDrills = JSON.parse(localStorage.getItem('recommended_drills') || '[]');
        if (existingDrills.length === 0) return null;

        // Take the top 5 weakest pairs
        const topDrills = existingDrills.slice(0, 5).map(d => d.pair.trim()).filter(Boolean);
        if (topDrills.length === 0) return null;

        // Create a custom lesson string by mixing these weak pairs
        const baseWords = ['the', 'and', 'for', 'that', 'with', 'here', 'there', 'this'];
        const lessonWords = [];
        
        for (let i = 0; i < 35; i++) {
            if (Math.random() > 0.4) {
                // Pick a random weak pair and duplicate it to construct a practice string
                const pair = topDrills[Math.floor(Math.random() * topDrills.length)];
                lessonWords.push(pair + pair);
            } else {
                lessonWords.push(baseWords[Math.floor(Math.random() * baseWords.length)]);
            }
        }

        return lessonWords.join(' ');
    } catch (e) {
        console.error('[Tutor] Error generating adaptive lesson:', e);
        return null;
    }
};
