import React, { useState, useEffect } from 'react';
import {
    Brain, Activity, Zap, Layers, Cpu, Shield, Wifi, Server,
    Gamepad2, Code, Music, Terminal, Lock, Play, ChevronRight,
    Search, Globe, Rocket, Swords, Sparkles, Flame, CheckCircle, Target, Timer,
    Trophy, Star, Crown, Medal, Leaf
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

    return (
        <div className="w-full flex flex-col items-center">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible mt-2">
                <defs>
                    <filter id="sparkline-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.4"/>
                    </filter>
                </defs>
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

// --- Nexus Command Center (3-Column Dashboard) ---
const NexusCommandCenter = () => {
    const { user } = useAuthStore();
    const stats = user?.stats || { testsTaken: 0, avgWpm: 0, bestWpm: 0, accuracy: 0, history: [] };
    const [timeLeft, setTimeLeft] = useState('');

    const MISSIONS = [
        { id: 1, title: "Void Hunter", desc: "Destroy 50 asteroids in Galactic Typist", progress: 35, total: 50, reward: "200 XP", icon: Rocket, color: "indigo", completed: false },
        { id: 2, title: "Perfect Sync", desc: "Get 10 Perfect hits in Rhythm Keystrokes", progress: 2, total: 10, reward: "500 XP", icon: Music, color: "fuchsia", completed: false },
        { id: 3, title: "Code Breaker", desc: "Complete 3 Snippets without error", progress: 3, total: 3, reward: "300 XP", icon: Code, color: "emerald", completed: true },
    ];

    const ELITE_AGENTS = [
        { rank: 1, name: "Neo_V2", wpm: 156, tier: "Legendary", color: "from-amber-400 to-yellow-500" },
        { rank: 2, name: "Cipher_Queen", wpm: 142, tier: "Grandmaster", color: "from-slate-300 to-slate-400" },
        { rank: 3, name: "Glitch0", wpm: 138, tier: "Master", color: "from-amber-600 to-orange-700" }
    ];

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="mt-20 relative z-10"
        >
            {/* Section Title */}
            <div className="flex items-end justify-between mb-8 px-4">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">NEXUS COMMAND CENTER</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide uppercase">OVERSEE SECTOR METRICS & OPERATIONS</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 shadow-xl">
                    <Timer className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-cyan-400 font-mono font-bold text-sm tracking-wider">{timeLeft || "CALCULATING..."}</span>
                </div>
            </div>

            {/* 3-Column Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column A: Daily Operations */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between shadow-xl">
                    <div>
                        <h3 className="text-lg font-extrabold text-white mb-2 flex items-center gap-2">
                            <Target className="w-5 h-5 text-orange-400" />
                            Daily Operations
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mb-4">Complete daily protocols for bonus XP.</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        {MISSIONS.map(m => (
                            <div key={m.id} className="p-3 bg-slate-950/60 rounded-2xl border border-slate-900 hover:border-slate-800 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <m.icon className="w-4 h-4 text-slate-400" />
                                        <span className={`text-xs font-bold ${m.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{m.title}</span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${m.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                        {m.completed ? 'Done' : 'Active'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">{m.desc}</p>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${m.completed ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${(m.progress / m.total) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column B: Neural Metrics */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between shadow-xl">
                    <div>
                        <h3 className="text-lg font-extrabold text-white mb-2 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-400" />
                            Neural Metrics
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mb-4">Real-time telemetry and progression curves.</p>
                    </div>

                    <div className="py-4 flex-1 flex flex-col justify-center">
                        <Sparkline history={stats.history} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-4 text-center mt-4">
                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Tests</span>
                            <span className="text-lg font-black text-white font-mono">{stats.testsTaken || 0}</span>
                        </div>
                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Avg Acc</span>
                            <span className="text-lg font-black text-cyan-400 font-mono">{stats.accuracy || 0}%</span>
                        </div>
                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Best WPM</span>
                            <span className="text-lg font-black text-pink-400 font-mono">{stats.bestWpm || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Column C: Elite Agents */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between shadow-xl">
                    <div>
                        <h3 className="text-lg font-extrabold text-white mb-2 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-purple-400 animate-pulse" />
                            Elite Agents
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mb-4">Top ranking sector operatives.</p>
                    </div>

                    <div className="space-y-3 flex-1 flex flex-col justify-center">
                        {ELITE_AGENTS.map((agent) => (
                            <div key={agent.name} className="flex items-center justify-between p-3.5 bg-slate-950/50 rounded-2xl border border-slate-900 hover:border-slate-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center font-black text-slate-950 text-xs`}>
                                        {agent.rank}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white">{agent.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{agent.tier}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-mono">{agent.wpm}</div>
                                    <div className="text-[9px] text-slate-600 font-bold uppercase">WPM</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
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
                        title="RHYTHM KEYSTROKES"
                        subtitle="Audio Entrainment"
                        description="Synesthetic typing challenge. Align your keystrokes with high-BPM tracks for maximum combo multipliers."
                        tags={['Rhythm', 'Timing', 'Sync']}
                        icon={Music}
                        color="amber"
                        status="LIVE"
                        path="/game/rhythm-typer"
                        delay={0.3}
                    />

                    <GameCard
                        title="NEON OVERDRIVE"
                        subtitle="Cyber Velocity"
                        description="Acknowledge mission parameters: High-velocity data intercept. Type the approaching word protocols to prevent system breach."
                        tags={['Speed', 'Adrenaline', 'Neon']}
                        icon={Zap}
                        color="cyan"
                        status="LIVE"
                        path="/game/neon-overdrive"
                        delay={0.4}
                    />

                    <GameCard
                        title="ZEN GARDEN FLOW"
                        subtitle="Focus & Endurance"
                        description="Embrace the silence. Maintain your focus to grow your digital sanctuary through precise, rhythmic typing."
                        tags={['Focus', 'Mindful', 'Flow']}
                        icon={Leaf}
                        color="emerald"
                        status="LIVE"
                        path="/game/zen-garden"
                        delay={0.5}
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
                        delay={0.5}
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
