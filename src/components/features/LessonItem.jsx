import React from 'react';
import { PlayCircle, Star, CheckCircle } from 'lucide-react';

/**
 * Lesson Item Component
 * Displays a single lesson row with progress indicators
 * 
 * @param {object} props
 * @param {string} props.title - Lesson title
 * @param {number} props.stars - Number of stars earned (0-3)
 * @param {boolean} props.completed - Whether the lesson is completed
 * @param {boolean} props.locked - Whether the lesson is locked
 * @param {function} props.onStart - Handler for starting the lesson
 */
const LessonItem = ({ title, stars = 0, completed = false, locked = false, onStart }) => {
    return (
        <div className={`flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-all ${locked ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${completed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                    {completed ? <CheckCircle className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
                    <div className="flex gap-1 mt-1">
                        {[...Array(3)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-600'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={onStart}
                disabled={locked}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2"
            >
                <PlayCircle className="w-4 h-4" />
                Start
            </button>
        </div>
    );
};

export default LessonItem;
