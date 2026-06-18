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
const ParticleBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
        {[...Array(20)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute bg-indigo-500/30 rounded-full"
                initial={{
                    x: Math.random() * 100 + "%",
                    y: Math.random() * 100 + "%",
                    scale: Math.random() * 2 + 0.5,
                    opacity: 0.3
                }}
                animate={{
                    y: [null, Math.random() * -20 + "%"],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                    duration: Math.random() * 5 + 5,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    width: Math.random() * 300 + "px",
                    height: Math.random() * 300 + "px",
                    filter: "blur(40px)"
                }}
            />
        ))}
    </div>
);

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

// --- Daily Operations Module ---
const DailyOperations = () => {
    // Mock Data
    const [timeLeft, setTimeLeft] = useState('');

    // Enhanced Data State
    const MISSIONS = [
        { id: 1, title: "Void Hunter", desc: "Destroy 50 asteroids in Galactic Typist", progress: 35, total: 50, reward: "200 XP", icon: Rocket, color: "indigo", completed: false },
        { id: 2, title: "Perfect Sync", desc: "Get 10 Perfect hits in Rhythm Keystrokes", progress: 2, total: 10, reward: "500 XP", icon: Music, color: "fuchsia", completed: false },
        { id: 3, title: "Code Breaker", desc: "Complete 3 Snippets without error", progress: 3, total: 3, reward: "300 XP", icon: Code, color: "emerald", completed: true },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);

            setTimeLeft(`${hours}h ${minutes}m`);
        }, 60000);

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
                        <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">DAILY OPERATIONS</span>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide">COMPLETE OBJECTIVES TO EARN SEASON XP</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-xl">
                    <Timer className="w-4 h-4 text-orange-400 animate-spin-slow" />
                    <span className="text-orange-400 font-mono font-bold text-sm tracking-wider">{timeLeft || "CALCULATING..."}</span>
                </div>
            </div>

            {/* Missions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MISSIONS.map((mission, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        key={mission.id}
                        className={cn(
                            "relative overflow-hidden rounded-2xl p-[1px] group h-full",
                            "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-white/20 hover:to-white/5 transition-all duration-500"
                        )}
                    >
                        {/* Inner Card */}
                        <div className="relative h-full bg-slate-950 rounded-[15px] p-6 flex flex-col justify-between overflow-hidden group-hover:bg-slate-900/90 transition-colors">
                            {/* Glow Effect */}
                            <div className={cn(
                                "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700",
                                `bg-${mission.color}-500`
                            )} />

                            {/* Mission Header */}
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={cn(
                                    "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                                    `bg-${mission.color}-500/10 text-${mission.color}-400 border border-${mission.color}-500/20`
                                )}>
                                    <mission.icon className="w-6 h-6" />
                                </div>
                                {mission.completed ? (
                                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-black uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                        <CheckCircle className="w-3 h-3" /> Complete
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-orange-400 text-xs font-black uppercase tracking-wider bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                                        <Target className="w-3 h-3" /> Active
                                    </div>
                                )}
                            </div>

                            {/* Mission Content */}
                            <div className="mb-6 relative z-10">
                                <h3 className={cn(
                                    "text-xl font-bold mb-2 transition-colors",
                                    mission.completed ? "text-slate-500 line-through decoration-emerald-500/50" : "text-white"
                                )}>
                                    {mission.title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{mission.desc}</p>
                            </div>

                            {/* Progress & Reward */}
                            <div className="relative z-10">
                                <div className="flex justify-between text-xs font-bold font-mono text-slate-500 mb-2 uppercase tracking-tight">
                                    <span>Progress</span>
                                    <span className={cn(mission.completed && "text-emerald-400")}>{Math.round((mission.progress / mission.total) * 100)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(mission.progress / mission.total) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={cn(
                                            "h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] relative overflow-hidden",
                                            mission.completed ? "bg-emerald-500" : `bg-${mission.color}-500`
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                    </motion.div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rewards</div>
                                    <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]">
                                        <Crown className="w-3.5 h-3.5 fill-current" /> {mission.reward}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

// --- Main Page Component ---
const Gamification = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500 selection:bg-indigo-500/30">
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

                {/* Daily Operations Module */}
                <DailyOperations />

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
