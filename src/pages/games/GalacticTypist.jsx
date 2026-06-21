/* eslint-disable react-hooks/purity */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, Trophy, Pause, Play, Volume2, VolumeX, LogOut, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WORDS = [
    "NEBULA", "GALAXY", "ASTEROID", "COMET", "PLANET", "STAR", "ORBIT", "GRAVITY", "COSMOS", "QUANTUM",
    "PHOTON", "LASER", "SHIELD", "ROCKET", "THRUST", "PLASMA", "VOID", "BLACKHOLE", "METEOR", "CONSTELLATION",
    "SUPERNOVA", "TELESCOPE", "ECLIPSE", "HORIZON", "SPACETIME", "INFINITY", "VELOCITY", "VECTOR", "MATRIX",
    "ALIEN", "MARS", "VENUS", "EARTH", "JUPITER", "SATURN", "URANUS", "NEPTUNE", "PLUTO", "SUN", "MOON",
    "CRATER", "DUST", "GAS", "ICE", "RING", "FIELD", "STATION", "BASE", "COLONY", "EMPIRE", "FEDERATION",
    "ALLIANCE", "TREK", "WAR", "PEACE", "LIGHT", "DARK", "MATTER", "ENERGY", "FORCE", "DRONE", "SHIP",
    "HULL", "CORE", "ENGINE", "WARP", "HYPER", "DRIVE", "JUMP", "GATE", "PORTAL", "WORMHOLE", "TIME",
    "DIMENSION", "UNIVERSE", "MULTIVERSE", "PARALLEL", "STRING", "THEORY", "BIGBANG", "EXPANSION", "REDSHIFT",
    "BLUESHIFT", "SPECTRUM", "RADIO", "SIGNAL", "MESSAGE", "CONTACT", "LIFE", "FORM", "UNKNOWN", "COMMAND",
    "SYSTEM", "FAIL", "ALERT", "DANGER", "WARNING", "ERROR", "ABORT", "RETRY", "CONNECT", "LINK", "NETWORK",
    "DATA", "UPLOAD", "DOWNLOAD", "SCAN", "TRACE", "TRACK", "LOCK", "FIRE", "BEAM", "RAY", "BLAST"
];

const useAudioSystem = () => {
    const audioCtxRef = useRef(null);
    const ambientNodeRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    }, []);

    const playTone = useCallback((freq, type, duration, vol = 0.1) => {
        if (isMuted || !audioCtxRef.current) return;
        try {
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (_e) { /* ignore */ }
    }, [isMuted]);

    const playLaser = () => playTone(880, 'sawtooth', 0.15, 0.05);
    const playExplosion = () => playTone(100, 'square', 0.4, 0.1);
    const playClick = () => playTone(600, 'sine', 0.05, 0.05);

    const toggleAmbient = useCallback((shouldPlay) => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        if (shouldPlay && !isMuted && !ambientNodeRef.current) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 50;
            gain.gain.value = 0.05;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            ambientNodeRef.current = { osc, gain };
        } else if ((!shouldPlay || isMuted) && ambientNodeRef.current) {
            try { ambientNodeRef.current.osc.stop(); ambientNodeRef.current.osc.disconnect(); ambientNodeRef.current = null; } catch (_e) { /* ignore */ }
        }
    }, [isMuted]);

    useEffect(() => { if (isMuted) toggleAmbient(false); }, [isMuted, toggleAmbient]);

    return { initAudio, playLaser, playExplosion, playClick, toggleAmbient, isMuted, setIsMuted };
};

