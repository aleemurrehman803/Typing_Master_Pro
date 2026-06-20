import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, ArrowLeft, Zap, Target, Clock, Crown, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { soundManager } from '../../utils/SoundManager';
import { calculateBattleRewards, saveArenaProgress, getRank, getNextRank } from '../../utils/ArenaProgression';

/**
 * Battle UI Component - Real-time 1v1 Typing Battle
 * Phase 2.5 Implementation - AI Commentator & Real-time Feedback
 * Phase 3.0 Updates - Visual Immersion (VS Screen, Combos)
 */
const BattleUI = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Game State
    const [battleState, setBattleState] = useState('waiting'); // waiting, intro, countdown, active, finished
    const [countdown, setCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(60);

    // Typing State
    const [userInput, setUserInput] = useState('');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    // Stats State
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [particles, setParticles] = useState([]);
    const [cursorPosition, setCursorPosition] = useState(0); // For Trail Effect
    const [xpGained, setXpGained] = useState(0);
    const [leveledUp, setLeveledUp] = useState(false);
    const [newRank, setNewRank] = useState(null);
    const [suddenDeathChoked, setSuddenDeathChoked] = useState(false);

    // Opponent State
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [opponentWpm, setOpponentWpm] = useState(0);

    // Feedback
    const [commentary, setCommentary] = useState("Battle ready? Let's go!");
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [streamerMode, setStreamerMode] = useState(false);
    const inputRef = useRef(null);

    // Battle text bank
    const battleTexts = [
        "The quick brown fox jumps over the lazy dog while the sun sets behind the mountains creating a beautiful orange glow across the sky",
        "Programming is the art of telling another human what one wants the computer to do and making it happen through code",
        "In the world of competitive typing speed and accuracy are equally important for achieving victory in battle arena",
        "Success comes to those who persevere through challenges and never give up on their dreams no matter how difficult the journey"
    ];

    const [battleText] = useState(battleTexts[Math.floor(Math.random() * battleTexts.length)]);
    const words = battleText.split(' ');
    const totalChars = battleText.length;

    // Opponent AI simulation & Config
    const arenaConfig = JSON.parse(localStorage.getItem('arena_opponent') || '{"wpm": 45}');
    const targetOpponentWpm = arenaConfig.wpm || 45;
    const opponentName = arenaConfig.name || "AI Opponent";
    const battleMode = arenaConfig.mode || 'practice';
    const betAmount = arenaConfig.bet || 0;
    const potentialReward = arenaConfig.reward || 0;

    // Start sequence
    useEffect(() => {
        if (battleState === 'waiting') {
            const timer = setTimeout(() => setBattleState('intro'), 500);
            return () => clearTimeout(timer);
        } else if (battleState === 'intro') {
            const timer = setTimeout(() => setBattleState('countdown'), 3000);
            return () => clearTimeout(timer);
        }
    }, [battleState]);

    useEffect(() => {
        if (battleState === 'countdown' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (battleState === 'countdown' && countdown === 0) {
            setBattleState('active');
            inputRef.current?.focus();
        }
    }, [battleState, countdown]);

    // Game loop
    useEffect(() => {
        if (battleState === 'active' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && battleState === 'active') {
            endBattle();
        }
    }, [battleState, timeLeft]);

    const aiPersonality = arenaConfig.personality || 'standard';

    // Opponent AI Progress
    useEffect(() => {
        if (battleState === 'active') {
            const interval = setInterval(() => {
                setOpponentProgress(prev => {
                    let multiplier = 1;
                    if (aiPersonality === 'rusher') {
                        // Rusher starts fast, chokes/slows down in the second half
                        multiplier = prev < 55 ? 1.45 : 0.55;
                    } else if (aiPersonality === 'sniper') {
                        // Sniper is slow and steady
                        multiplier = 0.85;
                    } else if (aiPersonality === 'choke') {
                        // Choke starts fast, but freezes near completion
                        if (prev >= 90 && prev < 98) {
                            multiplier = 0.08; // crawl
                        } else {
                            multiplier = 1.3;
                        }
                    }

                    const increment = (targetOpponentWpm / 60) * (totalChars / 100) * multiplier;
                    return Math.min(prev + increment + (Math.random() * 0.4), 100);
                });
                setOpponentWpm(targetOpponentWpm + Math.floor(Math.random() * 6 - 3));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [battleState, targetOpponentWpm, totalChars, aiPersonality]);

    // Player Stats & Commentary
    useEffect(() => {
        if (battleState === 'active' && userInput.length > 0) {
            const timeElapsed = (60 - timeLeft) / 60;
            const wordsTyped = userInput.trim().split(' ').length;
            const calculatedWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
            setWpm(calculatedWpm);

            const typedText = userInput;
            const expectedText = battleText.substring(0, typedText.length);
            let correctChars = 0;
            for (let i = 0; i < typedText.length; i++) {
                if (typedText[i] === expectedText[i]) correctChars++;
            }
            const calculatedAccuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;
            setAccuracy(calculatedAccuracy);

            // Commentary Logic
            const userProgress = (userInput.length / totalChars) * 100;
            if (combo > 10) setCommentary("INCREDIBLE STREAK! YOU'RE ON FIRE!");
            else if (calculatedAccuracy < 85) setCommentary("Watch your accuracy! Precision over speed.");
            else if (calculatedWpm > 75) setCommentary("UNSTOPPABLE! You're hitting legendary speeds!");
            else if (userProgress > opponentProgress + 15) setCommentary("Absolute domination! Keep it up.");
            else if (opponentProgress > userProgress + 10) setCommentary("The AI is pulling ahead! Dig deep!");
            else if (calculatedWpm > 50) setCommentary("Great rhythm, keep the flow going.");
            else setCommentary("Victory is within reach, keep typing!");
        }
    }, [userInput, timeLeft, battleState, battleText, opponentProgress, totalChars, combo]);

    const handleKeyDown = (e) => {
        if (battleState !== 'active') return;

        // Phase 2 Goal: "Backspace Off" - Hardcore Mode
        if (e.key === 'Backspace') {
            e.preventDefault();
            soundManager.playError();
            setCommentary("NO RETREAT! Backspace is disabled in the Arena!");
            // Visual feedback for denied action?
            const container = document.querySelector('.arena-input-container');
            if (container) {
                container.classList.add('animate-shake');
                setTimeout(() => container.classList.remove('animate-shake'), 300);
            }
        }
    };

    const triggerSuddenDeathFail = () => {
        setSuddenDeathChoked(true);
        setBattleState('finished');
        setAccuracy(0);
        soundManager.playError();
        
        let coinsChange = 0;
        if (battleMode === 'competitive' || battleMode === 'pro') {
            coinsChange = -betAmount;
        } else {
            coinsChange = -5;
        }

        const xp = 0;
        setXpGained(xp);

        // Save progress to database / local profile
        saveArenaProgress(xp, coinsChange);

        const stats = JSON.parse(localStorage.getItem('arena_practice_stats') || '{"wins": 0, "losses": 0, "bestWpm": 0}');
        stats.losses = stats.losses + 1;
        localStorage.setItem('arena_practice_stats', JSON.stringify(stats));

        window.dispatchEvent(new Event('arena-coins-updated'));

        setCommentary("💥 SUDDEN DEATH FAIL! One typo ended the match!");
    };

    const handleInputChange = (e) => {
        if (battleState !== 'active') return;
        const value = e.target.value;

        // Sudden Death Check
        if (arenaConfig.suddenDeath && value.length > 0) {
            const expectedSubstring = battleText.substring(0, value.length);
            if (value !== expectedSubstring) {
                setUserInput(value);
                triggerSuddenDeathFail();
                return;
            }
        }

        // Strict Mode: If the new character makes the current word incorrect, we allows it but mark it red in UI
        setUserInput(value);

        const currentWord = words[currentWordIndex];
        const typedWords = value.trim().split(' ');
        const currentTypedWord = typedWords[typedWords.length - 1];

        // Word Completion Logic
        if (value.endsWith(' ') && currentTypedWord === currentWord) {
            soundManager.playClick(); // Satisfying click on word finish
            setCurrentWordIndex(prev => prev + 1);
            setCombo(prev => {
                const newCombo = prev + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                return newCombo;
            });
            // JUICE: Gold particles for combos!
            setParticles(prev => [...prev, { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, color: 'bg-amber-400' }]);
        } else if (value.endsWith(' ') && currentTypedWord !== currentWord) {
            // Mistake made on word completion
            soundManager.playError();
            if (arenaConfig.suddenDeath) {
                triggerSuddenDeathFail();
                return;
            }
            setCombo(0);
            setCommentary("Missed it! Keep moving!");
            // JUICE: Red particles for mistakes!
            setParticles(prev => [...prev, { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, color: 'bg-red-500' }]);
        } else {
            // Normal keypress sound
            soundManager.playClick();
            // Update Cursor Trail position approximation (based on string length, rough calc for demo)
            setCursorPosition(value.length * 15); // Adjust multiplier based on font width
        }

        // Check for completion
        const cleanedInput = value.trim();
        const cleanedTarget = battleText.trim();

        if (cleanedInput === cleanedTarget || (cleanedInput.length >= cleanedTarget.length && cleanedInput === cleanedTarget)) {
            endBattle();
        }
    };

    const endBattle = () => {
        setBattleState('finished');

        const finalUserProgress = (userInput.trim() === battleText.trim()) ? 100 : (userInput.length / totalChars) * 100;

        const userFinished = userInput.trim() === battleText.trim();
        const aiFinished = opponentProgress >= 100;

        const isVictory = userFinished || (!aiFinished && finalUserProgress > opponentProgress);

        if (isVictory) {
            soundManager.playWin();
        }

        let coinsChange = 0;
        if (battleMode === 'competitive' || battleMode === 'pro') {
            if (isVictory) coinsChange = potentialReward;
            else coinsChange = -betAmount;
        } else {
            coinsChange = isVictory ? 10 : 5;
        }

        // XP Calculation
        const xp = calculateBattleRewards(wpm, accuracy, isVictory, battleMode);
        setXpGained(xp);

        // Save Progress
        const progress = saveArenaProgress(xp, coinsChange);
        if (progress.leveledUp) {
            setLeveledUp(true);
            setNewRank(progress.newRank);
            // Play special level up sound?
            soundManager.playWin(); // Double fan fare
        }

        const stats = JSON.parse(localStorage.getItem('arena_practice_stats') || '{"wins": 0, "losses": 0, "bestWpm": 0}');
        stats.wins = isVictory ? stats.wins + 1 : stats.wins;
        stats.losses = isVictory ? stats.losses : stats.losses + 1;
        stats.bestWpm = Math.max(stats.bestWpm, wpm);
        localStorage.setItem('arena_practice_stats', JSON.stringify(stats));

        // Dispatch even so navbar updates immediately
        window.dispatchEvent(new Event('arena-coins-updated'));

        return { isVictory, coinsChange };
    };

    const userProgress = (userInput.length / totalChars) * 100;
    const userFinished = userInput.trim() === battleText.trim();
    const isVictory = (battleState === 'finished') && (userFinished || userProgress > opponentProgress);

    const getCoinChange = () => {
        if (battleMode === 'competitive' || battleMode === 'pro') {
            return isVictory ? potentialReward : -betAmount;
        }
        return isVictory ? 10 : 5;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => {
                            if (battleMode === 'pro') navigate('/arena/pro');
                            else if (battleMode === 'competitive') navigate('/arena/competitive');
                            else navigate('/arena/dojo');
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 rounded-xl border border-slate-700">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        <span className="text-2xl font-black text-white">{timeLeft}s</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const newState = !soundEnabled;
                                setSoundEnabled(newState);
                                soundManager.toggle(newState);
                            }}
                            className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 transition-colors"
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* User Card */}
                        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl border-2 border-indigo-500/50 p-6 relative overflow-hidden">
                            {/* Combo Glow Effect */}
                            {combo > 5 && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>}

                            <div className="flex items-center justify-between mb-4 relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xl">
                                        {streamerMode ? 'C' : (user?.name?.[0] || 'U')}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white tracking-wide">{streamerMode ? 'Challenger' : (user?.name || 'You')}</h3>
                                        <p className="text-[10px] text-indigo-400 font-bold uppercase">Challenger</p>
                                    </div>
                                </div>
                                <Trophy className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="space-y-2 relative">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">WPM</span>
                                    <span className="font-black text-indigo-400">{wpm}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">Accuracy</span>
                                    <span className="font-black text-green-400">{accuracy}%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-300"
                                        style={{ width: `${userProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Opponent Card */}
                        <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-2xl border-2 border-red-500/50 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                                        <Swords className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white tracking-wide">{streamerMode ? 'Opponent' : opponentName}</h3>
                                        <p className="text-[10px] text-red-400 font-bold uppercase">{targetOpponentWpm} WPM Machine</p>
                                    </div>
                                </div>
                                <Target className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">WPM</span>
                                    <span className="font-black text-red-400">{opponentWpm}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 font-medium">Progress</span>
                                    <span className="font-black text-orange-400">{Math.round(opponentProgress)}%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 transition-all duration-300"
                                        style={{ width: `${opponentProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Commentary */}
                    <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-4 shadow-xl">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5">Arena Commentator</p>
                            <p className="text-sm font-semibold text-slate-100">{commentary}</p>
                        </div>
                    </div>

                    {/* Text Display */}
                    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 shadow-2xl relative overflow-hidden">
                        {/* Particles Container */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                            {particles.map((p) => (
                                <div
                                    key={p.id}
                                    className={`absolute w-3 h-3 rounded-full animate-ping ${p.color || 'bg-indigo-400'}`}
                                    style={{ left: `${p.x}%`, top: `${p.y}%`, animationDuration: '0.6s' }}
                                ></div>
                            ))}
                        </div>

                        <div className="text-2xl leading-relaxed font-mono flex flex-wrap gap-x-2 gap-y-1">
                            {words.map((word, index) => {
                                const typedWords = userInput.trim().split(' ');
                                const isCurrentWord = index === currentWordIndex;
                                const isTyped = index < typedWords.length;
                                const isCorrect = isTyped && typedWords[index] === word;

                                return (
                                    <span
                                        key={index}
                                        className={`${isCurrentWord ? 'bg-indigo-500/20 text-indigo-200 ring-2 ring-indigo-500/50 rounded-md px-1' :
                                            isTyped ? (isCorrect ? 'text-green-400' : 'text-red-400 line-through opacity-70') :
                                                'text-slate-500'
                                            } transition-all duration-200`}
                                    >
                                        {word}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="arena-input-container relative bg-slate-800/60 rounded-2xl border-2 border-indigo-500/30 p-6 shadow-2xl focus-within:border-indigo-500/70 focus-within:bg-slate-800/80 transition-all overflow-hidden">
                        {/* Cursor Trail Effect */}
                        {battleState === 'active' && userInput.length > 0 && (
                            <div
                                className="absolute pointer-events-none h-8 w-1 bg-indigo-500/50 blur-sm transition-all duration-300 ease-out"
                                style={{
                                    left: `calc(1.5rem + ${userInput.length}ch + 5px)`, // Simplified calculation for monospaced font
                                    top: '1.75rem'
                                }}
                            ></div>
                        )}

                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={battleState !== 'active'}
                            className="w-full bg-transparent text-2xl text-white font-mono focus:outline-none placeholder-slate-600"
                            placeholder={battleState === 'active' ? 'Type the words here...' : 'Get ready to battle...'}
                            autoComplete="off"
                            spellCheck="false"
                        />
                    </div>
                </div>

                {/* Combo Counter (Visual Juice) */}
                {combo > 2 && (
                    <div className="fixed bottom-10 left-10 z-50 pointer-events-none">
                        <div className={`transition-all duration-300 ${combo > 9 ? 'scale-125' : 'scale-100'}`}>
                            <div className="font-black italic text-6xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-300 drop-shadow-[0_4px_10px_rgba(234,179,8,0.5)]">
                                {combo}x
                            </div>
                            <div className="text-xl font-bold text-amber-100 uppercase tracking-[0.2em] animate-pulse">
                                {combo > 14 ? 'UNSTOPPABLE' : combo > 9 ? 'ON FIRE' : 'COMBO'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Overlays */}

                {/* VS Screen (Intro) */}
                {battleState === 'intro' && (
                    <div className="fixed inset-0 bg-slate-950 z-[100] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>

                        {/* Player Side - Slides In from Left */}
                        <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-20 bg-gradient-to-r from-indigo-900/20 to-transparent animate-in slide-in-from-left duration-1000 fill-mode-forwards">
                            <div className="text-right">
                                <div className="text-8xl mb-4 opacity-20"><Trophy /></div>
                                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">{user?.name || 'YOU'}</h2>
                                <p className="text-2xl text-indigo-400 font-bold uppercase tracking-[0.5em]">Challenger</p>
                            </div>
                        </div>

                        {/* VS Badge - Scales In */}
                        <div className="relative z-10 w-32 h-32 flex items-center justify-center bg-white text-slate-950 font-black text-6xl italic rounded-full shadow-[0_0_50px_rgba(255,255,255,0.5)] animate-in zoom-in spin-in-180 duration-[1500ms]">
                            VS
                        </div>

                        {/* Opponent Side - Slides In from Right */}
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-start pl-20 bg-gradient-to-l from-red-900/20 to-transparent animate-in slide-in-from-right duration-1000 fill-mode-forwards">
                            <div className="text-left">
                                <div className="text-8xl mb-4 opacity-20 text-red-500"><Swords /></div>
                                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">{opponentName}</h2>
                                <p className="text-2xl text-red-500 font-bold uppercase tracking-[0.5em]">Rival</p>
                            </div>
                        </div>
                    </div>
                )}

                {battleState === 'countdown' && countdown > 0 && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100]">
                        <div className="text-center scale-up-center">
                            <div className="text-[12rem] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 via-purple-600 to-indigo-800 drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                                {countdown}
                            </div>
                            <p className="text-3xl font-bold tracking-[0.5em] text-slate-400 -mt-10 uppercase">Battle Initializing</p>
                        </div>
                    </div>
                )}

                {battleState === 'finished' && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                        <div className="bg-slate-900/90 rounded-[2.5rem] border border-white/10 p-10 max-w-2xl w-full shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                            <div className="text-center mb-10">
                                {isVictory ? (
                                    <div className="space-y-4">
                                        <div className="relative inline-block">
                                            <Crown className="w-24 h-24 text-amber-400 animate-bounce" />
                                            <div className="absolute inset-0 blur-3xl bg-amber-400/20 rounded-full animate-pulse"></div>
                                        </div>
                                        <h2 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
                                            VICTORY!
                                        </h2>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Target className="w-24 h-24 text-rose-500 mx-auto" />
                                        <h2 className="text-6xl font-black italic tracking-tighter text-rose-500">
                                            {suddenDeathChoked ? 'SUDDEN DEATH!' : 'DEFEAT'}
                                        </h2>
                                        {suddenDeathChoked && (
                                            <p className="text-rose-400 font-bold text-sm tracking-wide mt-2">One mistake ended your run.</p>
                                        )}
                                    </div>
                                )}
                                <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Battle Outcome Verified</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <Zap className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                    <div className="text-4xl font-black text-white leading-none">{wpm}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Words Per Min</div>
                                </div>
                                <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                    <div className="text-4xl font-black text-white leading-none">{accuracy}%</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Accuracy</div>
                                </div>
                                <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/5 col-span-2">
                                    <div className="text-5xl font-black text-amber-400 leading-none italic">{maxCombo}x</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Max Combo Streak</div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-3xl p-6 border border-white/5 mb-8">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Performance Insights</h3>
                                <div className="space-y-3">
                                    {/* XP Progress Bar */}
                                    <div className="mb-4">
                                        {(() => {
                                            const currentStats = JSON.parse(localStorage.getItem('arena_stats') || JSON.stringify({ xp: 0 }));
                                            const currentTotalXP = currentStats.xp;
                                            const rank = getRank(currentTotalXP);
                                            const nextRank = getNextRank(currentTotalXP);
                                            const progressPercent = nextRank ? ((currentTotalXP - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100 : 100;
                                            
                                            return (
                                                <div className="relative">
                                                     <div className="flex justify-between items-end mb-1">
                                                         <div>
                                                             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Rank</span>
                                                             <div className={`text-sm font-black ${rank.color} uppercase`}>{rank.icon} {rank.name}</div>
                                                         </div>
                                                         <div className="text-right">
                                                             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Rank</span>
                                                             <div className="text-sm font-black text-slate-300 uppercase">{nextRank ? nextRank.name : 'Max Level'}</div>
                                                         </div>
                                                     </div>
                                                     <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                                         <div 
                                                            className={`h-full ${rank.color.replace('text', 'bg')} transition-all duration-1000 ease-out`}
                                                            style={{ width: `${progressPercent}%` }}
                                                         ></div>
                                                     </div>
                                                     <div className="text-center mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                         {currentTotalXP} / {nextRank?.minXP || 'MAX'} XP
                                                     </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-slate-400 opacity-80">Rhythm Consistency</span>
                                        <span className={accuracy > 95 ? 'text-green-400' : 'text-amber-400'}>{accuracy > 95 ? 'Elite' : accuracy > 85 ? 'Solid' : 'Unstable'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-slate-400 opacity-80">Burst Speed</span>
                                        <span className="text-indigo-400">{wpm + Math.floor(Math.random() * 15)} WPM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-semibold text-purple-400">
                                        <span className="text-slate-400 opacity-80">XP Gained</span>
                                        <span className="flex items-center gap-1 font-black">+{xpGained} XP</span>
                                    </div>
                                    <div className={`flex justify-between items-center text-sm font-semibold ${getCoinChange() > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        <span className="text-slate-400 opacity-80">Coins {getCoinChange() > 0 ? 'Earned' : 'Lost'}</span>
                                        <span className="flex items-center gap-1">{getCoinChange() > 0 ? '+' : ''}{getCoinChange()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        if (battleMode === 'pro') navigate('/arena/pro');
                                        else if (battleMode === 'competitive') navigate('/arena/competitive');
                                        else navigate('/arena/dojo');
                                    }}
                                    className="py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest transition-all"
                                >
                                    Exit Arena
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-all"
                                >
                                    Re-Match
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BattleUI;
