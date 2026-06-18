import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, User, Bot, Zap, Shield, Skull, ArrowLeft, Trophy, Volume2, VolumeX, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { syncNetworkTime, DuelPeerConnection, edgeLeaderboard } from '../../utils/network';


// Increased word list for better practice variety
const WORDS = [
    "FIGHT", "POWER", "SPEED", "BLOCK", "DODGE", "STRIKE", "COMBO", "SMASH", "BLAST", "PARRY",
    "COUNTER", "ATTACK", "DEFEND", "GLORY", "HONOR", "VICTORY", "DAMAGE", "CRITICAL", "IMPACT",
    "SHADOW", "LIGHT", "CHAOS", "ORDER", "FORCE", "DRILL", "FOCUS", "AGILITY", "VELOCITY",
    "ARMOR", "WEAPON", "TARGET", "LOCKED", "SYSTEM", "MATRIX", "NEXUS", "CORE", "PULSE",
    "ENERGY", "SURGE", "QUANTUM", "FINAL", "BLADE", "STEEL", "IRON", "TITAN", "ARENA"
];

const useBattleAudio = () => {
    const ctxRef = useRef(null);
    const ambientRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    const initAudio = useCallback(() => {
        if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    }, []);

    const playHit = (type) => {
        if (isMuted || !ctxRef.current) return;
        try {
            const t = ctxRef.current.currentTime;
            const osc = ctxRef.current.createOscillator();
            const gain = ctxRef.current.createGain();

            if (type === 'PLAYER') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
                gain.gain.setValueAtTime(0.1, t);
            } else {
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, t);
                osc.frequency.linearRampToValueAtTime(50, t + 0.2);
                gain.gain.setValueAtTime(0.15, t);
            }
            gain.gain.exponentialRampToValueAtTime(0.001, t + (type === 'PLAYER' ? 0.1 : 0.2));
            osc.connect(gain);
            gain.connect(ctxRef.current.destination);
            osc.start();
            osc.stop(t + 0.3);
        } catch (e) { }
    };

    const toggleAmbient = useCallback((play) => {
        if (!ctxRef.current) return;
        if (play && !isMuted && !ambientRef.current) {
            const osc = ctxRef.current.createOscillator();
            const gain = ctxRef.current.createGain();
            osc.frequency.value = 80;
            osc.type = 'sawtooth';

            const lfo = ctxRef.current.createOscillator();
            lfo.frequency.value = 0.5;
            const lfoGain = ctxRef.current.createGain();
            lfoGain.gain.value = 5;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();

            const filter = ctxRef.current.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 150;

            gain.gain.value = 0.03;
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctxRef.current.destination);
            osc.start();
            ambientRef.current = { osc, gain, lfo };
        } else if ((!play || isMuted) && ambientRef.current) {
            try { ambientRef.current.osc.stop(); ambientRef.current.lfo.stop(); ambientRef.current.osc.disconnect(); ambientRef.current = null; } catch (e) { }
        }
    }, [isMuted]);

    useEffect(() => { if (isMuted && ambientRef.current) toggleAmbient(false); }, [isMuted, toggleAmbient]);

    return { initAudio, playHit, toggleAmbient, isMuted, setIsMuted };
};

