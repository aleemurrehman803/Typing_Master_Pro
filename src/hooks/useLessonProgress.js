import { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../store/useAuthStore';

/**
 * Custom hook to manage lesson progress persistence.
 * Abstracts away the localStorage implementation details.
 * 
 * @param {string} courseId - The ID of the course to track
 * @returns {object} - { completedLessons, saveLessonProgress, getLessonStats }
 */
export const useLessonProgress = (courseId) => {
    const { user } = useAuthStore();

    // Key generator helper to ensure consistency
    // If no user, we could technically use a guest key, but for now we'll return empty
    const getStorageKey = useCallback(() => {
        if (!user) return null;
        return `course_progress_${user.id}_${courseId}`;
    }, [user, courseId]);

    // Initialize state from storage
    const [completedLessons, setCompletedLessons] = useState(() => {
        const key = getStorageKey();
        if (!key) return [];

        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load lesson progress:', error);
            return [];
        }
    });

    // Sync to storage whenever state changes
    useEffect(() => {
        const key = getStorageKey();
        if (key) {
            try {
                localStorage.setItem(key, JSON.stringify(completedLessons));
            } catch (error) {
                console.error('Failed to save lesson progress:', error);
            }
        }
    }, [completedLessons, getStorageKey]);

    /**
     * Updates or adds progress for a specific lesson.
     * Only updates if the new accuracy is higher than the previous one.
     * 
     * @param {number} lessonId 
     * @param {object} stats - { wpm, accuracy, etc. }
     */
    const saveLessonProgress = (lessonId, stats) => {
        setCompletedLessons(prev => {
            const existingIndex = prev.findIndex(l => l.id === lessonId);

            if (existingIndex !== -1) {
                const existingLesson = prev[existingIndex];
                // Only update if the new accuracy is better
                if (stats.accuracy > existingLesson.accuracy) {
                    const newProgress = [...prev];
                    newProgress[existingIndex] = { ...existingLesson, ...stats };
                    return newProgress;
                }
                return prev; // No improvement, return existing state
            }

            // New lesson completed
            return [...prev, { id: lessonId, ...stats }];
        });
    };

    /**
     * Helper to get stats for a specific lesson
     */
    const getLessonStats = (lessonId) => {
        return completedLessons.find(l => l.id === lessonId) || null;
    };

    return {
        completedLessons,
        saveLessonProgress,
        getLessonStats,
        isAuthenticated: !!user
    };
};
