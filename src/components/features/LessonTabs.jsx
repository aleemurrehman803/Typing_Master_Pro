import React from 'react';

/**
 * Lesson Tabs Component
 * Navigation tabs for difficulty levels
 * 
 * @param {object} props
 * @param {string} props.activeTab - Currently active tab key
 * @param {function} props.onTabChange - Handler for changing tabs
 */
const LessonTabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'pro', label: 'Pro' },
        { id: 'master', label: 'Master' }
    ];

    return (
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 transition-colors">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default LessonTabs;
