import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import {
    TrendingUp, Calendar, Target, Download, Award,
    Settings, Share2, Trophy, Clock, BarChart3,
    Zap, CheckCircle, Activity, User, Camera,
    X, Save, Bell, Volume2, Moon, Globe, Edit2,
    Upload, Trash2, AlertCircle, FileText, Search, Phone, MapPin
} from 'lucide-react';
import { BADGES } from '../utils/achievements';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { compressImage } from '../utils/imageUtils';
import COUNTRY_CODES, { POPULAR_COUNTRIES } from '../utils/countryCodes';

/**
 * Profile Page Component
 * Displays user statistics, achievements, and allows profile management.
 */

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

const Profile = () => {
    const { user, updateProfile, updateSettings } = useAuthStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isCertificateWarningOpen, setIsCertificateWarningOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    // Edit Profile State
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editFatherName, setEditFatherName] = useState('');
    const [editDateOfBirth, setEditDateOfBirth] = useState('');
    const [editCountryCode, setEditCountryCode] = useState('+1');
    const [editMobileNumber, setEditMobileNumber] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editCountry, setEditCountry] = useState('');
    const [editGender, setEditGender] = useState('');
    const [editReligion, setEditReligion] = useState('');
    const [editMaritalStatus, setEditMaritalStatus] = useState('');
    const [editOccupation, setEditOccupation] = useState('');
    const [editEmploymentStatus, setEditEmploymentStatus] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const fileInputRef = useRef(null);

    // Initialize edit state when modal opens
    const openEditModal = () => {
        setEditName(user.name);
        setEditAvatar(user.avatar || '');
        setEditFatherName(user.profile?.fatherName || '');
        setEditDateOfBirth(user.profile?.dateOfBirth || '');
        setEditCountryCode(user.profile?.countryCode || '+1');
        setEditMobileNumber(user.profile?.mobileNumber || '');
        setEditAddress(user.profile?.address || '');
        setEditCity(user.profile?.city || '');
        setEditCountry(user.profile?.country || '');
        setEditGender(user.profile?.gender || '');
        setEditReligion(user.profile?.religion || '');
        setEditMaritalStatus(user.profile?.maritalStatus || '');
        setEditOccupation(user.profile?.occupation || '');
        setEditEmploymentStatus(user.profile?.employmentStatus || '');
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        updateProfile({
            name: editName,
            avatar: editAvatar,
            profile: {
                fatherName: editFatherName,
                dateOfBirth: editDateOfBirth,
                countryCode: editCountryCode,
                mobileNumber: editMobileNumber,
                address: editAddress,
                city: editCity,
                country: editCountry,
                gender: editGender,
                religion: editReligion,
                maritalStatus: editMaritalStatus,
                occupation: editOccupation,
                employmentStatus: editEmploymentStatus
            }
        });
        setIsEditModalOpen(false);
        showNotification('Profile updated successfully!', 'success');
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Compress image to avoid localStorage quota limits
                const compressedImage = await compressImage(file, 300, 0.7);
                setEditAvatar(compressedImage);
            } catch (error) {
                console.error("Image upload failed:", error);
                showNotification('Failed to process image. Please try another.', 'error');
            }
        }
    };

    const handleRemoveAvatar = () => {
        setEditAvatar('');
    };

    // Settings State Handlers
    const toggleSetting = (key) => {
        updateSettings({ [key]: !user.settings[key] });
    };

    const changeTheme = (theme) => {
        updateSettings({ theme });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Certificate Download Logic
    const handleDownloadCertificate = () => {
        // Check if user has completed any course
        let hasQualifyingCourse = false;
        let bestAccuracy = 0;

        // Check all courses for completion
        for (let courseId = 1; courseId <= 4; courseId++) {
            const courseProgress = localStorage.getItem(`course_progress_${user.id}_${courseId}`);
            if (courseProgress) {
                const completedLessons = JSON.parse(courseProgress);
                if (completedLessons.length > 0) {
                    const avgAccuracy = Math.round(
                        completedLessons.reduce((acc, curr) => acc + curr.accuracy, 0) / completedLessons.length
                    );
                    if (avgAccuracy > bestAccuracy) {
                        bestAccuracy = avgAccuracy;
                    }
                    if (avgAccuracy >= 70) {
                        hasQualifyingCourse = true;
                    }
                }
            }
        }

        if (hasQualifyingCourse) {
            // User qualifies - navigate to certificates page
            navigate('/certificates');
        } else {
            // Show warning with user's best score
            setIsCertificateWarningOpen(true);
        }
    };

    if (!user) return null;

    const stats = user.stats || {
        testsTaken: 0,
        avgWpm: 0,
        bestWpm: 0,
        totalWords: 0,
        totalErrors: 0,
        accuracy: 100
    };

    const badges = user.badges || [];
    const earnedBadgeDetails = BADGES.filter(b => badges.includes(b.id));
    const totalBadges = BADGES.length;
    const badgeProgress = totalBadges > 0 ? Math.round((earnedBadgeDetails.length / totalBadges) * 100) : 0;

    const joinedDaysAgo = Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24));
    const testsPerDay = joinedDaysAgo > 0 ? (stats.testsTaken / joinedDaysAgo).toFixed(1) : 0;

    const recentTests = JSON.parse(localStorage.getItem('recent_tests') || '[]')
        .filter(test => test.userId === user.id)
        .slice(0, 10)
        .reverse();

    const chartData = useMemo(() => {
        return recentTests.map((test, index) => ({
            test: `#${index + 1}`,
            wpm: test.wpm,
            accuracy: test.accuracy,
            date: new Date(test.date).toLocaleDateString()
        }));
    }, [recentTests]);

    // Profile Completion Calculation
    const profileFields = [
        user.name,
        user.email,
        user.avatar,
        user.profile?.fatherName,
        user.profile?.dateOfBirth,
        user.profile?.mobileNumber,
        user.profile?.address,
        user.profile?.city,
        user.profile?.country,
        user.profile?.gender,
        user.profile?.religion,
        user.profile?.maritalStatus,
        user.profile?.occupation,
        user.profile?.employmentStatus
    ];
    const filledFields = profileFields.filter(field => field && field.trim() !== '').length;
    const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

    const level = Math.floor(stats.testsTaken / 10) + 1;
    const xpInCurrentLevel = stats.testsTaken % 10;
    const xpForNextLevel = 10;
    const levelProgress = (xpInCurrentLevel / xpForNextLevel) * 100;

    const handleShare = async () => {
        const shareText = `Check out my typing stats on TypeMaster! 🎯\n\nAverage: ${stats.avgWpm} WPM\nBest: ${stats.bestWpm} WPM\nAccuracy: ${stats.accuracy}%\nTests: ${stats.testsTaken}\n\n#TypeMasterPro`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My TypeMaster Profile',
                    text: shareText,
                    url: window.location.origin
                });
                showNotification('Shared successfully!', 'success');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    fallbackShare(shareText);
                }
            }
        } else {
            fallbackShare(shareText);
        }
    };

    const fallbackShare = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Stats copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy to clipboard.', 'error');
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'
                    }`}>
                    {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <p className="font-medium">{notification.message}</p>
                </div>
            )}

            {/* Certificate Warning Dialog */}
            {isCertificateWarningOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 text-center border border-slate-200 dark:border-slate-700">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Award className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Certificate Requirements</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            To download your certificate, you need to:
                        </p>
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6 text-left space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Complete a Course</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Finish all lessons in any course</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Achieve 70% Accuracy</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Maintain at least 70% average accuracy</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            💡 Go to <span className="font-bold text-indigo-600 dark:text-indigo-400">Learn</span> section to start a course!
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsCertificateWarningOpen(false)}
                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setIsCertificateWarningOpen(false);
                                    navigate('/learn');
                                }}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                Start Learning
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl overflow-hidden shadow-2xl">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }} />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900 rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        {/* Avatar Section */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md flex items-center justify-center text-5xl md:text-6xl font-bold text-white shadow-2xl ring-4 ring-white/20 transition-transform transform group-hover:scale-105 overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name[0].toUpperCase()
                                )}
                            </div>
                            <button
                                onClick={openEditModal}
                                className="absolute bottom-2 right-2 bg-white text-indigo-600 p-2 rounded-full shadow-lg hover:bg-indigo-50 transition-colors"
                                title="Edit Profile"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white/20">
                                Lv {level}
                            </div>
                        </div>

                        {/* User Info Section */}
                        <div className="flex-1 text-white space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{user.name}</h1>
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium border border-white/10">
                                    Pro Member
                                </span>
                            </div>
                            <p className="text-indigo-100 text-lg">{user.email}</p>
                            <p className="text-indigo-200 text-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Member since {new Date(user.joinedAt).toLocaleDateString()} • {joinedDaysAgo} days active
                            </p>

                            {/* Level Progress */}
                            <div className="max-w-md mt-6">
                                <div className="flex justify-between text-sm mb-2 font-medium">
                                    <span className="text-indigo-100">Level {level} Progress</span>
                                    <span className="text-white">{xpInCurrentLevel}/{xpForNextLevel} tests</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-white/10">
                                    <div
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                        style={{ width: `${levelProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-indigo-200 mt-2">
                                    {xpForNextLevel - xpInCurrentLevel} more tests to reach Level {level + 1}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                            <button
                                onClick={handleDownloadCertificate}
                                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-yellow-200 dark:shadow-none font-bold"
                            >
                                <Award className="w-5 h-5" />
                                <span className="hidden md:inline">Certificate</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl transition-all shadow-lg border border-white/10 font-medium"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden md:inline">Share</span>
                            </button>
                            <button
                                onClick={() => setIsSettingsModalOpen(true)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl transition-all shadow-lg border border-white/10 font-medium"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden md:inline">Settings</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Completion Banner */}
                {profileCompletion < 100 && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl border border-indigo-400/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Complete Your Profile</h3>
                                    <p className="text-indigo-100 text-sm">Unlock all features by completing your profile</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-white">{profileCompletion}%</div>
                                <div className="text-xs text-indigo-200 uppercase tracking-wider font-bold">Complete</div>
                            </div>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden mb-4">
                            <div
                                className="bg-white h-full rounded-full transition-all duration-1000 shadow-lg"
                                style={{ width: `${profileCompletion}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-indigo-100 text-sm">
                                {filledFields} of {profileFields.length} fields completed
                            </p>
                            <button
                                onClick={openEditModal}
                                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                            >
                                Update Profile
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 sticky top-20 z-10 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-800/60 transition-colors">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'statistics', label: 'Statistics', icon: TrendingUp },
                            { id: 'achievements', label: 'Achievements', icon: Trophy },
                            { id: 'activity', label: 'Activity', icon: Clock }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'animate-bounce' : ''}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div >

                {/* Content Sections */}
                < div className="animate-in fade-in slide-in-from-bottom-4 duration-500" >
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Average Speed" value={stats.avgWpm} unit="WPM" color="indigo" progress={Math.min((stats.avgWpm / 100) * 100, 100)} />
                                <StatCard icon={<Zap className="w-6 h-6" />} label="Best Speed" value={stats.bestWpm} unit="WPM" color="yellow" progress={Math.min((stats.bestWpm / 120) * 100, 100)} />
                                <StatCard icon={<Target className="w-6 h-6" />} label="Accuracy" value={stats.accuracy} unit="%" color="green" progress={stats.accuracy} />
                                <StatCard icon={<Calendar className="w-6 h-6" />} label="Tests Taken" value={stats.testsTaken} unit="tests" color="purple" progress={Math.min((stats.testsTaken / 100) * 100, 100)} />
                            </div>

                            {chartData.length > 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 transition-colors">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                            Performance Progress
                                        </h3>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            Last {chartData.length} tests
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                                                <XAxis dataKey="test" stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
                                                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} dx={-10} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                    itemStyle={{ color: '#e2e8f0' }}
                                                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                                                />
                                                <Area type="monotone" dataKey="wpm" stroke="#6366f1" strokeWidth={3} fill="url(#colorWpm)" animationDuration={1500} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center transition-colors">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BarChart3 className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Data Available</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">Complete your first typing test to see your progress chart.</p>
                                    <a href="/test" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                                        Start Typing Test
                                    </a>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <QuickStat label="Total Words Typed" value={stats.totalWords?.toLocaleString() || '0'} icon="📝" color="blue" />
                                <QuickStat label="Tests Per Day" value={testsPerDay} icon="📊" color="purple" />
                                <QuickStat label="Total Errors" value={stats.totalErrors?.toLocaleString() || '0'} icon="❌" color="red" />
                            </div>
                        </div>
                    )}

                    {
                        activeTab === 'achievements' && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-amber-100 dark:border-amber-900/30 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-200 mb-2">Achievement Unlocked</h3>
                                            <p className="text-amber-700 dark:text-amber-400 text-lg">You've earned {earnedBadgeDetails.length} out of {totalBadges} badges. Keep going!</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Completion</p>
                                                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{badgeProgress}%</p>
                                            </div>
                                            <div className="w-24 h-24 rounded-full border-8 border-amber-200 dark:border-amber-800 flex items-center justify-center bg-white dark:bg-slate-800 shadow-inner">
                                                <Trophy className="w-10 h-10 text-amber-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {BADGES.map((badge) => {
                                        const isEarned = badges.includes(badge.id);
                                        return (
                                            <div
                                                key={badge.id}
                                                className={`relative p-6 rounded-2xl border transition-all duration-300 group ${isEarned
                                                    ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/50 shadow-lg hover:shadow-xl hover:-translate-y-1'
                                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                                                    }`}
                                            >
                                                {isEarned && (
                                                    <div className="absolute top-3 right-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-full">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div className={`text-5xl mb-4 transform transition-transform group-hover:scale-110 ${isEarned ? 'grayscale-0' : 'grayscale'}`}>
                                                    {badge.icon}
                                                </div>
                                                <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-lg">{badge.name}</h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{badge.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    }

                    {activeTab === 'statistics' && <DetailedStatistics stats={stats} recentTests={recentTests} />}
                    {activeTab === 'activity' && <ActivityFeed recentTests={recentTests} />}
                </div >

                {/* Edit Profile Modal */}
                {
                    isEditModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Profile</h2>
                                    <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="flex flex-col items-center gap-4 mb-6">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400 border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden">
                                                {editAvatar ? (
                                                    <img src={editAvatar} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    user.name[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                                            >
                                                Change Photo
                                            </button>
                                            {editAvatar && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-600">|</span>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveAvatar}
                                                        className="text-sm text-red-500 font-medium hover:text-red-600"
                                                    >
                                                        Remove
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition-all"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Father Name</label>
                                            <input type="text" value={editFatherName} onChange={(e) => setEditFatherName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                                            <input type="date" value={editDateOfBirth} onChange={(e) => setEditDateOfBirth(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number</label>
                                            <input type="text" value={editMobileNumber} onChange={(e) => setEditMobileNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                                            <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                                            <input type="text" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                                            <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Marital Status</label>
                                            <select value={editMaritalStatus} onChange={(e) => setEditMaritalStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                                <option value="">Select Status</option>
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                                <option value="Divorced">Divorced</option>
                                                <option value="Widowed">Widowed</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Occupation</label>
                                            <input type="text" value={editOccupation} onChange={(e) => setEditOccupation(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Religion</label>
                                            <input type="text" value={editReligion} onChange={(e) => setEditReligion(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employment Status</label>
                                            <input type="text" value={editEmploymentStatus} onChange={(e) => setEditEmploymentStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Settings Modal */}
                {
                    isSettingsModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h2>
                                    <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Theme Setting */}
                                    <div className="space-y-3">
                                        < h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appearance</h3>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                                    <Moon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Switch to dark theme</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={user.settings?.theme === 'dark'}
                                                    onChange={() => changeTheme(user.settings?.theme === 'dark' ? 'light' : 'dark')}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Preferences */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preferences</h3>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                                    <Volume2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">Sound Effects</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Typing sounds</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={user.settings?.soundEnabled}
                                                    onChange={() => toggleSetting('soundEnabled')}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                                                    <Bell className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">Notifications</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Achievement alerts</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={user.settings?.notifications}
                                                    onChange={() => toggleSetting('notifications')}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsSettingsModalOpen(false)}
                                        className="w-full py-3 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-medium hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
            );
};

export default Profile;
