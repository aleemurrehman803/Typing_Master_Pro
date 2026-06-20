import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Code, Pause, Play, RotateCcw, ArrowLeft, Volume2, VolumeX, LogOut, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LEVELS = [
    {
        language: 'HTML',
        snippets: [
            { code: '<div className="container">', hint: 'Wrapper' },
            { code: '<img src="logo.png" alt="Logo" />', hint: 'Image Asset' },
            { code: '<a href="/home" target="_blank">', hint: 'Anchor' },
            { code: '<input type="text" required />', hint: 'Form Input' },
            { code: '<button disable={isLoading}>', hint: 'Button State' },
            { code: '<meta name="viewport" content="" />', hint: 'Meta Tag' },
            { code: '<section id="hero-section">', hint: 'Semantic Section' },
            { code: '<ul className="flex-col gap-4">', hint: 'Flex List' },
            { code: '<span style={{ color: "red" }}>', hint: 'Inline Style' },
            { code: '<form onSubmit={handleSubmit}>', hint: 'Event Handler' },
            { code: '<label htmlFor="email">Email</label>', hint: 'Accessibility' },
            { code: '<script src="bundle.js" defer>', hint: 'Script Tag' },
            { code: '<link rel="stylesheet" href="style.css">', hint: 'CSS Link' },
            { code: '<table className="table-auto">', hint: 'Table' },
            { code: '<thead><tr><th>ID</th></tr></thead>', hint: 'Table Head' },
            { code: '<textarea rows="4" cols="50">', hint: 'Text Area' },
            { code: '<option value="1">Option 1</option>', hint: 'Select Option' },
            { code: '<iframe title="video" src="...">', hint: 'Embed' },
            { code: '<canvas id="game" width="800">', hint: 'Canvas' },
            { code: '<svg viewBox="0 0 24 24">', hint: 'Vector Graphics' },
            { code: '<path d="M12 2L2 7l10 5 10-5" />', hint: 'SVG Path' },
            { code: '<article className="prose lg:prose-xl">', hint: 'Article' },
            { code: '<footer className="bg-gray-800">', hint: 'Footer' },
            { code: '<h1 className="text-4xl font-bold">', hint: 'Heading' },
            { code: '<p className="leading-relaxed">', hint: 'Paragraph' }
        ]
    },
    {
        language: 'JAVASCRIPT',
        snippets: [
            { code: 'const [user, setUser] = useState(null);', hint: 'React Hook' },
            { code: 'document.getElementById("root");', hint: 'DOM Access' },
            { code: 'array.map(item => item.id);', hint: 'Array Map' },
            { code: 'items.filter(i => i.active);', hint: 'Array Filter' },
            { code: 'items.reduce((acc, curr) => acc + curr, 0);', hint: 'Reducer' },
            { code: 'async function fetchData(url) {', hint: 'Async Func' },
            { code: 'await fetch("/api/data");', hint: 'Await Fetch' },
            { code: 'const { data } = await res.json();', hint: 'Destructuring' },
            { code: 'localStorage.setItem("token", val);', hint: 'Storage' },
            { code: 'setTimeout(() => setLoading(false), 1000);', hint: 'Timeout' },
            { code: 'export const Component = () => {}', hint: 'Export' },
            { code: 'import { useState, useEffect } from "react";', hint: 'Import' },
            { code: 'if (!isValid) return null;', hint: 'Guard Clause' },
            { code: 'switch (action.type) { case "ADD":', hint: 'Switch Case' },
            { code: 'class User extends Model {', hint: 'Class Extends' },
            { code: 'const highlight = isSelected ? "bg-blue" : "";', hint: 'Ternary' },
            { code: 'console.log(`Hello ${name}`);', hint: 'Template Literal' },
            { code: 'const copy = { ...obj, status: "active" };', hint: 'Spread Operator' },
            { code: 'try { await save() } catch(e) { log(e) }', hint: 'Try Catch' },
            { code: 'window.addEventListener("resize", handle);', hint: 'Event Listener' },
            { code: 'JSON.stringify({ id: 1, val: "test" });', hint: 'JSON Stringify' },
            { code: 'const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+$/i;', hint: 'Regex' },
            { code: 'Math.floor(Math.random() * 100);', hint: 'Math' },
            { code: 'new Date().toISOString();', hint: 'Date' }
        ]
    },
    {
        language: 'PYTHON',
        snippets: [
            { code: 'def calculate_area(radius):', hint: 'Function Def' },
            { code: 'if __name__ == "__main__":', hint: 'Main Guard' },
            { code: 'users = [u for u in data if u.is_active]', hint: 'List Comp' },
            { code: 'print(f"User {name} logged in")', hint: 'F-String' },
            { code: 'with open("data.txt", "r") as f:', hint: 'File Context' },
            { code: 'content = f.read().strip()', hint: 'File Read' },
            { code: 'class NeuralNetwork(nn.Module):', hint: 'Class Def' },
            { code: 'def __init__(self, input_size):', hint: 'Constructor' },
            { code: 'super().__init__()', hint: 'Super Call' },
            { code: 'import pandas as pd', hint: 'Import Alias' },
            { code: 'df = pd.read_csv("dataset.csv")', hint: 'Pandas Read' },
            { code: 'active_users = df[df["status"] == "active"]', hint: 'DataFrame Filter' },
            { code: 'for index, row in df.iterrows():', hint: 'Iteration' },
            { code: 'try: x = 1 / 0 except ZeroDivisionError:', hint: 'Except Block' },
            { code: 'return {"status": 200, "data": []}', hint: 'Return Dict' },
            { code: 'lambda x: x * 2', hint: 'Lambda' },
            { code: 'map(str, [1, 2, 3])', hint: 'Map Func' },
            { code: 'from datetime import datetime, timedelta', hint: 'Import From' },
            { code: 'now = datetime.now()', hint: 'Datetime' },
            { code: 'requests.get("https://api.github.com")', hint: 'Requests' },
            { code: 'json_data = response.json()', hint: 'JSON Decode' },
            { code: 'def generator(): yield "data"', hint: 'Generator' },
            { code: '@app.route("/api/v1/users")', hint: 'Decorator' },
            { code: 'assert x > 0, "X must be positive"', hint: 'Assert' }
        ]
    }
];

