import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import {
    TrendingUp, Calendar, Target, Download, Award,
    Settings, Share2, Trophy, Clock, BarChart3,
    Zap, CheckCircle, Activity, User, Camera,
    X, Save, Bell, Volume2, Moon, Globe, Edit2,
    Upload, Trash2, AlertCircle, FileText, Search, Phone, MapPin,
    BadgeDollarSign, Copy, Check, Facebook, Linkedin, Coins, Sparkles,
    Banknote, DollarSign
} from 'lucide-react';
import { BADGES } from '../utils/achievements';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { compressImage } from '../utils/imageUtils';
import COUNTRY_CODES, { POPULAR_COUNTRIES } from '../utils/countryCodes';

// Static Chart Configurations
const ChartTooltipStyle = {
    backgroundColor: '#1e293b',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
};

const ChartGradientDefs = () => (
    <defs>
        <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
    </defs>
);

/**
 * Dashboard Component
 * Displays user statistics, achievements, and allows profile management.
 */
const Dashboard = () => {
    // ... existing state definitions ...
    const { user, updateProfile, updateSettings } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isCertificateWarningOpen, setIsCertificateWarningOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
    const fileInputRef = useRef(null);

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
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');

    // Handle automated scroll to referral section
    useEffect(() => {
        if (location.state?.scrollToReferral) {
            const timer = setTimeout(() => {
                const element = document.getElementById('referral-section');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Clear state to prevent re-scroll on refresh
                    window.history.replaceState({}, document.title);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [location]);

    const { addReferralCoins } = useAuthStore();

    const handleCopyLink = () => {
        const referralLink = `https://typemasterpro.com/register?ref=${user.id}`;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showNotification('Referral link copied to clipboard!', 'success');
    };

    const handleSocialReferral = (platform) => {
        setIsSharing(true);
        const referralLink = `https://typemasterpro.com/register?ref=${user.id}`;
        const message = "🎯 Master your typing speed with TypeMaster Pro! Use my link to join and earn rewards: ";

        let url = '';
        switch (platform) {
            case 'whatsapp': url = `https://wa.me/?text=${encodeURIComponent(message + referralLink)}`; break;
            case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`; break;
            case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`; break;
            case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`; break;
            default: break;
        }

        if (url) {
            window.open(url, '_blank', 'width=600,height=400');

            // Daily Sharing Bonus Logic (10 shares in 24h = 50 coins)
            const shareData = JSON.parse(localStorage.getItem(`shares_${user.id}`) || '{"count": 0, "lastReset": 0, "bonusClaimed": false}');
            const now = Date.now();
            const ONE_DAY = 24 * 60 * 60 * 1000;

            if (now - shareData.lastReset > ONE_DAY) {
                shareData.count = 1;
                shareData.lastReset = now;
                shareData.bonusClaimed = false;
            } else {
                shareData.count += 1;
            }

            if (shareData.count >= 10 && !shareData.bonusClaimed) {
                addReferralCoins(50);
                shareData.bonusClaimed = true;
                showNotification('🔥 Daily Goal Reached! 50 Bonus Coins Added!', 'success');
            } else {
                showNotification('Referral link shared! Reach 10 shares for a bonus.', 'info');
            }

            localStorage.setItem(`shares_${user.id}`, JSON.stringify(shareData));
            setTimeout(() => setIsSharing(false), 1000);
        }
    };

    const handleCashoutSubmit = (e) => {
        e.preventDefault();
        if ((user.referralCoins || 0) < 1000) {
            showNotification('Minimum 1,000 coins required to cash out.', 'error');
            return;
        }

        // Simulation of processing
        showNotification('Cashout request submitted! Processing takes 3-5 business days.', 'success');
        setIsCashoutModalOpen(false);

        // In a real app, we would deduct coins here and hit an API.
    };

    // Initialize edit state when modal opens
    const openEditModal = useCallback(() => {
        setEditName(user.name);
        setEditAvatar(user.avatar || '');
        setEditFatherName(user.profile?.fatherName || '');
        setEditDateOfBirth(user.profile?.dateOfBirth || '');
        setEditCountryCode(user.profile?.countryCode || '+1');
        setEditMobileNumber(user.profile?.mobileNumber || '');
        setEditAddress(user.profile?.address || '');
        setEditCity(user.profile?.city || '');
        setEditCountry(user.profile?.country || '');
        setIsEditModalOpen(true);
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({
                name: editName,
                avatar: editAvatar,
                profile: {
                    fatherName: editFatherName,
                    dateOfBirth: editDateOfBirth,
                    countryCode: editCountryCode,
                    mobileNumber: editMobileNumber,
                    address: editAddress,
                    city: editCity,
                    country: editCountry
                }
            });
            setIsEditModalOpen(false);
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            showNotification('Failed to update profile.', 'error');
        }
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

    const fallbackShare = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Stats copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy to clipboard.', 'error');
        });
    };

    // Certificate Download Logic
    // Certificate Download Logic
    const handleDownloadCertificate = useCallback(() => {
        // Check recent tests for qualification
        const recentTests = JSON.parse(localStorage.getItem('recent_tests') || '[]')
            .filter(test => test.userId === user.id);

        const hasQualifyingTest = recentTests.some(test => test.accuracy >= 70 && test.wpm > 0);

        if (hasQualifyingTest) {
            // User qualifies - navigate to certificates page
            navigate('/certificates');
        } else {
            // Show warning with user's best score
            setIsCertificateWarningOpen(true);
        }
    }, [user, navigate]);

    if (!user) return null;

    const stats = user.stats || {
        testsTaken: 0,
        avgWpm: 0,
        bestWpm: 0,
        totalWords: 0,
        totalErrors: 0,
        accuracy: 0
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

    const level = Math.floor(stats.testsTaken / 10) + 1;
    const xpInCurrentLevel = stats.testsTaken % 10;
    const xpForNextLevel = 10;
    const levelProgress = (xpInCurrentLevel / xpForNextLevel) * 100;
    const handleShare = useCallback(async () => {
        if (!user.stats) return;
        const stats = user.stats;
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
    }, [user.stats]);

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
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Achieve 70% Accuracy</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Score 70% or higher in any test</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Complete a Typing Test</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Pass a standard typing test with distinction</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">Complete Profile Details</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Add father's name and contact info</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            💡 Go to <span className="font-bold text-indigo-600 dark:text-indigo-400">Test</span> section to show your skills!
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
                                    navigate('/test');
                                }}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                Start Test
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

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
                        <div className="flex-1 text-white space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{user.name}</h1>
                                <p className="text-indigo-100/80 text-lg font-medium">{user.email}</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-100/60">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Active for {joinedDaysAgo} days
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/5">
                                    <Target className="w-3.5 h-3.5" />
                                    Lv {level} Elite
                                </span>
                            </div>

                            {/* Level Progress */}
                            <div className="max-w-md bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-inner">
                                <div className="flex justify-between text-xs mb-2.5 font-bold uppercase tracking-widest text-indigo-100/70">
                                    <span>Rank Progress</span>
                                    <span>{xpInCurrentLevel} / {xpForNextLevel} Tests</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(251,191,36,0.5)] relative"
                                        style={{ width: `${levelProgress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-indigo-200/50 mt-2.5 font-semibold uppercase tracking-wider">
                                    Complete {xpForNextLevel - xpInCurrentLevel} more tests to reach Level {level + 1}
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
            </div>

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
            </div>

            {/* Content Sections */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                        {/* Community & Rankings Section (Moved from Navbar) */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-800/80 dark:to-slate-800/50 rounded-2xl p-6 border border-indigo-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-xl shadow-md flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Global Leaderboard</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Compete with typists worldwide and see where you rank!</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/leaderboard')}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                            >
                                View Rankings
                            </button>
                        </div>

                        {/* Refer to Earn Section - REFINED PREMIUM EDITION */}
                        <div id="referral-section" className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group border border-indigo-500/20">
                            {/* Animated Background Decor */}
                            <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-12 -translate-y-12 group-hover:translate-x-6 group-hover:-translate-y-6 transition-all duration-1000">
                                <BadgeDollarSign className="w-96 h-96" />
                            </div>
                            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>

                            <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                                <div className="text-center lg:text-left space-y-6 max-w-xl">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Exclusive Rewards
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight bg-gradient-to-br from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                                        Help Others <br />Master Typing.
                                    </h2>
                                    <p className="text-indigo-100/60 text-lg font-medium max-w-md leading-relaxed">
                                        Earn <span className="text-indigo-400 font-black">10 coins</span> for every friend who joins. Use coins for premium themes or cash out!
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 transition-all">
                                            <p className="text-indigo-300/50 text-[10px] font-black uppercase tracking-widest mb-2">My Balance</p>
                                            <div className="flex items-center gap-2.5">
                                                <Coins className="w-5 h-5 text-yellow-500" />
                                                <span className="text-3xl font-black tabular-nums">{user.referralCoins || 0}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 transition-all">
                                            <p className="text-indigo-300/50 text-[10px] font-black uppercase tracking-widest mb-2">Total Referrals</p>
                                            <div className="flex items-center gap-2.5">
                                                <User className="w-5 h-5 text-indigo-400" />
                                                <span className="text-3xl font-black tabular-nums">{user.referralCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsCashoutModalOpen(true)}
                                        disabled={(user.referralCoins || 0) < 1000}
                                        className="w-full mt-2 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
                                    >
                                        <Banknote className="w-5 h-5" />
                                        Cash Out
                                    </button>
                                </div>

                                <div className="w-full lg:w-[420px] space-y-6">
                                    <div className="bg-black/20 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300/60 ml-1">Your Invite Link</label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={`typemasterpro.com/reg?ref=${user.id}`}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-sm font-mono text-indigo-50 focus:outline-none"
                                                />
                                                <button
                                                    onClick={handleCopyLink}
                                                    className="absolute right-1.5 p-2 bg-indigo-500 text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            <div className="pt-4 space-y-4">
                                                <p className="text-[10px] text-center font-bold uppercase tracking-widest text-indigo-300/40">Quick Share</p>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {[
                                                        { p: 'whatsapp', c: '#25D366', i: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' },
                                                        { p: 'twitter', c: '#ffffff', i: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z' },
                                                        { p: 'facebook', c: '#1877F2', i: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                                                        { p: 'linkedin', c: '#0A66C2', i: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z' }
                                                    ].map((social) => (
                                                        <button
                                                            key={social.p}
                                                            onClick={() => handleSocialReferral(social.p)}
                                                            className="aspect-square flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all group/btn"
                                                        >
                                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" style={{ color: isSharing ? '#64748b' : social.c }}>
                                                                <path d={social.i} />
                                                            </svg>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-600/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <p className="text-xs font-bold leading-tight">
                                                Share daily to earn <span className="text-yellow-400">50 bonus coins</span>!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'achievements' && (
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
                )}

                {activeTab === 'statistics' && <DetailedStatistics stats={stats} recentTests={recentTests} />}
                {activeTab === 'activity' && <ActivityFeed recentTests={recentTests} />}
            </div>

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
            {/* Cashout Modal - ULTRA PREMIUM (Section 13) */}
            {
                isCashoutModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-600 relative flex flex-col items-center justify-center text-white overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                                    <BadgeDollarSign className="absolute -bottom-10 -right-10 w-48 h-48 rotate-12" />
                                </div>
                                <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md border border-white/30 mb-3 shadow-2xl">
                                    <Banknote className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-widest">Withdraw Funds</h2>
                                <p className="text-emerald-50 font-medium opacity-80">Convert your referral coins to cash</p>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Available Coins</p>
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-5 h-5 text-yellow-500" />
                                            <span className="text-2xl font-black text-slate-800 dark:text-white">{user.referralCoins || 0}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Estimated Value</p>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-emerald-500" />
                                            <span className="text-2xl font-black text-slate-800 dark:text-white">${((user.referralCoins || 0) / 100).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Withdrawal Form */}
                                <form onSubmit={handleCashoutSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-sm font-black uppercase tracking-widest text-slate-500 pl-1">Select Payment Method</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['PayPal', 'Bank', 'Crypto'].map(method => (
                                                <button
                                                    key={method}
                                                    type="button"
                                                    className="py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all focus:bg-emerald-50 dark:focus:bg-emerald-900/20"
                                                >
                                                    {method}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-black uppercase tracking-widest text-slate-500 pl-1">Payment ID / Email</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. paypal@example.com"
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 selection:bg-emerald-200 transition-all"
                                        />
                                    </div>

                                    <div className="pt-2 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsCashoutModalOpen(false)}
                                            className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                                            disabled={(user.referralCoins || 0) < 1000}
                                        >
                                            Confirm Cashout
                                        </button>
                                    </div>
                                </form>

                                {(user.referralCoins || 0) < 1000 && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600" />
                                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                            You need at least 1,000 coins to initiate a withdrawal. Keep sharing to reach the goal!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const StatCard = ({ icon, label, value, unit, color, progress }) => {
    const colorClasses = {
        indigo: 'from-indigo-500 to-indigo-600',
        yellow: 'from-yellow-500 to-yellow-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600'
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50 p-7 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative">
            {/* Background Glow */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br ${colorClasses[color]}`} />
            
            <div className="flex justify-between items-start mb-6">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {React.cloneElement(icon, { className: 'w-6 h-6' })}
                </div>
            </div>
            
            <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                        {value}
                    </span>
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{unit}</span>
                </div>
            </div>

            <div className="mt-8">
                <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-1.5 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)]`} 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
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

const MetricRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 rounded-lg transition-colors">
        <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
        <span className="font-bold text-slate-900 dark:text-white">{value}</span>
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

export default Dashboard;
