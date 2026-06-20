import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Award, ShieldAlert, Zap, Trophy, Timer, RefreshCw, X, FileCheck, Play, ArrowLeft } from 'lucide-react';
import TypingArea from '../components/features/TypingArea';
import SEOHead from '../components/SEOHead';

const EXAM_PROFILES = [
    {
        id: 'intermediate',
        name: 'Intermediate Typing Exam',
        targetWpm: 40,
        targetAccuracy: 90,
        duration: 120, // 2 minutes
        description: 'Demonstrate competent touch typing speeds and accuracy for office tasks.',
        badge: '⚡',
        gradient: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'advanced',
        name: 'Advanced Certification Exam',
        targetWpm: 70,
        targetAccuracy: 95,
        duration: 120, // 2 minutes
        description: 'Prove professional-level typing mastery under strict execution rules.',
        badge: '🔥',
        gradient: 'from-orange-500 to-red-600'
    },
    {
        id: 'master',
        name: 'Master Typist Certification',
        targetWpm: 100,
        targetAccuracy: 98,
        duration: 180, // 3 minutes
        description: 'Elite speed typing certificate. Requires absolute focus and near-perfect execution.',
        badge: '👑',
        gradient: 'from-purple-500 to-pink-600'
    }
];

const EXAM_PARAGRAPHS = [
    "The journey of a thousand miles begins with a single step, and the journey of mastering typing is no different. Each key pressed with correct posture builds the muscle memory required for seamless speeds. Over time, the hands move effortlessly across the home row without conscious thought, allowing thoughts to flow directly onto the screen.",
    "A successful developer must possess a combination of technical knowledge and typing speed. Typing efficiency directly impacts coding productivity and communication flow. When you can type as fast as you think, typing stops being a friction point and instead becomes a native extension of your mind, allowing you to focus on resolving architectural problems.",
    "Cryptographic proof systems provide mathematical certainty in digital environments. By generating client-side nonces and utilizing hash chains, decentralized protocols prove consistency without relying on centralized validation. These integrity validation layers protect systems against malicious manipulation while maintaining absolute verification trust."
];