const TypingDuels = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('MATCHMAKING');
    const [playerHealth, setPlayerHealth] = useState(100);
    const [enemyHealth, setEnemyHealth] = useState(100);
    const [currentWord, setCurrentWord] = useState('');
    const [input, setInput] = useState('');
    const [log, setLog] = useState([]);

    const { initAudio, playHit, toggleAmbient, isMuted, setIsMuted } = useBattleAudio();
    const botTimerRef = useRef(null);
    const peerRef = useRef(null);
    const [networkOffset, setNetworkOffset] = useState(0);

    // Feature 23: NTP Synchronization on Mount
    useEffect(() => {
        syncNetworkTime().then(offset => setNetworkOffset(offset));
    }, []);


    const startMatchmaking = async () => {
        initAudio();
        setGameState('SEARCHING');

        // Feature 1: Initialize sub-1ms P2P duel connection
        peerRef.current = new DuelPeerConnection((data) => {
            if (data.type === 'KEY') {
                setPlayerHealth(h => Math.max(0, h - 2));
                setLog(l => [{ msg: `ENEMY ATTACK: ${data.payload.char}`, color: "text-rose-500", id: Date.now() }, ...l].slice(0, 1));
                playHit('ENEMY');
            }
        });

        // Phase 7: Deterministic Start Time (Match Integrity)
        // We calculate a future timestamp (e.g., T + 3000ms) adjusted by the NTP offset
        // In a real P2P flow, this TimeToStart would be negotiated or sent by the host/server.
        // Here we simulate it.
        const networkTime = Date.now() + networkOffset;
        const targetStartTime = networkTime + 3000; // Start in 3 seconds from "server time"

        // Wait for the standardized start time
        const waitDuration = targetStartTime - (Date.now() + networkOffset);

        console.log(`[MATCH] Syncing start... Wait: ${waitDuration}ms`);

        setTimeout(() => {
            setGameState('PLAYING');
            setPlayerHealth(100);
            setEnemyHealth(100);
            setCurrentWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
            setLog([]);
            setInput('');
        }, Math.max(0, waitDuration));
    };


    useEffect(() => {
        gameState === 'PLAYING' ? toggleAmbient(true) : toggleAmbient(false);
        return () => toggleAmbient(false);
    }, [gameState, toggleAmbient]);

    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        botTimerRef.current = setInterval(() => {
            setPlayerHealth(h => {
                const nh = Math.max(0, h - (5 + Math.floor(Math.random() * 5)));
                if (nh < h) {
                    playHit('ENEMY');
                    setLog(l => [{ msg: "DAMAGE TAKEN!", color: "text-rose-500", id: Date.now() }, ...l].slice(0, 1));
                }
                return nh;
            });
        }, 2000);
        return () => clearInterval(botTimerRef.current);
    }, [gameState, playHit]);

    useEffect(() => {
        if (playerHealth <= 0 && gameState === 'PLAYING') setGameState('RESULT_LOSE');
        if (enemyHealth <= 0 && gameState === 'PLAYING') setGameState('RESULT_WIN');
    }, [playerHealth, enemyHealth, gameState]);

    const handleInput = (e) => {
        const val = e.target.value.toUpperCase();
        setInput(val);

        // Feature 21: Send sub-1ms keystroke data via WebRTC
        if (peerRef.current) {
            peerRef.current.sendKeystroke(val.slice(-1), val.length / currentWord.length);
        }

        if (val === currentWord) {
            playHit('PLAYER');
            setEnemyHealth(h => Math.max(0, h - (10 + Math.floor(Math.random() * 5))));
            setLog(l => [{ msg: "CRITICAL HIT!", color: "text-emerald-400", id: Date.now() }, ...l].slice(0, 1));
            setCurrentWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
            setInput('');
        }
    };


    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden relative selection:bg-rose-500/30">
            {/* Header */}
            <div className="absolute top-0 right-0 p-6 z-20 flex gap-3">
                <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition border border-slate-600 shadow-lg">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-indigo-400" />}
                </button>
                <button onClick={() => navigate('/gamification')} className="p-3 bg-rose-600 rounded-full hover:bg-rose-500 transition border border-rose-500 shadow-lg">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {gameState === 'MATCHMAKING' && (
                <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
                    <Swords className="w-24 h-24 text-rose-500 mb-6 animate-pulse" />
                    <h1 className="text-6xl font-black italic uppercase mb-2">TYPING <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">DUELS</span></h1>
                    <p className="text-xl text-slate-400 mb-10 font-bold tracking-widest">1v1 RANKED PROTOCOL</p>
                    <button onClick={startMatchmaking} className="bg-white text-slate-900 px-12 py-5 rounded-xl font-black text-2xl hover:scale-105 transition shadow-2xl">
                        FIND MATCH
                    </button>
                </div>
            )}

            {gameState === 'SEARCHING' && (
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="w-20 h-20 border-8 border-rose-600 border-t-transparent rounded-full animate-spin mb-8" />
                    <div className="text-2xl font-black uppercase tracking-widest animate-pulse">Scanning Network...</div>
                </div>
            )}

            {gameState === 'PLAYING' && (
                <div className="container mx-auto px-4 h-screen flex flex-col justify-center max-w-5xl relative z-10">
                    <div className="flex justify-between items-end mb-12 px-8">
                        {/* Player */}
                        <div className="text-center w-1/3">
                            <User className="w-16 h-16 mx-auto mb-4 text-emerald-400 bg-slate-800 p-3 rounded-2xl border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20" />
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <motion.div initial={{ width: '100%' }} animate={{ width: `${playerHealth}%` }} className="h-full bg-emerald-500" />
                            </div>
                        </div>
                        <div className="text-4xl font-black text-slate-600 italic">VS</div>
                        {/* Enemy */}
                        <div className="text-center w-1/3">
                            <Bot className="w-16 h-16 mx-auto mb-4 text-rose-400 bg-slate-800 p-3 rounded-2xl border-2 border-rose-500/50 shadow-lg shadow-rose-500/20" />
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <motion.div initial={{ width: '100%' }} animate={{ width: `${enemyHealth}%` }} className="h-full bg-rose-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/80 backdrop-blur-xl p-16 rounded-[3rem] border border-slate-700 shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[400px]">

                        {/* Layout Correction:
                            1. Top section for floating alerts (absolute) to keep main flow clear.
                            2. Middle section purely for the Target Word, with abundant padding.
                            3. Bottom section for input.
                        */}

                        <div className="absolute top-8 left-0 w-full flex flex-col items-center gap-2 pointer-events-none">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.5em] mb-2">Target Lock</div>
                            {log.map(l => (
                                <motion.div
                                    key={l.id}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`text-sm font-black italic tracking-widest ${l.color}`}
                                >
                                    {l.msg}
                                </motion.div>
                            ))}
                        </div>

                        {/* Spacer to push word down slightly */}
                        <div className="flex-grow flex items-center justify-center w-full py-10">
                            <div className="text-7xl md:text-8xl font-black text-white tracking-tight drop-shadow-2xl uppercase relative z-10 selection:bg-rose-500">
                                {currentWord}
                            </div>
                        </div>

                        {/* Input Area */}

                        <div className="w-full max-w-lg mx-auto relative mt-4">
                            <input
                                type="text"
                                value={input}
                                onChange={handleInput}
                                autoFocus
                                className="w-full bg-slate-900 border-4 border-slate-700 focus:border-rose-500 rounded-full px-8 py-5 text-3xl font-bold text-center text-white outline-none transition-all uppercase tracking-widest placeholder:text-slate-700 shadow-inner focus:shadow-[0_0_30px_rgba(244,63,94,0.3)]"
                                placeholder="TYPE HERE..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {(gameState === 'RESULT_WIN' || gameState === 'RESULT_LOSE') && (
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center z-50">
                    <div className="text-center">
                        {gameState === 'RESULT_WIN' ? (
                            <>
                                <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                                <h1 className="text-8xl font-black text-white italic mb-4">VICTORY</h1>
                                <p className="text-yellow-400 text-2xl font-bold tracking-widest mb-8">+25 MMR</p>
                            </>
                        ) : (
                            <>
                                <Skull className="w-24 h-24 text-rose-600 mx-auto mb-6" />
                                <h1 className="text-8xl font-black text-white italic mb-4">DEFEAT</h1>
                                <p className="text-rose-500 text-2xl font-bold tracking-widest mb-8">-18 MMR</p>
                            </>
                        )}
                        <div className="flex gap-4 justify-center">
                            <button onClick={startMatchmaking} className="px-10 py-4 bg-white text-slate-900 font-black rounded-xl hover:scale-105 transition">AGAIN</button>
                            <button onClick={() => navigate('/gamification')} className="px-10 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition">LEAVE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TypingDuels;
