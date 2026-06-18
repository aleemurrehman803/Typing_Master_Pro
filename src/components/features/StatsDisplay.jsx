import React from 'react';
import { Timer, Zap, Target, AlertCircle } from 'lucide-react';

/**
 * StatsDisplay Component
 * Shows real-time statistics for the typing test.
 * 
 * @param {number} timeLeft - Remaining time in seconds.
 * @param {number} wpm - Words Per Minute.
 * @param {number} accuracy - Accuracy percentage (0-100).
 * @param {number} errors - Total number of errors.
 */
const StatsDisplay = ({ label, value, icon, colorClass }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-all hover:scale-105 duration-300">
            <div className={`p-3 rounded-xl ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{label}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

export default StatsDisplay;
