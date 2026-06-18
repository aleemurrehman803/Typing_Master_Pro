import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PlayCircle, Award } from 'lucide-react';
import LessonPractice from '../components/features/LessonPractice';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { COURSES } from '../utils/curriculum';

/**
 * CourseDetail Page Component
 * Displays course lessons with interactive typing practice.
 */
const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const [currentLesson, setCurrentLesson] = useState(null);

    // Use custom hook for persistence
    const { completedLessons, saveLessonProgress } = useLessonProgress(courseId);

    const course = COURSES[courseId];

    if (!course) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <h1 className="text-2xl font-bold text-slate-800">Course not found</h1>
                <button onClick={() => navigate('/learn')} className="mt-4 text-indigo-600 hover:text-indigo-700">
                    ← Back to Courses
                </button>
            </div>
        );
    }

    const handleLessonClick = (lesson) => {
        setCurrentLesson(lesson);
    };

    const handlePreviousLesson = () => {
        if (!currentLesson) return;
        const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex > 0) {
            setCurrentLesson(course.lessons[currentIndex - 1]);
        }
    };

    const handleCompleteLesson = (stats) => {
        if (currentLesson) {
            // Save progress using the hook
            saveLessonProgress(currentLesson.id, stats);
        }

        // Move to next lesson
        const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < course.lessons.length - 1) {
            setCurrentLesson(course.lessons[currentIndex + 1]);
        } else {
            setCurrentLesson(null);
        }
    };

    const progress = course.lessons.length > 0
        ? Math.round((completedLessons.length / course.lessons.length) * 100)
        : 0;

    const averageAccuracy = completedLessons.length > 0
        ? Math.round(completedLessons.reduce((acc, curr) => acc + curr.accuracy, 0) / completedLessons.length)
        : 0;

    const handleDownloadCertificate = () => {
        if (averageAccuracy >= 70) {
            // Navigate to certificates page with course data
            navigate('/certificates', {
                state: {
                    courseTitle: course.title,
                    accuracy: averageAccuracy,
                    completedDate: new Date().toISOString()
                }
            });
        } else {
            setShowWarning(true);
        }
    };

    return (
        <div className="max-w-6xl mx-auto relative">
            {/* Warning Dialog */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Award className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Certificate Locked</h3>
                        <p className="text-slate-600 mb-6">
                            You have completed the course, but your average accuracy is <span className="font-bold text-red-600">{averageAccuracy}%</span>.
                            You need at least <span className="font-bold text-green-600">70%</span> to qualify for the certificate.
                        </p>
                        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm text-slate-500">
                            Tip: Retake lessons with low accuracy scores to improve your average.
                        </div>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                        >
                            I'll Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/learn')}
                    className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Courses
                </button>
                <h1 className="text-3xl font-bold text-slate-800">{course.title}</h1>
                <p className="text-slate-600 mt-2">{course.description}</p>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>{completedLessons.length} of {course.lessons.length} lessons completed</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lesson List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-4">
                        <h2 className="font-bold text-slate-800 mb-4">Lessons</h2>
                        <div className="space-y-2">
                            {course.lessons.map((lesson) => {
                                const completedData = completedLessons.find(l => l.id === lesson.id);
                                const isCompleted = !!completedData;
                                const isCurrent = currentLesson?.id === lesson.id;

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => handleLessonClick(lesson)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${isCurrent
                                            ? 'bg-indigo-100 border-2 border-indigo-500'
                                            : isCompleted
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isCompleted ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <PlayCircle className={`w-5 h-5 flex-shrink-0 ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <div className={`font-medium ${isCurrent ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                        Lesson {lesson.id}
                                                    </div>
                                                    {isCompleted && (
                                                        <span className={`text-xs font-bold ${completedData.accuracy >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                                                            {completedData.accuracy}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-600 truncate">{lesson.title}</div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Lesson Content */}
                <div className="lg:col-span-2">
                    {currentLesson ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="mb-6">
                                <span className="text-sm text-indigo-600 font-medium">Lesson {currentLesson.id}</span>
                                <h2 className="text-2xl font-bold text-slate-800 mt-1">{currentLesson.title}</h2>
                                <p className="text-slate-700 mt-2">{currentLesson.content}</p>
                            </div>

                            {/* Interactive Practice */}
                            <LessonPractice
                                exerciseText={currentLesson.exercise}
                                onComplete={handleCompleteLesson}
                                onNext={() => handleCompleteLesson({ wpm: 0, accuracy: 0 })} // Fallback if next clicked without complete (should be disabled though)
                                onPrevious={handlePreviousLesson}
                                isFirstLesson={course.lessons.findIndex(l => l.id === currentLesson.id) === 0}
                                isLastLesson={course.lessons.findIndex(l => l.id === currentLesson.id) === course.lessons.length - 1}
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                            {completedLessons.length === course.lessons.length ? (
                                <>
                                    <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">🎉 Course Complete!</h3>
                                    <p className="text-slate-600 mb-2">Congratulations! You've finished all lessons.</p>
                                    <p className="text-lg font-medium text-slate-800 mb-6">
                                        Average Accuracy: <span className={averageAccuracy >= 70 ? 'text-green-600' : 'text-red-500'}>{averageAccuracy}%</span>
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                        <button
                                            onClick={handleDownloadCertificate}
                                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl font-bold shadow-lg shadow-yellow-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                                        >
                                            <Award className="w-5 h-5" />
                                            Download Certificate
                                        </button>
                                        <button
                                            onClick={() => navigate('/learn')}
                                            className="px-6 py-3 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                                        >
                                            Browse More Courses
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Select a lesson to begin</h3>
                                    <p className="text-slate-600">Click on any lesson from the list to start practicing.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
