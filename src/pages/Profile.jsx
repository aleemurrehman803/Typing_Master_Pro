import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import {
    TrendingUp, Calendar, Target, Download, Award,
    Settings, Share2, Trophy, Clock, BarChart3,
    Zap, CheckCircle, Activity, User, Camera,
    X, Save, Bell, Volume2, Moon, Globe, Edit2,
    Upload, Trash2, AlertCircle, FileText, Search, Phone, MapPin,
    Lock, LogOut, Briefcase, User2, Mail, Hash, Heart
} from 'lucide-react';
import { BADGES } from '../utils/achievements';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { compressImage } from '../utils/imageUtils';
import ProfileProgressIndicator from '../components/features/ProfileProgressIndicator';

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

const DetailItem = ({ label, value, icon: Icon, color }) => (
    <div className="flex items-center gap-4 group">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">{label}</p>
            <p className="font-bold text-slate-900 dark:text-white">{value || 'Not specified'}</p>
        </div>
    </div>
);

const DetailedProfileDashboard = ({ user, profileCompletion, filledFields, openEditModal, handleLogout }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Left Column: Personal & Additional Info */}
        <div className="lg:col-span-2 space-y-6">
            {/* Header Card (From Screenshot 2) */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-4 ring-white/20">
                        {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="text-white">
                        <h2 className="text-3xl font-black tracking-tight mb-1">{user.name}</h2>
                        <p className="text-indigo-100 font-medium mb-2 opacity-90">@{user.email?.split('@')[0] || user.name.toLowerCase().replace(/ /g, '')}</p>
                        <p className="text-indigo-100/70 text-sm font-medium">{user.email}</p>
                    </div>
                </div>
                <div className="absolute top-8 right-8">
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-white/70" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">N/A</span>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                        <User2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <DetailItem label="Gender" value={user.profile?.gender} icon={User} color="bg-purple-100 text-purple-600 dark:bg-purple-900/40" />
                    <DetailItem label="Date of Birth" value={user.profile?.dateOfBirth} icon={Calendar} color="bg-green-100 text-green-600 dark:bg-green-900/40" />
                    <DetailItem label="Country" value={user.profile?.country} icon={Globe} color="bg-blue-100 text-blue-600 dark:bg-blue-900/40" />
                    <DetailItem label="City" value={user.profile?.city} icon={MapPin} color="bg-orange-100 text-orange-600 dark:bg-orange-900/40" />
                </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Additional Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <DetailItem label="Religion" value={user.profile?.religion} icon={Globe} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40" />
                    <DetailItem label="Marital Status" value={user.profile?.maritalStatus} icon={Heart} color="bg-pink-100 text-pink-600 dark:bg-pink-900/40" />
                    <DetailItem label="Occupation" value={user.profile?.occupation} icon={Briefcase} color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40" />
                    <DetailItem label="Mobile" value={user.profile?.mobileNumber} icon={Phone} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40" />
                    <DetailItem label="Employment Status" value={user.profile?.employmentStatus} icon={Briefcase} color="bg-teal-100 text-teal-600 dark:bg-teal-900/40" />
                </div>
            </div>
        </div>

        {/* Right Column: Cards */}
        <div className="space-y-6">
            {/* Profile Completion Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h4 className="font-bold text-slate-800 dark:text-white">Profile Completion</h4>
                </div>
                <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{profileCompletion}% Complete</p>
                    <p className="text-xs text-slate-400">{filledFields}/14</p>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 text-center font-medium italic">Complete your profile to unlock all features!</p>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6 font-bold text-slate-800 dark:text-white">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    <h4>Quick Stats</h4>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Member Since</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Last Updated</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">Just now</span>
                    </div>
                </div>
            </div>

            {/* Account Actions Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6 font-bold text-slate-800 dark:text-white">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <h4>Account Actions</h4>
                </div>
                <div className="space-y-3">
                    <button onClick={openEditModal} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
                        <Edit2 className="w-4 h-4" /> Update Profile
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                        <Lock className="w-4 h-4" /> Change Password
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 dark:shadow-none hover:bg-red-700 transition-all">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const Profile = () => {
    const { user, updateProfile, updateSettings, logout } = useAuthStore();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const [activeTab, setActiveTab] = useState(user.stats?.testsTaken === 0 ? 'detailed' : 'overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isCertificateWarningOpen, setIsCertificateWarningOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    // Edit Profile State
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editFatherName, setEditFatherName] = useState('');
    const [editDateOfBirth, setEditDateOfBirth] = useState('');
    const [editMobileNumber, setEditMobileNumber] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editCountry, setEditCountry] = useState('');
    const [editGender, setEditGender] = useState('');
    const [editMaritalStatus, setEditMaritalStatus] = useState('');
    const [editOccupation, setEditOccupation] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editReligion, setEditReligion] = useState('');
    const [editEmploymentStatus, setEditEmploymentStatus] = useState('');
    const [editCountryCode, setEditCountryCode] = useState('+1');
    const fileInputRef = useRef(null);

    // Initialize edit state when modal opens
    const openEditModal = () => {
        setEditName(user.name);
        setEditAvatar(user.avatar || '');
        setEditFatherName(user.profile?.fatherName || '');
        setEditDateOfBirth(user.profile?.dateOfBirth || '');
        setEditMobileNumber(user.profile?.mobileNumber || '');
        setEditCity(user.profile?.city || '');
        setEditCountry(user.profile?.country || '');
        setEditGender(user.profile?.gender || '');
        setEditMaritalStatus(user.profile?.maritalStatus || '');
        setEditOccupation(user.profile?.occupation || '');
        setEditCountryCode(user.profile?.countryCode || '+1');
        setEditAddress(user.profile?.address || '');
        setEditReligion(user.profile?.religion || '');
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
                mobileNumber: editMobileNumber,
                city: editCity,
                country: editCountry,
                gender: editGender,
                maritalStatus: editMaritalStatus,
                occupation: editOccupation,
                countryCode: editCountryCode,
                address: editAddress,
                religion: editReligion,
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
                const compressedImage = await compressImage(file, 300, 0.7);
                setEditAvatar(compressedImage);
            } catch (error) {
                console.error("Image upload failed:", error);
                showNotification('Failed to process image.', 'error');
            }
        }
    };

    const handleRemoveAvatar = () => {
        setEditAvatar('');
    };

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

    const handleDownloadCertificate = () => {
        let hasQualifyingCourse = false;
        let bestAccuracy = 0;

        for (let courseId = 1; courseId <= 4; courseId++) {
            const courseProgress = localStorage.getItem(`course_progress_${user.id}_${courseId}`);
            if (courseProgress) {
                const completedLessons = JSON.parse(courseProgress);
                if (completedLessons.length > 0) {
                    const avgAccuracy = Math.round(
                        completedLessons.reduce((acc, curr) => acc + curr.accuracy, 0) / completedLessons.length
                    );
                    if (avgAccuracy > bestAccuracy) bestAccuracy = avgAccuracy;
                    if (avgAccuracy >= 70) hasQualifyingCourse = true;
                }
            }
        }

        if (hasQualifyingCourse) {
            navigate('/certificates');
        } else {
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

    const profileFields = [
        user.name, user.email, user.avatar, user.profile?.fatherName, user.profile?.dateOfBirth,
        user.profile?.mobileNumber, user.profile?.city, user.profile?.country, user.profile?.gender,
        user.profile?.maritalStatus, user.profile?.occupation, user.profile?.religion, user.profile?.employmentStatus
    ];
    const filledFields = profileFields.filter(f => f && f.toString().trim() !== '').length;
    const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

    const level = Math.floor(stats.testsTaken / 10) + 1;
    const xpInCurrentLevel = stats.testsTaken % 10;
    const xpForNextLevel = 10;
    const levelProgress = (xpInCurrentLevel / xpForNextLevel) * 100;

    const handleShare = async () => {
        const shareText = `Check out my typing stats on TypeMaster! Average: ${stats.avgWpm} WPM, Best: ${stats.bestWpm} WPM.`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'My TypeMaster Profile', text: shareText, url: window.location.origin });
                showNotification('Shared successfully!');
            } catch (e) { if (e.name !== 'AbortError') copyToClipboard(shareText); }
        } else copyToClipboard(shareText);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => showNotification('Stats copied to clipboard!'))
            .catch(() => showNotification('Failed to copy.', 'error'));
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 relative">
            {notification && (
                <div className={`fixed top-24 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
                    {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <p className="font-medium">{notification.message}</p>
                </div>
            )}

            {isCertificateWarningOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 text-center border border-slate-200 dark:border-slate-700">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Award className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Certificate Requirements</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">Complete any course with average 70% accuracy.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsCertificateWarningOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-medium">Close</button>
                            <button onClick={() => { setIsCertificateWarningOpen(false); navigate('/learn'); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200">Start Learning</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl overflow-hidden shadow-2xl p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl md:text-6xl font-bold text-white shadow-2xl ring-4 ring-white/20 overflow-hidden">
                            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                        </div>
                        <button onClick={openEditModal} className="absolute bottom-2 right-2 bg-white text-indigo-600 p-2 rounded-full shadow-lg hover:bg-indigo-50"><Edit2 className="w-5 h-5" /></button>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">Lv {level}</div>
                    </div>

                    <div className="flex-1 text-white space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{user.name}</h1>
                        <p className="text-indigo-100 text-lg">{user.email}</p>
                        <p className="text-indigo-200 text-sm flex items-center gap-2"><Calendar className="w-4 h-4" /> Member since {new Date(user.joinedAt).toLocaleDateString()}</p>

                        <div className="max-w-md mt-6">
                            <div className="flex justify-between text-sm mb-2 font-medium">
                                <span className="text-indigo-100">Level {level} Progress</span>
                                <span className="text-white">{xpInCurrentLevel}/{xpForNextLevel} tests</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-3 border border-white/10 overflow-hidden">
                                <div className="bg-yellow-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${levelProgress}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button onClick={handleDownloadCertificate} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-yellow-200"><Award className="w-5 h-5" />Certificate</button>
                        <button onClick={handleShare} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/10"><Share2 className="w-4 h-4" />Share</button>
                        <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/10"><Settings className="w-4 h-4" />Settings</button>
                    </div>
                </div>
            </div>

            {profileCompletion < 100 && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl border border-indigo-400/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white"><User className="w-6 h-6" /></div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Complete My Profile</h3>
                                <p className="text-indigo-100 text-sm">Unlock all features by completing your profile</p>
                            </div>
                        </div>
                        <div className="text-right text-white">
                            <div className="text-3xl font-black">{profileCompletion}%</div>
                            <div className="text-xs uppercase tracking-wider font-bold">Complete</div>
                        </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden mb-4">
                        <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-indigo-100 text-sm">{filledFields} of {profileFields.length} fields completed</p>
                        <button onClick={() => setActiveTab('detailed')} className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold">Update Profile</button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 sticky top-20 z-10">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'detailed', label: 'My Details', icon: User2 },
                        { id: 'statistics', label: 'Statistics', icon: TrendingUp },
                        { id: 'achievements', label: 'Achievements', icon: Trophy },
                        { id: 'activity', label: 'Activity', icon: Clock }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                <Icon className="w-4 h-4" />{tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Avg Speed" value={stats.avgWpm} unit="WPM" color="indigo" progress={Math.min(stats.avgWpm, 100)} />
                            <StatCard icon={<Zap className="w-6 h-6" />} label="Best Speed" value={stats.bestWpm} unit="WPM" color="yellow" progress={Math.min(stats.bestWpm, 120)} />
                            <StatCard icon={<Target className="w-6 h-6" />} label="Accuracy" value={stats.accuracy} unit="%" color="green" progress={stats.accuracy} />
                            <StatCard icon={<Calendar className="w-6 h-6" />} label="Tests" value={stats.testsTaken} unit="total" color="purple" progress={Math.min(stats.testsTaken, 100)} />
                        </div>

                        {chartData.length > 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Performance Progress</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                            <XAxis dataKey="test" stroke="#94a3b8" tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }} />
                                            <Area type="monotone" dataKey="wpm" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
                                <p className="text-slate-500">Complete a test to see your progress!</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <QuickStat label="Words Typed" value={stats.totalWords?.toLocaleString() || '0'} icon="📝" color="blue" />
                            <QuickStat label="Tests/Day" value={testsPerDay} icon="📊" color="purple" />
                            <QuickStat label="Errors" value={stats.totalErrors?.toLocaleString() || '0'} icon="❌" color="red" />
                        </div>
                    </div>
                )}

                {activeTab === 'detailed' && (
                    <DetailedProfileDashboard
                        user={user}
                        profileCompletion={profileCompletion}
                        filledFields={filledFields}
                        openEditModal={openEditModal}
                        handleLogout={handleLogout}
                    />
                )}

                {activeTab === 'achievements' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 rounded-2xl p-8 border border-amber-100 select-none">
                            <div className="flex items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-200">Achievements</h3>
                                    <p className="text-amber-700 dark:text-amber-400">Earned {earnedBadgeDetails.length} out of {totalBadges} badges.</p>
                                </div>
                                <div className="text-4xl font-bold text-amber-600">{badgeProgress}%</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {BADGES.map((badge) => {
                                const isEarned = badges.includes(badge.id);
                                return (
                                    <div key={badge.id} className={`p-6 rounded-2xl border transition-all ${isEarned ? 'bg-white dark:bg-slate-800 border-amber-200 shadow-lg' : 'bg-slate-50 dark:bg-slate-800/50 opacity-60'}`}>
                                        <div className="text-5xl mb-4">{badge.icon}</div>
                                        <h4 className="font-bold text-slate-800 dark:text-white mb-2">{badge.name}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{badge.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'statistics' && <DetailedStatistics stats={stats} recentTests={recentTests} />}
                {activeTab === 'activity' && <ActivityFeed recentTests={recentTests} />}
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Profile</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 p-1"><X className="w-6 h-6" /></button>
                        </div>

                        {/* 🎯 Profile Completion Progress Indicator */}
                        <ProfileProgressIndicator
                            currentStep={profileCompletion < 33 ? 1 : profileCompletion < 66 ? 2 : 3}
                            completionPercentage={profileCompletion}
                        />

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="flex flex-col items-center gap-4 mb-4">
                                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 overflow-hidden ring-4 ring-white shadow-lg">
                                    {editAvatar ? <img src={editAvatar} alt="Preview" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                <div className="flex gap-2 text-sm font-medium">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-indigo-600">Change Photo</button>
                                    {editAvatar && <button type="button" onClick={handleRemoveAvatar} className="text-red-500">Remove</button>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name</label>
                                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Father Name</label>
                                        <input type="text" value={editFatherName} onChange={(e) => setEditFatherName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">DOB</label>
                                        <input type="date" value={editDateOfBirth} onChange={(e) => setEditDateOfBirth(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mobile</label>
                                        <input type="text" value={editMobileNumber} onChange={(e) => setEditMobileNumber(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">City</label>
                                        <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                                        <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" required>
                                            <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                                        <select value={editMaritalStatus} onChange={(e) => setEditMaritalStatus(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" required>
                                            <option value="">Select</option><option value="Single">Single</option><option value="Married">Married</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Occupation</label>
                                    <input type="text" value={editOccupation} onChange={(e) => setEditOccupation(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Employer Status</label>
                                    <input type="text" value={editEmploymentStatus} onChange={(e) => setEditEmploymentStatus(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Address</label>
                                    <textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-900 dark:text-white" rows="2" required />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isSettingsModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Settings</h2>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Moon className="w-5 h-5 text-indigo-600" />
                                    <div><p className="font-bold text-sm">Dark Mode</p></div>
                                </div>
                                <input type="checkbox" checked={user.settings?.theme === 'dark'} onChange={() => changeTheme(user.settings?.theme === 'dark' ? 'light' : 'dark')} />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Volume2 className="w-5 h-5 text-green-600" />
                                    <div><p className="font-bold text-sm">Sound</p></div>
                                </div>
                                <input type="checkbox" checked={user.settings?.soundEnabled} onChange={() => toggleSetting('soundEnabled')} />
                            </div>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
