/* eslint-disable no-unused-vars, no-empty, react-hooks/purity */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Swords, User, Bot, Zap, Trophy, Skull, LogOut,
    Volume2, VolumeX, Timer, TrendingUp, Star, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { syncNetworkTime, DuelPeerConnection } from '../../utils/network';
import useAuthStore from '../../store/useAuthStore';
import { calculateXP } from '../../utils/levelSystem';

// ─── Race Texts ───────────────────────────────────────────────────────────────
// Longer passages for a proper typing race feel
const RACE_TEXTS = [
    "The quick brown fox jumps over the lazy dog near the river bank where sunlight dances on the water.",
    "Programming is the art of telling another human what one wants the computer to do clearly and precisely.",
    "Technology changes how we live, work, and communicate every single day bringing the world closer together.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts in every challenge.",
    "Space exploration pushes the boundaries of human knowledge and capability beyond what we once thought possible.",
    "A well-crafted algorithm can solve problems that would otherwise take centuries of manual computation to resolve.",
    "The human brain is the most complex structure in the known universe with billions of neurons firing constantly.",
    "Consistency is the key to mastering any new skill you choose to pursue with dedication and focused practice.",
    "Innovation distinguishes between a leader and a follower in every field from science to art to engineering.",
    "Reading opens doors to new worlds and perspectives allowing us to travel through time without leaving our chair.",
];

// ─── Skill-based bot WPM profiles ────────────────────────────────────────────
const BOT_PROFILES = [
    { name: 'Rookie Bot',   mmr: 800,  wpm: 30,  variance: 5,  emoji: '🤖' },
    { name: 'Novice Bot',   mmr: 1000, wpm: 45,  variance: 8,  emoji: '🟢' },
    { name: 'Skilled Bot',  mmr: 1200, wpm: 60,  variance: 10, emoji: '⚡' },
    { name: 'Expert Bot',   mmr: 1500, wpm: 80,  variance: 12, emoji: '🔥' },
    { name: 'Master Bot',   mmr: 1800, wpm: 100, variance: 15, emoji: '💎' },
];

function getBotProfile(userWpm) {
    // Match a bot within ±15 WPM of the user
    const sorted = [...BOT_PROFILES].sort((a, b) => Math.abs(a.wpm - userWpm) - Math.abs(b.wpm - userWpm));
    return sorted[0];
}

// ─── Audio Hook ───────────────────────────────────────────────────────────────
const useBattleAudio = () => {
    const ctxRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    const initAudio = useCallback(() => {
        if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    }, []);

    const playTone = useCallback((freq, type = 'sine', duration = 0.1, vol = 0.08) => {
        if (isMuted || !ctxRef.current) return;
        try {
            const t = ctxRef.current.currentTime;
            const osc = ctxRef.current.createOscillator();
            const gain = ctxRef.current.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
            osc.connect(gain);
            gain.connect(ctxRef.current.destination);
            osc.start();
            osc.stop(t + duration);
        } catch (e) {}
    }, [isMuted]);

    const playKeystroke = useCallback(() => playTone(800, 'square', 0.04, 0.05), [playTone]);
    const playWordComplete = useCallback(() => playTone(1200, 'sine', 0.08, 0.08), [playTone]);
    const playCountdown = useCallback((n) => playTone(n === 0 ? 1600 : 880, 'triangle', 0.15, 0.12), [playTone]);
    const playVictory = useCallback(() => {
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.2, 0.12), i * 120));
    }, [playTone]);
    const playDefeat = useCallback(() => {
        [523, 440, 349].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.25, 0.1), i * 150));
    }, [playTone]);

    return { initAudio, playKeystroke, playWordComplete, playCountdown, playVictory, playDefeat, isMuted, setIsMuted };
};

