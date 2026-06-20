/* eslint-disable */
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
        const shareText = `Check out my typing stats on TypeMaster! ðŸŽ¯\n\nAverage: ${stats.avgWpm} WPM\nBest: ${stats.bestWpm} WPM\nAccuracy: ${stats.accuracy}%\nTests: ${stats.testsTaken}\n\n#TypeMasterPro`;

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
                            ðŸ’¡ Go to <span className="font-bold text-indigo-600 dark:text-indigo-400">Learn</span> section to start a course!
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
