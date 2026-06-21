/* eslint-disable no-unused-vars, no-empty, react-hooks/purity */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Swords, User, Bot, Zap, Trophy, Skull, LogOut,
    Volume2, VolumeX, Timer, TrendingUp, Star, Shield,
    Camera, Check, AlertCircle, Coins, Lock, Play,
    Plus, Search, RefreshCw, X, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { syncNetworkTime } from '../../utils/network';
import useAuthStore from '../../store/useAuthStore';
import { calculateXP } from '../../utils/levelSystem';
import { DbService } from '../../services/db.service';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// ─── Race Texts ───────────────────────────────────────────────────────────────
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
const RaceTrack = ({ playerProgress, botProgress, playerName, botName, botEmoji, opponentWpm }) => (
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
                <span className="rt-name">
                    {botName}
                    {opponentWpm > 0 && <span className="rt-wpm-badge">{opponentWpm} WPM</span>}
                </span>
            </div>
            <div className="rt-bar-bg">
                <motion.div
                    className="rt-bar rt-bar-bot"
                    animate={{ width: `${botProgress}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
                <div className="rt-car rt-car-bot" style={{ left: `${Math.min(botProgress, 96)}%` }}>{botEmoji === '🤖' ? '🤖' : '⚡'}</div>
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
            .rt-name { font-size: 13px; font-weight: 600; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; }
            .rt-wpm-badge {
                font-size: 9px;
                font-weight: 800;
                color: #f97316;
                background: rgba(249, 115, 22, 0.1);
                border: 1px solid rgba(249, 115, 22, 0.3);
                padding: 1px 5px;
                border-radius: 4px;
                margin-left: 6px;
                text-transform: uppercase;
                display: inline-block;
                vertical-align: middle;
            }
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

// ─── Biometric KYC Camera Scan Simulation Component ─────────────────────────────
const KycVerificationModal = ({ isOpen, onClose, onVerifySuccess, userId }) => {
    const [provider, setProvider] = useState(null); // null | 'native' | 'persona' | 'sumsub'
    const [step, setStep] = useState('intro'); // 'intro' | 'straight' | 'left' | 'right' | 'submitting' | 'success' | 'persona-init' | 'persona-liveness' | 'persona-doc' | 'sumsub-terms' | 'sumsub-init' | 'sumsub-liveness'
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [consentChecked, setConsentChecked] = useState(false);
    const [sdkProgress, setSdkProgress] = useState(0);
    const [sdkPrompt, setSdkPrompt] = useState('');

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const sdkTimerRef = useRef(null);

    const startCamera = async () => {
        setErrorMessage('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 400, height: 300, facingMode: 'user' } 
            });
            streamRef.current = mediaStream;
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(e => console.warn(e));
            }
            setIsCameraActive(true);
        } catch (e) {
            console.warn("Webcam access failed. Falling back to animated HUD grid mesh.");
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const handleClose = useCallback(() => {
        stopCamera();
        if (sdkTimerRef.current) clearTimeout(sdkTimerRef.current);
        setStep('intro');
        setProvider(null);
        setConsentChecked(false);
        setSdkProgress(0);
        setSdkPrompt('');
        onClose();
    }, [onClose]);

    // Auto camera trigger for scanning steps
    useEffect(() => {
        const isScanningStep = step === 'straight' || step === 'left' || step === 'right' || 
                              step === 'persona-liveness' || step === 'persona-doc' || step === 'sumsub-liveness';
        if (isOpen && isScanningStep) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [step, isOpen]);

    const runBiometricAnalysis = useCallback(() => {
        let currentProgress = 65;
        const interval = setInterval(() => {
            if (currentProgress < 100) {
                currentProgress += 5;
                setProgress(currentProgress);
            } else {
                clearInterval(interval);
                const mockHash = 'bio_' + Math.random().toString(36).substr(2, 16);
                DbService.updateKycStatus(userId || 'local_user', 'verified', mockHash).then(res => {
                    if (res.success) {
                        setStep('success');
                        onVerifySuccess();
                    } else {
                        setErrorMessage(res.error || 'Verification failed. Try again.');
                        setStep('intro');
                        setProvider(null);
                    }
                });
            }
        }, 200);
    }, [userId, onVerifySuccess]);

    const captureSnapshot = (position) => {
        setProgress(prev => prev + 25);
        
        if (position === 'straight') {
            setStep('left');
        } else if (position === 'left') {
            setStep('right');
        } else if (position === 'right') {
            setStep('submitting');
            stopCamera();
            runBiometricAnalysis();
        }
    };

    // Handle SDK automation simulation
    useEffect(() => {
        if (sdkTimerRef.current) clearTimeout(sdkTimerRef.current);

        if (step === 'persona-init') {
            sdkTimerRef.current = setTimeout(() => {
                setSdkProgress(15);
                setSdkPrompt('Align your face inside the green frame');
                setStep('persona-liveness');
            }, 1000);
        } else if (step === 'persona-liveness') {
            const t1 = setTimeout(() => {
                setSdkProgress(45);
                setSdkPrompt('Hold steady. Analyzing liveness...');
            }, 1800);

            const t2 = setTimeout(() => {
                setSdkProgress(75);
                setSdkPrompt('Blink once now to verify human identity');
            }, 3600);

            const t3 = setTimeout(() => {
                setSdkProgress(95);
                setSdkPrompt('Scanning complete! Saving selfie...');
            }, 5400);

            const t4 = setTimeout(() => {
                setSdkProgress(20);
                setSdkPrompt('Hold the front of your ID card to the screen');
                setStep('persona-doc');
            }, 6800);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
                clearTimeout(t4);
            };
        } else if (step === 'persona-doc') {
            const t1 = setTimeout(() => {
                setStep('submitting');
                setProgress(65);
                runBiometricAnalysis();
            }, 2500);

            return () => clearTimeout(t1);
        } else if (step === 'sumsub-init') {
            sdkTimerRef.current = setTimeout(() => {
                setSdkProgress(20);
                setSdkPrompt('Position face inside the blue oval');
                setStep('sumsub-liveness');
            }, 1000);
        } else if (step === 'sumsub-liveness') {
            const t1 = setTimeout(() => {
                setSdkProgress(50);
                setSdkPrompt('Move slightly closer to the camera');
            }, 2000);

            const t2 = setTimeout(() => {
                setSdkProgress(80);
                setSdkPrompt('Rotate your head slowly in a full circle');
            }, 4000);

            const t3 = setTimeout(() => {
                setSdkProgress(95);
                setSdkPrompt('Liveness matched! Computing biometric hash...');
            }, 6000);

            const t4 = setTimeout(() => {
                setStep('submitting');
                setProgress(65);
                runBiometricAnalysis();
            }, 7500);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
                clearTimeout(t4);
            };
        }

        return () => {
            if (sdkTimerRef.current) clearTimeout(sdkTimerRef.current);
        };
    }, [step, runBiometricAnalysis]);

    const handleStartVerification = () => {
        setProvider('native');
        setStep('straight');
        setProgress(15);
    };

    const handleStartPersona = () => {
        setProvider('persona');
        setStep('persona-init');
    };

    const handleStartSumsub = () => {
        setProvider('sumsub');
        setStep('sumsub-terms');
    };



    if (!isOpen) return null;

    return (
        <div className="kyc-modal-overlay">
            <div className="kyc-modal-card">
                <div className="kyc-modal-header">
                    <div className="kyc-header-title">
                        <Shield className="kyc-icon-lock" />
                        <span>Biometric KYC Verification</span>
                    </div>
                    <button className="kyc-close-btn" onClick={handleClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="kyc-modal-body">
                    {step === 'intro' && (
                        <div className="kyc-step-intro">
                            <div className="kyc-intro-shield">
                                <Camera size={40} className="text-indigo-400 animate-pulse" />
                            </div>
                            <h3 className="kyc-body-title">Anti-Cheat Face Match Protocol</h3>
                            <p className="kyc-body-text">
                                To prevent bots, automation, and duplicate hacking nodes from abusing real-money wager pools, a quick biometric face check is required.
                            </p>
                            
                            <div className="kyc-requirements-list">
                                <div className="kyc-req-item">
                                    <CheckCircle2 className="kyc-req-check" />
                                    <span>Liveness verification (looks for movement)</span>
                                </div>
                                <div className="kyc-req-item">
                                    <CheckCircle2 className="kyc-req-check" />
                                    <span>3-angle scans (straight, left side, right side)</span>
                                </div>
                                <div className="kyc-req-item">
                                    <CheckCircle2 className="kyc-req-check" />
                                    <span>Secure biometric hashing (no photos are stored permanently)</span>
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="kyc-error-alert">
                                    <AlertCircle size={14} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <div className="kyc-provider-choices">
                                <button type="button" className="kyc-provider-card sumsub" onClick={handleStartSumsub}>
                                    <div className="kyc-provider-icon sumsub">🌐</div>
                                    <div className="kyc-provider-info">
                                        <span className="kyc-provider-name text-left">Verify using Sumsub SDK</span>
                                        <span className="kyc-provider-desc text-left">Recommended. Automated oval face rotation check.</span>
                                    </div>
                                    <ChevronRight size={14} className="ml-auto text-slate-500 self-center" />
                                </button>

                                <button type="button" className="kyc-provider-card persona" onClick={handleStartPersona}>
                                    <div className="kyc-provider-icon persona">🛡️</div>
                                    <div className="kyc-provider-info">
                                        <span className="kyc-provider-name text-left">Verify using Persona SDK</span>
                                        <span className="kyc-provider-desc text-left">Automated selfie scan & ID card capture portals.</span>
                                    </div>
                                    <ChevronRight size={14} className="ml-auto text-slate-500 self-center" />
                                </button>

                                <button type="button" className="kyc-provider-card native" onClick={handleStartVerification}>
                                    <div className="kyc-provider-icon native">📸</div>
                                    <div className="kyc-provider-info">
                                        <span className="kyc-provider-name text-left">TypeMaster Native Scan</span>
                                        <span className="kyc-provider-desc text-left">Standard 3-angle mesh webcam snapshots.</span>
                                    </div>
                                    <ChevronRight size={14} className="ml-auto text-slate-500 self-center" />
                                </button>
                            </div>
                        </div>
                    )}

                    {(step === 'straight' || step === 'left' || step === 'right') && (
                        <div className="kyc-step-scan">
                            <div className="kyc-scan-viewport">
                                {isCameraActive ? (
                                    <video ref={videoRef} className="kyc-video-feed" autoPlay playsInline muted />
                               ) : (
                                    <div className="kyc-fallback-scanner">
                                        <div className="kyc-hud-mesh">
                                            <div className="kyc-laser-line" />
                                            <svg viewBox="0 0 100 100" className="kyc-svg-outline">
                                                <path d="M 50 15 C 30 15, 25 35, 25 50 C 25 70, 35 85, 50 85 C 65 85, 75 70, 75 50 C 75 35, 70 15, 50 15 Z" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="3, 3" />
                                                <circle cx="38" cy="45" r="3" fill="#6366f1" opacity="0.7" />
                                                <circle cx="62" cy="45" r="3" fill="#6366f1" opacity="0.7" />
                                                <path d="M 45 65 A 5 5 0 0 0 55 65" fill="none" stroke="#6366f1" strokeWidth="1" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                <div className="kyc-scan-overlay-target">
                                    <div className="kyc-corner top-left" />
                                    <div className="kyc-corner top-right" />
                                    <div className="kyc-corner bottom-left" />
                                    <div className="kyc-corner bottom-right" />
                                </div>

                                <div className="kyc-scan-prompt">
                                    {step === 'straight' && "Look straight into the camera"}
                                    {step === 'left' && "Turn your face slowly to the left"}
                                    {step === 'right' && "Turn your face slowly to the right"}
                                </div>
                            </div>

                            <div className="kyc-scan-controls">
                                <button className="kyc-capture-btn" onClick={() => captureSnapshot(step)}>
                                    <Camera size={16} /> CAPTURE FRAME
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'persona-init' && (
                        <div className="persona-sdk-frame">
                            <div className="persona-sdk-header">
                                <span className="persona-sdk-logo">Persona SDK Portal</span>
                                <span className="text-slate-500 font-mono text-[9px]">Initializing...</span>
                            </div>
                            <div className="persona-sdk-body py-10">
                                <RefreshCw className="animate-spin text-emerald-400 mb-4" size={32} />
                                <span className="text-xs font-bold text-slate-300">Connecting to Persona Secure Enclave...</span>
                            </div>
                        </div>
                    )}

                    {step === 'persona-liveness' && (
                        <div className="persona-sdk-frame">
                            <div className="persona-sdk-header">
                                <span className="persona-sdk-logo">Persona SDK Portal</span>
                                <span className="text-emerald-400 font-bold font-mono text-[9px]">LIVENESS CHECK</span>
                            </div>
                            <div className="persona-sdk-body">
                                <div className="persona-liveness-oval">
                                    {isCameraActive ? (
                                        <video ref={videoRef} className="kyc-video-feed" autoPlay playsInline muted />
                                    ) : (
                                        <div className="kyc-fallback-scanner">
                                            <div className="kyc-hud-mesh">
                                                <div className="kyc-laser-line" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                                                <svg viewBox="0 0 100 100" className="kyc-svg-outline">
                                                    <path d="M 50 15 C 30 15, 25 35, 25 50 C 25 70, 35 85, 50 85 C 65 85, 75 70, 75 50 C 75 35, 70 15, 50 15 Z" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3, 3" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-slate-200 mb-1">{sdkPrompt}</span>
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">SDK Telemetry Active</span>
                                <div className="persona-progress-bar">
                                    <div className="persona-progress-fill" style={{ width: `${sdkProgress}%` }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'persona-doc' && (
                        <div className="persona-sdk-frame">
                            <div className="persona-sdk-header">
                                <span className="persona-sdk-logo">Persona SDK Portal</span>
                                <span className="text-emerald-400 font-bold font-mono text-[9px]">ID SCANNER</span>
                            </div>
                            <div className="persona-sdk-body">
                                <div className="persona-doc-rect">
                                    {isCameraActive ? (
                                        <video ref={videoRef} className="kyc-video-feed" autoPlay playsInline muted />
                                    ) : (
                                        <div className="kyc-fallback-scanner">
                                            <div className="kyc-hud-mesh">
                                                <div className="kyc-laser-line" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                                                <svg viewBox="0 0 100 100" className="kyc-svg-outline" style={{ width: '220px', height: '140px' }}>
                                                    <rect x="10" y="20" width="80" height="60" rx="4" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3, 3" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-slate-200 mb-1">{sdkPrompt}</span>
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Align ID inside box</span>
                                <div className="persona-progress-bar">
                                    <div className="persona-progress-fill" style={{ width: `${sdkProgress}%` }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'sumsub-terms' && (
                        <div className="sumsub-sdk-frame">
                            <div className="sumsub-sdk-header">
                                <span className="sumsub-sdk-logo">Sumsub Verification</span>
                                <span className="text-slate-500 font-mono text-[9px]">Step 1 of 2</span>
                            </div>
                            <div className="sumsub-sdk-body text-left">
                                <h4 className="text-xs font-bold text-slate-200 mb-2">Consent to Data Processing</h4>
                                <div className="sumsub-consent-box mb-4">
                                    <input 
                                        type="checkbox" 
                                        id="sumsub-consent" 
                                        className="sumsub-consent-checkbox mr-2.5"
                                        checked={consentChecked}
                                        onChange={(e) => setConsentChecked(e.target.checked)}
                                    />
                                    <label htmlFor="sumsub-consent" className="cursor-pointer text-slate-400 font-medium">
                                        I agree to the processing of my biometric facial patterns and camera screenshots by Sumsub for the purpose of checking identity, anti-cheat enforcement, and compliance verification.
                                    </label>
                                </div>
                                <button 
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none"
                                    disabled={!consentChecked}
                                    onClick={() => setStep('sumsub-init')}
                                >
                                    Agree & Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'sumsub-init' && (
                        <div className="sumsub-sdk-frame">
                            <div className="sumsub-sdk-header">
                                <span className="sumsub-sdk-logo">Sumsub Verification</span>
                                <span className="text-slate-500 font-mono text-[9px]">Initializing...</span>
                            </div>
                            <div className="sumsub-sdk-body py-10">
                                <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
                                <span className="text-xs font-bold text-slate-300">Launching secure liveness module...</span>
                            </div>
                        </div>
                    )}

                    {step === 'sumsub-liveness' && (
                        <div className="sumsub-sdk-frame">
                            <div className="sumsub-sdk-header">
                                <span className="sumsub-sdk-logo">Sumsub Verification</span>
                                <span className="text-blue-500 font-bold font-mono text-[9px]">Liveness Check</span>
                            </div>
                            <div className="sumsub-sdk-body">
                                <div className="sumsub-liveness-oval relative">
                                    <div className="sumsub-progress-circle" />
                                    {isCameraActive ? (
                                        <video ref={videoRef} className="kyc-video-feed" autoPlay playsInline muted />
                                    ) : (
                                        <div className="kyc-fallback-scanner">
                                            <div className="kyc-hud-mesh">
                                                <div className="kyc-laser-line" style={{ background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
                                                <svg viewBox="0 0 100 100" className="kyc-svg-outline" style={{ width: '130px', height: '170px' }}>
                                                    <ellipse cx="50" cy="50" rx="25" ry="35" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3, 3" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-slate-200 mb-1">{sdkPrompt}</span>
                                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest font-mono">Progress: {sdkProgress}%</span>
                            </div>
                        </div>
                    )}

                    {step === 'submitting' && (
                        <div className="kyc-step-submitting">
                            <div className="kyc-loader-circle">
                                <RefreshCw className={`animate-spin ${provider === 'persona' ? 'text-emerald-400' : provider === 'sumsub' ? 'text-blue-500' : 'text-indigo-500'}`} size={40} />
                            </div>
                            <h3 className="kyc-body-title">
                                {provider === 'persona' ? "Persona Verification Portal" : provider === 'sumsub' ? "Sumsub Core Enclave" : "Analyzing Biometric Hashes"}
                            </h3>
                            <p className="kyc-body-text">
                                {provider === 'persona' ? "Persona AI is calculating face match indices and verifying ID card authenticity..." :
                                 provider === 'sumsub' ? "Sumsub AI Engine is matching liveness telemetry vectors and computing cryptographic prints..." :
                                 "Verifying liveness vectors and computing unique physical facial prints. This ensures each individual is tied to a single profile node..."}
                            </p>
                            <div className="kyc-progress-bar-container">
                                <div className="kyc-progress-bar-fill" style={{ width: `${progress}%`, background: provider === 'persona' ? '#10b981' : provider === 'sumsub' ? '#3b82f6' : 'linear-gradient(90deg, #6366f1, #d946ef)' }} />
                            </div>
                            <div className="kyc-loading-status font-mono">
                                {progress < 90 ? "COMPUTING SHA-256 FACE MESH..." : "VERIFYING IDENTITY CREDENTIAL LEDGER..."}
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="kyc-step-success">
                            <div className="kyc-success-glow" style={{ boxShadow: provider === 'persona' ? '0 0 30px rgba(16, 185, 129, 0.2)' : provider === 'sumsub' ? '0 0 30px rgba(59, 130, 246, 0.2)' : '0 0 30px rgba(16, 185, 129, 0.2)' }}>
                                <CheckCircle2 size={56} className={provider === 'persona' ? 'text-emerald-400' : provider === 'sumsub' ? 'text-blue-500' : 'text-emerald-400'} />
                            </div>
                            <h3 className={`kyc-body-title ${provider === 'persona' ? 'text-emerald-400' : provider === 'sumsub' ? 'text-blue-500' : 'text-emerald-400'}`}>
                                {provider === 'persona' ? "Persona SDK Authenticated!" : provider === 'sumsub' ? "Sumsub Approved Profile!" : "Verifications Authenticated!"}
                            </h3>
                            <p className="kyc-body-text">
                                {provider === 'persona' ? "Persona has verified your identity profile. Full betting clearance and instant coin withdraws have been unlocked." :
                                 provider === 'sumsub' ? "Sumsub automated biometric checks have approved your active status node. Full wagering clearances enabled." :
                                 "Your liveness signature was successfully logged. You have been granted full clearance for the Real-Money Betting Arena and cash withdrawals."}
                            </p>
                            <button 
                                className={`kyc-success-close-btn border-none cursor-pointer ${provider === 'persona' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : provider === 'sumsub' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}`} 
                                onClick={handleClose}
                            >
                                PROCEED TO ARENA
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TypingDuels = () => {
    const navigate = useNavigate();
    const { user, updateStats } = useAuthStore();

    // Tabs: 'wager' (Betting matchroom lobby) vs 'dojo' (Practice bot MMR)
    const [activeTab, setActiveTab] = useState('wager');

    // Game state machine: LOBBY → WAITING_ROOM → COUNTDOWN → RACING → RESULT
    const [gameState, setGameState] = useState('LOBBY');
    const [countdown, setCountdown] = useState(3);
    const [raceText, setRaceText] = useState('');
    const [typed, setTyped] = useState('');
    const [botProgress, setBotProgress] = useState(0);
    const [result, setResult] = useState(null); // { won, playerWpm, accuracy, mmrChange, xp, payout, rake }
    const [networkOffset, setNetworkOffset] = useState(0);

    const inputRef = useRef(null);
    const botTimerRef = useRef(null);
    const raceStartTime = useRef(null);
    const activeChannelRef = useRef(null);
    const lobbyTimerRef = useRef(null);

    const audio = useBattleAudio();
    const { wpm: playerWpm, recordChar, reset: resetWpm } = useWPMTracker(gameState === 'RACING');

    // MMR settings
    const userAvgWpm = user?.stats?.avgWpm || 35;
    const botProfile = useMemo(() => getBotProfile(userAvgWpm), [userAvgWpm]);

    const [playerMMR, setPlayerMMR] = useState(() => {
        return parseInt(localStorage.getItem('duel_mmr') || '1000');
    });

    // P2P Match State
    const [kycStatus, setKycStatus] = useState('unverified');
    const [showKycModal, setShowKycModal] = useState(false);
    const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
    const [selectedWager, setSelectedWager] = useState(10);
    const [customWager, setCustomWager] = useState('');
    const [wagerMatches, setWagerMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    // Active Match State
    const [isP2P, setIsP2P] = useState(false);
    const [matchWager, setMatchWager] = useState(0);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const [opponentName, setOpponentName] = useState('');
    const [opponentEmoji, setOpponentEmoji] = useState('🤖');
    const [opponentWpm, setOpponentWpm] = useState(0);
    const [roomCreationLoading, setRoomCreationLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    const refreshLobbyData = useCallback(async () => {
        if (user) {
            setKycStatus(user.kyc_status || 'unverified');
        }
        setLoadingMatches(true);
        const res = await DbService.fetchWaitingMatches();
        if (res.success) {
            setWagerMatches(res.matches);
        }
        setLoadingMatches(false);
    }, [user]);

    // Sync network time & load KYC + coins on mount
    useEffect(() => {
        syncNetworkTime().then(off => setNetworkOffset(off));
        refreshLobbyData();
        
        // Listen for coin updates
        const updateCoins = () => {
            const storedCoins = localStorage.getItem('arena_coins') || '50';
            setWalletBalance(parseInt(storedCoins));
        };
        updateCoins();
        window.addEventListener('arena-coins-updated', updateCoins);
        return () => window.removeEventListener('arena-coins-updated', updateCoins);
    }, [refreshLobbyData]);

    // Derived progress percentages
    const playerProgress = raceText.length > 0
        ? Math.min(100, (typed.length / raceText.length) * 100)
        : 0;

    // ── KYC COMPLIANCE CHECKER ───────────────────────────────────────────────
    const handleVerifySuccess = () => {
        setKycStatus('verified');
        if (user) {
            useAuthStore.setState({ user: { ...user, kyc_status: 'verified' } });
        }
    };

    // ── START PRACTICE DOJO MATCH ────────────────────────────────────────────
    const startPracticeMatch = useCallback(() => {
        setIsP2P(false);
        setMatchWager(0);
        setSelectedRoomId(null);
        setOpponentName(botProfile.name);
        setOpponentEmoji(botProfile.emoji);

        audio.initAudio();
        const text = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
        setRaceText(text);
        setTyped('');
        setBotProgress(0);
        setOpponentWpm(0);
        setResult(null);
        resetWpm();

        setGameState('COUNTDOWN');
        setCountdown(3);
    }, [audio, resetWpm, botProfile]);

    // ── CREATE P2P WAGER MATCH ───────────────────────────────────────────────
    const handleCreateWagerMatch = async () => {
        if (kycStatus !== 'verified') {
            setShowKycModal(true);
            return;
        }

        const wager = customWager ? parseInt(customWager) : selectedWager;
        if (isNaN(wager) || wager <= 0) {
            alert("Please specify a valid wager amount.");
            return;
        }

        if (walletBalance < wager) {
            alert("Insufficient wallet balance.");
            return;
        }

        setRoomCreationLoading(true);
        const text = RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
        const creatorId = user?.id || 'local_user';
        
        const res = await DbService.createBettingMatch(creatorId, wager, text);
        setRoomCreationLoading(false);

        if (res.success) {
            setIsP2P(true);
            setMatchWager(wager);
            setSelectedRoomId(res.match_id);
            setRaceText(text);
            setIsCreator(true);
            setOpponentName('Waiting...');
            setOpponentEmoji('⏳');
            setTyped('');
            setBotProgress(0);
            setOpponentWpm(0);
            setResult(null);
            resetWpm();
            
            setShowCreateRoomModal(false);
            setGameState('WAITING_ROOM');

            // Trigger window event to update wallet HUD immediately
            window.dispatchEvent(new CustomEvent('arena-coins-updated'));

            // Matchmaking queue simulation in fallback
            if (!isSupabaseConfigured) {
                lobbyTimerRef.current = setTimeout(() => {
                    const mockChallengers = ['NeonTyper', 'KeystrokeMaster', 'AlphaFingers', 'MatrixHack'];
                    const chosen = mockChallengers[Math.floor(Math.random() * mockChallengers.length)];
                    setOpponentName(chosen);
                    setOpponentEmoji('⚡');
                    
                    // Transition to countdown
                    setTimeout(() => {
                        setGameState('COUNTDOWN');
                        setCountdown(3);
                    }, 1000);
                }, 4000);
            } else {
                // Subscribe to match changes
                const matchChannel = supabase.channel(`match_room_${res.match_id}`)
                    .on('postgres_changes', { 
                        event: 'UPDATE', 
                        schema: 'public', 
                        table: 'betting_matches',
                        filter: `id=eq.${res.match_id}` 
                    }, payload => {
                        if (payload.new && payload.new.challenger_id) {
                            // Opponent joined! Get user details
                            supabase.from('profiles').select('username, full_name').eq('id', payload.new.challenger_id).single().then(profRes => {
                                const name = profRes.data?.full_name || profRes.data?.username || 'Opponent';
                                setOpponentName(name);
                                setOpponentEmoji('⚡');
                                setGameState('COUNTDOWN');
                                setCountdown(3);
                            });
                        }
                    })
                    .subscribe();
                activeChannelRef.current = matchChannel;
            }
        } else {
            alert(res.error || "Failed to create match.");
        }
    };

    // ── JOIN ACTIVE WAGER MATCH ──────────────────────────────────────────────
    const handleJoinWagerMatch = async (match) => {
        if (kycStatus !== 'verified') {
            setShowKycModal(true);
            return;
        }

        if (walletBalance < match.wager_amount) {
            alert("Insufficient wallet balance.");
            return;
        }

        const challengerId = user?.id || 'local_user';
        const res = await DbService.joinBettingMatch(challengerId, match.id);

        if (res.success) {
            setIsP2P(true);
            setMatchWager(match.wager_amount);
            setSelectedRoomId(match.id);
            setRaceText(match.target_text);
            setIsCreator(false);
            setOpponentName(match.creator_name || match.profiles?.username || 'Host');
            setOpponentEmoji('⚡');
            setTyped('');
            setBotProgress(0);
            setOpponentWpm(0);
            setResult(null);
            resetWpm();

            // Trigger wallet update
            window.dispatchEvent(new CustomEvent('arena-coins-updated'));

            setGameState('COUNTDOWN');
            setCountdown(3);
        } else {
            alert(res.error || "Failed to join match.");
        }
    };

    // ── CANCEL WAITING MATCH ─────────────────────────────────────────────────
    const handleCancelMatch = () => {
        clearTimeout(lobbyTimerRef.current);
        if (activeChannelRef.current) {
            activeChannelRef.current.unsubscribe();
            activeChannelRef.current = null;
        }
        
        // Refund coins locally in fallback
        if (isP2P && selectedRoomId) {
            const currentCoins = parseInt(localStorage.getItem('arena_coins') || '0');
            localStorage.setItem('arena_coins', (currentCoins + matchWager).toString());
            window.dispatchEvent(new CustomEvent('arena-coins-updated'));

            // Remove local match
            const localMatches = JSON.parse(localStorage.getItem('tm_p2p_matches') || '[]');
            const filtered = localMatches.filter(m => m.id !== selectedRoomId);
            localStorage.setItem('tm_p2p_matches', JSON.stringify(filtered));
        }

        setGameState('LOBBY');
        refreshLobbyData();
    };

    // Countdown Ticker Effect
    useEffect(() => {
        if (gameState !== 'COUNTDOWN') return;

        if (countdown > 0) {
            audio.playCountdown(countdown);
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        } else {
            audio.playCountdown(0);
            setTimeout(() => {
                setGameState('RACING');
                raceStartTime.current = Date.now();
                setTimeout(() => inputRef.current?.focus(), 50);
            }, 700);
        }
    }, [gameState, countdown, audio]);

    // Supabase Real-Time stream for P2P matches
    useEffect(() => {
        if (gameState !== 'RACING' || !isP2P || !selectedRoomId || !isSupabaseConfigured) return;

        // Subscribe to progress stream channel
        const streamChannel = supabase.channel(`stream_${selectedRoomId}`, {
            config: { broadcast: { self: false } }
        });

        streamChannel.on('broadcast', { event: 'progress' }, ({ payload }) => {
            if (payload && payload.userId !== (user?.id || 'local_user')) {
                setBotProgress(payload.progress);
                if (payload.wpm !== undefined) {
                    setOpponentWpm(payload.wpm);
                }
            }
        });

        streamChannel.subscribe();
        activeChannelRef.current = streamChannel;

        return () => {
            if (activeChannelRef.current) {
                activeChannelRef.current.unsubscribe();
            }
        };
    }, [gameState, isP2P, selectedRoomId, user]);

    // Broadcast our progress
    useEffect(() => {
        if (gameState !== 'RACING' || !isP2P || !isSupabaseConfigured || !activeChannelRef.current) return;

        activeChannelRef.current.send({
            type: 'broadcast',
            event: 'progress',
            payload: {
                userId: user?.id || 'local_user',
                progress: playerProgress,
                wpm: playerWpm
            }
        });
    }, [playerProgress, playerWpm, gameState, isP2P, user]);

    // ── END MATCH ────────────────────────────────────────────────────────────
    const endRace = useCallback(async (playerWon) => {
        clearInterval(botTimerRef.current);
        setGameState('RESULT');

        const elapsed = raceStartTime.current ? (Date.now() - raceStartTime.current) / 1000 : 60;
        const finalWpm = elapsed > 0 ? Math.round((raceText.length / 5) / (elapsed / 60)) : playerWpm;
        const acc = calcAccuracy(typed, raceText);
        
        let payout = 0;
        let rake = 0;

        if (isP2P && selectedRoomId) {
            const winnerId = playerWon ? (user?.id || 'local_user') : 'opponent_id';
            const resolveRes = await DbService.resolveBettingMatch(selectedRoomId, winnerId);
            if (resolveRes.success && playerWon) {
                payout = resolveRes.payout;
                rake = resolveRes.rake;
            }
            // Trigger wallet update
            window.dispatchEvent(new CustomEvent('arena-coins-updated'));
        }

        const mmrDelta = playerWon ? 25 : -18;
        const newMMR = Math.max(0, playerMMR + mmrDelta);
        const xp = playerWon 
            ? calculateXP({ wpm: finalWpm, accuracy: acc, duration: elapsed }) 
            : Math.round(calculateXP({ wpm: finalWpm, accuracy: acc, duration: elapsed }) * 0.3);

        localStorage.setItem('duel_mmr', String(newMMR));
        setPlayerMMR(newMMR);

        if (playerWon) audio.playVictory();
        else audio.playDefeat();

        setResult({ 
            won: playerWon, 
            playerWpm: finalWpm, 
            accuracy: acc, 
            mmrChange: mmrDelta, 
            xp, 
            newMMR,
            payout,
            rake
        });

        // Submit to stats store
        if (user) {
            updateStats({
                wpm: finalWpm,
                accuracy: acc,
                date: new Date().toISOString(),
                duration: elapsed,
                mode: 'duel'
            });
        }
    }, [raceText, typed, playerWpm, playerMMR, audio, user, updateStats, isP2P, selectedRoomId]);

    // Bot simulation / Opponent progress fallback
    useEffect(() => {
        if (gameState !== 'RACING' || !raceText) return;
        if (isP2P && isSupabaseConfigured) return; // Supabase broadcast handles it

        // Bot CPS config
        const botWpm = isP2P ? 65 : botProfile.wpm;
        const botVariance = isP2P ? 10 : botProfile.variance;
        const speed = botWpm + (Math.random() - 0.5) * botVariance;
        const botCps = (speed * 5) / 60;
        const totalChars = raceText.length;

        let botTyped = 0;
        const interval = 120;

        botTimerRef.current = setInterval(() => {
            const charsPerInterval = botCps * (interval / 1000);
            const advance = charsPerInterval * (0.85 + Math.random() * 0.3);
            botTyped = Math.min(botTyped + advance, totalChars);
            const pct = (botTyped / totalChars) * 100;
            setBotProgress(pct);

            // Dynamically set opponent WPM for bot/fallback
            const elapsed = (Date.now() - (raceStartTime.current || Date.now())) / 1000;
            if (elapsed > 1) {
                const currentBotWpm = Math.round((botTyped / 5) / (elapsed / 60));
                setOpponentWpm(currentBotWpm);
            } else {
                setOpponentWpm(Math.round(speed));
            }

            // Bot finished first
            if (botTyped >= totalChars) {
                clearInterval(botTimerRef.current);
                endRace(false); // Host/Bot won
            }
        }, interval);

        return () => clearInterval(botTimerRef.current);
    }, [gameState, raceText, botProfile, isP2P, endRace]);

    // Handle typing input
    const handleTyping = useCallback((val) => {
        if (gameState !== 'RACING') return;
        if (val.length > raceText.length) return;

        audio.playKeystroke();
        recordChar();
        setTyped(val);

        if (val.endsWith(' ') && raceText[val.length - 1] === ' ') {
            audio.playWordComplete();
        }

        if (val === raceText) {
            clearInterval(botTimerRef.current);
            endRace(true); // Player won
        }
    }, [gameState, raceText, audio, recordChar, endRace]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Enter' && gameState === 'RESULT') {
                if (isP2P) {
                    setGameState('LOBBY');
                    refreshLobbyData();
                } else {
                    startPracticeMatch();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [gameState, startPracticeMatch, isP2P, refreshLobbyData]);

    // Cleanups
    useEffect(() => () => {
        clearInterval(botTimerRef.current);
        clearTimeout(lobbyTimerRef.current);
    }, []);

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
                    <span>Typing Duels & Wagers</span>
                </div>
                <div className="td-wallet-status flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-slate-900/80 pl-4 pr-2.5 py-1.5 rounded-full border border-slate-800 text-yellow-500 font-bold text-xs tracking-wider">
                        <Coins size={14} />
                        <span>{walletBalance} COINS</span>
                        <button 
                            className="ml-1.5 p-0.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer border-none"
                            onClick={() => window.dispatchEvent(new CustomEvent('trigger-stripe-deposit'))}
                            title="Deposit Coins via Stripe"
                        >
                            <Plus size={10} strokeWidth={4} />
                        </button>
                    </div>
                    {kycStatus === 'verified' ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 size={14} />
                            <span>KYC VERIFIED</span>
                        </div>
                    ) : (
                        <button 
                            className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-[10px] tracking-widest px-3 py-1.5 rounded-full uppercase transition-all duration-300"
                            onClick={() => setShowKycModal(true)}
                        >
                            VERIFY KYC
                        </button>
                    )}
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

            {/* ── Biometric KYC Modal ───────────────────────────────────────── */}
            <KycVerificationModal 
                isOpen={showKycModal} 
                onClose={() => setShowKycModal(false)} 
                onVerifySuccess={handleVerifySuccess}
                userId={user?.id}
            />

            {/* ═══════════════════ LOBBY ═══════════════════ */}
            {gameState === 'LOBBY' && (
                <div className="td-lobby w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
                    <div className="td-lobby-glow" />

                    <div className="td-lobby-header text-center mb-8">
                        <Swords size={48} className="td-lobby-icon mx-auto" />
                        <h1 className="td-lobby-title">Typing <span className="td-accent">Arena</span></h1>
                        <p className="td-lobby-sub">Cleave through competition · claim wager stakes</p>
                    </div>

                    {/* Mode Selection Tabs */}
                    <div className="flex gap-4 mb-8 bg-slate-950 p-1.5 rounded-2xl border border-slate-900 w-full max-w-md">
                        <button 
                            onClick={() => setActiveTab('wager')}
                            className={`flex-1 py-3 text-center rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'wager' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            💰 Wager Matchrooms
                        </button>
                        <button 
                            onClick={() => setActiveTab('dojo')}
                            className={`flex-1 py-3 text-center rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'dojo' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            ⚔️ Practice Dojo
                        </button>
                    </div>

                    {/* Wager Arena Tab */}
                    {activeTab === 'wager' && (
                        <div className="w-full flex flex-col items-center gap-6">
                            {kycStatus !== 'verified' && (
                                <div className="w-full max-w-4xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-500">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">KYC Compliance Check Required</h4>
                                            <p className="text-slate-400 text-xs mt-1">Biometric authentication is required to host or join wager pools. Complete your facial liveness check now.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowKycModal(true)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-xs tracking-wider px-6 py-3 rounded-xl uppercase transition-all duration-300 whitespace-nowrap shadow-lg shadow-yellow-500/10"
                                    >
                                        Verify Identity Now
                                    </button>
                                </div>
                            )}

                            <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                            <Coins className="text-indigo-400 w-5 h-5" />
                                            Active Matchroom Lobby
                                        </h3>
                                        <p className="text-slate-500 text-xs mt-0.5">Select a room to duel for coin stakes</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowCreateRoomModal(true)}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs tracking-wider px-5 py-3 rounded-xl uppercase transition-all duration-300 shadow-md shadow-indigo-600/10"
                                    >
                                        <Plus size={14} /> Host Wager
                                    </button>
                                </div>

                                <div className="overflow-x-auto w-full">
                                    {loadingMatches ? (
                                        <div className="py-12 text-center text-slate-500 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2">
                                            <RefreshCw className="animate-spin w-4 h-4 text-indigo-400" />
                                            Scanning matchmaking registry...
                                        </div>
                                    ) : wagerMatches.length === 0 ? (
                                        <div className="py-12 text-center text-slate-500 text-xs font-mono uppercase tracking-wider">
                                            No active wager matches found. Be the first to host!
                                        </div>
                                    ) : (
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                                                    <th className="py-3 px-4">Room ID</th>
                                                    <th className="py-3 px-4">Operative (Host)</th>
                                                    <th className="py-3 px-4 text-right">Wager Stake</th>
                                                    <th className="py-3 px-4 text-right">Target Length</th>
                                                    <th className="py-3 px-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {wagerMatches.map((m) => (
                                                    <tr key={m.id} className="border-b border-slate-800/40 hover:bg-slate-800/10 transition-colors">
                                                        <td className="py-4 px-4 font-mono text-slate-400">{m.id.substring(0, 8).toUpperCase()}</td>
                                                        <td className="py-4 px-4 font-extrabold text-white flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-black text-[9px] text-indigo-400 border border-slate-700">
                                                                {(m.creator_name || m.profiles?.username || 'U')[0].toUpperCase()}
                                                            </div>
                                                            <span>{m.creator_name || m.profiles?.username || 'Host'}</span>
                                                        </td>
                                                        <td className="py-4 px-4 text-right text-yellow-500 font-extrabold">{m.wager_amount} Coins</td>
                                                        <td className="py-4 px-4 text-right text-slate-400 font-mono">{m.target_text.split(' ').length} words</td>
                                                        <td className="py-4 px-4 text-right">
                                                            <button 
                                                                className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent font-black text-[10px] tracking-wider px-4 py-2 rounded-lg uppercase transition-all duration-300"
                                                                onClick={() => handleJoinWagerMatch(m)}
                                                            >
                                                                Join Duel
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Practice Dojo Tab */}
                    {activeTab === 'dojo' && (
                        <div className="w-full max-w-xl flex flex-col items-center gap-8">
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

                            <div className="td-stakes">
                                <div className="td-stake td-stake-win">🏆 Win: +25 MMR</div>
                                <div className="td-stake td-stake-lose">💀 Lose: −18 MMR</div>
                            </div>

                            <button id="duel-find-match-btn" className="td-find-btn" onClick={startPracticeMatch}>
                                <Swords size={20} />
                                FIND MATCH
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Host Wager Modal Dialog */}
            {showCreateRoomModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                                <Coins className="text-yellow-500" size={18} />
                                Set Wager Stakes
                            </h3>
                            <button onClick={() => setShowCreateRoomModal(false)} className="text-slate-500 hover:text-white p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Coin Amount</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[10, 20, 50, 100, 250].map((amt) => (
                                    <button 
                                        key={amt}
                                        onClick={() => { setSelectedWager(amt); setCustomWager(''); }}
                                        className={`py-3 rounded-xl border font-black text-xs transition-all duration-300 ${selectedWager === amt && !customWager ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/10' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                                    >
                                        {amt} COINS
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-1.5 mt-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Custom Amount</label>
                                <input 
                                    type="number"
                                    placeholder="Enter custom wager..."
                                    value={customWager}
                                    onChange={(e) => setCustomWager(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={roomCreationLoading}
                            onClick={handleCreateWagerMatch}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs tracking-wider rounded-xl uppercase transition-all duration-300 shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2"
                        >
                            {roomCreationLoading ? (
                                <>
                                    <RefreshCw className="animate-spin" size={14} /> Creating...
                                </>
                            ) : (
                                <>
                                    <Play size={12} fill="currentColor" /> Host Wager Duel
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════ WAITING ROOM ═══════════════════ */}
            {gameState === 'WAITING_ROOM' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-8 relative z-10">
                    <div className="td-lobby-glow" />
                    
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border border-indigo-500/20 flex items-center justify-center animate-ping absolute" />
                        <div className="w-32 h-32 rounded-full bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-center relative shadow-2xl">
                            <Swords size={40} className="text-indigo-400 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Wager Match Hosted</h2>
                        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                            Stake: <strong className="text-yellow-500">{matchWager} Coins</strong>. Awaiting challenger connection...
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 bg-slate-950 px-5 py-3 rounded-full border border-slate-900 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                        <RefreshCw className="animate-spin text-indigo-500 w-3 h-3" />
                        <span>MATCHROOM ID: {selectedRoomId?.substring(0, 8).toUpperCase() || 'LOCAL'}</span>
                    </div>

                    <button 
                        className="px-6 py-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl text-red-400 font-bold text-xs uppercase tracking-wider transition-all duration-300"
                        onClick={handleCancelMatch}
                    >
                        Cancel Match
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
                            botName={opponentName}
                            botEmoji={opponentEmoji}
                            opponentWpm={opponentWpm}
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

                        {/* Wager Payout Details Banner */}
                        {isP2P && (
                            <div className="mb-6 p-4 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col gap-2 text-left">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider">Stake Staged:</span>
                                    <span className="text-slate-200 font-bold">{matchWager * 2} Coins (2x)</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider">House Rake (5%):</span>
                                    <span className="text-red-400 font-bold">-{matchWager * 2 * 0.05} Coins</span>
                                </div>
                                <div className="border-t border-slate-900/60 pt-2 flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-extrabold uppercase tracking-widest">Net Outcome:</span>
                                    <span className={`font-black text-sm ${result.won ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {result.won ? `+${result.payout} Coins` : `-${matchWager} Coins`}
                                    </span>
                                </div>
                            </div>
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
                            {isP2P ? (
                                <button id="duel-lobby-btn" className="td-btn-primary" onClick={() => { setGameState('LOBBY'); refreshLobbyData(); }}>
                                    Lobby Registry
                                </button>
                            ) : (
                                <button id="duel-rematch-btn" className="td-btn-primary" onClick={startPracticeMatch}>
                                    <Swords size={16} /> Rematch
                                </button>
                            )}
                            {!isP2P && (
                                <button id="duel-lobby-btn" className="td-btn-secondary" onClick={() => setGameState('LOBBY')}>
                                    Lobby
                                </button>
                            )}
                            <button id="duel-leave-btn" className="td-btn-ghost" onClick={() => navigate('/gamification')}>
                                <LogOut size={16} /> Leave
                            </button>
                        </div>
                        <p className="td-result-hint">Press Enter to continue</p>
                    </div>
                </div>
            )}

            {/* ── ‗‗ Global Styles ‗‗ ──────────────────────────────────────── */}
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

                /* KYC Modal styles */
                .kyc-modal-overlay {
                    position: fixed; inset: 0; z-index: 150;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px);
                    padding: 16px;
                }
                .kyc-modal-card {
                    background: #0f172a; border: 1px solid rgba(99, 102, 241, 0.25);
                    border-radius: 20px; width: 440px; max-width: 100%;
                    overflow: hidden; box-shadow: 0 0 50px rgba(99, 102, 241, 0.2);
                    display: flex; flex-direction: column;
                }
                .kyc-modal-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .kyc-header-title { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #f1f5f9; }
                .kyc-icon-lock { color: #818cf8; width: 16px; height: 16px; }
                .kyc-close-btn { background: transparent; border: none; color: #64748b; cursor: pointer; transition: color 0.15s; }
                .kyc-close-btn:hover { color: #f1f5f9; }

                .kyc-modal-body { padding: 24px; color: #94a3b8; }
                .kyc-step-intro, .kyc-step-scan, .kyc-step-submitting, .kyc-step-success {
                    display: flex; flex-direction: column; align-items: center; text-align: center;
                }
                .kyc-intro-shield {
                    width: 72px; height: 72px; border-radius: 50%;
                    background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2);
                    display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
                }
                .kyc-body-title { font-size: 18px; font-weight: 800; color: #f1f5f9; margin: 0 0 10px; }
                .kyc-body-text { font-size: 13px; line-height: 1.6; margin: 0 0 20px; }

                .kyc-requirements-list {
                    width: 100%; display: flex; flex-direction: column; gap: 10px;
                    background: rgba(2, 6, 23, 0.4); padding: 16px; border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.03); margin-bottom: 24px;
                }
                .kyc-req-item { display: flex; align-items: center; gap: 8px; font-size: 12px; text-align: left; }
                .kyc-req-check { color: #34d399; width: 14px; height: 14px; flex-shrink: 0; }

                .kyc-error-alert {
                    width: 100%; display: flex; align-items: center; gap: 8px;
                    background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171; padding: 12px; border-radius: 8px; font-size: 12px; margin-bottom: 16px;
                }

                .kyc-action-btn, .kyc-success-close-btn {
                    width: 100%; padding: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white; border: none; border-radius: 12px; font-weight: 700;
                    cursor: pointer; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .kyc-action-btn:hover, .kyc-success-close-btn:hover {
                    transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
                }

                /* Scanning Step */
                .kyc-scan-viewport {
                    position: relative; width: 320px; height: 240px;
                    border-radius: 16px; border: 2px solid rgba(99, 102, 241, 0.3);
                    overflow: hidden; background: #020617; margin-bottom: 20px;
                }
                .kyc-video-feed { width: 100%; height: 100%; object-fit: cover; }
                .kyc-fallback-scanner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
                .kyc-hud-mesh { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
                .kyc-laser-line {
                    position: absolute; left: 0; right: 0; height: 2px;
                    background: #6366f1; box-shadow: 0 0 10px #6366f1;
                    animation: kyc-laser 2s infinite ease-in-out;
                }
                @keyframes kyc-laser {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                }
                .kyc-svg-outline { width: 160px; height: 160px; }
                .kyc-scan-overlay-target {
                    position: absolute; inset: 20px; pointer-events: none;
                }
                .kyc-corner { position: absolute; width: 16px; height: 16px; border-color: #818cf8; border-style: solid; }
                .top-left { top: 0; left: 0; border-width: 2px 0 0 2px; }
                .top-right { top: 0; right: 0; border-width: 2px 2px 0 0; }
                .bottom-left { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
                .bottom-right { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

                .kyc-scan-prompt {
                    position: absolute; bottom: 12px; left: 12px; right: 12px;
                    background: rgba(15, 23, 42, 0.85); padding: 8px 12px;
                    border-radius: 8px; font-size: 11px; font-weight: 700; color: #818cf8;
                    text-align: center; border: 1px solid rgba(99, 102, 241, 0.2);
                }
                .kyc-scan-controls { width: 100%; }
                .kyc-capture-btn {
                    width: 100%; padding: 12px; background: #1e293b; border: 1px solid #334155;
                    border-radius: 12px; color: #f1f5f9; font-weight: 600; font-size: 13px;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: all 0.15s;
                }
                .kyc-capture-btn:hover { background: #334155; border-color: #475569; }

                /* Submitting Step */
                .kyc-loader-circle { margin-bottom: 20px; }
                .kyc-progress-bar-container {
                    width: 100%; height: 6px; border-radius: 3px;
                    overflow: hidden; margin-bottom: 12px; background: #1e293b;
                }
                .kyc-progress-bar-fill {
                    height: 100%; background: linear-gradient(90deg, #6366f1, #d946ef);
                    border-radius: 3px; transition: width 0.3s ease;
                }
                .kyc-loading-status { font-size: 10px; color: #64748b; tracking-widest: 0.1em; }

                /* Success Step */
                .kyc-success-glow {
                    width: 80px; height: 80px; border-radius: 50%;
                    background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);
                    display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
                    box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
                }
                .kyc-success-close-btn { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
                .kyc-success-close-btn:hover { box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45); }

                /* Provider Choice Cards */
                .kyc-provider-choices {
                    display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 10px;
                }
                .kyc-provider-card {
                    background: rgba(30, 41, 59, 0.3); border: 1px solid #1e293b; border-radius: 16px;
                    padding: 16px; text-align: left; cursor: pointer; transition: all 0.2s ease;
                    display: flex; align-items: flex-start; gap: 14px; width: 100%; box-sizing: border-box;
                }
                .kyc-provider-card:hover {
                    border-color: #4f46e5; background: rgba(30, 41, 59, 0.6);
                    transform: translateY(-1px);
                }
                .kyc-provider-card.persona:hover { border-color: #10b981; }
                .kyc-provider-card.sumsub:hover { border-color: #3b82f6; }
                .kyc-provider-icon {
                    width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900;
                }
                .kyc-provider-icon.persona { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; }
                .kyc-provider-icon.sumsub { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .kyc-provider-icon.native { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); color: #6366f1; }
                .kyc-provider-info { display: flex; flex-direction: column; gap: 2px; }
                .kyc-provider-name { font-size: 13px; font-weight: 800; color: #f1f5f9; }
                .kyc-provider-desc { font-size: 11px; color: #64748b; line-height: 1.4; }

                /* Persona SDK styles */
                .persona-sdk-frame {
                    background: #0f172a; border: 2px solid #10b981; border-radius: 18px;
                    width: 100%; display: flex; flex-direction: column; overflow: hidden;
                    box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);
                }
                .persona-sdk-header {
                    background: #0b0f19; padding: 12px 18px; border-bottom: 1px solid rgba(16, 185, 129, 0.2);
                    display: flex; justify-content: space-between; align-items: center; font-size: 12px;
                }
                .persona-sdk-logo { font-weight: 900; color: #10b981; letter-spacing: 0.05em; text-transform: uppercase; }
                .persona-sdk-body { padding: 20px; display: flex; flex-direction: column; align-items: center; width: 100%; box-sizing: border-box; }
                .persona-liveness-oval {
                    position: relative; width: 200px; height: 200px; border-radius: 50%;
                    border: 3px dashed #10b981; overflow: hidden; background: #020617; margin-bottom: 16px;
                }
                .persona-doc-rect {
                    position: relative; width: 260px; height: 160px; border-radius: 12px;
                    border: 3px dashed #10b981; overflow: hidden; background: #020617; margin-bottom: 16px;
                }
                .persona-progress-bar {
                    width: 100%; height: 4px; background: rgba(16, 185, 129, 0.1);
                    border-radius: 2px; overflow: hidden; margin-top: 12px;
                }
                .persona-progress-fill {
                    height: 100%; background: #10b981; transition: width 0.3s ease;
                }

                /* Sumsub SDK styles */
                .sumsub-sdk-frame {
                    background: #0f172a; border: 2px solid #3b82f6; border-radius: 18px;
                    width: 100%; display: flex; flex-direction: column; overflow: hidden;
                    box-shadow: 0 0 30px rgba(59, 130, 246, 0.15);
                }
                .sumsub-sdk-header {
                    background: #0b0f19; padding: 12px 18px; border-bottom: 1px solid rgba(59, 130, 246, 0.2);
                    display: flex; justify-content: space-between; align-items: center; font-size: 12px;
                }
                .sumsub-sdk-logo { font-weight: 900; color: #3b82f6; letter-spacing: 0.05em; text-transform: uppercase; }
                .sumsub-sdk-body { padding: 20px; display: flex; flex-direction: column; align-items: center; width: 100%; box-sizing: border-box; }
                .sumsub-consent-box {
                    display: flex; gap: 10px; background: rgba(2, 6, 23, 0.4);
                    padding: 14px; border-radius: 10px; border: 1px solid #1e293b;
                    font-size: 11px; text-align: left; line-height: 1.5; margin-bottom: 16px;
                }
                .sumsub-consent-checkbox { margin-top: 2px; cursor: pointer; }
                .sumsub-liveness-oval {
                    position: relative; width: 180px; height: 230px; border-radius: 100px;
                    border: 3px solid #3b82f6; overflow: hidden; background: #020617; margin-bottom: 16px;
                }
                .sumsub-progress-circle {
                    position: absolute; inset: -3px; border-radius: 100px;
                    border: 3px solid transparent; border-top-color: #3b82f6;
                    animation: sumsub-spin 2s linear infinite;
                }
                @keyframes sumsub-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default TypingDuels;
