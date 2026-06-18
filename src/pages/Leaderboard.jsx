import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

/**
 * Leaderboard Page Component
 * Displays top performers. Accepts data prop for flexibility.
 * 
 * @param {object[]} data - Optional array of leaderboard entries
 */
const Leaderboard = ({ data }) => {
    // Mock leaderboard data (Fallback)
    const MOCK_DATA = [
        { rank: 1, name: 'Speed Master', wpm: 120, accuracy: 98, tests: 250 },
        { rank: 2, name: 'Type Pro', wpm: 115, accuracy: 97, tests: 200 },
        { rank: 3, name: 'Keyboard Wizard', wpm: 110, accuracy: 99, tests: 180 },
        { rank: 4, name: 'Fast Fingers', wpm: 105, accuracy: 96, tests: 150 },
        { rank: 5, name: 'Quick Keys', wpm: 100, accuracy: 95, tests: 120 },
    ];

    const displayData = data || MOCK_DATA;

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-slate-400" />;
            case 3:
                return <Award className="w-6 h-6 text-orange-600" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500">{rank}</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold">Global Leaderboard</h1>
                <p className="text-indigo-100 mt-2">Top performers worldwide</p>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Rank</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">User</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">WPM</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Accuracy</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Tests</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {displayData.map((entry) => (
                                <tr key={entry.rank} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-900/10' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getRankIcon(entry.rank)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                {entry.name[0]}
                                            </div>
                                            <span className="font-medium text-slate-800 dark:text-white">{entry.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{entry.wpm}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-green-600 dark:text-green-400 font-medium">{entry.accuracy}%</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-600 dark:text-slate-400">{entry.tests}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center transition-colors">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    🚀 <strong>Coming Soon:</strong> Real-time rankings with weekly competitions!
                </p>
            </div>
        </div>
    );
};

export default Leaderboard;
