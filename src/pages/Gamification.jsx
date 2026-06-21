/* eslint-disable no-unused-vars, react-hooks/purity */
import React, { useState, useEffect } from 'react';
import {
    Brain, Activity, Zap, Layers, Cpu, Shield, Wifi, Server,
    Gamepad2, Code, Music, Terminal, Lock, Play, ChevronRight,
    Search, Globe, Rocket, Swords, Sparkles, Flame, CheckCircle, Target, Timer,
    Trophy, Star, Crown, Medal, Leaf, Wallet, DollarSign, ArrowDownCircle,
    ArrowUpCircle, TrendingUp, Calendar, Gift, Users, BarChart2, PieChart,
    Bell, Download, AlertCircle, ChevronDown, RefreshCw, RotateCcw, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import SEOHead from '../components/SEOHead';

// --- Utility Components ---
const cn = (...inputs) => twMerge(clsx(inputs));

const Badge = ({ children, className }) => (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border", className)}>
        {children}
    </span>
);

// --- Typewriter Effect Component ---
const TypewriterText = ({ text, speed = 30 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else if (currentIndex === text.length && !isComplete) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsComplete(true);
        }
    }, [currentIndex, text, speed, isComplete]);

    return (
        <span className="inline-flex items-center">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">{displayedText}</span>
            {isComplete && (
                <span className="inline-block w-[6px] h-[120px] bg-red-500 ml-2 shadow-[0_0_15px_rgba(239,68,68,0.9)]"
                    style={{
                        animation: 'blink 1s step-end infinite'
                    }}
                />
            )}
        </span>
    );
};

// --- Particle Background ---
const ParticleBackground = () => {
    const particles = React.useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            scale: Math.random() * 2 + 0.5,
            animateY: Math.random() * -20 + "%",
            duration: Math.random() * 5 + 5,
            size: Math.random() * 300 + "px"
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-indigo-500/30 rounded-full"
                    initial={{
                        x: p.x,
                        y: p.y,
                        scale: p.scale,
                        opacity: 0.3
                    }}
                    animate={{
                        y: [null, p.animateY],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        width: p.size,
                        height: p.size,
                        filter: "blur(40px)"
                    }}
                />
            ))}
        </div>
    );
};

// --- Game Card Component ---
const GameCard = ({ title, subtitle, description, tags, icon: Icon, color, status, delay, path }) => {
    const navigate = useNavigate();
    const isLocked = status === "LOCKED";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            className={cn(
                "group relative overflow-hidden rounded-3xl border p-1 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]",
                isLocked
                    ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 dark:hover:border-indigo-500/50"
            )}
        >
            {/* Inner Content Container */}
            <div className="relative h-full bg-slate-50/50 dark:bg-slate-800/50 rounded-[20px] p-6 flex flex-col backdrop-blur-sm overflow-hidden z-10 transition-colors group-hover:bg-slate-100/50 dark:group-hover:bg-slate-800/80">
                {/* Background Decor */}
                <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-500 opacity-0 group-hover:opacity-30",
                    `bg-${color}-500`
                )} />

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                        "p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg",
                        isLocked ? "bg-slate-200 dark:bg-slate-700 text-slate-500" : `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 shadow-${color}-500/20`
                    )}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <Badge className={cn(
                        isLocked
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600"
                            : `bg-${color}-100 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 border-${color}-200 dark:border-${color}-800`
                    )}>
                        {status}
                    </Badge>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-display tracking-tight">
                    {title}
                </h3>
                <p className={cn("text-xs font-bold tracking-widest uppercase mb-4", `text-${color}-500`)}>
                    {subtitle}
                </p>
                <div className="mb-6 flex-grow">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        {description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                        {tags.map((tag, i) => (
                            <span key={i} className={cn("px-2 py-1 rounded bg-slate-200 dark:bg-slate-900/60 text-slate-500 border border-slate-300 dark:border-slate-800 transition-colors group-hover:border-slate-500 group-hover:text-slate-400")}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                <button
                    disabled={isLocked}
                    onClick={() => !isLocked && navigate(path)}
                    className={cn(
                        "relative overflow-hidden w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl",
                        isLocked
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                            : `bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white shadow-indigo-500/10`
                    )}
                >
                    <div className="relative z-10 flex items-center gap-2">
                        {isLocked ? (
                            <>
                                <Lock className="w-4 h-4" /> COMPILATION PENDING
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current animate-pulse" /> START SIMULATION
                            </>
                        )}
                    </div>
                </button>
            </div>
        </motion.div>
    );
};

// --- SVG Sparkline Graph ---
const Sparkline = ({ history }) => {
    const data = history && history.length > 0 
        ? history.slice(-10).map(t => t.wpm)
        : [30, 38, 35, 45, 40, 50, 48, 55, 62, 58]; // default mock progression if history empty

    if (data.length < 2) return <div className="text-slate-500 text-xs italic">Not enough data to graph</div>;

    const width = 300;
    const height = 60;
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal || 1;

    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((val - minVal) / range) * height * 0.8 - height * 0.1;
        return `${x},${y}`;
    }).join(' ');

    const polygonPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <div className="w-full flex flex-col items-center">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible mt-2">
                <defs>
                    <filter id="sparkline-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.4"/>
                    </filter>
                    <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                <polygon
                    fill="url(#sparkline-fill)"
                    points={polygonPoints}
                />
                <polyline
                    fill="none"
                    stroke="url(#sparkline-gradient)"
                    strokeWidth="3"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#sparkline-glow)"
                />
                <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </svg>
            <div className="flex justify-between w-full text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2 px-1">
                <span>Start</span>
                <span>Current ({data[data.length - 1]} WPM)</span>
            </div>
        </div>
    );
};

