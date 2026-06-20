/**
 * Jenny AI - Advanced Typing Coach Engine
 * Analyzes user performance and provides intelligent coaching
 */

export class JennyAI {
    constructor(user) {
        this.user = user;
        this.sessionData = [];
        this.weaknesses = new Map();
    }

    // ==================== ERROR DETECTION & ANALYSIS ====================

    /**
     * 1. Analyze typing errors in real-time
     */
    analyzeErrors(userInput, targetText) {
        const errors = [];
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] !== targetText[i]) {
                errors.push({
                    position: i,
                    expected: targetText[i],
                    typed: userInput[i],
                    context: targetText.substring(Math.max(0, i - 5), i + 5)
                });
            }
        }
        return errors;
    }

    /**
     * 2. Detect weak fingers based on key positions
     */
    detectWeakFingers(errors) {
        const fingerMap = {
            leftPinky: ['q', 'a', 'z', '1', '`'],
            leftRing: ['w', 's', 'x', '2'],
            leftMiddle: ['e', 'd', 'c', '3'],
            leftIndex: ['r', 'f', 'v', 't', 'g', 'b', '4', '5'],
            rightIndex: ['y', 'h', 'n', 'u', 'j', 'm', '6', '7'],
            rightMiddle: ['i', 'k', ',', '8'],
            rightRing: ['o', 'l', '.', '9'],
            rightPinky: ['p', ';', '/', '0', '[', ']', '\'', '-', '=']
        };

        const fingerErrors = {};
        errors.forEach(error => {
            for (const [finger, keys] of Object.entries(fingerMap)) {
                if (keys.includes(error.expected?.toLowerCase())) {
                    fingerErrors[finger] = (fingerErrors[finger] || 0) + 1;
                }
            }
        });

        return Object.entries(fingerErrors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2);
    }

    /**
     * 3. Find common mistake patterns
     */
    findCommonMistakes(recentTests) {
        const mistakes = {};
        recentTests.forEach(test => {
            if (test.errors) {
                test.errors.forEach(error => {
                    const pattern = `${error.expected}→${error.typed}`;
                    mistakes[pattern] = (mistakes[pattern] || 0) + 1;
                });
            }
        });

        return Object.entries(mistakes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([pattern, count]) => ({ pattern, count }));
    }

    /**
     * 4. Generate accuracy heatmap data
     */
    generateAccuracyHeatmap(errors) {
        const heatmap = {};
        errors.forEach(error => {
            const key = error.expected?.toLowerCase();
            if (key) {
                heatmap[key] = (heatmap[key] || 0) + 1;
            }
        });
        return heatmap;
    }

    /**
     * 5. Detect speed bottlenecks (character combinations)
     */
    detectSpeedBottlenecks(typingData) {
        const combinations = {};
        for (let i = 0; i < typingData.length - 1; i++) {
            const combo = typingData[i].char + typingData[i + 1].char;
            const timeDiff = typingData[i + 1].timestamp - typingData[i].timestamp;

            if (!combinations[combo]) {
                combinations[combo] = { times: [], avg: 0 };
            }
            combinations[combo].times.push(timeDiff);
        }

        // Calculate averages and find slowest
        Object.keys(combinations).forEach(combo => {
            const times = combinations[combo].times;
            combinations[combo].avg = times.reduce((a, b) => a + b, 0) / times.length;
        });

        return Object.entries(combinations)
            .sort((a, b) => b[1].avg - a[1].avg)
            .slice(0, 5)
            .map(([combo, data]) => ({ combo, avgTime: Math.round(data.avg) }));
    }

    // ==================== PERSONALIZED SUGGESTIONS ====================

    /**
     * 11. Generate custom drill from weak words
     */
    generateCustomDrill(errors, _wordList) {
        const weakWords = new Set();
        errors.forEach(error => {
            const word = this.extractWord(error.context);
            if (word) weakWords.add(word);
        });

        return Array.from(weakWords).slice(0, 20);
    }

    /**
     * 12. Create daily warm-up routine
     */
    getDailyWarmup(userLevel) {
        const warmups = {
            beginner: ['fff jjj fff jjj', 'aaa ;;; aaa ;;;', 'the quick brown fox'],
            intermediate: ['programming javascript python', 'function return variable'],
            advanced: ['asynchronous implementation architecture']
        };

        const level = userLevel < 30 ? 'beginner' : userLevel < 60 ? 'intermediate' : 'advanced';
        return warmups[level];
    }

    /**
     * 15. Calculate goal achievement timeline
     */
    predictGoalTimeline(currentWPM, targetWPM, recentProgress) {
        const avgImprovement = recentProgress.reduce((sum, test, i, arr) => {
            if (i === 0) return 0;
            return sum + (test.wpm - arr[i - 1].wpm);
        }, 0) / Math.max(1, recentProgress.length - 1);

        const wpmGap = targetWPM - currentWPM;
        const daysNeeded = avgImprovement > 0 ? Math.ceil(wpmGap / avgImprovement) : null;

        return {
            daysNeeded,
            avgImprovement: avgImprovement.toFixed(1),
            recommendation: this.getTimelineRecommendation(daysNeeded)
        };
    }

    /**
     * 21. Predictive performance analysis
     */
    predictFuturePerformance(recentTests) {
        if (recentTests.length < 3) return null;

        const wpmTrend = this.calculateTrend(recentTests.map(t => t.wpm));
        const accuracyTrend = this.calculateTrend(recentTests.map(t => t.accuracy));

        const daysToNextMilestone = this.calculateDaysToMilestone(
            recentTests[recentTests.length - 1].wpm,
            wpmTrend
        );

        return {
            wpmTrend: wpmTrend > 0 ? 'improving' : wpmTrend < 0 ? 'declining' : 'stable',
            accuracyTrend: accuracyTrend > 0 ? 'improving' : accuracyTrend < 0 ? 'declining' : 'stable',
            nextMilestone: Math.ceil(recentTests[recentTests.length - 1].wpm / 10) * 10,
            daysToMilestone: daysToNextMilestone,
            confidence: this.calculateConfidence(recentTests)
        };
    }

    // ==================== INTELLIGENT RESPONSES ====================

    /**
     * Generate contextual coaching message
     */
    generateCoachingMessage(context) {
        const { wpm, accuracy, errors, combo, testComplete, isImproving: _isImproving } = context;

        // Performance-based responses
        if (testComplete) {
            if (wpm > 80 && accuracy > 95) {
                return this.getRandomMessage([
                    "🔥 INCREDIBLE! You're typing like a pro! That's world-class speed!",
                    "⚡ UNSTOPPABLE! You just crushed that test! Keep this momentum!",
                    "🏆 LEGENDARY performance! You're in the top 5% of all typists!"
                ]);
            }
            if (wpm > 60 && accuracy > 90) {
                return this.getRandomMessage([
                    "💪 Excellent work! You're making serious progress!",
                    "🎯 Great job! Your consistency is paying off!",
                    "✨ Impressive! You're well on your way to mastery!"
                ]);
            }
            if (accuracy < 80) {
                return this.getRandomMessage([
                    "🎯 Let's focus on accuracy over speed. Slow down a bit!",
                    "💡 Quality over quantity! Aim for 90%+ accuracy first.",
                    "🔍 I noticed some patterns in your errors. Want to practice those?"
                ]);
            }
        }

        // Real-time feedback
        if (combo > 10) {
            return "🔥 ON FIRE! " + combo + " perfect words in a row!";
        }

        if (errors && errors.length > 5) {
            return "👀 Lots of mistakes - take a breath and slow down!";
        }

        return this.getEncouragingMessage(wpm, accuracy);
    }

    /**
     * Emotional intelligence - detect frustration
     */
    detectFrustration(recentTests) {
        if (recentTests.length < 3) return false;

        const last3 = recentTests.slice(-3);
        const decliningAccuracy = last3.every((test, i) =>
            i === 0 || test.accuracy < last3[i - 1].accuracy
        );
        const lowAccuracy = last3.every(test => test.accuracy < 75);

        return decliningAccuracy || lowAccuracy;
    }

    // ==================== HELPER METHODS ====================

    extractWord(context) {
        return context?.trim().split(/\s+/)[0];
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        const recent = values.slice(-5);
        const avg1 = recent.slice(0, Math.floor(recent.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(recent.length / 2);
        const avg2 = recent.slice(Math.floor(recent.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(recent.length / 2);
        return avg2 - avg1;
    }

    calculateDaysToMilestone(currentWPM, trend) {
        if (trend <= 0) return null;
        const nextMilestone = Math.ceil(currentWPM / 10) * 10;
        return Math.ceil((nextMilestone - currentWPM) / trend);
    }

    calculateConfidence(tests) {
        const variance = this.calculateVariance(tests.map(t => t.wpm));
        return variance < 5 ? 'high' : variance < 10 ? 'medium' : 'low';
    }

    calculateVariance(values) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length);
    }

    getTimelineRecommendation(days) {
        if (!days) return "Keep practicing consistently!";
        if (days < 7) return "You're very close! Push hard this week!";
        if (days < 30) return "Practice 15-20 minutes daily to hit your goal!";
        return "This is a long-term goal. Stay consistent and patient!";
    }

    getRandomMessage(messages) {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getEncouragingMessage(_wpm, _accuracy) {
        const messages = [
            "Keep going! You're doing great! 💪",
            "Nice rhythm! Stay focused! 🎯",
            "You've got this! Keep typing! ⚡",
            "Excellent progress! Don't stop now! 🚀"
        ];
        return this.getRandomMessage(messages);
    }
}

export default JennyAI;
