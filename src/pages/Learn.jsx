import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import LessonTabs from '../components/features/LessonTabs';
import LessonItem from '../components/features/LessonItem';
import SEOHead from '../components/SEOHead';
import { LESSONS_DATA } from '../utils/lessons';
import { BookOpen, Trophy, Target, Brain, Sparkles } from 'lucide-react';
import { generateAdaptiveLesson } from '../utils/tutor';

/**
 * Learn Page Component
 * Displays detailed lesson structure with progress tracking.
 */
const Learn = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('beginner');

    // Lesson Data Structure
    const lessonsData = LESSONS_DATA;

    const handleStartLesson = (lessonId) => {
        // Navigate to the typing test with specific lesson config
        // For now, we'll just go to the test page with a query param
        navigate(`/test?lesson=${lessonId}`);
    };

    // Calculate progress for the current tab
    const currentLessons = lessonsData[activeTab];
    const completedCount = currentLessons.reduce((acc, lesson) => {
        return acc + (user?.lessons?.[lesson.id]?.completed ? 1 : 0);
    }, 0);
    const progressPercentage = Math.round((completedCount / currentLessons.length) * 100);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <SEOHead
                title="Typing Lessons - TypeMaster Pro"
                description="Structured typing lessons from beginner to advanced levels. Track your progress and earn stars."
            />

            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Typing Lessons</h1>
                        <p className="text-indigo-100 text-lg">Master touch typing with our structured curriculum.</p>
                    </div>
                    <div className="hidden md:block bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <div className="text-center">
                            <p className="text-sm text-indigo-200 uppercase tracking-wider font-semibold">Current Level</p>
                            <p className="text-2xl font-bold capitalize">{activeTab}</p>
                        </div>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Lessons List */}
                <div className="lg:col-span-2 space-y-6">
                    <LessonTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Lessons
                            </h2>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {completedCount}/{currentLessons.length} Completed
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 w-full">
                            <div
                                className="h-full bg-green-500 transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <div className="p-6 space-y-4">
                            {currentLessons.map((lesson, index) => {
                                const userLesson = user?.lessons?.[lesson.id];
                                // Lock logic: First lesson is unlocked. Subsequent lessons locked until previous is completed.
                                // For now, we'll keep all unlocked for better UX in testing, or implement simple locking.
                                // Let's implement simple locking:
                                const isLocked = index > 0 && !user?.lessons?.[currentLessons[index - 1].id]?.completed;

                                return (
                                    <LessonItem
                                        key={lesson.id}
                                        title={lesson.title}
                                        stars={userLesson?.stars || 0}
                                        completed={userLesson?.completed || false}
                                        locked={isLocked}
                                        onStart={() => handleStartLesson(lesson.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Info */}
                <div className="space-y-6">
                    {/* Feature 1: AI Master - Weak Keys Adaptive Drill */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Brain className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">AI Adaptive Learning</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 block">
                            Our AI analyzes your typing patterns. Practice a custom lesson built specifically for your weakest keys.
                        </p>
                        <button 
                            onClick={() => {
                                const adaptiveText = generateAdaptiveLesson();
                                if (adaptiveText) {
                                    // Custom route state passing so Test.jsx knows it's an AI Adaptive drill
                                    navigate('/test', { state: { adaptiveText, customTitle: 'AI Weak Keys Drill' } });
                                } else {
                                    alert('Keep practicing! Complete more standard lessons so the AI can learn your weak keys.');
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-colors font-medium text-sm shadow-md shadow-indigo-200 dark:shadow-none"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate Custom Drill
                        </button>
                    </div>
                    {/* Daily Goal Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Daily Goal</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">Time Spent</span>
                                    <span className="font-medium text-slate-900 dark:text-white">12 / 15 min</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[80%] rounded-full"></div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Practice 3 more minutes to reach your daily goal!
                            </p>
                        </div>
                    </div>

                    {/* Level Stats */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Level Progress</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl transition-colors">
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{completedCount}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lessons</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl transition-colors">
                                <p className="text-2xl font-bold text-yellow-500">
                                    {Number(currentLessons.reduce((acc, l) => {
                                        const s = user?.lessons?.[l.id]?.stars;
                                        return acc + (typeof s === 'number' ? s : 0);
                                    }, 0))}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Stars</p>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default Learn;