const GalacticTypist = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('MENU');
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);
    const [wave, setWave] = useState(1);
    const [inputValue, setInputValue] = useState('');

    // Engine State
    const lastTimeRef = useRef(0);
    const asteroids = useRef([]);
    const particles = useRef([]);
    const frameIdRef = useRef(null);
    const spawnTimerRef = useRef(0);

    const { initAudio, playLaser, playExplosion, playClick, toggleAmbient, isMuted, setIsMuted } = useAudioSystem();

    // Start/Stop Sound
    useEffect(() => {
        gameState === 'PLAYING' ? toggleAmbient(true) : toggleAmbient(false);
        return () => toggleAmbient(false);
    }, [gameState, toggleAmbient]);

    const spawnAsteroid = useCallback(() => {
        // Difficulty scaling: Speed increases with Wave
        const baseSpeed = 0.05 + (wave * 0.01);
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];

        // Prevent duplicate words on screen
        if (asteroids.current.some(a => a.word === word)) return;

        asteroids.current.push({
            x: Math.random() * (window.innerWidth - 200) + 100,
            y: -60,
            word: word,
            speed: baseSpeed * (0.8 + Math.random() * 0.4), // Variance
            id: Math.random().toString(36),
            color: `hsl(${Math.random() * 60 + 200}, 90%, 60%)`,
            size: 30 + Math.random() * 20
        });
    }, [wave]);

    const update = useCallback(function loopFunc(time) {
        if (gameState !== 'PLAYING') return;

        // Logic: Calculate Delta Time (seconds)
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaTime = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        // Stars background (static for perf, or simple drift)
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137 + time * 0.01) % width;
            const y = (i * 243 + time * 0.02) % height;
            ctx.globalAlpha = (Math.sin(i + time * 0.002) + 1) / 2 * 0.5;
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.globalAlpha = 1;

        // Spawn Logic (Time based instead of Frame based)
        spawnTimerRef.current += deltaTime;
        // Spawn rate: Starts at 2s, decreases by 0.1s per wave, min 0.5s
        const spawnRate = Math.max(0.5, 2.0 - (wave * 0.15));

        if (spawnTimerRef.current > spawnRate) {
            spawnAsteroid();
            spawnTimerRef.current = 0;
        }

        // --- UPDATE ENTITIES ---

        // Asteroids
        for (let i = asteroids.current.length - 1; i >= 0; i--) {
            const a = asteroids.current[i];

            // Movement: Pixels per Second
            a.y += a.speed * 300 * deltaTime;

            // Hit Floor
            if (a.y > height + 50) {
                asteroids.current.splice(i, 1);
                setHealth(h => Math.max(0, h - 15)); // Harder hit
                playExplosion();
            }

            // Draw Asteroid
            ctx.shadowBlur = 15;
            ctx.shadowColor = a.color;
            ctx.fillStyle = a.color;
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Text
            ctx.font = 'bold 24px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const matched = inputValue.toUpperCase();
            const word = a.word.toUpperCase();

            // Highlight
            if (word.startsWith(matched) && matched.length > 0) {
                ctx.fillStyle = '#facc15'; // Match color
                ctx.fillText(word, a.x, a.y);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillText(word, a.x, a.y);
            }
        }

        // Particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            p.life -= deltaTime;
            p.x += p.vx * 60 * deltaTime;
            p.y += p.vy * 60 * deltaTime;

            if (p.life <= 0) {
                particles.current.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        frameIdRef.current = requestAnimationFrame(loopFunc);
    }, [gameState, wave, inputValue, spawnAsteroid, playExplosion]);

    // Loop Control
    useEffect(() => {
        if (gameState === 'PLAYING') {
            lastTimeRef.current = 0; // Reset time tracking
            frameIdRef.current = requestAnimationFrame(update);
        } else {
            cancelAnimationFrame(frameIdRef.current);
        }
        return () => cancelAnimationFrame(frameIdRef.current);
    }, [gameState, update]);

    // Cleanup Limit
    useEffect(() => {
        if (health <= 0 && gameState === 'PLAYING') {
            setGameState('GAMEOVER');
            playExplosion();
        }
    }, [health, gameState, playExplosion]);

    // Input Handler
    useEffect(() => {
        const handleKey = (e) => {
            if (gameState !== 'PLAYING') return;

            if (e.key === 'Backspace') {
                setInputValue(prev => prev.slice(0, -1));
                playClick();
                return;
            }
            if (e.key === 'Escape') {
                setGameState('PAUSED');
                playClick();
                return;
            }
            if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                playClick();
                const char = e.key.toUpperCase();
                const nextInput = inputValue + char;
                setInputValue(nextInput);
                playLaser();

                const idx = asteroids.current.findIndex(a => a.word === nextInput);
                if (idx !== -1) {
                    const dest = asteroids.current[idx];
                    playExplosion();

                    // Explosion Particles
                    for (let i = 0; i < 12; i++) {
                        particles.current.push({
                            x: dest.x, y: dest.y,
                            vx: (Math.random() - 0.5) * 8,
                            vy: (Math.random() - 0.5) * 8,
                            life: 0.5 + Math.random() * 0.5,
                            color: dest.color,
                            size: 3 + Math.random() * 3
                        });
                    }

                    asteroids.current.splice(idx, 1);
                    setScore(s => s + 100);
                    setInputValue('');

                    // Wave Progress
                    const nextScore = score + 100;
                    if (nextScore > 0 && nextScore % 1000 === 0) {
                        setWave(w => w + 1);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, inputValue, score, playLaser, playExplosion, playClick]);

    // Canvas Resize
    useEffect(() => {
        const r = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', r);
        r();
        return () => window.removeEventListener('resize', r);
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-950 font-sans select-none overflow-hidden text-white">
            {/* HUD */}
            <div className="absolute top-0 right-0 p-6 flex gap-3 z-30">
                <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-slate-800 rounded-full">{isMuted ? <VolumeX /> : <Volume2 className="text-emerald-400" />}</button>
                <button onClick={() => setGameState(g => g === 'PAUSED' ? 'PLAYING' : 'PAUSED')} className="p-3 bg-indigo-600 rounded-full">{gameState === 'PAUSED' ? <Play className="fill-current" /> : <Pause className="fill-current" />}</button>
                <button onClick={() => navigate('/gamification')} className="p-3 bg-rose-600 rounded-full"><LogOut /></button>
            </div>

            <div className="absolute top-6 left-6 z-20 flex gap-6">
                <div>
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-widest">Hull Integrity</div>
                    <div className="text-4xl font-black italic">{health}%</div>
                    <div className="h-2 w-32 bg-slate-800 rounded-full mt-1"><div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${health}%` }} /></div>
                </div>
                <div>
                    <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Score</div>
                    <div className="text-4xl font-black italic">{score}</div>
                </div>
                <div>
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Wave</div>
                    <div className="text-4xl font-black italic">{wave}</div>
                </div>
            </div>

            <canvas ref={canvasRef} className="block w-full h-full" />

            {/* Input Vis */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-slate-900/80 backdrop-blur px-10 py-4 rounded-full border border-slate-700 shadow-2xl min-w-[300px] text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Targeting Computer</div>
                    <div className="text-4xl font-mono font-black tracking-widest h-10">{inputValue}<span className="animate-pulse">_</span></div>
                </div>
            </div>

            {/* Menus */}
            <AnimatePresence>
                {(gameState === 'MENU' || gameState === 'PAUSED' || gameState === 'GAMEOVER') && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center">
                        <div className="text-center">
                            {gameState === 'GAMEOVER' ? (
                                <>
                                    <h1 className="text-8xl font-black italic text-white mb-4">M.I.A.</h1>
                                    <p className="text-2xl text-rose-400 font-bold mb-8">FINAL SCORE: {score}</p>
                                    <button onClick={() => { setGameState('PLAYING'); setScore(0); setHealth(100); setWave(1); asteroids.current = []; setInputValue(''); spawnTimerRef.current = 0; }} className="px-10 py-4 bg-white text-black font-black text-xl rounded-full hover:scale-105 transition">RE-ENGAGE</button>
                                </>
                            ) : (
                                <>
                                    <div className="inline-block p-6 bg-indigo-500/20 rounded-full mb-6 text-indigo-400"><Rocket className="w-16 h-16" /></div>
                                    <h1 className="text-7xl font-black italic text-white mb-4 tracking-tighter">GALACTIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">TYPIST</span></h1>
                                    <button onClick={() => { initAudio(); setGameState('PLAYING'); setScore(0); setHealth(100); setWave(1); asteroids.current = []; setInputValue(''); spawnTimerRef.current = 0; }} className="px-12 py-5 bg-white text-black font-black text-2xl rounded-full hover:scale-105 transition shadow-xl">
                                        {gameState === 'PAUSED' ? 'RESUME' : 'LAUNCH MISSION'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalacticTypist;
