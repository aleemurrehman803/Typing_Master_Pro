import { describe, it, expect } from 'vitest';
import {
    getAdaptiveDifficulty,
    getDifficultyMeta,
    getAdaptiveText
} from './adaptiveDifficulty';

describe('Adaptive Difficulty Utils', () => {
    describe('getAdaptiveDifficulty', () => {
        it('should return beginner for missing or empty stats/history', () => {
            expect(getAdaptiveDifficulty(null)).toBe('beginner');
            expect(getAdaptiveDifficulty({})).toBe('beginner');
            expect(getAdaptiveDifficulty({ history: [] })).toBe('beginner');
        });

        it('should return beginner if avgWpm is below 40 or avgAccuracy is below 85', () => {
            // Low WPM, High Accuracy
            const stats1 = {
                history: Array(10).fill({ wpm: 35, accuracy: 98 })
            };
            expect(getAdaptiveDifficulty(stats1)).toBe('beginner');

            // High WPM, Low Accuracy
            const stats2 = {
                history: Array(10).fill({ wpm: 75, accuracy: 80 })
            };
            expect(getAdaptiveDifficulty(stats2)).toBe('beginner');
        });

        it('should return intermediate if avgWpm is 40-69 and avgAccuracy is 85-94', () => {
            const stats = {
                history: Array(10).fill({ wpm: 50, accuracy: 90 })
            };
            expect(getAdaptiveDifficulty(stats)).toBe('intermediate');
        });

        it('should return hard if avgWpm is >= 70 and avgAccuracy is >= 95', () => {
            const stats = {
                history: Array(10).fill({ wpm: 75, accuracy: 96 })
            };
            expect(getAdaptiveDifficulty(stats)).toBe('hard');
        });

        it('should only evaluate the last 10 elements of the history array', () => {
            // User had poor stats initially, but last 10 are excellent
            const history = [
                ...Array(10).fill({ wpm: 20, accuracy: 70 }), // old poor stats
                ...Array(10).fill({ wpm: 80, accuracy: 98 })  // new excellent stats
            ];
            expect(getAdaptiveDifficulty({ history })).toBe('hard');
        });
    });

    describe('getDifficultyMeta', () => {
        it('should return correct styling and labels for each difficulty level', () => {
            expect(getDifficultyMeta('beginner').label).toBe('Easy');
            expect(getDifficultyMeta('intermediate').label).toBe('Medium');
            expect(getDifficultyMeta('hard').label).toBe('Hard');
            
            // Fallback
            expect(getDifficultyMeta('unknown').label).toBe('Easy');
        });
    });

    describe('getAdaptiveText', () => {
        it('should return a non-empty string of text matched to difficulty', () => {
            const stats = {
                history: Array(10).fill({ wpm: 50, accuracy: 90 })
            };
            const text = getAdaptiveText(stats);
            expect(typeof text).toBe('string');
            expect(text.length).toBeGreaterThan(0);
        });
    });
});