// ─── WPM Calculator hook ──────────────────────────────────────────────────────
function useWPMTracker(isRacing) {
    const startTime = useRef(null);
    const charsTyped = useRef(0);
    const [wpm, setWpm] = useState(0);

    const recordChar = useCallback(() => {
        if (!startTime.current) startTime.current = Date.now();
        charsTyped.current += 1;
        const elapsed = (Date.now() - startTime.current) / 1000 / 60; // minutes
        const newWpm = elapsed > 0 ? Math.round((charsTyped.current / 5) / elapsed) : 0;
        setWpm(newWpm);
    }, []);

    const reset = useCallback(() => {
        startTime.current = null;
        charsTyped.current = 0;
        setWpm(0);
    }, []);

    return { wpm, recordChar, reset };
}

// ─── Accuracy Calculator ──────────────────────────────────────────────────────
function calcAccuracy(typed, target) {
    if (!typed.length) return 100;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === target[i]) correct++;
    }
    return Math.round((correct / typed.length) * 100);
}

// ─── Countdown Component ──────────────────────────────────────────────────────
const CountdownOverlay = ({ count }) => (
    <motion.div
        className="cd-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <AnimatePresence mode="wait">
            <motion.div
                key={count}
                className="cd-number"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                {count === 0 ? 'GO!' : count}
            </motion.div>
        </AnimatePresence>
        <style>{`
            .cd-overlay {
                position: fixed; inset: 0; z-index: 100;
                display: flex; align-items: center; justify-content: center;
                background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px);
            }
            .cd-number {
                font-size: clamp(80px, 20vw, 180px);
                font-weight: 900; color: white;
                font-family: monospace; letter-spacing: -4px;
                text-shadow: 0 0 60px rgba(99,102,241,0.8), 0 0 120px rgba(99,102,241,0.4);
            }
        `}</style>
    </motion.div>
);

