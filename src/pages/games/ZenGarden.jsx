import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wind, Leaf, Sun, Infinity, ArrowLeft,
    RefreshCcw, Play, Heart, Sprout,
    Sparkles, Cloud, Music, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { PARAGRAPHS } from '../../utils/testContent';

// --- Zen Garden Flow Component ---
const ZenGarden = () => {
    const navigate = useNavigate();
    const { user, updateStats } = useAuthStore();

    // Game State
    const [gameState, setGameState] = useState('idle'); // idle, playing, finished
    const [growth, setGrowth] = useState(0); // 0 to 100
    const [flowState, setFlowState] = useState(0); // Sequential correct characters
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [activeWords, setActiveWords] = useState([]);
    const [typedText, setTypedText] = useState('');
    const [totalChars, setTotalChars] = useState(0);
    const [errorChars, setErrorChars] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const inputRef = useRef(null);
    const startTimeRef = useRef(null);
    const paragraphRef = useRef(null);

    // Initial setup
    useEffect(() => {
        if (!paragraphRef.current) {
            paragraphRef.current = PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)].text;
        }
    }, []);

    const startGame = () => {
        setGameState('playing');
        setGrowth(0);
        setFlowState(0);
        setWpm(0);
        setAccuracy(100);
        setTotalChars(0);
        setErrorChars(0);
        setTimeElapsed(0);
        setTypedText('');
        startTimeRef.current = Date.now();
        setActiveWords([]);

        // Split text into words for the "flow"
        const words = paragraphRef.current.split(' ');
        setActiveWords(words.map((w, i) => ({ id: i, text: w, status: 'pending' })));
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        const currentWordIndex = activeWords.findIndex(w => w.status === 'pending');
        if (currentWordIndex === -1) return;

        const targetWord = activeWords[currentWordIndex].text;

        // Check for space to submit word
        if (val.endsWith(' ')) {
            const cleanVal = val.trim();
            if (cleanVal === targetWord) {
                // Perfect Match
                setActiveWords(prev => {
                    const next = [...prev];
                    next[currentWordIndex].status = 'correct';
                    return next;
                });
                setGrowth(prev => Math.min(100, prev + 2));
                setFlowState(prev => prev + 1);
            } else {
                // Mistake
                setActiveWords(prev => {
                    const next = [...prev];
                    next[currentWordIndex].status = 'error';
                    return next;
                });
                setGrowth(prev => Math.max(0, prev - 5));
                setFlowState(0);
                setErrorChars(prev => prev + 1);
            }
            setTypedText('');
            setTotalChars(prev => prev + targetWord.length + 1);

            // Finish check
            if (currentWordIndex === activeWords.length - 1) {
                setGameState('finished');
            }
        } else {
            setTypedText(val);
        }

        // Real-time WPM & Accuracy
        const now = Date.now();
        const duration = (now - startTimeRef.current) / 60000;
        if (duration > 0) {
            const currentWpm = Math.round((totalChars / 5) / duration);
            setWpm(currentWpm);
        }

        const accuracyVal = totalChars > 0 ? Math.round(((totalChars - errorChars) / totalChars) * 100) : 100;
        setAccuracy(accuracyVal);
    };

    // Auto-save stats
    useEffect(() => {
        if (gameState === 'finished' && user) {
            updateStats({
                wpm: wpm,
                accuracy: accuracy,
                date: new Date().toISOString()
            });
        }
    }, [gameState, user, updateStats, wpm, accuracy]);

    // Decorative Elements based on Growth
    const bloomingFlowers = Math.floor(growth / 10);

    return (
        <div className="min-h-screen bg-[#fdfcfb] dark:bg-[#0f172a] transition-colors duration-1000 overflow-hidden relative font-sans">
            {/* Zen Background Elements */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-teal-200 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 blur-[120px] rounded-full animate-pulse delay-1000" />

                {/* Floating Petals */}
                {[...Array(bloomingFlowers * 2)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-4 h-4 bg-rose-200/60 dark:bg-rose-900/40 rounded-full"
                        initial={{ x: '-10vw', y: `${Math.random() * 100}vh`, rotate: 0 }}
                        animate={{
                            x: '110vw',
                            y: [`${Math.random() * 100}vh`, `${Math.random() * 100}vh`],
                            rotate: 360
                        }}
                        transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, ease: 'linear' }}
                    />
                ))}
            </div>

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-8">
                <button
                    onClick={() => navigate('/gamification')}
                    className="flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-teal-600 transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold text-sm">Return to Temple</span>
                </button>

                <div className="flex gap-12">
                    <div className="text-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">Flow State</span>
                        <div className="text-2xl font-light text-slate-800 dark:text-white flex items-center justify-center gap-2">
                            <Sparkles className={`w-5 h-5 ${flowState > 10 ? 'text-teal-500 animate-spin-slow' : 'text-slate-300'}`} />
                            {flowState}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <span className="text-2xl font-light text-slate-800 dark:text-white">{wpm}</span>
                        <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">WPM</span>
                    </div>
                </div>
            </header>

            {/* Main Garden Area */}
            <main className="relative z-10 max-w-5xl mx-auto px-8 pt-12 flex flex-col items-center">

                {/* Growth UI */}
                <div className="w-full max-w-2xl mb-16">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            <span className="font-bold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-widest">Garden Growth</span>
                        </div>
                        <span className="text-sm font-black text-teal-600">{growth}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                        <motion.div
                            className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                            animate={{ width: `${growth}%` }}
                            transition={{ type: 'spring', damping: 20 }}
                        />
                    </div>
                </div>

                {/* Zen Text Display */}
                <div className="relative w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-[3rem] p-12 mb-12 border border-white/50 dark:border-slate-800/50 shadow-xl overflow-hidden">
                    {/* Perspective lines */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#000_1px,transparent_0)] bg-[size:30px_30px]" />

                    <div className="flex flex-wrap gap-x-4 gap-y-6 justify-center relative z-10 h-64 overflow-y-auto no-scrollbar py-4">
                        {activeWords.length > 0 ? activeWords.map((word, i) => (
                            <motion.span
                                key={word.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: word.status === 'pending' ? 1 : 0.4,
                                    scale: word.status === 'pending' ? 1.1 : 0.95,
                                    y: 0
                                }}
                                className={`text-3xl md:text-4xl font-light tracking-tight transition-colors duration-500 ${word.status === 'correct' ? 'text-teal-500 dark:text-teal-400 italic' :
                                        word.status === 'error' ? 'text-rose-400 dark:text-rose-500 line-through' :
                                            'text-slate-800 dark:text-slate-200'
                                    }`}
                            >
                                {word.text}
                            </motion.span>
                        )) : (
                            <div className="text-slate-300 dark:text-slate-700 text-3xl font-light animate-pulse">Meditating on text...</div>
                        )}
                    </div>
                </div>

                {/* Bottom Input Area */}
                <div className="w-full max-w-xl relative">
                    <div className="absolute -inset-8 bg-teal-500/5 blur-3xl rounded-full" />

                    <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={typedText}
                            onChange={handleInputChange}
                            placeholder={gameState === 'playing' ? "Type with intention..." : "Pause in silence"}
                            disabled={gameState !== 'playing'}
                            className="w-full bg-transparent px-6 py-4 text-2xl font-light text-center text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 outline-none"
                            autoFocus
                        />
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2" />
                        <div className={`p-3 rounded-full transition-colors ${flowState > 5 ? 'bg-teal-500/10 text-teal-600' : 'text-slate-300'}`}>
                            <Wind className={`w-6 h-6 ${flowState > 5 ? 'animate-bounce' : ''}`} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Overlays */}
            <AnimatePresence>
                {gameState === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl"
                    >
                        <div className="text-center space-y-8 max-w-md px-8">
                            <div className="relative">
                                <motion.div
                                    className="absolute -inset-8 bg-teal-500/10 blur-[50px] rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                />
                                <div className="relative p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-teal-100 dark:border-teal-900/30 shadow-2xl">
                                    <Leaf className="w-20 h-20 text-teal-500 mx-auto animate-spin-slow" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-4xl font-light text-slate-800 dark:text-white tracking-widest italic uppercase">Zen Garden Flow</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                                    Embrace the silence. Maintain your focus to grow your digital sanctuary through precise, rhythmic typing.
                                </p>
                            </div>

                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-teal-600 text-white rounded-[2rem] font-bold text-lg tracking-[0.1em] shadow-xl shadow-teal-200 dark:shadow-none hover:bg-teal-700 hover:scale-[1.02] transition-all group overflow-hidden relative"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>Begin Meditation</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {gameState === 'finished' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#fdfcfb] dark:bg-[#0f172a]"
                    >
                        <div className="max-w-2xl w-full p-12 text-center space-y-12">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-600 text-[10px] font-black uppercase tracking-[0.2em] border border-teal-500/20">
                                    Enlightenment Achieved
                                </div>
                                <h1 className="text-6xl font-light text-slate-800 dark:text-white tracking-tighter italic">Peaceful Results.</h1>
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth</div>
                                    <div className="text-4xl font-light text-teal-600">{growth}%</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stability</div>
                                    <div className="text-4xl font-light text-slate-800 dark:text-white">{accuracy}%</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo</div>
                                    <div className="text-4xl font-light text-slate-800 dark:text-white">{wpm} <span className="text-xs">wpm</span></div>
                                </div>
                            </div>

                            <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center gap-4">
                                <div className="flex gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Sparkles key={i} className={`w-6 h-6 ${i < Math.floor(growth / 20) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-800'}`} />
                                    ))}
                                </div>
                                <p className="text-slate-500 text-sm font-medium">Your garden flourished beautifully. Your mind is sharp and settled.</p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={startGame}
                                    className="flex-1 py-5 bg-teal-600 text-white rounded-3xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-3"
                                >
                                    <RefreshCcw className="w-5 h-5" /> Regather
                                </button>
                                <button
                                    onClick={() => navigate('/gamification')}
                                    className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-3xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    To Courtyard
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ZenGarden;