// --- Modals for Wallet Dashboard ---

// 1. Deposit Modal
const DepositModal = ({ isOpen, onClose, onDeposit }) => {
    const [amount, setAmount] = useState('10');
    const [method, setMethod] = useState('card');

    if (!isOpen) return null;

    const packages = [
        { cost: '$5', tokens: 500, label: 'Starter Deck' },
        { cost: '$10', tokens: 1100, label: 'Pro Pack (+10% Bonus)' },
        { cost: '$25', tokens: 3000, label: 'Elite Vault (+20% Bonus)' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedPkg = packages.find(p => p.cost.includes(amount)) || { tokens: parseInt(amount) * 100 };
        onDeposit(selectedPkg.tokens, parseFloat(amount || 0));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                    <ArrowDownCircle className="w-5 h-5 text-emerald-400 animate-pulse" /> DEPOSIT CREDITS
                </h3>
                <p className="text-xs text-slate-400 mb-6">Convert fiat currency into premium TMP tokens instantly.</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {packages.map(pkg => (
                        <button
                            key={pkg.cost}
                            onClick={() => setAmount(pkg.cost.replace('$', ''))}
                            className={cn(
                                "p-3 rounded-2xl border text-center transition flex flex-col items-center justify-between",
                                amount === pkg.cost.replace('$', '')
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                    : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                            )}
                        >
                            <span className="text-[10px] font-black tracking-widest uppercase">{pkg.label}</span>
                            <span className="text-lg font-black text-white font-mono my-1.5">{pkg.cost}</span>
                            <span className="text-[9px] font-bold bg-slate-900 px-1.5 py-0.5 rounded-full text-slate-500">
                                {pkg.tokens} TMP
                            </span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Custom Deposit Amount ($)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter USD amount"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Payment Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                            <option value="card">Stripe / Credit Card</option>
                            <option value="paypal">PayPal Gateway</option>
                            <option value="crypto">Direct Cryptopay (BTC/ETH)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300"
                    >
                        Authorize & Deposit
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

// 2. Withdraw Modal
const WithdrawModal = ({ isOpen, onClose, onWithdraw, balance }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('bank');
    const [faCode, setFaCode] = useState('');

    if (!isOpen) return null;

    const feePercent = 2.5;
    const feeAmount = parseFloat(amount || 0) * (feePercent / 100);
    const finalWithdrawal = Math.max(0, parseFloat(amount || 0) - feeAmount);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (parseFloat(amount) > balance) {
            alert('Insufficient TMP coin balance.');
            return;
        }
        if (faCode !== '123456') {
            alert('Invalid 2FA authentication token. Try 123456');
            return;
        }
        onWithdraw(parseFloat(amount));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                    <ArrowUpCircle className="w-5 h-5 text-rose-500 animate-pulse" /> WITHDRAW COINS
                </h3>
                <p className="text-xs text-slate-400 mb-6">Cash out your typing earnings directly to your primary bank or wallet.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Withdrawal Amount (TMP)</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                max={balance}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter TMP tokens"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-rose-500 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setAmount(balance.toString())}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold px-2 py-1 rounded"
                            >
                                MAX
                            </button>
                        </div>
                        <div className="mt-2 p-2 bg-slate-950/60 rounded-xl border border-slate-900 text-[10px] text-slate-500 flex justify-between">
                            <span>Processing Fee ({feePercent}%): {(feeAmount).toFixed(1)} TMP</span>
                            <span>Payout Value: ${(finalWithdrawal / 1000).toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Destination Gateway</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                        >
                            <option value="bank">Direct Bank Wire</option>
                            <option value="paypal">PayPal Account</option>
                            <option value="crypto">Tether USD (USDT-TRC20)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">2FA Authentication Token (Use "123456")</label>
                        <input
                            type="password"
                            required
                            maxLength="6"
                            value={faCode}
                            onChange={(e) => setFaCode(e.target.value)}
                            placeholder="Enter 6-digit verification code"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-rose-500 text-center tracking-widest font-mono"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-xs font-black uppercase tracking-wider text-white rounded-xl shadow-lg shadow-rose-500/10 transition-all duration-300"
                    >
                        Confirm Payout Request
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

// 3. Spin Wheel Modal
const SpinWheelModal = ({ isOpen, onClose, onSpinWin }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [prizeAngle, setPrizeAngle] = useState(0);
    const [winText, setWinText] = useState('');

    if (!isOpen) return null;

    const segments = [
        { label: '50 TMP', value: 50, color: 'bg-indigo-600' },
        { label: '10 TMP', value: 10, color: 'bg-purple-600' },
        { label: '500 TMP', value: 500, color: 'bg-amber-500' },
        { label: '100 TMP', value: 100, color: 'bg-pink-600' },
        { label: 'Try Again', value: 0, color: 'bg-slate-700' },
        { label: '200 TMP', value: 200, color: 'bg-cyan-600' },
        { label: '25 TMP', value: 25, color: 'bg-rose-600' },
        { label: '1000 TMP', value: 1000, color: 'bg-gradient-to-r from-yellow-400 to-amber-500' }
    ];

    const spin = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setWinText('');
        
        const randomSegmentIndex = Math.floor(Math.random() * segments.length);
        const segmentDegree = 360 / segments.length;
        const targetDegrees = (360 * 5) + (360 - (randomSegmentIndex * segmentDegree)) - (segmentDegree / 2);
        
        setPrizeAngle(targetDegrees);

        setTimeout(() => {
            setIsSpinning(false);
            const prize = segments[randomSegmentIndex];
            if (prize.value > 0) {
                setWinText(`CONGRATULATIONS! You won ${prize.label}!`);
                onSpinWin(prize.value);
            } else {
                setWinText('Hard luck! Try again tomorrow.');
            }
        }, 5500);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative flex flex-col items-center"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white" disabled={isSpinning}>
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-400 animate-bounce" /> NEURAL SPIN WHEEL
                </h3>
                <p className="text-xs text-slate-400 mb-6 text-center">Overclock your daily fortune protocols. Spin once a day to win free tokens!</p>

                {/* Spin Wheel SVG/CSS Circle */}
                <div className="relative w-64 h-64 border-4 border-slate-800 rounded-full overflow-hidden shadow-2xl bg-slate-950 flex items-center justify-center">
                    <div className="absolute top-0 w-3 h-6 bg-red-500 z-30 triangle-down shadow-md" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
                    <div
                        className="w-full h-full rounded-full relative transition-transform"
                        style={{
                            transform: `rotate(${prizeAngle}deg)`,
                            transitionDuration: '5s',
                            transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
                        }}
                    >
                        {/* Segments drawing */}
                        {segments.map((seg, idx) => {
                            const angle = idx * 45;
                            return (
                                <div
                                    key={idx}
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{
                                        transform: `rotate(${angle}deg)`
                                    }}
                                >
                                    <div className="absolute top-0 w-0 h-0 border-l-[40px] border-r-[40px] border-t-[128px] border-t-slate-800/10 border-l-transparent border-r-transparent origin-bottom" />
                                    <span className="absolute top-4 text-[9px] font-black text-white uppercase tracking-wider rotate-90 transform origin-center max-w-[80px] truncate">
                                        {seg.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Spin center dial */}
                    <button
                        onClick={spin}
                        disabled={isSpinning}
                        className="absolute w-16 h-16 rounded-full bg-slate-900 border-2 border-indigo-500 shadow-xl flex items-center justify-center text-xs font-black text-indigo-400 hover:text-white hover:bg-indigo-600 transition-colors z-20"
                    >
                        {isSpinning ? 'SPINNING' : 'SPIN'}
                    </button>
                </div>

                {/* Win announcement text */}
                <AnimatePresence>
                    {winText && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center text-xs font-extrabold text-indigo-400"
                        >
                            {winText}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

// --- Main Drop-in Replacement: NexusCommandCenter (Wallet Dashboard) ---
const NexusCommandCenter = () => {
    const { user } = useAuthStore();
    const stats = user?.stats || { testsTaken: 0, avgWpm: 0, bestWpm: 0, accuracy: 0, history: [] };
    const navigate = useNavigate();

    // Local state variables for Wallet
    const [balance, setBalance] = useState(() => {
        const cached = localStorage.getItem('tmp_wallet_balance');
        return cached ? parseInt(cached) : 2450;
    });
    const [lockedBalance, setLockedBalance] = useState(() => {
        const cached = localStorage.getItem('tmp_wallet_locked');
        return cached ? parseInt(cached) : 500;
    });
    const [goal, setGoal] = useState(() => {
        const cached = localStorage.getItem('tmp_wallet_goal');
        return cached ? parseInt(cached) : 5000;
    });
    const [autoWithdraw, setAutoWithdraw] = useState(() => {
        const cached = localStorage.getItem('tmp_wallet_auto');
        return cached === 'true';
    });
    const [currency, setCurrency] = useState('USD');
    const [timeLeft, setTimeLeft] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    
    // Transactions history state
    const [transactions, setTransactions] = useState(() => {
        const cached = localStorage.getItem('tmp_wallet_transactions');
        if (cached) return JSON.parse(cached);
        return [
            { id: 1, date: '2026-06-20', type: 'Earned', desc: 'Daily Bounty - Word Master', amount: 50, status: 'CONFIRMED' },
            { id: 2, date: '2026-06-19', type: 'Deposited', desc: 'Stripe Gateway Ref: #9021', amount: 1000, status: 'CONFIRMED' },
            { id: 3, date: '2026-06-18', type: 'Withdrawn', desc: 'PayPal Payout Ref: #3019', amount: 200, status: 'PENDING' },
            { id: 4, date: '2026-06-17', type: 'Earned', desc: 'Typing Duel Win vs Neo_V2', amount: 150, status: 'CONFIRMED' },
            { id: 5, date: '2026-06-16', type: 'Earned', desc: 'Galactic Wave 10 Defense Bonus', amount: 80, status: 'FAILED' }
        ];
    });

    // Modals visibility toggles
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isSpinOpen, setIsSpinOpen] = useState(false);

    // Save states on change
    useEffect(() => {
        localStorage.setItem('tmp_wallet_balance', balance);
    }, [balance]);
    useEffect(() => {
        localStorage.setItem('tmp_wallet_locked', lockedBalance);
    }, [lockedBalance]);
    useEffect(() => {
        localStorage.setItem('tmp_wallet_goal', goal);
    }, [goal]);
    useEffect(() => {
        localStorage.setItem('tmp_wallet_auto', autoWithdraw);
    }, [autoWithdraw]);
    useEffect(() => {
        localStorage.setItem('tmp_wallet_transactions', JSON.stringify(transactions));
    }, [transactions]);

    // Timer logic
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            setTimeLeft(`${hours}h ${minutes}m`);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Conversion rate: 1000 TMP = $1.00 USD
    // PKR: 1 USD = 278 PKR, EUR: 1 USD = 0.92 EUR
    const getConvertedValue = (tokens) => {
        const usdVal = tokens / 1000;
        if (currency === 'PKR') return `₨ ${(usdVal * 278).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        if (currency === 'EUR') return `€ ${(usdVal * 0.92).toFixed(2)}`;
        return `$ ${usdVal.toFixed(2)}`;
    };

    // Deposit handler
    const handleDepositSuccess = (tokens, dollars) => {
        setBalance(prev => prev + tokens);
        const newTx = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'Deposited',
            desc: `Deposit Bundle Authorized via Stripe`,
            amount: tokens,
            status: 'CONFIRMED'
        };
        setTransactions(prev => [newTx, ...prev]);
    };

    // Withdraw handler
    const handleWithdrawSuccess = (tokens) => {
        setBalance(prev => Math.max(0, prev - tokens));
        const newTx = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'Withdrawn',
            desc: `Payout Transferred to Selected Gateway`,
            amount: tokens,
            status: 'PENDING'
        };
        setTransactions(prev => [newTx, ...prev]);
    };

    // Spin win handler
    const handleSpinWin = (tokens) => {
        setBalance(prev => prev + tokens);
        const newTx = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: 'Earned',
            desc: `Spin Wheel Daily Prize Unlocked`,
            amount: tokens,
            status: 'CONFIRMED'
        };
        setTransactions(prev => [newTx, ...prev]);
    };

    // CSV export simulation
    const handleExportCSV = () => {
        const headers = 'Date,Type,Description,Amount,Status\n';
        const rows = transactions.map(t => `${t.date},${t.type},"${t.desc}",${t.amount},${t.status}`).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `TMP_TransHistory_${Date.now()}.csv`);
        a.click();
    };

    // Dispute handler
    const handleDispute = (txId) => {
        alert(`Dispute initiated for transaction Ref ID #${txId}. A moderator will audit your keystroke telemetry logs.`);
    };

    // Dynamic rank calculations based on WPM/level
    const averageWpm = stats.avgWpm || 45;
    const getRank = () => {
        if (averageWpm >= 100) return { title: 'Legendary', progress: 100, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
        if (averageWpm >= 80) return { title: 'Diamond', progress: 85, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
        if (averageWpm >= 60) return { title: 'Platinum', progress: 65, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' };
        if (averageWpm >= 45) return { title: 'Gold', progress: 50, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' };
        if (averageWpm >= 30) return { title: 'Silver', progress: 30, color: 'text-slate-300 border-slate-400/30 bg-slate-400/10' };
        return { title: 'Bronze', progress: 10, color: 'text-amber-600 border-amber-700/30 bg-amber-700/10' };
    };
    const rank = getRank();

    const filteredTransactions = transactions.filter(t => activeTab === 'All' || t.type === activeTab);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="mt-20 relative z-10 space-y-12"
        >
            {/* Title Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4 border-b border-slate-800/80 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <Wallet className="w-7 h-7 text-indigo-400" />
                        <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">WALLET COMMAND CENTER</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                    </h2>
                    <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide uppercase">TRANSACT, DEPOSIT, AND CASH OUT SPEED EARNINGS</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Currency selector toggle */}
                    <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-[10px] font-bold">
                        {['USD', 'PKR', 'EUR'].map(c => (
                            <button
                                key={c}
                                onClick={() => setCurrency(c)}
                                className={cn("px-2.5 py-1 rounded-lg transition-all", currency === c ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white")}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 shadow-xl">
                        <Timer className="w-4 h-4 text-cyan-400 animate-pulse" />
                        <span className="text-cyan-400 font-mono font-bold text-xs tracking-wider">{timeLeft || "CALCULATING..."}</span>
                    </div>
                </div>
            </div>

            {/* SECTION 1: HERO WALLET ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat 1: TMP Coin Balance */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/25 transition-colors duration-500" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">TMP Coin Balance</span>
                        <Coins className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white font-mono tracking-tight glow-indigo">
                            {balance.toLocaleString()}
                        </span>
                        <span className="text-xs text-indigo-400 font-black">TMP</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5 cursor-help" title="Based on active multiplier protocols">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-400 animate-bounce" /> Current Earn Rate: 2.5× base
                    </p>
                </div>

                {/* Stat 2: Real Money Value */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-colors duration-500" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase font-sans">Convertible Cash</span>
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white font-mono tracking-tight glow-cyan">
                            {getConvertedValue(balance)}
                        </span>
                        <span className="text-xs text-slate-400 font-bold uppercase">{currency}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Conversion formula: 1,000 TMP = $1.00 USD</p>
                </div>

                {/* Stat 3: Locked in Active Duels */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/25 transition-colors duration-500" />
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Locked in Duels</span>
                        <Lock className="w-5 h-5 text-rose-500 animate-pulse" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white font-mono tracking-tight glow-rose">
                            {lockedBalance.toLocaleString()}
                        </span>
                        <span className="text-xs text-rose-500 font-black">TMP</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Released on duel settlement or forfeit</p>
                </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex gap-4">
                <button
                    onClick={() => setIsDepositOpen(true)}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-black uppercase tracking-wider text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all hover:-translate-y-0.5"
                >
                    <ArrowDownCircle className="w-4 h-4" /> Deposit Fiat
                </button>
                <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-xs font-black uppercase tracking-wider text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10 transition-all hover:-translate-y-0.5"
                >
                    <ArrowUpCircle className="w-4 h-4" /> Withdraw Earnings
                </button>
            </div>

            {/* SECTION 2: RANK & STATUS STRIP */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                    <span className={cn("text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border", rank.color)}>
                        {rank.title} operative
                    </span>
                    <span className="text-xs font-bold text-slate-200">Level {user?.currentLevel || 1} • {stats.avgWpm || 0} Average WPM</span>
                </div>
                
                {/* Progress bar */}
                <div className="flex-1 max-w-md flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase text-slate-500 shrink-0">XP Gain</span>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900 relative">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${rank.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">{rank.progress}%</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                        2.5× multiplier active
                    </div>
                    <Shield className="w-4 h-4 text-cyan-400" title="Security Clearance Audit Verified" />
                </div>
            </div>

            {/* SECTION 3: ANALYTICS GRID (3-column) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column A: Earnings Chart & Streaks */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">Daily Telemetry (7 Days)</span>
                        {/* Custom SVG Bar Chart */}
                        <div className="flex justify-between items-end h-28 gap-2 pt-2 border-b border-slate-800/80 pb-1">
                            {[120, 150, 90, 240, 180, 210, 310].map((val, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center group">
                                    <div
                                        className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-lg transition-all duration-500 hover:scale-105"
                                        style={{ height: `${(val / 320) * 100}%` }}
                                        title={`${val} TMP`}
                                    />
                                    <span className="text-[8px] font-bold text-slate-600 uppercase mt-1">D{idx+1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                        <span>Total 7D Gain: 1,300 TMP</span>
                        <span className="text-emerald-400">+14.2% week-on-week</span>
                    </div>
                </div>

                {/* Column B: WPM to Earn Rate Conversion */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">WPM to Multiplier conversion</span>
                        <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl text-center space-y-2">
                            <span className="block text-[9px] font-bold text-slate-500 uppercase">TELEMETRY FORMULA</span>
                            <code className="text-xs font-mono text-cyan-400 block font-bold">Earn = WPM × Multiplier × Accuracy%</code>
                            <div className="border-t border-slate-900 pt-2 flex justify-between text-[10px]">
                                <span className="text-slate-400">Avg WPM: {stats.avgWpm || 45}</span>
                                <span className="text-emerald-400">Earn factor: 1.12 TMP/min</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        Overclock WPM to increase base conversion
                    </div>
                </div>

                {/* Column C: Earning Mode & Streaks */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">Streak Tracker</span>
                        <div className="flex gap-2 justify-center mb-4">
                            {[true, true, true, true, false, false, false].map((active, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-black",
                                        active
                                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md"
                                            : "bg-slate-950/40 border-slate-800/80 text-slate-600"
                                    )}
                                    title={active ? 'Completed' : 'Missed / Lock'}
                                >
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center">Maintain 7-day streak for a 500 TMP bonus coin claim.</p>
                </div>
            </div>

            {/* SECTION 4: TRANSACTION HISTORY TABLE */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2 border-b border-slate-800 pb-2 md:pb-0 md:border-b-0">
                        {['All', 'Earned', 'Deposited', 'Withdrawn'].map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                    activeTab === t
                                        ? "bg-slate-800 text-white border border-slate-700"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="self-end md:self-auto text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-800"
                    >
                        <Download className="w-3.5 h-3.5" /> Export Ledger CSV
                    </button>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[9px]">
                                <th className="pb-3 font-black">Date</th>
                                <th className="pb-3 font-black">Operation</th>
                                <th className="pb-3 font-black">Description</th>
                                <th className="pb-3 font-black text-right">Amount</th>
                                <th className="pb-3 font-black text-center">Status</th>
                                <th className="pb-3 font-black text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium">
                            {filteredTransactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-900/10 transition-colors">
                                    <td className="py-3 text-slate-400 font-mono">{tx.date}</td>
                                    <td className="py-3">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                                            tx.type === 'Earned' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                            tx.type === 'Deposited' && 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                                            tx.type === 'Withdrawn' && 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        )}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-300">{tx.desc}</td>
                                    <td className="py-3 text-right font-black font-mono text-slate-200">
                                        {tx.type === 'Withdrawn' ? '-' : '+'}{tx.amount} TMP
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                                            tx.status === 'CONFIRMED' && 'bg-emerald-500/20 text-emerald-400',
                                            tx.status === 'PENDING' && 'bg-amber-500/20 text-amber-400',
                                            tx.status === 'FAILED' && 'bg-red-500/20 text-red-400'
                                        )}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-center">
                                        <button
                                            onClick={() => handleDispute(tx.id)}
                                            className="text-[9px] text-slate-500 hover:text-rose-400 font-bold hover:underline"
                                        >
                                            Audit Request
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 5: GOALS, BOUNTIES & REWARDS (2-column) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Circular Goals, Auto-withdraw & Referral panels */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-4">Cash Out Target Goals</span>
                        <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/60 p-4 border border-slate-900 rounded-2xl">
                            {/* Circular progress bar */}
                            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        stroke="#6366f1"
                                        strokeWidth="6"
                                        fill="transparent"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 - (251.2 * Math.min(balance / goal, 1))}
                                    />
                                </svg>
                                <span className="absolute text-xs font-black text-white font-mono">{((balance / goal) * 100).toFixed(0)}%</span>
                            </div>
                            
                            <div className="space-y-2 flex-1">
                                <span className="block text-[9px] font-bold text-slate-500 uppercase">WITHDRAWAL GOAL TARGET</span>
                                <div className="flex justify-between items-baseline gap-2">
                                    <span className="text-xl font-black text-white font-mono">{balance.toLocaleString()} / {goal.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-500">TMP</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-900 pt-2">
                                    <span className="text-[10px] text-slate-400">Trigger Auto-Withdrawal</span>
                                    <input
                                        type="checkbox"
                                        checked={autoWithdraw}
                                        onChange={(e) => setAutoWithdraw(e.target.checked)}
                                        className="w-4 h-4 accent-indigo-500 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/60 p-4 border border-slate-900 rounded-2xl flex items-center justify-between">
                        <div>
                            <span className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Referral Connection Link</span>
                            <span className="text-xs font-black text-slate-200">3 Friends Recruited ({3 * 200} TMP Earned)</span>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText('https://typemasterpro.com/invite/ref-operative-42');
                                alert('Referral code copied to clipboard!');
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white rounded-xl transition"
                        >
                            Copy Invite
                        </button>
                    </div>
                </div>

                {/* Right Column: Bounties, Spin Wheel, & Achievement Cards */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Daily Combat Protocols</span>
                            <button
                                onClick={() => setIsSpinOpen(true)}
                                className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-[9px] font-black uppercase tracking-wider hover:bg-purple-500 hover:text-white transition"
                            >
                                Spin Fortune Wheel
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {/* Bounty 1 */}
                            <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-2xl">
                                <div className="flex justify-between items-center text-[10px] mb-1.5">
                                    <span className="font-bold text-slate-300">Word Overlord: Reach 80 WPM in standard test</span>
                                    <span className="text-indigo-400 font-mono font-bold">+200 TMP</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${Math.min((stats.bestWpm || 45) / 80 * 100, 100)}%` }} />
                                </div>
                            </div>
                            
                            {/* Bounty 2 */}
                            <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-2xl">
                                <div className="flex justify-between items-center text-[10px] mb-1.5">
                                    <span className="font-bold text-slate-300">Absolute Shield: Finish CSS test with 100% accuracy</span>
                                    <span className="text-indigo-400 font-mono font-bold">+500 TMP</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${Math.min((stats.accuracy || 95) / 100 * 100, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Gift className="w-5 h-5 text-indigo-400" />
                            <div>
                                <span className="block text-[10px] font-black text-white uppercase tracking-wider">Lobby Mastery Reward Card</span>
                                <span className="text-[9px] text-slate-500 font-medium">Unlocked by completing 3 simulation runs</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setBalance(prev => prev + 300);
                                alert('Claimed 300 TMP Achievements rewards!');
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase text-white rounded-xl shadow-md transition"
                        >
                            Claim
                        </button>
                    </div>
                </div>
            </div>

            {/* SECTION 6: SOCIAL, VIP & WITHDRAWAL TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel: Friends Earning Leaderboard */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-md">
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-4">Tactical Squad Earnings (Weekly)</span>
                    <div className="space-y-3">
                        {[
                            { rank: 1, name: 'Neo_V2', amount: '8,450 TMP', isSelf: false },
                            { rank: 2, name: 'You', amount: `${balance.toLocaleString()} TMP`, isSelf: true },
                            { rank: 3, name: 'Cipher_Queen', amount: '2,100 TMP', isSelf: false },
                            { rank: 4, name: 'Glitch0', amount: '1,560 TMP', isSelf: false },
                            { rank: 5, name: 'GridMaster', amount: '800 TMP', isSelf: false }
                        ].map(friend => (
                            <div
                                key={friend.name}
                                className={cn(
                                    "p-3 rounded-2xl flex items-center justify-between border transition-colors",
                                    friend.isSelf
                                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                                        : "bg-slate-950/60 border-slate-900 hover:border-slate-800 text-slate-300"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-slate-500 w-4">#{friend.rank}</span>
                                    <span className="text-xs font-bold">{friend.name}</span>
                                </div>
                                <span className="text-xs font-black font-mono">{friend.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Marquee + VIP + Timeline */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-md flex flex-col justify-between gap-6">
                    {/* Live Ticker Marquee */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 overflow-hidden relative flex items-center h-10">
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest shrink-0 border-r border-slate-800 pr-2 mr-2 bg-slate-950 z-10">
                            LIVE FEED:
                        </span>
                        <div className="flex gap-8 animate-[marquee_20s_linear_infinite] whitespace-nowrap text-[10px] text-slate-400 font-medium">
                            <span>Ali just claimed 500 TMP!</span>
                            <span>Neo_V2 won 300 TMP in Typing Duel!</span>
                            <span>Cipher_Queen unlocked Diamond Tier status!</span>
                            <span>GridMaster processed payout Ref #92!</span>
                        </div>
                    </div>

                    {/* VIP Status Tier Card */}
                    <div className="bg-gradient-to-br from-indigo-950/80 to-slate-950/85 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase">VIP Operative Tier</span>
                            <h4 className="text-lg font-black text-white italic">CYBER VIP LEVEL 1</h4>
                            <p className="text-[9px] text-slate-500">Perks: -10% withdrawal fees • Premium custom tags</p>
                        </div>
                        <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
                    </div>

                    {/* Withdrawal Step Tracker */}
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-3">Withdrawal Pipeline tracker</span>
                        <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-500">
                            <div className="flex flex-col items-center gap-1.5 text-indigo-400">
                                <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center font-mono">1</span>
                                <span>Requested</span>
                            </div>
                            <div className="h-0.5 bg-indigo-500 flex-1 mx-2" />
                            <div className="flex flex-col items-center gap-1.5 text-indigo-400 animate-pulse">
                                <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center font-mono">2</span>
                                <span>Processing</span>
                            </div>
                            <div className="h-0.5 bg-slate-800 flex-1 mx-2" />
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono">3</span>
                                <span>Approved</span>
                            </div>
                            <div className="h-0.5 bg-slate-800 flex-1 mx-2" />
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono">4</span>
                                <span>Dispatched</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals Mounting */}
            <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} onDeposit={handleDepositSuccess} />
            <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} onWithdraw={handleWithdrawSuccess} balance={balance} />
            <SpinWheelModal isOpen={isSpinOpen} onClose={() => setIsSpinOpen(false)} onSpinWin={handleSpinWin} />
        </motion.div>
    );
};

// --- Main Page Component ---
const Gamification = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500 selection:bg-indigo-500/30">
            <SEOHead
                title="Quest Board & Armory - TypeMaster Pro"
                description="Unlock typing achievements, earn coins, and redeem custom themes and keyboard skins in the Armory."
                schemaType="webApplication"
            />
            <ParticleBackground />

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center md:text-left"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black tracking-[0.2em] uppercase mb-6 border border-indigo-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                        <Cpu className="w-3.5 h-3.5 animate-pulse" /> Nexus Core v2.4.0
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 relative">
                        GAMING <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 animate-gradient-x">ARENA</span>
                    </h1>
                    <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
                        <TypewriterText text="Engage in industrial-grade simulations designed to overclock your cognitive throughput and typing velocity." speed={30} />
                    </p>
                </motion.div>

                {/* Modules Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Gamepad2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight">Active Simulations</h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-transparent rounded-full mt-1" />
                    </div>
                </div>

                {/* Game Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-24">
                    <GameCard
                        title="GALACTIC TYPIST"
                        subtitle="Planetary Defense"
                        description="Velocity-based typing warfare. Intercept asteroids with semantic precision before they breach the horizon."
                        tags={['Reflex', 'High WPM', 'Chaos']}
                        icon={Rocket}
                        color="indigo"
                        status="LIVE"
                        path="/game/galactic-typist"
                        delay={0.1}
                    />

                    <GameCard
                        title="CODE NINJA"
                        subtitle="Syntax Slicer"
                        description="Precision coding gauntlet. Execute perfect syntax combos to compile clean code under extreme time pressure."
                        tags={['Accuracy', 'Syntax', 'Flow']}
                        icon={Code}
                        color="pink"
                        status="LIVE"
                        path="/game/code-ninja"
                        delay={0.2}
                    />


                    <GameCard
                        title="TYPING DUELS"
                        subtitle="Multiplayer Combat"
                        description="Real-time 1v1 typing battles. Dominate opponents in a test of raw speed and tactical power-up usage."
                        tags={['PvP', 'Ranked', 'Combat']}
                        icon={Swords}
                        color="rose"
                        status="LIVE"
                        path="/game/duels"
                        delay={0.3}
                    />
                </div>

                {/* Nexus Command Center Dashboard */}
                <NexusCommandCenter />

                {/* Footer Section */}
                <div className="mt-32 text-center border-t border-slate-800 pt-10">
                    <p className="text-slate-600 font-mono text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:text-indigo-400 transition-colors cursor-default">
                        <span className="flex items-center gap-2"><Sparkles className="w-3 h-3" /> NEURAL ENGINE ACTIVE</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>LATENCY 12MS</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Gamification;