const Exams = () => {
    const { user, updateStats, currentLevel } = useAuthStore();
    const navigate = useNavigate();

    // Exam Engine State
    const [selectedExam, setSelectedExam] = useState(null);
    const [isExamRunning, setIsExamRunning] = useState(false);
    const [examText, setExamText] = useState('');
    const [typedText, setTypedText] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [examResult, setExamResult] = useState(null);
    const [myCertificates, setMyCertificates] = useState([]);

    // Live Metrics
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);

    // Timers & refs
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // Load user's issued certificates
    useEffect(() => {
        if (user?.id) {
            const stored = JSON.parse(localStorage.getItem('issued_certificates') || '[]');
            const filtered = stored.filter(cert => cert.userId === user.id);
            setMyCertificates(filtered);
        }
    }, [user]);

    // Warning before leaving active exam
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isExamRunning) {
                e.preventDefault();
                e.returnValue = 'Leaving the page will void your active exam attempt!';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isExamRunning]);

    // WPM and Accuracy calculator
    const updateMetrics = useCallback((currentTyped) => {
        if (!startTimeRef.current) return;
        const timeDiffSeconds = (Date.now() - startTimeRef.current) / 1000;
        const minutes = timeDiffSeconds / 60;
        if (minutes <= 0) return;

        // Standard WPM formula (5 chars = 1 word)
        const typedWords = currentTyped.length / 5;
        const calculatedWpm = Math.round(typedWords / minutes);
        setWpm(calculatedWpm);

        // Accuracy calculator
        let correctChars = 0;
        for (let i = 0; i < currentTyped.length; i++) {
            if (currentTyped[i] === examText[i]) {
                correctChars++;
            }
        }
        const calculatedAcc = currentTyped.length > 0 
            ? Math.round((correctChars / currentTyped.length) * 100) 
            : 100;
        setAccuracy(calculatedAcc);
    }, [examText]);

    // Handle character input
    const handleInput = useCallback((value) => {
        // Enforce strict: no backspace allowed (the string length can only increase)
        if (value.length < typedText.length) {
            return; // Reject deletion
        }
        
        setTypedText(value);
        updateMetrics(value);

        // Auto submit if text fully typed
        if (value.length >= examText.length) {
            completeExam(value);
        }
    }, [typedText, examText, updateMetrics]);

    // Start Exam
    const startExam = (profile) => {
        setSelectedExam(profile);
        setIsExamRunning(true);
        setTypedText('');
        setWpm(0);
        setAccuracy(100);
        setExamResult(null);

        // Pick a random paragraph
        const randParagraph = EXAM_PARAGRAPHS[Math.floor(Math.random() * EXAM_PARAGRAPHS.length)];
        setExamText(randParagraph);

        setTimeLeft(profile.duration);
        startTimeRef.current = Date.now();

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    completeExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Complete Exam
    const completeExam = (finalTypedVal) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsExamRunning(false);

        const currentTyped = finalTypedVal !== undefined ? finalTypedVal : typedText;

        // Final metric calculation
        const timeDiffSeconds = startTimeRef.current 
            ? (Date.now() - startTimeRef.current) / 1000 
            : selectedExam.duration;
        const minutes = Math.max(0.1, timeDiffSeconds / 60);
        
        const finalWpm = Math.round((currentTyped.length / 5) / minutes);
        
        let correctChars = 0;
        for (let i = 0; i < currentTyped.length; i++) {
            if (currentTyped[i] === examText[i]) {
                correctChars++;
            }
        }
        const finalAcc = currentTyped.length > 0 
            ? Math.round((correctChars / currentTyped.length) * 100) 
            : 0;

        const passed = finalWpm >= selectedExam.targetWpm && finalAcc >= selectedExam.targetAccuracy;

        const resultObj = {
            wpm: finalWpm,
            accuracy: finalAcc,
            passed,
            date: new Date().toLocaleDateString(),
            examName: selectedExam.name
        };

        if (passed) {
            // Generate official certificate
            const certId = 'TMP-CERT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const newCertificate = {
                certificateId: certId,
                userId: user.id,
                name: user.name || 'Professional Typist',
                wpm: finalWpm,
                accuracy: finalAcc,
                date: new Date().toISOString().split('T')[0],
                issueDateTime: new Date().toISOString(),
                description: `Successfully passed the ${selectedExam.name} with distinction.`,
                grossSpeed: finalWpm,
                netSpeed: finalWpm
            };

            // Save to localStorage
            const stored = JSON.parse(localStorage.getItem('issued_certificates') || '[]');
            stored.push(newCertificate);
            localStorage.setItem('issued_certificates', JSON.stringify(stored));
            
            // Refresh local state
            setMyCertificates(prev => [...prev, newCertificate]);

            // Award XP (200 XP for passing certification)
            if (updateStats) {
                updateStats({
                    wpm: finalWpm,
                    accuracy: finalAcc,
                    xpEarned: 200,
                    historyItem: {
                        wpm: finalWpm,
                        accuracy: finalAcc,
                        date: new Date().toISOString(),
                        type: 'exam'
                    }
                });
            }
        }

        setExamResult(resultObj);
    };

    // Quit active exam
    const quitExam = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsExamRunning(false);
        setSelectedExam(null);
        setTypedText('');
        setExamResult(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <SEOHead
                title="Typing Exams & Certification - TypeMaster Pro"
                description="Test your professional typing capabilities in a secure environment. Earn high-status credentials and badges."
                schemaType="course"
            />
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                        Official Certification Center
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Attempt strict, locked-down typing examinations to prove your skills and earn certificates.
                    </p>
                </div>
                {isExamRunning && (
                    <button
                        onClick={quitExam}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                        Abort Exam
                    </button>
                )}
            </div>

            {/* Exam is active */}
            {isExamRunning ? (
                <div className="space-y-6">
                    {/* Locked-down Info Bar */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4 border border-slate-800">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{selectedExam.badge}</span>
                            <div>
                                <h3 className="font-extrabold text-lg">{selectedExam.name}</h3>
                                <p className="text-xs text-slate-400">Rules: No Backspacing · Pausing Blocked · Exiting Voids Result</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <span className="block text-xs uppercase tracking-wider text-slate-400">WPM Target</span>
                                <span className="text-xl font-black text-indigo-400">{selectedExam.targetWpm}</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xs uppercase tracking-wider text-slate-400">Accuracy Target</span>
                                <span className="text-xl font-black text-indigo-400">{selectedExam.targetAccuracy}%</span>
                            </div>
                            <div className="h-10 w-px bg-slate-800" />
                            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl">
                                <Timer className="w-5 h-5 text-amber-500" />
                                <span className="text-2xl font-mono font-bold text-amber-500">
                                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Live Stats Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                            <span className="block text-xs text-slate-500">Current Speed</span>
                            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{wpm} WPM</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                            <span className="block text-xs text-slate-500">Accuracy</span>
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{accuracy}%</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                            <span className="block text-xs text-slate-500">Target WPM</span>
                            <span className="text-3xl font-black text-slate-700 dark:text-slate-300">{selectedExam.targetWpm} WPM</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                            <span className="block text-xs text-slate-500">Target Acc</span>
                            <span className="text-3xl font-black text-slate-700 dark:text-slate-300">{selectedExam.targetAccuracy}%</span>
                        </div>
                    </div>

                    {/* Strict Backspace Interception Wrapper */}
                    <div className="relative">
                        <div className="absolute top-4 left-4 z-10 bg-rose-500 text-white text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded">
                            🚫 BACKSPACE DISABLED
                        </div>
                        <TypingArea
                            text={examText}
                            typedText={typedText}
                            onInput={handleInput}
                            disabled={timeLeft <= 0}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Results Banner (if just finished) */}
                    {examResult && (
                        <div className={`p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
                            examResult.passed 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300' 
                                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300'
                        }`}>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black flex items-center gap-2">
                                    {examResult.passed ? <FileCheck className="w-8 h-8 text-emerald-600" /> : <ShieldAlert className="w-8 h-8 text-rose-600" />}
                                    {examResult.passed ? 'EXAM PASSED!' : 'EXAM FAILED'}
                                </h3>
                                <p className="text-sm">
                                    {examResult.passed 
                                        ? `Congratulations! You scored ${examResult.wpm} WPM and ${examResult.accuracy}% Accuracy. Your certificate has been issued and stored.`
                                        : `You scored ${examResult.wpm} WPM and ${examResult.accuracy}% Accuracy. You did not meet the exam requirements of ${selectedExam.targetWpm} WPM / ${selectedExam.targetAccuracy}% accuracy. Try again!`
                                    }
                                </p>
                            </div>
                            <div className="flex gap-4">
                                {examResult.passed && (
                                    <Link
                                        to="/certificates"
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg"
                                    >
                                        View Certificate
                                    </Link>
                                )}
                                <button
                                    onClick={() => setExamResult(null)}
                                    className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Level 3 Check Lock */}
                    {currentLevel < 3 ? (
                        <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto space-y-6">
                            <span className="text-6xl block">🔒</span>
                            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">Exam Center Locked</h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                Official certifications are only available for Level 3 (Advanced) typists. Reach Level 3 to unlock examinations and earn verification documents.
                            </p>
                            <div className="text-xs text-indigo-600 font-bold">
                                Required: Level 3+ · Current Level: {currentLevel}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Exam Profiles Grid */}
                            <div className="grid md:grid-cols-3 gap-6">
                                {EXAM_PROFILES.map((profile) => {
                                    const hasCert = myCertificates.some(c => c.description.includes(profile.name));
                                    return (
                                        <div
                                            key={profile.id}
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
                                        >
                                            {/* Gradient Accent */}
                                            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${profile.gradient}`} />
                                            
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-4xl">{profile.badge}</span>
                                                    {hasCert && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                                                            Earned ✓
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-200">{profile.name}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{profile.description}</p>
                                                </div>

                                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-2 text-sm font-semibold">
                                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                                        <span>Target WPM:</span>
                                                        <span className="text-slate-900 dark:text-slate-100">{profile.targetWpm} WPM</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                                        <span>Target Accuracy:</span>
                                                        <span className="text-slate-900 dark:text-slate-100">{profile.targetAccuracy}%</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                                        <span>Time Limit:</span>
                                                        <span className="text-slate-900 dark:text-slate-100">{profile.duration / 60} minutes</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => startExam(profile)}
                                                className={`mt-6 w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl font-bold bg-gradient-to-r ${profile.gradient} shadow-lg hover:shadow-xl transition-all`}
                                            >
                                                <Play className="w-4 h-4 fill-white" />
                                                Start Certification
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* My Certificates Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <Award className="w-6 h-6 text-indigo-600" />
                                    Your Issued Certificates
                                </h3>

                                {myCertificates.length > 0 ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myCertificates.map((cert) => (
                                            <div
                                                key={cert.certificateId}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: {cert.certificateId.substring(0, 15)}...</span>
                                                        <Trophy className="w-5 h-5 text-amber-500" />
                                                    </div>
                                                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">Typing Certification</h4>
                                                    <p className="text-xs text-slate-500">{cert.description}</p>
                                                    <div className="flex gap-4 text-sm font-bold text-slate-700 dark:text-slate-300 pt-2">
                                                        <span>WPM: {cert.wpm}</span>
                                                        <span>Acc: {cert.accuracy}%</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                    <span className="text-xs text-slate-400">{cert.date}</span>
                                                    <Link
                                                        to="/certificates"
                                                        state={{
                                                            courseTitle: 'Official Typing Certification',
                                                            accuracy: cert.accuracy,
                                                            completedDate: cert.date,
                                                            wpm: cert.wpm
                                                        }}
                                                        className="text-xs font-black text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        Print Certificate →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800">
                                        No certificates earned yet. Pass any of the examinations above to earn your official certificate.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Exams;
