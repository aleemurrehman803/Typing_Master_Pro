import React, { useState } from 'react';
import { Target, Zap, Trophy, TrendingUp } from 'lucide-react';

/**
 * Speed Challenge Component
 * Allows users to set WPM targets and track progress in real-time
 * 
 * @param {Object} props
 * @param {number} props.currentWpm - Current typing speed
 * @param {Function} props.onTargetSelect - Callback when target is selected
 * @param {number} props.selectedTarget - Currently selected WPM target
 */
const SpeedChallenge = ({ currentWpm = 0, onTargetSelect, selectedTarget = null }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const targets = [
        { wpm: 40, label: 'Beginner', color: 'green', icon: Target, description: 'Build foundation' },
        { wpm: 50, label: 'Intermediate', color: 'blue', icon: Zap, description: 'Steady progress' },
        { wpm: 60, label: 'Advanced', color: 'purple', icon: TrendingUp, description: 'Professional speed' },
        { wpm: 70, label: 'Expert', color: 'orange', icon: Trophy, description: 'Elite performance' },
        { wpm: 80, label: 'Master', color: 'red', icon: Trophy, description: 'Top 5% globally' },
        { wpm: 100, label: 'Legend', color: 'yellow', icon: Trophy, description: 'World-class' },
    ];

    const handleTargetSelect = (target) => {
        onTargetSelect(target.wpm);
        setIsExpanded(false);
    };

    const getProgressPercentage = () => {
        if (!selectedTarget || selectedTarget === 0) return 0;
        return Math.min(100, (currentWpm / selectedTarget) * 100);
    };

    const getProgressColor = () => {
        const progress = getProgressPercentage();
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-500';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getMotivationalMessage = () => {
        const progress = getProgressPercentage();
        if (progress >= 100) return "🎉 Target achieved! Set a new challenge!";
        if (progress >= 90) return "🔥 Almost there! Push harder!";
        if (progress >= 75) return "💪 Great progress! Keep going!";
        if (progress >= 50) return "⚡ Halfway there! Stay focused!";
        if (progress >= 25) return "🚀 Good start! Build momentum!";
        return "🎯 Let's crush this target!";
    };

    const selectedTargetData = targets.find(t => t.wpm === selectedTarget);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Speed Challenge</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Set your WPM target</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                >
                    {isExpanded ? 'Close' : selectedTarget ? 'Change' : 'Select Target'}
                </button>
            </div>

            {/* Target Selection Grid */}
            {isExpanded && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    {targets.map((target) => {
                        const Icon = target.icon;
                        const isSelected = selectedTarget === target.wpm;
                        const isAchieved = currentWpm >= target.wpm;

                        return (
                            <button
                                key={target.wpm}
                                onClick={() => handleTargetSelect(target)}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${isSelected
                                        ? `border-${target.color}-500 bg-${target.color}-50 dark:bg-${target.color}-900/20`
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                {isAchieved && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-2">
                                    <Icon className={`w-8 h-8 text-${target.color}-500`} />
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{target.wpm}</div>
                                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">{target.label}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">{target.description}</div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Progress Display */}
            {selectedTarget && !isExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Current Stats */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Current Speed</div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">{currentWpm} <span className="text-lg text-slate-500">WPM</span></div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-600 dark:text-slate-400">Target</div>
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{selectedTarget} <span className="text-lg text-slate-500">WPM</span></div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Progress</span>
                            <span className="font-bold text-slate-900 dark:text-white">{Math.round(getProgressPercentage())}%</span>
                        </div>
                        <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`absolute top-0 left-0 h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
                                style={{ width: `${getProgressPercentage()}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            </div>
                        </div>
                    </div>

                    {/* Motivational Message */}
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <p className="text-sm font-semibold text-center text-slate-700 dark:text-slate-300">
                            {getMotivationalMessage()}
                        </p>
                    </div>

                    {/* Target Info */}
                    {selectedTargetData && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <div className={`p-2 bg-${selectedTargetData.color}-100 dark:bg-${selectedTargetData.color}-900/30 rounded-lg`}>
                                <selectedTargetData.icon className={`w-5 h-5 text-${selectedTargetData.color}-600 dark:text-${selectedTargetData.color}-400`} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedTargetData.label} Challenge</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">{selectedTargetData.description}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Remaining</div>
                                <div className="text-lg font-black text-slate-900 dark:text-white">
                                    {Math.max(0, selectedTarget - currentWpm)} <span className="text-xs">WPM</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!selectedTarget && !isExpanded && (
                <div className="text-center py-8">
                    <Target className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">No target selected</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Choose a WPM goal to start your challenge</p>
                </div>
            )}
        </div>
    );
};

export default SpeedChallenge;
