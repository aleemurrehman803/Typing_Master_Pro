import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, ArrowLeft, Volume2, VolumeX, Pause, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Track Generator ---
// Generates a ~2 minute track with structured patterns (approx 150-200 notes)
const generateTrack = () => {
    const blocks = [];
    const LANES = ['S', 'D', 'F', 'J', 'K', 'L'];
    const BPM = 120;
    const MS_PER_BEAT = 60000 / BPM; // 500ms
    let currentTime = 2000; // Start at 2s

    // Patterns
    const addRoll = (duration) => {
        for (let i = 0; i < duration; i++) {
            blocks.push({ time: currentTime, key: LANES[i % 6] });
            currentTime += MS_PER_BEAT / 2; // Eighth notes
        }
    };

    const addStairs = (duration, dir = 1) => {
        let laneIdx = dir === 1 ? 0 : 5;
        for (let i = 0; i < duration; i++) {
            blocks.push({ time: currentTime, key: LANES[laneIdx] });
            laneIdx += dir;
            if (laneIdx > 5) laneIdx = 0;
            if (laneIdx < 0) laneIdx = 5;
            currentTime += MS_PER_BEAT; // Quarter notes
        }
    };

    const addChord = () => {
        blocks.push({ time: currentTime, key: 'S' });
        blocks.push({ time: currentTime, key: 'L' });
        currentTime += MS_PER_BEAT;
    };

    // --- Song Structure ---

    // Intro (Simple beats)
    for (let i = 0; i < 8; i++) {
        blocks.push({ time: currentTime, key: i % 2 === 0 ? 'D' : 'K' });
        currentTime += MS_PER_BEAT;
    }

    // Verse 1 (Stairs)
    addStairs(16, 1);

    // Chorus 1 (Rolls - faster)
    addRoll(32);

    // Bridge (Chords/Double taps)
    for (let i = 0; i < 8; i++) {
        addChord();
        currentTime += MS_PER_BEAT;
    }

    // Verse 2 (Reverse Stairs)
    addStairs(16, -1);

    // Chorus 2 (Complex)
    for (let i = 0; i < 16; i++) {
        blocks.push({ time: currentTime, key: LANES[Math.floor(Math.random() * 6)] });
        currentTime += MS_PER_BEAT / 2;
    }

    // Outro (Slow Down)
    for (let i = 0; i < 8; i++) {
        blocks.push({ time: currentTime, key: LANES[Math.floor(Math.random() * 6)] });
        currentTime += MS_PER_BEAT * 1.5;
    }

    return {
        id: 1,
        title: "NEON PULSE [EXTENDED]",
        bpm: BPM,
        blocks: blocks
    };
};

const TRACKS = [generateTrack()];

// --- Audio Engine ---
const useRhythmAudio = () => {
    const ctxRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    const initAudio = useCallback(() => {
        if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    }, []);

    const playHit = useCallback((rating) => {
        if (isMuted || !ctxRef.current) return;
        try {
            const osc = ctxRef.current.createOscillator();
            const gain = ctxRef.current.createGain();

            if (rating === 'PERFECT') {
                osc.frequency.setValueAtTime(880, ctxRef.current.currentTime); // A5
                osc.type = 'sine';
            } else {
                osc.frequency.setValueAtTime(440, ctxRef.current.currentTime); // A4
                osc.type = 'triangle';
            }

            gain.gain.setValueAtTime(0.1, ctxRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctxRef.current.destination);
            osc.start();
            osc.stop(ctxRef.current.currentTime + 0.1);
        } catch (e) { }
    }, [isMuted]);

    // Simple metronome for background beat
    const scheduleBeat = useCallback((time) => {
        if (isMuted || !ctxRef.current) return;
        try {
            const osc = ctxRef.current.createOscillator();
            const gain = ctxRef.current.createGain();
            osc.frequency.value = 100;
            osc.type = 'square';
            gain.gain.value = 0.05;
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            osc.connect(gain);
            gain.connect(ctxRef.current.destination);
            osc.start(time);
            osc.stop(time + 0.05);
        } catch (e) { }
    }, [isMuted]);

    return { initAudio, playHit, scheduleBeat, isMuted, setIsMuted };
};