// ─── Race Track Component ─────────────────────────────────────────────────────
const RaceTrack = ({ playerProgress, botProgress, playerName, botName, botEmoji }) => (
    <div className="rt-root">
        <div className="rt-lane">
            <div className="rt-label">
                <span className="rt-avatar rt-you">YOU</span>
                <span className="rt-name">{playerName}</span>
            </div>
            <div className="rt-bar-bg">
                <motion.div
                    className="rt-bar rt-bar-player"
                    animate={{ width: `${playerProgress}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                />
                <div className="rt-car rt-car-player" style={{ left: `${Math.min(playerProgress, 96)}%` }}>⌨️</div>
            </div>
            <span className="rt-pct">{Math.round(playerProgress)}%</span>
        </div>

        <div className="rt-lane">
            <div className="rt-label">
                <span className="rt-avatar rt-bot">{botEmoji}</span>
                <span className="rt-name">{botName}</span>
            </div>
            <div className="rt-bar-bg">
                <motion.div
                    className="rt-bar rt-bar-bot"
                    animate={{ width: `${botProgress}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
                <div className="rt-car rt-car-bot" style={{ left: `${Math.min(botProgress, 96)}%` }}>🤖</div>
            </div>
            <span className="rt-pct">{Math.round(botProgress)}%</span>
        </div>

        <style>{`
            .rt-root { display: flex; flex-direction: column; gap: 18px; width: 100%; }
            .rt-lane { display: grid; grid-template-columns: 160px 1fr 44px; align-items: center; gap: 12px; }
            .rt-label { display: flex; align-items: center; gap: 8px; overflow: hidden; }
            .rt-avatar {
                width: 28px; height: 28px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 10px; font-weight: 800; flex-shrink: 0;
            }
            .rt-you { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; }
            .rt-bot { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
            .rt-name { font-size: 13px; font-weight: 600; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .rt-bar-bg {
                position: relative; height: 20px;
                background: #0f172a; border-radius: 999px;
                border: 1px solid #1e293b; overflow: visible;
            }
            .rt-bar { height: 100%; border-radius: 999px; position: absolute; top: 0; left: 0; min-width: 4px; }
            .rt-bar-player { background: linear-gradient(90deg, #6366f1, #8b5cf6); box-shadow: 0 0 12px rgba(99,102,241,0.6); }
            .rt-bar-bot { background: linear-gradient(90deg, #ef4444, #f97316); box-shadow: 0 0 12px rgba(239,68,68,0.4); }
            .rt-car {
                position: absolute; top: 50%; transform: translate(-50%, -50%);
                font-size: 18px; pointer-events: none; z-index: 2;
                transition: left 0.3s ease;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            }
            .rt-pct { font-size: 12px; font-weight: 700; color: #475569; text-align: right; font-family: monospace; }
        `}</style>
    </div>
);

// ─── Typing Input Component ───────────────────────────────────────────────────
const TypingInput = React.forwardRef(({ target, typed, onChange, disabled }, ref) => {
    const chars = target.split('');
    return (
        <div className="ti-root">
            <div className="ti-display" aria-hidden="true">
                {chars.map((ch, i) => {
                    const isTyped = i < typed.length;
                    const isCorrect = isTyped && typed[i] === ch;
                    const isError = isTyped && typed[i] !== ch;
                    const isCursor = i === typed.length;
                    return (
                        <span
                            key={i}
                            className={`ti-char ${isCorrect ? 'ti-correct' : ''} ${isError ? 'ti-error' : ''} ${!isTyped && !isCursor ? 'ti-pending' : ''}`}
                        >
                            {isCursor && <span className="ti-cursor" />}
                            {ch === ' ' ? '\u00a0' : ch}
                        </span>
                    );
                })}
            </div>
            <input
                ref={ref}
                className="ti-hidden-input"
                value={typed}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                aria-label="Type here to race"
            />
            <style>{`
                .ti-root { position: relative; }
                .ti-display {
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: clamp(15px, 2.2vw, 20px);
                    line-height: 1.9;
                    color: #475569;
                    word-break: break-word;
                    letter-spacing: 0.03em;
                    user-select: none;
                    padding: 20px 24px;
                    background: #0a0f1e;
                    border: 1px solid #1e293b;
                    border-radius: 16px;
                    min-height: 100px;
                    cursor: text;
                }
                .ti-char { position: relative; }
                .ti-correct { color: #e2e8f0; }
                .ti-error { color: #f87171; text-decoration: underline; text-decoration-color: #ef4444; }
                .ti-pending { color: #334155; }
                .ti-cursor {
                    position: absolute; left: 0; top: 0.1em; bottom: 0.1em;
                    width: 2px; background: #6366f1;
                    animation: cursor-blink 0.9s step-end infinite;
                    border-radius: 1px;
                    box-shadow: 0 0 6px rgba(99,102,241,0.8);
                }
                .ti-hidden-input {
                    position: absolute; opacity: 0; pointer-events: all;
                    width: 100%; height: 100%; top: 0; left: 0;
                    cursor: text; font-size: 1px;
                }
                @keyframes cursor-blink { 0%,100%{ opacity:1 } 50%{ opacity:0 } }
            `}</style>
        </div>
    );
});
TypingInput.displayName = 'TypingInput';

// ─── Main Component ───────────────────────────────────────────────────────────
const TypingDuels = () => {
    const navigate = useNavigate();
    const { user, updateStats } = useAuthStore();

    // Game state machine: LOBBY → COUNTDOWN → RACING → RESULT
    const [gameState, setGameState] = useState('LOBBY');
    const [countdown, setCountdown] = useState(3);
    const [raceText, setRaceText] = useState('');
    const [typed, setTyped] = useState('');
    const [botProgress, setBotProgress] = useState(0);
    const [result, setResult] = useState(null); // { won, playerWpm, accuracy, mmrChange, xp }
    const [networkOffset, setNetworkOffset] = useState(0);

    const inputRef = useRef(null);
    const botTimerRef = useRef(null);
    const raceStartTime = useRef(null);

    const audio = useBattleAudio();
    const { wpm: playerWpm, recordChar, reset: resetWpm } = useWPMTracker(gameState === 'RACING');

    // Pick a bot matched to user's skill
    const userAvgWpm = user?.stats?.avgWpm || 35;
    const botProfile = useMemo(() => getBotProfile(userAvgWpm), [userAvgWpm]);

    // MMR (stored in localStorage for persistence across sessions)
    const [playerMMR, setPlayerMMR] = useState(() => {
        return parseInt(localStorage.getItem('duel_mmr') || '1000');
    });

    // NTP sync on mount
    useEffect(() => {
        syncNetworkTime().then(off => setNetworkOffset(off));
    }, []);

    // Derived progress percentages
    const playerProgress = raceText.length > 0
        ? Math.min(100, (typed.length / raceText.length) * 100)
        : 0;

    // ── START MATCH ─────────────────────────────────────────────────────────
    const startMatch = useCallback(() => {
        audio.initAudio();

        // Pick random race text
        const text = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
        setRaceText(text);
        setTyped('');
        setBotProgress(0);
        setResult(null);
        resetWpm();

        // Begin countdown
        setGameState('COUNTDOWN');
        setCountdown(3);
    }, [audio, resetWpm]);

    // Countdown ticker
    useEffect(() => {
        if (gameState !== 'COUNTDOWN') return;

        if (countdown > 0) {
            audio.playCountdown(countdown);
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        } else {
            // Count hits 0 — fire "GO!"
            audio.playCountdown(0);
            setTimeout(() => {
                setGameState('RACING');
                raceStartTime.current = Date.now();
                // Focus the hidden input
                setTimeout(() => inputRef.current?.focus(), 50);
            }, 700);
        }
    }, [gameState, countdown, audio]);

    // ── End race ─────────────────────────────────────────────────────────────
    const endRace = useCallback((playerWon) => {
        clearInterval(botTimerRef.current);
        setGameState('RESULT');

        const elapsed = raceStartTime.current ? (Date.now() - raceStartTime.current) / 1000 : 60;
        const finalWpm = elapsed > 0 ? Math.round((raceText.length / 5) / (elapsed / 60)) : playerWpm;
        const acc = calcAccuracy(typed, raceText);
        const mmrDelta = playerWon ? 25 : -18;
        const newMMR = Math.max(0, playerMMR + mmrDelta);
        const xp = playerWon ? calculateXP({ wpm: finalWpm, accuracy: acc, duration: elapsed }) : Math.round(calculateXP({ wpm: finalWpm, accuracy: acc, duration: elapsed }) * 0.3);

        localStorage.setItem('duel_mmr', String(newMMR));
        setPlayerMMR(newMMR);

        if (playerWon) audio.playVictory();
        else audio.playDefeat();

        setResult({ won: playerWon, playerWpm: finalWpm, accuracy: acc, mmrChange: mmrDelta, xp, newMMR });

        // Submit result to stats store (feeds level system)
        if (user) {
            updateStats({
                wpm: finalWpm,
                accuracy: acc,
                date: new Date().toISOString(),
                duration: elapsed,
                mode: 'duel'
            });
        }
    }, [raceText, typed, playerWpm, playerMMR, audio, user, updateStats]);

    // Bot simulation — types at its WPM with natural variance
    useEffect(() => {
        if (gameState !== 'RACING' || !raceText) return;

        // Bot chars per second (with variance)
        const botWpm = botProfile.wpm + (Math.random() - 0.5) * botProfile.variance;
        const botCps = (botWpm * 5) / 60; // chars per second
        const totalChars = raceText.length;

        let botTyped = 0;
        const interval = 120; // ms between updates

        botTimerRef.current = setInterval(() => {
            const charsPerInterval = botCps * (interval / 1000);
            // Add slight micro-variance
            const advance = charsPerInterval * (0.85 + Math.random() * 0.3);
            botTyped = Math.min(botTyped + advance, totalChars);
            const pct = (botTyped / totalChars) * 100;
            setBotProgress(pct);

            // Bot finished
            if (botTyped >= totalChars) {
                clearInterval(botTimerRef.current);
                endRace(false); // bot won
            }
        }, interval);

        return () => clearInterval(botTimerRef.current);
    }, [gameState, raceText, botProfile]);

    // ── Handle typing input ──────────────────────────────────────────────────
    const handleTyping = useCallback((val) => {
        if (gameState !== 'RACING') return;

        // Prevent typing past the text length
        if (val.length > raceText.length) return;

        audio.playKeystroke();
        recordChar();
        setTyped(val);

        // Check word completions for sound
        if (val.endsWith(' ') && raceText[val.length - 1] === ' ') {
            audio.playWordComplete();
        }

        // Player finished?
        if (val === raceText) {
            clearInterval(botTimerRef.current);
            endRace(true);
        }
    }, [gameState, raceText, audio, recordChar]);



    // ── Keyboard shortcut: Enter to restart ─────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Enter' && gameState === 'RESULT') startMatch();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [gameState, startMatch]);

    // Cleanup on unmount
    useEffect(() => () => clearInterval(botTimerRef.current), []);

    return (
        <div className="td-root" onClick={() => gameState === 'RACING' && inputRef.current?.focus()}>

            {/* ── Top Bar ──────────────────────────────────────────────────── */}
            <div className="td-topbar">
                <div className="td-mmr">
                    <Shield size={14} />
                    <span>{playerMMR} MMR</span>
                </div>
                <div className="td-brand">
                    <Swords size={18} className="td-brand-icon" />
                    <span>Typing Duels</span>
                </div>
                <div className="td-controls">
                    <button
                        id="duel-mute-btn"
                        className="td-icon-btn"
                        onClick={() => audio.setIsMuted(m => !m)}
                        title={audio.isMuted ? 'Unmute' : 'Mute'}
                    >
                        {audio.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button
                        id="duel-exit-btn"
                        className="td-icon-btn td-exit-btn"
                        onClick={() => navigate('/gamification')}
                        title="Exit"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {/* ── Countdown overlay ─────────────────────────────────────────── */}
            <AnimatePresence>
                {gameState === 'COUNTDOWN' && <CountdownOverlay count={countdown} />}
            </AnimatePresence>

            {/* ═══════════════════ LOBBY ═══════════════════ */}
            {gameState === 'LOBBY' && (
                <div className="td-lobby">
                    <div className="td-lobby-glow" />

                    <div className="td-lobby-header">
                        <Swords size={48} className="td-lobby-icon" />
                        <h1 className="td-lobby-title">Typing <span className="td-accent">Duels</span></h1>
                        <p className="td-lobby-sub">1v1 Ranked Protocol — Race to finish first</p>
                    </div>

                    {/* Player vs Bot Cards */}
                    <div className="td-matchup">
                        <div className="td-card td-card-player">
                            <div className="td-card-avatar td-card-avatar-player">
                                {user?.name?.[0]?.toUpperCase() || 'Y'}
                            </div>
                            <div className="td-card-name">{user?.name || 'You'}</div>
                            <div className="td-card-stats">
                                <span className="td-stat-pill">{userAvgWpm} WPM avg</span>
                                <span className="td-stat-pill">{playerMMR} MMR</span>
                            </div>
                        </div>

                        <div className="td-vs">VS</div>

                        <div className="td-card td-card-bot">
                            <div className="td-card-avatar td-card-avatar-bot">
                                {botProfile.emoji}
                            </div>
                            <div className="td-card-name">{botProfile.name}</div>
                            <div className="td-card-stats">
                                <span className="td-stat-pill">~{botProfile.wpm} WPM</span>
                                <span className="td-stat-pill">{botProfile.mmr} MMR</span>
                            </div>
                        </div>
                    </div>

                    {/* MMR stakes */}
                    <div className="td-stakes">
                        <div className="td-stake td-stake-win">🏆 Win: +25 MMR</div>
                        <div className="td-stake td-stake-lose">💀 Lose: −18 MMR</div>
                    </div>

                    <button id="duel-find-match-btn" className="td-find-btn" onClick={startMatch}>
                        <Swords size={20} />
                        FIND MATCH
                    </button>
                </div>
            )}

            {/* ═══════════════════ RACING ══════════════════ */}
            {gameState === 'RACING' && (
                <div className="td-race">
                    {/* Live stat row */}
                    <div className="td-race-stats">
                        <div className="td-live-stat">
                            <Zap size={14} className="td-live-icon" />
                            <span className="td-live-val">{playerWpm}</span>
                            <span className="td-live-unit">WPM</span>
                        </div>
                        <div className="td-live-stat td-live-center">
                            <Timer size={14} className="td-live-icon" />
                            <span className="td-live-val">
                                {/* eslint-disable-next-line react-hooks/purity */}
                                {Math.round((Date.now() - (raceStartTime.current || Date.now())) / 1000)}s
                            </span>
                        </div>
                        <div className="td-live-stat td-live-right">
                            <TrendingUp size={14} className="td-live-icon" />
                            <span className="td-live-val">{Math.round(playerProgress)}%</span>
                            <span className="td-live-unit">done</span>
                        </div>
                    </div>

                    {/* Race tracks */}
                    <div className="td-tracks">
                        <RaceTrack
                            playerProgress={playerProgress}
                            botProgress={botProgress}
                            playerName={user?.name || 'You'}
                            botName={botProfile.name}
                            botEmoji={botProfile.emoji}
                        />
                    </div>

                    {/* Typing area */}
                    <div className="td-input-section">
                        <TypingInput
                            ref={inputRef}
                            target={raceText}
                            typed={typed}
                            onChange={handleTyping}
                            disabled={false}
                        />
                        <p className="td-input-hint">Click anywhere to focus · Type to race</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════ RESULT ══════════════════ */}
            {gameState === 'RESULT' && result && (
                <div className="td-result">
                    <div className="td-result-card">
                        {result.won ? (
                            <>
                                <div className="td-result-icon td-result-win-icon">
                                    <Trophy size={52} />
                                </div>
                                <h2 className="td-result-title td-result-win">VICTORY!</h2>
                            </>
                        ) : (
                            <>
                                <div className="td-result-icon td-result-lose-icon">
                                    <Skull size={52} />
                                </div>
                                <h2 className="td-result-title td-result-lose">DEFEAT</h2>
                            </>
                        )}

                        {/* Stats grid */}
                        <div className="td-result-stats">
                            <div className="td-rs">
                                <div className="td-rs-val">{result.playerWpm}</div>
                                <div className="td-rs-label">WPM</div>
                            </div>
                            <div className="td-rs">
                                <div className="td-rs-val">{result.accuracy}%</div>
                                <div className="td-rs-label">Accuracy</div>
                            </div>
                            <div className="td-rs">
                                <div className={`td-rs-val ${result.mmrChange > 0 ? 'td-rs-green' : 'td-rs-red'}`}>
                                    {result.mmrChange > 0 ? '+' : ''}{result.mmrChange}
                                </div>
                                <div className="td-rs-label">MMR</div>
                            </div>
                            <div className="td-rs">
                                <div className="td-rs-val td-rs-xp">+{result.xp}</div>
                                <div className="td-rs-label">XP</div>
                            </div>
                        </div>

                        <div className="td-result-mmr">
                            <Shield size={14} /> New MMR: <strong>{result.newMMR}</strong>
                        </div>

                        <div className="td-result-btns">
                            <button id="duel-rematch-btn" className="td-btn-primary" onClick={startMatch}>
                                <Swords size={16} /> Rematch
                            </button>
                            <button id="duel-lobby-btn" className="td-btn-secondary" onClick={() => setGameState('LOBBY')}>
                                Lobby
                            </button>
                            <button id="duel-leave-btn" className="td-btn-ghost" onClick={() => navigate('/gamification')}>
                                <LogOut size={16} /> Leave
                            </button>
                        </div>
                        <p className="td-result-hint">Press Enter to rematch</p>
                    </div>
                </div>
            )}

            {/* ═══════════════ Global Styles ════════════════ */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');

                .td-root {
                    min-height: 100vh;
                    background: radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 50%, #020617 100%);
                    color: #e2e8f0;
                    font-family: 'Inter', system-ui, sans-serif;
                    display: flex; flex-direction: column;
                    position: relative; overflow: hidden;
                }

                /* Top bar */
                .td-topbar {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 14px 24px; position: relative; z-index: 10;
                    border-bottom: 1px solid rgba(99,102,241,0.1);
                    background: rgba(2,6,23,0.5); backdrop-filter: blur(12px);
                }
                .td-mmr { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #818cf8; }
                .td-brand { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }
                .td-brand-icon { color: #ef4444; }
                .td-controls { display: flex; gap: 8px; }
                .td-icon-btn {
                    width: 36px; height: 36px; border-radius: 10px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
                    color: #94a3b8; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.15s;
                }
                .td-icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }
                .td-exit-btn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #f87171; }

                /* Lobby */
                .td-lobby {
                    flex: 1; display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    padding: 40px 24px; gap: 32px; position: relative; z-index: 1;
                }
                .td-lobby-glow {
                    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
                    width: 600px; height: 400px;
                    background: radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%);
                    pointer-events: none;
                }
                .td-lobby-header { text-align: center; }
                .td-lobby-icon { color: #ef4444; margin-bottom: 12px; filter: drop-shadow(0 0 20px #ef4444); }
                .td-lobby-title { font-size: clamp(36px, 6vw, 64px); font-weight: 900; margin: 0 0 8px; letter-spacing: -1px; }
                .td-accent { background: linear-gradient(135deg, #ef4444, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .td-lobby-sub { color: #64748b; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0; }

                .td-matchup { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; justify-content: center; }
                .td-card {
                    background: rgba(15,23,42,0.8); border: 1px solid #1e293b;
                    border-radius: 20px; padding: 28px 32px;
                    display: flex; flex-direction: column; align-items: center; gap: 12px;
                    min-width: 160px; backdrop-filter: blur(8px);
                    transition: border-color 0.2s, transform 0.2s;
                }
                .td-card:hover { transform: translateY(-2px); }
                .td-card-player { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 30px rgba(99,102,241,0.1); }
                .td-card-bot { border-color: rgba(239,68,68,0.3); box-shadow: 0 0 30px rgba(239,68,68,0.08); }
                .td-card-avatar {
                    width: 60px; height: 60px; border-radius: 50%;
                    font-size: 22px; font-weight: 900;
                    display: flex; align-items: center; justify-content: center;
                }
                .td-card-avatar-player { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
                .td-card-avatar-bot { background: #1e293b; border: 2px solid #334155; }
                .td-card-name { font-weight: 700; font-size: 15px; color: #f1f5f9; }
                .td-card-stats { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
                .td-stat-pill {
                    background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
                    color: #818cf8; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
                }

                .td-vs { font-size: 28px; font-weight: 900; color: #334155; letter-spacing: 2px; }

                .td-stakes { display: flex; gap: 16px; }
                .td-stake { padding: 8px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; }
                .td-stake-win { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
                .td-stake-lose { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

                .td-find-btn {
                    display: flex; align-items: center; gap: 10px;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white; border: none; border-radius: 16px;
                    padding: 18px 48px; font-size: 20px; font-weight: 900;
                    letter-spacing: 0.05em; cursor: pointer;
                    box-shadow: 0 8px 32px rgba(239,68,68,0.4);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .td-find-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(239,68,68,0.55); }
                .td-find-btn:active { transform: translateY(0); }

                /* Racing */
                .td-race {
                    flex: 1; display: flex; flex-direction: column;
                    gap: 24px; padding: 28px 32px; max-width: 860px;
                    width: 100%; margin: 0 auto;
                }
                .td-race-stats {
                    display: grid; grid-template-columns: 1fr 1fr 1fr;
                    gap: 12px;
                }
                .td-live-stat {
                    display: flex; align-items: center; gap: 6px;
                    background: rgba(15,23,42,0.8); border: 1px solid #1e293b;
                    border-radius: 12px; padding: 12px 16px;
                }
                .td-live-center { justify-content: center; }
                .td-live-right { justify-content: flex-end; }
                .td-live-icon { color: #6366f1; flex-shrink: 0; }
                .td-live-val { font-size: 20px; font-weight: 800; color: #f1f5f9; font-family: monospace; }
                .td-live-unit { font-size: 11px; color: #64748b; text-transform: uppercase; margin-left: 2px; }

                .td-tracks {
                    background: rgba(15,23,42,0.8); border: 1px solid #1e293b;
                    border-radius: 16px; padding: 24px;
                }
                .td-input-section { display: flex; flex-direction: column; gap: 8px; }
                .td-input-hint { text-align: center; font-size: 11px; color: #334155; margin: 0; }

                /* Result */
                .td-result {
                    flex: 1; display: flex; align-items: center; justify-content: center;
                    padding: 24px;
                }
                .td-result-card {
                    background: linear-gradient(145deg, #1e1b4b, #0f172a);
                    border: 1px solid rgba(99,102,241,0.3);
                    border-radius: 24px; padding: 40px 48px;
                    text-align: center; width: min(480px, 95vw);
                    box-shadow: 0 0 60px rgba(99,102,241,0.2);
                }
                .td-result-icon { width: 90px; height: 90px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
                .td-result-win-icon { background: rgba(250,204,21,0.15); color: #fbbf24; box-shadow: 0 0 40px rgba(250,204,21,0.3); }
                .td-result-lose-icon { background: rgba(239,68,68,0.12); color: #f87171; box-shadow: 0 0 40px rgba(239,68,68,0.2); }
                .td-result-title { font-size: 42px; font-weight: 900; margin: 0 0 28px; letter-spacing: -1px; }
                .td-result-win { color: #fbbf24; text-shadow: 0 0 30px rgba(250,204,21,0.5); }
                .td-result-lose { color: #f87171; }

                .td-result-stats {
                    display: grid; grid-template-columns: repeat(4, 1fr);
                    gap: 12px; margin-bottom: 20px;
                }
                .td-rs { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px 8px; }
                .td-rs-val { font-size: 22px; font-weight: 800; color: #f1f5f9; font-family: monospace; }
                .td-rs-label { font-size: 10px; text-transform: uppercase; color: #475569; letter-spacing: 0.06em; margin-top: 4px; }
                .td-rs-green { color: #34d399 !important; }
                .td-rs-red { color: #f87171 !important; }
                .td-rs-xp { color: #818cf8 !important; }

                .td-result-mmr {
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    color: #64748b; font-size: 13px; margin-bottom: 24px;
                }
                .td-result-mmr strong { color: #818cf8; }

                .td-result-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
                .td-btn-primary {
                    display: flex; align-items: center; gap: 8px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white; border: none; border-radius: 12px;
                    padding: 12px 28px; font-size: 15px; font-weight: 700;
                    cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
                    box-shadow: 0 4px 20px rgba(99,102,241,0.4);
                }
                .td-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(99,102,241,0.6); }
                .td-btn-secondary {
                    background: #1e293b; color: #94a3b8; border: 1px solid #334155;
                    border-radius: 12px; padding: 12px 24px; font-size: 15px;
                    font-weight: 600; cursor: pointer; transition: all 0.15s;
                }
                .td-btn-secondary:hover { background: #334155; color: white; }
                .td-btn-ghost {
                    display: flex; align-items: center; gap: 6px;
                    background: transparent; color: #64748b; border: 1px solid #1e293b;
                    border-radius: 12px; padding: 12px 20px; font-size: 14px;
                    cursor: pointer; transition: all 0.15s;
                }
                .td-btn-ghost:hover { color: #f87171; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
                .td-result-hint { color: #334155; font-size: 12px; margin: 0; }
            `}</style>
        </div>
    );
};

export default TypingDuels;
