import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Timer, Trophy, Activity, ArrowLeft,
    RefreshCcw, Play, Lock, Gauge, Flame,
    Cpu, FastForward, Terminal, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { DIFFICULTY_TEXTS } from '../../utils/testContent';

// --- Neon Overdrive Component ---
const NeonOverdrive = () => {
    const navigate = useNavigate();
    const { user, updateStats } = useAuthStore();

    // Game State
    const [gameState, setGameState] = useState('idle'); // idle, playing, finished
    const [difficulty, setDifficulty] = useState('intermediate');
    const [score, setScore] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [activeWords, setActiveWords] = useState([]);
    const [typedText, setTypedText] = useState('');
    const [multiplier, setMultiplier] = useState(1);
    const [velocity, setVelocity] = useState(1); // Visual speed multiplier

    const inputRef = useRef(null);
    const gameLoopRef = useRef(null);
    const startTimeRef = useRef(null);

    // Config
    const SPAWN_INTERVAL = 2000; // ms

    // Initialize Game
    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setWpm(0);
        setStreak(0);
        setMaxStreak(0);
        setTimeLeft(60);
        setMultiplier(1);
        setVelocity(1);
        setActiveWords([]);
        setTypedText('');
        startTimeRef.current = Date.now();

        // Initial word spawn
        spawnWord();
    };

    const spawnWord = useCallback(() => {
        const texts = DIFFICULTY_TEXTS[difficulty];
        const randomSentence = texts[Math.floor(Math.random() * texts.length)];
        const words = randomSentence.split(' ');
        const word = words[Math.floor(Math.random() * words.length)];

        const newWord = {
            id: Date.now(),
            text: word,
            x: 20 + Math.random() * 60, // 20% to 80% horizontal
            y: -10, // Start above screen
            speed: 0.5 + Math.random() * 0.5 + (velocity * 0.2)
        };

        setActiveWords(prev => [...prev, newWord]);
    }, [difficulty, velocity]);

    // Game Loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('finished');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const spawner = setInterval(spawnWord, Math.max(800, SPAWN_INTERVAL - (velocity * 200)));

        const mover = setInterval(() => {
            setActiveWords(prev => {
                const updated = prev.map(w => ({ ...w, y: w.y + w.speed }));
                // Check for missed words (off screen)
                const missed = updated.find(w => w.y > 100);
                if (missed) {
                    setStreak(0);
                    setMultiplier(1);
                    setVelocity(prevV => Math.max(1, prevV - 0.2));
                }
                return updated.filter(w => w.y <= 100);
            });
        }, 50);

        return () => {
            clearInterval(interval);
            clearInterval(spawner);
            clearInterval(mover);
        };
    }, [gameState, spawnWord, velocity]);

    // Handle Input
    const handleInputChange = (e) => {
        const val = e.target.value.trim().toLowerCase();
        setTypedText(val);

        const match = activeWords.find(w => w.text.toLowerCase() === val);
        if (match) {
            // Success!
            setActiveWords(prev => prev.filter(w => w.id !== match.id));
            setTypedText('');

            const newStreak = streak + 1;
            setStreak(newStreak);
            setMaxStreak(prev => Math.max(prev, newStreak));

            // Multiplier logic
            const newMultiplier = Math.floor(newStreak / 5) + 1;
            setMultiplier(newMultiplier);

            // Score calculation
            setScore(prev => prev + (match.text.length * 10 * multiplier));

            // Speed up
            setVelocity(prev => Math.min(5, prev + 0.05));

            // Calculate WPM
            const timeElapsed = (Date.now() - startTimeRef.current) / 60000;
            const wordsTyped = (score / 50) + 1; // rough estimate
            setWpm(Math.round(wordsTyped / timeElapsed));
        }
    };

    // Save Stats when finished
    useEffect(() => {
        if (gameState === 'finished' && user) {
            const coinsEarned = Math.floor(score / 100);
            updateStats({
                wpm: wpm,
                accuracy: 95, // Simplified for this game mode
                date: new Date().toISOString()
            });
            // Logic for coins could be added here if needed
        }
    }, [gameState, score, wpm, user, updateStats]);

    return (
        <div className="min-h-screen bg-[#09090b] text-white overflow-hidden relative font-sans selection:bg-cyan-500/30">
            {/* Cyber HUD Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]" />
                <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-cyan-500/10 to-transparent"
                    style={{ perspective: '1000px' }}>
                    <div className="w-full h-full border-t border-cyan-500/20"
                        style={{
                            transform: 'rotateX(60deg)',
                            backgroundImage: 'linear-gradient(rgba(6,182,212,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.2) 1px, transparent 1px)',
                            backgroundSize: '100px 100px'
                        }}
                    />
                </div>
            </div>

            {/* Navigation Header */}
            <div className="relative z-20 flex items-center justify-between p-6 bg-black/40 backdrop-blur-xl border-b border-white/5">
                <button
                    onClick={() => navigate('/gamification')}
                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold tracking-widest text-xs uppercase">Abort Mission</span>
                </button>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.2em] mb-1">Time Remaining</span>
                        <div className="text-2xl font-mono font-black text-white">{timeLeft}s</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                        <span className="text-cyan-400 font-black text-lg">{score.toLocaleString()}</span>
                        <span className="ml-2 text-[10px] text-cyan-600 font-bold uppercase tracking-wider">Points</span>
                    </div>
                </div>
            </div>

            {/* Main Game Area */}
            <main className="relative z-10 h-[calc(100vh-140px)] flex flex-col items-center">

                {/* Stats HUD (Floating) */}
                <div className="absolute left-8 top-12 flex flex-col gap-6">
                    <div className="p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 w-40 transform hover:scale-105 transition-transform">
                        <div className="flex items-center gap-3 mb-2">
                            <Gauge className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">Velocity</span>
                        </div>
                        <div className="text-2xl font-black text-white">{wpm} <span className="text-xs text-slate-500">WPM</span></div>
                    </div>

                    <div className="p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 w-40 transform hover:scale-105 transition-transform">
                        <div className="flex items-center gap-3 mb-2">
                            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`} />
                            <span className="text-[10px] font-black text-slate-500 uppercase">Burn Rate</span>
                        </div>
                        <div className="text-2xl font-black text-white">x{multiplier.toFixed(1)}</div>
                        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-orange-500"
                                animate={{ width: `${(streak % 5) * 20}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="flex-1 w-full max-w-4xl relative perspective-1000 overflow-hidden mt-8">
                    <AnimatePresence>
                        {gameState === 'playing' && activeWords.map((word) => (
                            <motion.div
                                key={word.id}
                                className="absolute"
                                initial={{ opacity: 0, scale: 0.5, y: '-10vh' }}
                                animate={{
                                    opacity: 1,
                                    scale: 1 + (word.y / 200), // Grows as it approaches
                                    y: `${word.y}vh`,
                                    left: `${word.x}%`
                                }}
                                exit={{ opacity: 0, scale: 2, filter: 'blur(10px)' }}
                                transition={{ type: 'spring', damping: 20 }}
                            >
                                <div className="relative group">
                                    {/* Neon Outer Glow */}
                                    <div className="absolute -inset-4 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative px-6 py-3 bg-black/80 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                        <span className="text-2xl font-black tracking-tighter text-white font-mono">
                                            {word.text}
                                        </span>
                                    </div>

                                    {/* Directional Lines */}
                                    <div className="absolute top-1/2 left-0 w-screen h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-x-full pointer-events-none" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Ground Splash effect on hits */}
                    {streak > 0 && streak % 5 === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [1, 0], scale: [1, 4] }}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl"
                        />
                    )}
                </div>

                {/* Bottom Input Section */}
                <div className="w-full max-w-2xl px-6 mb-12 relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 blur-2xl opacity-50" />

                    <div className="relative bg-black/60 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
                        <input
                            ref={inputRef}
                            type="text"
                            value={typedText}
                            onChange={handleInputChange}
                            placeholder={gameState === 'playing' ? "INTERFACE LINKED. AWAITING INPUT..." : "SYSTEM OFFLINE"}
                            disabled={gameState !== 'playing'}
                            className="w-full bg-transparent px-8 py-5 text-2xl font-black text-center text-white placeholder-slate-700 outline-none font-mono uppercase tracking-[0.2em]"
                            autoFocus
                        />

                        {/* Glow lines */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />
                    </div>
                </div>
            </main>

            {/* Modals & Overlays */}
            <AnimatePresence>
                {/* Idle/Start Overlay */}
                {gameState === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl"
                    >
                        <div className="text-center space-y-8 max-w-lg px-8">
                            <div className="relative inline-block">
                                <motion.div
                                    className="absolute -inset-4 bg-cyan-500 opacity-20 blur-2xl rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                                <div className="relative p-6 bg-slate-900/50 rounded-3xl border border-cyan-500/30 shadow-2xl">
                                    <FastForward className="w-20 h-20 text-cyan-400 mx-auto" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-black text-white tracking-tighter">NEON OVERDRIVE</h2>
                                <p className="text-slate-400 font-medium leading-relaxed uppercase tracking-wider text-xs">
                                    Acknowledge mission parameters: High-velocity data intercept. Type the approaching word protocols to prevent system breach.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {['beginner', 'intermediate', 'hard'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className={`py-3 px-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${difficulty === d
                                                ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/40 scale-105'
                                                : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:bg-cyan-400 hover:scale-[1.02] transition-all group"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <Play className="w-6 h-6 fill-current" />
                                    <span>Initiate Sequence</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Game Over Overlay */}
                {gameState === 'finished' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b] p-8"
                    >
                        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-xs font-black uppercase tracking-widest border border-green-500/20">
                                    <Terminal className="w-4 h-4" /> Mission Accomplished
                                </div>

                                <h2 className="text-7xl font-black text-white tracking-tighter leading-none">
                                    SIMULATION <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">RESULTS.</span>
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 group hover:border-cyan-500/50 transition-colors">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Final Score</div>
                                        <div className="text-4xl font-black text-white group-hover:text-cyan-400 transition-colors">{score.toLocaleString()}</div>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 group hover:border-purple-500/50 transition-colors">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Peak WPM</div>
                                        <div className="text-4xl font-black text-white group-hover:text-purple-400 transition-colors">{wpm}</div>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 col-span-2 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Max Burn Streak</div>
                                            <div className="text-2xl font-black text-white">{maxStreak} Words</div>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-lg shadow-orange-500/10">
                                            <Flame className="w-8 h-8 text-orange-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={startGame}
                                        className="flex-1 py-5 bg-white text-black rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3"
                                    >
                                        <RefreshCcw className="w-5 h-5" /> Retry
                                    </button>
                                    <button
                                        onClick={() => navigate('/gamification')}
                                        className="flex-1 py-5 bg-white/5 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-white/10 border border-white/10 transition-all"
                                    >
                                        Terminal
                                    </button>
                                </div>
                            </div>

                            <div className="hidden md:block relative">
                                {/* Visual Reward Display */}
                                <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 shadow-2xl">
                                    <div className="w-full h-full bg-[#09090b] rounded-[2.8rem] flex flex-col items-center justify-center p-12 text-center overflow-hidden relative">
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                                        <Trophy className="w-24 h-24 text-white mb-6 animate-bounce" />
                                        <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">New Badge Potential</h3>
                                        <p className="text-slate-400 text-sm font-medium">Your data throughput has been logged. Performance improvements detected since last session.</p>

                                        {/* Rank Badge */}
                                        <div className="mt-8 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                                            NEURON COMMANDER
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NeonOverdrive;
