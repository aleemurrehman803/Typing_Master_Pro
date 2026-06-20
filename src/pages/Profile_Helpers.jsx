/* eslint-disable react-refresh/only-export-components */
const StatCard = ({ icon, label, value, unit, color, progress }) => {
    const colorClasses = {
        indigo: 'from-indigo-500 to-indigo-600',
        yellow: 'from-yellow-500 to-yellow-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600'
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg shadow-indigo-100 dark:shadow-none group-hover:scale-110 transition-transform`}>{icon}</div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
                    +2.5%
                </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {value} <span className="text-lg text-slate-400 dark:text-slate-500">{unit}</span>
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
};

const QuickStat = ({ label, value, icon, color }) => {
    const bgColors = {
        blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bgColors[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
            </div>
        </div>
    );
};

const MetricRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 rounded-lg transition-colors">
        <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
        <span className="font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
);

const DetailedStatistics = ({ stats, recentTests }) => (
    <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 transition-colors">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Detailed Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Performance Metrics
                    </h4>
                    <div className="space-y-4">
                        <MetricRow label="Total Tests" value={stats.testsTaken} />
                        <MetricRow label="Average WPM" value={stats.avgWpm} />
                        <MetricRow label="Best WPM" value={stats.bestWpm} />
                        <MetricRow label="Overall Accuracy" value={`${stats.accuracy}%`} />
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Volume Statistics
                    </h4>
                    <div className="space-y-4">
                        <MetricRow label="Total Words" value={stats.totalWords?.toLocaleString() || 0} />
                        <MetricRow label="Total Errors" value={stats.totalErrors?.toLocaleString() || 0} />
                        <MetricRow label="Error Rate" value={`${stats.totalWords > 0 ? ((stats.totalErrors / stats.totalWords) * 100).toFixed(1) : 0}%`} />
                        <MetricRow label="Words Per Test" value={stats.testsTaken > 0 ? Math.round(stats.totalWords / stats.testsTaken) : 0} />
                    </div>
                </div>
            </div>
        </div>

        {recentTests.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 transition-colors">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Recent Performance</h3>
                <div className="space-y-3">
                    {recentTests.slice(0, 5).map((test, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-600">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400 font-bold border border-slate-100 dark:border-slate-600">
                                    {test.wpm}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-white">Typing Test</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(test.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                    {test.accuracy}% Accuracy
                                </span>
                                <p className="text-xs text-slate-400 mt-1">{test.errors} errors</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center transition-colors">
                <p className="text-slate-500 dark:text-slate-400">No detailed statistics available yet.</p>
            </div>
        )}
    </div>
);

const ActivityFeed = ({ recentTests }) => {
    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
        return 'Just now';
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 transition-colors">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Recent Activity
            </h3>
            {recentTests.length > 0 ? (
                <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-3 space-y-8">
                    {recentTests.map((test, index) => {
                        const timeAgo = getTimeAgo(new Date(test.date));
                        return (
                            <div key={index} className="relative pl-8">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-800 shadow-sm"></div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-600">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-slate-800 dark:text-white">
                                            Completed typing test
                                        </p>
                                        <span className="text-xs font-medium text-slate-400">{timeAgo}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                                        Achieved <span className="font-bold text-indigo-600 dark:text-indigo-400">{test.wpm} WPM</span> with {test.accuracy}% accuracy.
                                    </p>
                                    <div className="flex gap-2">
                                        {test.wpm > 60 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                                                <Zap className="w-3 h-3 mr-1" /> Fast
                                            </span>
                                        )}
                                        {test.accuracy === 100 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                <Target className="w-3 h-3 mr-1" /> Perfect
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No recent activity. Take a test to get started!</p>
                </div>
            )}
        </div>
    );
};
