import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

/**
 * Profile Completion Progress Indicator
 * Shows step-by-step progress through profile completion
 * 
 * @param {Object} props
 * @param {number} props.currentStep - Current step (1-3)
 * @param {number} props.completionPercentage - Overall completion percentage
 */
const ProfileProgressIndicator = ({ currentStep = 1, completionPercentage = 0 }) => {
    const steps = [
        { id: 1, label: 'Basic Info', description: 'Name & Contact' },
        { id: 2, label: 'Personal Details', description: 'Demographics' },
        { id: 3, label: 'Additional Info', description: 'Complete Profile' }
    ];

    const getStepStatus = (stepId) => {
        if (stepId < currentStep) return 'completed';
        if (stepId === currentStep) return 'current';
        return 'pending';
    };

    const getStepColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500 border-green-500 text-white';
            case 'current':
                return 'bg-indigo-600 border-indigo-600 text-white animate-pulse';
            case 'pending':
                return 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400';
            default:
                return '';
        }
    };

    const getLineColor = (stepId) => {
        if (stepId < currentStep) {
            return 'bg-green-500';
        }
        return 'bg-slate-300 dark:bg-slate-600';
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Completion</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Complete all steps to unlock full access</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{completionPercentage}%</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Complete</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${completionPercentage}%` }}
                    >
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                </div>
            </div>

            {/* Steps */}
            <div className="relative">
                {/* Connection Lines */}
                <div className="absolute top-6 left-0 right-0 flex items-center px-8">
                    <div className={`flex-1 h-1 ${getLineColor(2)} transition-all duration-300`}></div>
                    <div className="w-8"></div>
                    <div className={`flex-1 h-1 ${getLineColor(3)} transition-all duration-300`}></div>
                </div>

                {/* Step Items */}
                <div className="relative grid grid-cols-3 gap-4">
                    {steps.map((step) => {
                        const status = getStepStatus(step.id);
                        return (
                            <div key={step.id} className="flex flex-col items-center text-center">
                                {/* Step Circle */}
                                <div
                                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg mb-3 transition-all duration-300 ${getStepColor(status)}`}
                                >
                                    {status === 'completed' ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : status === 'current' ? (
                                        step.id
                                    ) : (
                                        <Circle className="w-6 h-6" />
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className={`transition-colors duration-300 ${status === 'current'
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : status === 'completed'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                    <div className="font-bold text-sm mb-1">{step.label}</div>
                                    <div className="text-xs">{step.description}</div>
                                </div>

                                {/* Status Badge */}
                                {status === 'completed' && (
                                    <div className="mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        Done
                                    </div>
                                )}
                                {status === 'current' && (
                                    <div className="mt-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                        In Progress
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Motivational Message */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-semibold text-center text-slate-700 dark:text-slate-300">
                    {completionPercentage < 33 && "🚀 Let's get started! Fill in your basic information."}
                    {completionPercentage >= 33 && completionPercentage < 66 && "💪 Great progress! Add your personal details."}
                    {completionPercentage >= 66 && completionPercentage < 100 && "🔥 Almost there! Complete the final details."}
                    {completionPercentage === 100 && "🎉 Profile complete! You now have full access to all features."}
                </p>
            </div>
        </div>
    );
};

export default ProfileProgressIndicator;
