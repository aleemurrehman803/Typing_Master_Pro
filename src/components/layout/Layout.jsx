// Layout wrapper component for TypeMaster Pro
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { AnimatePresence } from 'framer-motion';

import {
    Keyboard,
    LayoutDashboard,
    User,
    LogOut,
    Menu,
    X,
    Trophy,
    GraduationCap,
    Bell,
    Search,
    Moon,
    Sun,
    ChevronDown,
    Settings,
    CreditCard,
    HelpCircle,
    Target,
    Zap,
    Clock,
    Volume2,
    Gamepad2,
    Heart,
    Swords,
    Coins,
    Terminal,
    ChevronRight,
    ChevronLeft,
    MessageSquare
} from 'lucide-react';
import _packageJson from '../../../package.json';
import { secureStorage as _secureStorage } from '../../utils/security';
import { isFeatureEnabled as _isFeatureEnabled } from '../../utils/featureFlags';
import { getLevelBadge } from '../../utils/levelSystem';
import CommandPalette from './CommandPalette';
import ReferralModal from './ReferralModal';
import { StripeDepositModal } from '../arena/StripeDepositModal';


/**
 * Enhanced Layout Component
 * Provides responsive application shell with mobile menu and modern navbar
 */
const Layout = ({ children }) => {
    const { user, logout, updateSettings, currentLevel } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Desktop sidebar collapse state persisted in localStorage
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('tm_sidebar_collapsed') === 'true';
    });

    const toggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem('tm_sidebar_collapsed', newState);
    };

    // Feature 1: Scroll-aware State
    const [_scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled(isScrolled);
            document.body.classList.toggle('is-scrolled', isScrolled);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Feature 3: Reduced Motion Hook
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPrefersReducedMotion(mediaQuery.matches);
        const handler = () => setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Feature 2: Keyboard Focus Trap for Mobile Drawer
    const mobileMenuRef = useRef(null);
    useEffect(() => {
        if (mobileMenuOpen && mobileMenuRef.current) {
            const focusableElements = mobileMenuRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length === 0) return;
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            const handleTab = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            };
            window.addEventListener('keydown', handleTab);
            return () => window.removeEventListener('keydown', handleTab);
        }
    }, [mobileMenuOpen]);

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [preferencesOpen, setPreferencesOpen] = useState(false);
    const [helpSupportOpen, setHelpSupportOpen] = useState(false);
    const [donationModalOpen, setDonationModalOpen] = useState(false);
    const [referralModalOpen, setReferralModalOpen] = useState(false);
    const [stripeDepositOpen, setStripeDepositOpen] = useState(false);



    // Feature 48: ARIA Live Region State
    const [liveStatus, _setLiveStatus] = useState('');

    // Command Palette open state (controlled by this button; CommandPalette itself also listens for Ctrl+K)
    const [_commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            icon: Trophy,
            color: 'yellow',
            title: 'Achievement Unlocked!',
            desc: 'You reached 50 WPM speed',
            time: '2 hours ago',
            read: false,
            details: "Congratulations! You've hit a major milestone by typing at 50 Words Per Minute. This unlocks the Competitive League arena. Keep practicing to reach 80 WPM and unlock the Pro Circuit!"
        },
        {
            id: 2,
            icon: Target,
            color: 'green',
            title: 'Perfect Accuracy!',
            desc: '100% accuracy on last test',
            time: '5 hours ago',
            read: false,
            details: "Incredible focus! Achieving 100% accuracy is a rare feat. Your precision score has boosted your global ranking. Remember, accuracy is the foundation of true speed."
        },
        {
            id: 3,
            icon: Zap,
            color: 'indigo',
            title: 'New Personal Best',
            desc: 'Beat your previous record by 5 WPM',
            time: '1 day ago',
            read: false,
            details: "You are getting faster every day! You surpassed your previous best of 45 WPM. Check your detailed statistics in the Dashboard to see your progress chart."
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notif) => {
        setSelectedNotification(notif);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setNotificationsOpen(false); // Optional: close dropdown when opening modal
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    const userMenuRef = useRef(null);
    const notificationRef = useRef(null);

    const isDarkMode = user?.settings?.theme === 'dark';

    // Add Coin State
    const [coins, setCoins] = useState(0);

    // Sync Coins from LocalStorage & Setup stripe triggers
    useEffect(() => {
        const loadCoins = () => {
            const storedCoins = localStorage.getItem('arena_coins');
            if (storedCoins) {
                setCoins(parseInt(storedCoins));
            } else {
                localStorage.setItem('arena_coins', '50');
                setCoins(50);
            }
        };
        loadCoins();

        const handleStripeTrigger = () => {
            setStripeDepositOpen(true);
        };

        window.addEventListener('storage', loadCoins);
        window.addEventListener('arena-coins-updated', loadCoins);
        window.addEventListener('trigger-stripe-deposit', handleStripeTrigger);
        return () => {
            window.removeEventListener('storage', loadCoins);
            window.removeEventListener('arena-coins-updated', loadCoins);
            window.removeEventListener('trigger-stripe-deposit', handleStripeTrigger);
        };
    }, []);

    // Handle outside clicks for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };



        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    // Feature 12: PWA Theme-Color Support
    useEffect(() => {
        const themeColor = isDarkMode ? '#0f172a' : '#f8fafc';
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = themeColor;
    }, [isDarkMode]);


    // Handle Global Escape Key (Back Shortcut & Modal Closing)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                // Priority 1: Close any open modals/menus
                if (mobileMenuOpen) {
                    setMobileMenuOpen(false);
                    return;
                }
                if (userMenuOpen) {
                    setUserMenuOpen(false);
                    return;
                }
                if (notificationsOpen) {
                    setNotificationsOpen(false);
                    return;
                }
                if (preferencesOpen) {
                    setPreferencesOpen(false);
                    return;
                }
                if (helpSupportOpen) {
                    setHelpSupportOpen(false);
                    return;
                }
                if (donationModalOpen) {
                    setDonationModalOpen(false);
                    return;
                }
                if (selectedNotification) {
                    setSelectedNotification(null);
                    return;
                }

                // Priority 2: Navigate Back if no modals are open
                // Prevent default browser behavior just in case
                event.preventDefault();
                navigate(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        mobileMenuOpen,
        userMenuOpen,
        notificationsOpen,
        preferencesOpen,
        helpSupportOpen,
        helpSupportOpen,
        donationModalOpen,
        selectedNotification,
        navigate
    ]);

    // Handle user logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Toggle Theme with instant DOM update
    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';

        // Immediately update DOM for instant feedback
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Persist to settings
        updateSettings({ theme: newTheme });
    };

    // Navigation items configuration
    // 🎯 Level-Aware: Battle Arena is shown only once user reaches Level 2+
    // This reads from the live currentLevel in the auth store, which is
    // recalculated after every test — no manual flag changes needed.
    const showArena = currentLevel >= 2;
    const showExams = currentLevel >= 3;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: GraduationCap, label: 'Lessons', path: '/learn' },
        { icon: Keyboard, label: 'Typing Test', path: '/test' },
        { icon: Gamepad2, label: 'Gamification', path: '/gamification' },
        { icon: MessageSquare, label: 'Community Chat', path: '/community/chat' },
        ...(showArena ? [{ icon: Swords, label: 'Battle Arena', path: '/arena' }] : []),
        ...(showExams ? [{ icon: Trophy, label: 'Certifications', path: '/exams' }] : []),
    ];

    const currentPage = navItems.find(i => i.path === location.pathname)?.label || 'TypeMaster Pro';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className={`w-64 bg-slate-900 dark:bg-slate-950 text-white fixed h-full hidden md:flex flex-col z-30 shadow-2xl border-r border-transparent dark:border-slate-800 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:-translate-x-full' : 'md:translate-x-0'}`}>
                {/* Logo Section */}
                <div className="p-6 border-b border-slate-800 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Keyboard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight block leading-none">TypeMaster</span>
                            <span className="text-xs text-indigo-400 font-medium tracking-wider uppercase">Pro Edition</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar pb-2">

                    {/* Level Badge Chip */}
                    {(() => {
                        const badge = getLevelBadge(currentLevel || 1);
                        const colors = {
                            1: 'from-emerald-600/20 to-emerald-900/20 border-emerald-500/20 text-emerald-400',
                            2: 'from-indigo-600/20 to-indigo-900/20 border-indigo-500/20 text-indigo-400',
                            3: 'from-orange-600/20 to-orange-900/20 border-orange-500/20 text-orange-400',
                            4: 'from-purple-600/20 to-purple-900/20 border-purple-500/20 text-purple-400',
                        };
                        const cls = colors[currentLevel || 1] || colors[1];
                        return (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-gradient-to-r ${cls} mb-3`}>
                                <span style={{ fontSize: 16 }}>{badge.emoji}</span>
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">Current Level</div>
                                    <div className="text-xs font-bold leading-none">{badge.title}</div>
                                </div>
                                {currentLevel < 4 && (
                                    <div className="ml-auto text-[9px] opacity-50 font-mono">Lvl {currentLevel}</div>
                                )}
                                {currentLevel >= 4 && (
                                    <span className="ml-auto text-[10px]">👑</span>
                                )}
                            </div>
                        );
                    })()}

                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4 mt-2">Menu</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden ${isActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/20'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 rounded-r-full"></div>
                                )}
                                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                )}
                            </Link>
                        );
                    })}

                    <div className="mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">Settings</div>
                    <button
                        onClick={() => setPreferencesOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200 group"
                    >
                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                        <span className="font-medium">Preferences</span>
                    </button>
                    <button
                        onClick={() => setHelpSupportOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200"
                    >
                        <HelpCircle className="w-5 h-5" />
                        <span className="font-medium">Help & FAQs</span>
                    </button>
                    <button
                        onClick={() => setReferralModalOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all duration-200 border border-emerald-500/20 mt-4 group"
                    >
                        <div className="p-1 bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform">
                            <Zap className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-emerald-400">Refer & Earn 10 Coins</span>
                    </button>
                </nav>


                {/* Sidebar Footer - Bleeding Heart Supporter Badge */}
                <div className="p-4 flex-shrink-0">
                    <div
                        onClick={() => setDonationModalOpen(true)}
                        className="relative group cursor-pointer w-full"
                    >
                        {/* Container with cinematic glow - COMPACT */}
                        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl p-4 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.6),inset_0_0_30px_rgba(220,38,38,0.05)] group-hover:shadow-[0_0_30px_rgba(220,38,38,0.3),inset_0_0_40px_rgba(220,38,38,0.1)] overflow-hidden relative flex flex-row items-center gap-4">

                            {/* Atmospheric Red Vignette */}
                            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent group-hover:from-red-900/30 transition-all duration-700"></div>

                            {/* Heart Icon */}
                            <div className="relative z-10 flex-shrink-0">
                                <div className="absolute inset-0 w-12 h-12 bg-red-600/30 blur-xl rounded-full animate-pulse"></div>
                                <Heart className="relative w-10 h-10 text-red-600 fill-red-600 animate-pulse drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]" strokeWidth={1} />
                            </div>

                            {/* Text */}
                            <div className="relative z-10 flex flex-col">
                                <h4 className="font-black text-xs text-transparent bg-clip-text bg-gradient-to-r from-red-100 via-white to-red-100 uppercase tracking-[0.15em] group-hover:from-red-300 group-hover:to-red-100 transition-all duration-500">
                                    Become a Legend
                                </h4>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5 group-hover:text-red-400/70 transition-colors">
                                    Fuel the Mission
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )
            }

            {/* Mobile Sidebar */}
            <aside
                ref={mobileMenuRef}
                className={`fixed top-0 left-0 h-full w-64 bg-slate-900 dark:bg-slate-950 text-white z-50 md:hidden transform transition-transform duration-300 shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>

                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                            <Keyboard className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">TypeMaster</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Desktop Sidebar Collapse Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`fixed top-1/2 z-40 -translate-y-1/2 w-8 h-16 bg-slate-900/80 dark:bg-slate-950/80 hover:bg-indigo-600 dark:hover:bg-indigo-600 border border-slate-800 dark:border-slate-800/80 text-slate-400 hover:text-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 group shadow-lg backdrop-blur-md hidden md:flex rounded-r-2xl border-l-0 ${
                    sidebarCollapsed ? 'left-0' : 'left-[256px]'
                }`}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <div className="relative w-4 h-8 flex items-center justify-center">
                    {/* Animated 3 Dots */}
                    <div className={`flex flex-col gap-0.5 transition-all duration-300 ${
                        sidebarCollapsed ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-50'
                    }`}>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                    </div>
                    {/* Animated Chevron Arrow */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                        sidebarCollapsed 
                            ? 'opacity-100 scale-100 rotate-0 text-indigo-400' 
                            : 'opacity-0 scale-50 -rotate-90 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0'
                    }`}>
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        ) : (
                            <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                        )}
                    </div>
                </div>
            </button>

            {/* Main Content Area */}
            <main className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-0' : 'md:ml-64'}`}>
                {/* Ultra-Modern Enhanced Navbar */}
                <header className="relative bg-gradient-to-r from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-20 transition-all duration-500 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    {/* Top Navbar Row */}
                    <div className="relative h-16 flex items-center justify-between px-4 md:px-8">
                        <div className="flex items-center gap-4 flex-1">
                            {/* Mobile Menu Button - Enhanced */}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden relative group text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 p-2.5 rounded-xl hover:bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg"
                            >
                                <Menu className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                            </button>

                            {/* Page Title with Icon - Premium Design */}
                            <div className="hidden md:flex items-center gap-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                                    <div className="relative p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-300/50 dark:shadow-indigo-900/50 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                        {navItems.find(i => i.path === location.pathname)?.icon &&
                                            React.createElement(navItems.find(i => i.path === location.pathname).icon, {
                                                className: "w-6 h-6 text-white drop-shadow-lg"
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="relative">
                                    <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent tracking-tight leading-none drop-shadow-sm" style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif' }}>
                                        {currentPage}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg shadow-green-400/50"></div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest whitespace-nowrap">
                                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Title - Enhanced */}
                            <div className="md:hidden">
                                <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    {currentPage}
                                </h1>
                            </div>
                        </div>


                        {/* Battle Arena CTA - Premium Center Button */}
                        {/* 🎯 Level 2: Show for intermediate users */}
                        {showArena && (
                            <div className="hidden lg:flex items-center justify-center flex-1 max-w-md mx-8">
                                <motion.div
                                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                                    className="w-full"
                                >
                                    <button
                                        onClick={() => navigate('/arena')}
                                        className="relative group w-full"
                                    >
                                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>

                                        <div className="relative flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>

                                            <div className="relative">
                                                <Swords className="w-6 h-6 text-white drop-shadow-lg group-hover:rotate-12 transition-transform duration-300" />
                                                <div className="absolute inset-0 blur-md bg-white/50 group-hover:bg-white/80 transition-all duration-300"></div>
                                            </div>

                                            <div className="relative">
                                                <span className="text-lg font-black text-white uppercase tracking-wider drop-shadow-lg">
                                                    Battle Arena
                                                </span>
                                                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                            </div>

                                            <div className="relative flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
                                                <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Live</span>
                                            </div>

                                            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                                            <div className="absolute bottom-0 left-0 w-2 h-2 bg-orange-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </button>
                                </motion.div>
                            </div>
                        )}

                        {/* Feature 50: Desktop Quick Search Button */}
                        <div className="hidden xl:flex items-center flex-1 max-w-sm ml-4">
                            <button
                                onClick={() => setCommandPaletteOpen(true)}
                                className="w-full flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all group"
                            >
                                <Search className="w-4 h-4" />
                                <span className="text-sm font-medium">Search anything...</span>
                                <div className="ml-auto flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[10px] font-bold">Ctrl</kbd>
                                    <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[10px] font-bold">K</kbd>
                                </div>
                            </button>
                        </div>



                        {/* Right Actions - Enhanced */}
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Daily Streak Badge - Premium */}
                            <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 border-2 border-orange-200/60 dark:border-orange-800/60 shadow-lg shadow-orange-100 dark:shadow-orange-900/20 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">🔥</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-orange-600 dark:text-orange-400 leading-none">{user?.stats?.testsTaken || 0}</span>
                                        <span className="text-[9px] text-orange-500 dark:text-orange-500 uppercase tracking-widest font-bold">Tests</span>
                                    </div>
                                </div>
                            </div>

                            {/* Coins Wallet Badge - NEW (Only visible in Arena) */}
                            {location.pathname.startsWith('/arena') && (
                                <div 
                                    className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-orange-900/20 border-2 border-yellow-200/60 dark:border-yellow-800/60 shadow-lg shadow-yellow-100 dark:shadow-yellow-900/20 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                                    onClick={() => setStripeDepositOpen(true)}
                                    title="Deposit Coins via Stripe"
                                >
                                    <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/40 rounded-full group-hover:rotate-12 transition-transform duration-300">
                                        <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-yellow-700 dark:text-yellow-400 leading-none">{coins}</span>
                                        <span className="text-xs text-yellow-600 dark:text-yellow-500 uppercase tracking-widest font-bold">Coins</span>
                                    </div>
                                </div>
                            )}

                            {/* Quick Stats - Premium */}
                            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-indigo-200/60 dark:border-indigo-800/60 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{user?.stats?.bestWpm || 0}</span>
                                <span className="text-[10px] text-indigo-500 dark:text-indigo-500 font-bold uppercase tracking-wider">WPM</span>
                            </div>

                            {/* Theme Toggle - Ultra Premium */}
                            <div className="relative">
                                <button
                                    onClick={toggleTheme}
                                    className="relative p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 transition-all duration-300 hover:scale-110 active:scale-95 group shadow-md hover:shadow-xl border border-slate-200/50 dark:border-slate-700/50"
                                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                                >
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                                    {isDarkMode ? (
                                        <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-180 group-hover:scale-125 transition-all duration-500 drop-shadow-lg" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 group-hover:scale-125 transition-all duration-500 drop-shadow-lg" />
                                    )}
                                </button>
                            </div>

                            {/* Notifications - Premium */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className="relative p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 transition-all duration-300 hover:scale-110 active:scale-95 group shadow-md hover:shadow-xl border border-slate-200/50 dark:border-slate-700/50"
                                >
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                                    <Bell className={`w-5 h-5 transition-all duration-300 ${notificationsOpen ? 'rotate-12 scale-110' : 'group-hover:rotate-12'}`} />
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 transition-all duration-300 transform scale-100" style={{ opacity: unreadCount > 0 ? 1 : 0, transform: unreadCount > 0 ? 'scale(1)' : 'scale(0)' }}>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-br from-red-500 to-pink-500 items-center justify-center text-[10px] font-bold text-white shadow-lg">{unreadCount}</span>
                                    </span>
                                </button>

                                {/* Enhanced Notifications Dropdown */}
                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5 py-1 z-50 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You have {unreadCount} unread messages</p>
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllRead}
                                                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto custom-scrollbar p-1 space-y-1">
                                            {notifications.map((notif, i) => {
                                                const Icon = notif.icon;
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer flex gap-4 border border-transparent hover:scale-[1.02] ${notif.read
                                                            ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 opacity-70 hover:opacity-100'
                                                            : 'bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30'
                                                            }`}
                                                    >
                                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${notif.color}-100 dark:bg-${notif.color}-900/30 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm`}>
                                                            <Icon className={`w-5 h-5 text-${notif.color}-600 dark:text-${notif.color}-400`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <p className={`text-sm font-bold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{notif.title}</p>
                                                                {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50 animate-pulse"></span>}
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{notif.desc}</p>
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1 font-medium">
                                                                <Clock className="w-3 h-3" />
                                                                {notif.time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 text-center">
                                            <Link
                                                to="/notifications"
                                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                                            >
                                                View all notifications
                                                <ChevronDown className="w-3 h-3 rotate-270" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced User Profile Dropdown */}
                            <div className="relative ml-1" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md group"
                                >
                                    {user ? (
                                        <>
                                            <div className="relative">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-white dark:ring-slate-900 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-800 transition-all">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        user.name[0].toUpperCase()
                                                    )}
                                                    {/* Feature 5: Skeleton Loader Overlay (Simulated) */}
                                                    {!user && <div className="absolute inset-0 skeleton-box rounded-xl z-10" />}

                                                </div>
                                                {/* Online Status Indicator */}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900 shadow-sm"></div>
                                            </div>
                                            <div className="hidden md:block text-left">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {user.name}
                                                </p>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                        </>
                                    ) : (
                                        <Link to="/login" className="text-sm font-medium text-indigo-600">Sign In</Link>
                                    )}
                                </button>

                                {/* Enhanced Dropdown Menu */}
                                {userMenuOpen && user && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5 py-2 z-50 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2 fade-in duration-200">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        user.name[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            {/* Quick Stats in Dropdown */}
                                            <div className="grid grid-cols-3 gap-2 mt-3">
                                                <div className="text-center p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{user.stats?.avgWpm || 0}</p>
                                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Avg WPM</p>
                                                </div>
                                                <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                                    <p className="text-xs font-bold text-green-600 dark:text-green-400">{user.stats?.accuracy || 0}%</p>
                                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Accuracy</p>
                                                </div>
                                                <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400">{user.stats?.testsTaken || 0}</p>
                                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Tests</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                            >
                                                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                    <User className="w-4 h-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                                </div>
                                                <span className="font-medium">My Profile</span>
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                            >
                                                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                    <Settings className="w-4 h-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                                </div>
                                                <span className="font-medium">Settings</span>
                                            </Link>

                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-slate-100 dark:border-slate-700 pt-2 pb-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                                            >
                                                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                                    <LogOut className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold">Sign out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Breadcrumbs Bar (New Feature) */}
                    <div className="hidden md:flex items-center gap-2 px-8 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                        <Link to="/dashboard" className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                            Home
                        </Link>
                        <ChevronDown className="w-3 h-3 text-slate-300 dark:text-slate-600 rotate-[-90deg]" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {currentPage}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>

            {/* Preferences Modal */}
            {
                preferencesOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                        <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Preferences</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Customize your typing experience</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreferencesOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Appearance */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Appearance</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                                    <Moon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">Dark Mode</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark theme</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isDarkMode}
                                                    onChange={toggleTheme}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Audio */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Audio</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                                    <Volume2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">Sound Effects</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Typing sounds and notifications</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={user?.settings?.soundEnabled}
                                                    onChange={() => updateSettings({ soundEnabled: !user?.settings?.soundEnabled })}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Notifications</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                                                    <Bell className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">Achievement Alerts</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Get notified when you earn badges</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={user?.settings?.notifications}
                                                    onChange={() => updateSettings({ notifications: !user?.settings?.notifications })}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                                <button
                                    onClick={() => setPreferencesOpen(false)}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }



            {/* Notification Detail Modal */}
            {
                selectedNotification && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 overflow-hidden">
                            {/* Header with Color Accent */}
                            <div className={`h-24 bg-${selectedNotification.color}-100 dark:bg-${selectedNotification.color}-900/30 w-full relative`}>
                                <div className="absolute -bottom-6 left-6">
                                    <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-800 p-2 shadow-lg ring-4 ring-white dark:ring-slate-800 flex items-center justify-center`}>
                                        {React.createElement(selectedNotification.icon, {
                                            className: `w-6 h-6 text-${selectedNotification.color}-600 dark:text-${selectedNotification.color}-400`
                                        })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>

                            <div className="pt-8 px-6 pb-6">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                                    {selectedNotification.title}
                                </h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                                        {selectedNotification.time}
                                    </span>
                                </div>

                                <div className="prose prose-sm dark:prose-invert">
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {selectedNotification.details}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                    <button
                                        onClick={() => setSelectedNotification(null)}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Help & FAQs Modal */}
            {
                helpSupportOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 flex items-center justify-between z-10 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <HelpCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Help & FAQs</h2>
                                        <p className="text-sm text-indigo-100">We're here to help you succeed</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setHelpSupportOpen(false)}
                                    className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Quick Links */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <a href="#faq" className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-md transition-shadow group">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-blue-900 dark:text-blue-100">FAQ</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">Common questions</p>
                                        </div>
                                    </a>
                                    <a href="mailto:support@typemaster.com" className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:shadow-md transition-shadow group">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-900 dark:text-green-100">Contact</p>
                                            <p className="text-xs text-green-600 dark:text-green-400">Get in touch</p>
                                        </div>
                                    </a>
                                </div>

                                {/* FAQ Section */}
                                <div id="faq">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        Frequently Asked Questions
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                q: "How do I improve my typing speed?",
                                                a: "Practice regularly with our lessons, focus on accuracy first, maintain proper finger positioning, and gradually increase your speed as you build muscle memory."
                                            },
                                            {
                                                q: "What is a good typing speed?",
                                                a: "Average typing speed is 40 WPM. Professional level is 60-80 WPM. Expert typists achieve 100+ WPM. Focus on consistent improvement!"
                                            },
                                            {
                                                q: "How do I earn certificates?",
                                                a: "Complete any course with 70% or higher average accuracy. Then download your certificate from the Dashboard."
                                            },
                                            {
                                                q: "Can I reset my progress?",
                                                a: "Contact support at support@typemaster.com to reset your account. This action cannot be undone."
                                            }
                                        ].map((faq, i) => (
                                            <details key={i} className="group bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
                                                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                    <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                                                    <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    {faq.a}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                            <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">📧</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                                                <a href="mailto:support@typemaster.com" className="font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    support@typemaster.com
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                            <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">💬</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Discord Community</p>
                                                <a href="#" className="font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    Join our server
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                            <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">🌐</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Website</p>
                                                <a href="https://typemaster.com" className="font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    www.typemaster.com
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Version 1.0.0 • © 2026 TypeMaster Pro
                                </p>
                                <button
                                    onClick={() => setHelpSupportOpen(false)}
                                    className="px-6 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Donation Modal */}
            {
                donationModalOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-6 flex items-center justify-between rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Support Us</h2>
                                        <p className="text-sm text-amber-100">Choose your payment method</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDonationModalOpen(false)}
                                    className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                                    Your support helps us keep TypeMaster free and continuously improve the platform for everyone!
                                </p>

                                {/* PayPal Option */}
                                <button
                                    onClick={() => window.open('https://www.paypal.me/yourusername', '_blank')}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-lg">PayPal</p>
                                            <p className="text-xs text-blue-100">Secure payment</p>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-5 h-5 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                </button>

                                {/* USDT Binance Option */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('YOUR_USDT_BINANCE_ADDRESS_HERE');
                                        alert('USDT Address copied to clipboard!');
                                    }}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                            <span className="text-2xl">₮</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-lg">USDT (Binance)</p>
                                            <p className="text-xs text-yellow-100">Click to copy address</p>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-5 h-5 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                                    Thank you for your generosity! Every contribution helps us grow. 🙏
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 rounded-b-2xl">
                                <button
                                    onClick={() => setDonationModalOpen(false)}
                                    className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Feature 48: ARIA Live Status Region */}
            <div role="status" aria-live="polite" className="sr-only">
                {liveStatus}
            </div>

            {/* Modals & Overlays */}
            <CommandPalette />
            <ReferralModal isOpen={referralModalOpen} onClose={() => setReferralModalOpen(false)} />
            <StripeDepositModal isOpen={stripeDepositOpen} onClose={() => setStripeDepositOpen(false)} />
        </div>
    );
};

export default Layout;