// --- Robust Audio Hook ---
const useCodeAudio = () => {
    const ctxRef = useRef(null);
    const ambientRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    const initAudio = useCallback(() => {
        if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    }, []);

    const playTone = useCallback((freq, type, dur, vol = 0.05) => {
        if (isMuted || !ctxRef.current) return;
        try {
            const osc = ctxRef.current.createOscillator();
            const gain = ctxRef.current.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctxRef.current.currentTime);
            gain.gain.setValueAtTime(vol, ctxRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + dur);
            osc.connect(gain);
            gain.connect(ctxRef.current.destination);
            osc.start();
            osc.stop(ctxRef.current.currentTime + dur);
        } catch (_e) { /* ignore */ }
    }, [isMuted]);

    const playKey = () => playTone(800 + Math.random() * 200, 'square', 0.05, 0.02); // Clicky
    const playSuccess = () => playTone(1200, 'sine', 0.3, 0.1);
    const playError = () => playTone(150, 'sawtooth', 0.2, 0.1);

    const toggleAmbient = useCallback((play) => {
        if (!ctxRef.current) return;
        if (play && !isMuted && !ambientRef.current) {
            const osc = ctxRef.current.createOscillator();
            const gain = ctxRef.current.createGain();
            osc.frequency.value = 100; // Low hum
            osc.type = 'triangle';

            // Filter
            const filter = ctxRef.current.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 200;

            gain.gain.value = 0.02;
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctxRef.current.destination);
            osc.start();
            ambientRef.current = { osc, gain };
        } else if ((!play || isMuted) && ambientRef.current) {
            try { ambientRef.current.osc.stop(); ambientRef.current.osc.disconnect(); ambientRef.current = null; } catch (_e) { /* ignore */ }
        }
    }, [isMuted]);

    useEffect(() => {
        if (isMuted && ambientRef.current) toggleAmbient(false);
    }, [isMuted, toggleAmbient]);

    return { initAudio, playKey, playSuccess, playError, toggleAmbient, isMuted, setIsMuted };
};

const SyntaxHighlight = ({ code, progress }) => {
    const typed = code.substring(0, progress);
    const remaining = code.substring(progress);
    return (
        <div className="font-mono text-3xl md:text-5xl leading-tight font-bold tracking-tight">
            <span className="text-emerald-400 drop-shadow-md border-b-4 border-emerald-500/50">{typed}</span>
            <span className="text-slate-600 border-b-4 border-transparent relative">
                <span className="absolute -left-[2px] -top-1 h-12 w-[3px] bg-yellow-400 animate-pulse"></span>
                {remaining}
            </span>
        </div>
    );
};