const RhythmTyper = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('MENU');
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeTrack] = useState(TRACKS[0]);

    const startTimeRef = useRef(0);
    const pauseTimeRef = useRef(0);
    const requestRef = useRef(null);
    const processedBlocks = useRef(new Set());
    const nextNoteTimeRef = useRef(0);

    const { initAudio, playHit, scheduleBeat, isMuted, setIsMuted } = useRhythmAudio();

    const startGame = () => {
        initAudio();
        setGameState('PLAYING');
        setScore(0);
        setCombo(0);
        processedBlocks.current.clear();
        startTimeRef.current = Date.now();
        nextNoteTimeRef.current = 0;
        loop();
    };

    const loop = () => {
        if (gameState !== 'PLAYING') return;
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        setCurrentTime(elapsed);

        // Beat Scheduler
        if (elapsed > nextNoteTimeRef.current) {
            scheduleBeat(0);
            nextNoteTimeRef.current += (60000 / activeTrack.bpm);
        }

        // Miss logic
        activeTrack.blocks.forEach((block, idx) => {
            if (elapsed > block.time + 300 && !processedBlocks.current.has(idx)) {
                processedBlocks.current.add(idx);
                setCombo(0);
            }
        });

        // End condition
        const lastBlock = activeTrack.blocks[activeTrack.blocks.length - 1];
        if (lastBlock && elapsed > lastBlock.time + 2000) {
            setGameState('RESULTS');
            return;
        }

        requestRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        if (gameState === 'PLAYING') {
            if (pauseTimeRef.current > 0) {
                startTimeRef.current += (Date.now() - pauseTimeRef.current);
                pauseTimeRef.current = 0;
            }
            requestRef.current = requestAnimationFrame(loop);
        } else if (gameState === 'PAUSED') {
            cancelAnimationFrame(requestRef.current);
            pauseTimeRef.current = Date.now();
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState]);

    // Input
    useEffect(() => {
        const handleKey = (e) => {
            if (gameState !== 'PLAYING') return;
            if (e.key === 'Escape') { setGameState('PAUSED'); return; }

            const elapsed = Date.now() - startTimeRef.current;

            // Find valid note
            const valid = activeTrack.blocks.findIndex((b, i) =>
                !processedBlocks.current.has(i) &&
                b.key === e.key.toUpperCase() &&
                Math.abs(elapsed - b.time) < 250 // 250ms window
            );

            if (valid !== -1) {
                const diff = Math.abs(elapsed - activeTrack.blocks[valid].time);
                let rating = diff < 80 ? 'PERFECT' : 'GOOD';
                playHit(rating);
                setScore(s => s + (rating === 'PERFECT' ? 200 : 50) * (1 + combo * 0.1));
                setCombo(c => c + 1);
                processedBlocks.current.add(valid);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, combo, playHit, activeTrack]);

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans select-none relative">
            {/* Header Controls */}
            <div className="absolute top-0 right-0 p-6 flex gap-3 z-30">
                <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 text-white border border-slate-700 transition shadow-lg">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-pink-500" />}
                </button>
                <button onClick={() => setGameState(g => g === 'PAUSED' ? 'PLAYING' : 'PAUSED')} className="p-3 bg-pink-600/20 text-pink-500 rounded-full hover:bg-pink-600/30 border border-pink-500/50 transition">
                    {gameState === 'PAUSED' ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                </button>
                <button onClick={() => navigate('/gamification')} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 text-white border border-slate-700 transition">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Score HUD */}
            <div className="absolute top-6 left-6 z-20">
                <div className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-lg">
                    {Math.floor(score).toLocaleString()}
                </div>
                <div className="text-sm font-bold tracking-[0.5em] text-slate-400 mt-2">
                    {combo > 0 ? `${combo}X COMBO` : 'READY'}
                </div>
            </div>

            {/* Game Lane */}
            <div className="relative w-full max-w-2xl mx-auto h-screen border-x border-slate-800 bg-slate-900/30 backdrop-blur-sm overflow-hidden perspective-1000">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.1)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20 transform perspective-1000 rotate-x-60"></div>

                {/* Hit Zone */}
                <div className="absolute top-[500px] left-0 right-0 flex justify-around px-8 z-10">
                    {['S', 'D', 'F', 'J', 'K', 'L'].map(k => (
                        <div key={k} className="w-16 h-16 rounded-xl border-2 border-slate-700 bg-slate-900 flex items-center justify-center font-black text-2xl text-slate-500 shadow-xl">
                            {k}
                        </div>
                    ))}
                    <div className="absolute top-1/2 -z-10 w-full h-1 bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.8)]"></div>
                </div>

                {/* Notes */}
                {gameState !== 'MENU' && activeTrack.blocks.map((b, i) => {
                    const delta = b.time - currentTime;
                    const y = 500 - (delta * 0.6); // Adjust speed factor

                    // Render Condition optimization
                    if (y > 900 || y < -100 || processedBlocks.current.has(i)) return null;

                    const lanes = ['S', 'D', 'F', 'J', 'K', 'L'];
                    return (
                        <div key={i} className="absolute w-16 h-8 rounded-md bg-gradient-to-r from-pink-500 to-violet-600 shadow-lg border border-white/20"
                            style={{ top: y, left: `calc(${(lanes.indexOf(b.key) * 16.66)}% + 50px)`, width: '60px' }}>
                        </div>
                    );
                })}
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {(gameState === 'MENU' || gameState === 'PAUSED' || gameState === 'RESULTS') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-40 flex items-center justify-center">
                        <div className="text-center">
                            {gameState === 'RESULTS' ? (
                                <>
                                    <h1 className="text-6xl font-black text-white italic mb-4">COMPLETE</h1>
                                    <p className="text-2xl text-pink-400 font-bold mb-8">SCORE: {Math.floor(score)}</p>
                                    <button onClick={() => setGameState('MENU')} className="px-10 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition">CONTINUE</button>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-7xl font-black text-white italic tracking-tighter mb-4">RHYTHM <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">KEY</span></h1>
                                    <p className="text-slate-500 mb-8 font-mono tracking-widest text-sm">TRACK: {activeTrack.title} // {activeTrack.blocks.length} NOTES</p>
                                    <button onClick={startGame} className="px-16 py-6 bg-pink-600 text-white text-2xl font-black rounded-full hover:scale-105 transition shadow-xl shadow-pink-500/30">
                                        {gameState === 'PAUSED' ? 'RESUME' : 'START TRACK'}
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

export default RhythmTyper;