const CodeNinja = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('MENU');
    const [levelIdx, setLevelIdx] = useState(0);
    const [snippetIdx, setSnippetIdx] = useState(0);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [streak, setStreak] = useState(0);

    const { initAudio, playKey, playSuccess, playError, toggleAmbient, isMuted, setIsMuted } = useCodeAudio();

    // Start/Stop Ambient
    useEffect(() => {
        gameState === 'PLAYING' ? toggleAmbient(true) : toggleAmbient(false);
        return () => toggleAmbient(false);
    }, [gameState, toggleAmbient]);

    // Timer
    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { setGameState('GAMEOVER'); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [gameState]);

    // Input
    useEffect(() => {
        const handleKey = (e) => {
            if (gameState !== 'PLAYING') return;
            // Prevent default for some keys if needed, but keeping it simple
            if (e.key === 'Escape') { setGameState('PAUSED'); return; }

            const snippet = LEVELS[levelIdx].snippets[snippetIdx];
            const target = snippet.code[input.length];

            // Ignore modifier keys alone
            if (e.key.length > 1 && e.key !== target) return;

            if (e.key === target) {
                const next = input + e.key;
                setInput(next);
                playKey();

                if (next === snippet.code) {
                    setStreak(s => s + 1);
                    setScore(s => s + 200 + (streak * 20));
                    playSuccess();

                    // Next Snippet Logic
                    setTimeout(() => {
                        setInput('');
                        if (snippetIdx < LEVELS[levelIdx].snippets.length - 1) {
                            setSnippetIdx(i => i + 1);
                        } else {
                            // Loop or Next Level
                            const nextLvl = (levelIdx + 1) % LEVELS.length;
                            setLevelIdx(nextLvl);
                            setSnippetIdx(0);
                        }
                    }, 100);
                }
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                // Error
                playError();
                setStreak(0);
            }
        };
        window.addEventListener('keypress', handleKey);
        return () => window.removeEventListener('keypress', handleKey);
    }, [gameState, input, levelIdx, snippetIdx, streak, playKey, playSuccess, playError]);

    return (
        <div className="min-h-screen bg-[#0d1117] text-white font-sans overflow-hidden relative selection:bg-indigo-500/30">
            {/* Controls */}
            <div className="absolute top-0 right-0 p-6 flex gap-3 z-30">
                <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white border border-slate-700 transition-all hover:scale-105 active:scale-95 shadow-lg">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                </button>
                <button onClick={() => setGameState(g => g === 'PAUSED' ? 'PLAYING' : 'PAUSED')} className="p-3 bg-indigo-600 rounded-xl hover:bg-indigo-500 text-white border border-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30">
                    {gameState === 'PAUSED' ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                </button>
                <button onClick={() => navigate('/gamification')} className="p-3 bg-rose-600 rounded-xl hover:bg-rose-500 text-white border border-rose-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/30">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Game UI */}
            {gameState === 'PLAYING' && (
                <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
                    <div className="w-full max-w-5xl px-8">

                        {/* Status */}
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Protocol</div>
                                <div className="text-4xl font-black text-white px-4 py-2 bg-slate-800 rounded-lg inline-block border border-slate-700 shadow-md">
                                    {LEVELS[levelIdx].language}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Remaining</div>
                                <div className={`text-5xl font-mono font-black ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                                    {timeLeft}s
                                </div>
                            </div>
                        </div>

                        {/* Editor Box */}
                        <div className="bg-[#161b22] rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                            <div className="h-10 bg-[#0d1117] border-b border-slate-800 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            </div>
                            <div className="p-16 flex flex-col items-center justify-center min-h-[300px]">
                                <div className="text-slate-500 font-mono text-sm mb-6 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded">// {LEVELS[levelIdx].snippets[snippetIdx].hint}</div>
                                <SyntaxHighlight code={LEVELS[levelIdx].snippets[snippetIdx].code} progress={input.length} />
                            </div>
                        </div>

                        {/* Score & Streak */}
                        <div className="mt-8 flex justify-between items-center px-4">
                            <div className="text-2xl font-bold text-slate-400">SCORE: <span className="text-white">{score}</span></div>
                            {streak > 1 && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full text-white font-black italic tracking-widest text-lg shadow-lg shadow-orange-500/20">
                                    {streak}X COMBO
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Overlays */}
            <AnimatePresence>
                {(gameState === 'MENU' || gameState === 'PAUSED' || gameState === 'GAMEOVER') && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0d1117]/95 backdrop-blur-md z-40 flex items-center justify-center"
                    >
                        <div className="text-center">
                            {gameState === 'GAMEOVER' ? (
                                <>
                                    <h1 className="text-8xl font-black text-white italic mb-4">TERMINATED</h1>
                                    <p className="text-3xl text-emerald-400 font-bold mb-12">FINAL SCORE: {score}</p>
                                    <button onClick={() => { setGameState('PLAYING'); setScore(0); setTimeLeft(60); setStreak(0); setInput(''); initAudio(); }} className="px-12 py-5 bg-white text-black text-xl font-black rounded-full hover:scale-105 transition-transform">
                                        RESTART SYSTEM
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl rotate-12">
                                        <Code className="w-12 h-12 text-white" />
                                    </div>
                                    <h1 className="text-7xl font-black text-white uppercase tracking-tighter mb-4">CODE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">NINJA</span></h1>
                                    <button
                                        onClick={() => { initAudio(); setGameState('PLAYING'); setScore(0); setTimeLeft(60); setInput(''); }}
                                        className="px-16 py-6 bg-white text-black text-2xl font-black rounded-full hover:scale-105 transition-transform shadow-xl shadow-white/10"
                                    >
                                        {gameState === 'PAUSED' ? 'RESUME' : 'INITIALIZE'}
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CodeNinja;
