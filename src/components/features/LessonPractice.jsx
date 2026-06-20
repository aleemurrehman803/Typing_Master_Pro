import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, RefreshCw, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import KeyboardVisualization from './KeyboardVisualization';

const LessonPractice = ({ exerciseText, onComplete, onNext, onPrevious, isFirstLesson, isLastLesson }) => {
    const [userInput, setUserInput] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [errors, setErrors] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const playClickSound = useCallback(() => {
        if (isMuted) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    }, [isMuted]);

    useEffect(() => {
        if (userInput.length === 1 && !startTime) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStartTime(Date.now());
        }
    }, [userInput, startTime]);

    useEffect(() => {
        if (userInput === exerciseText && exerciseText.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsComplete(true);
            const timeElapsed = (Date.now() - startTime) / 1000 / 60;
            const words = exerciseText.split(' ').length;
            const calculatedWpm = Math.round(words / timeElapsed);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setWpm(calculatedWpm);
        }
    }, [userInput, exerciseText, startTime]);

    useEffect(() => {
        let errorCount = 0;
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] !== exerciseText[i]) errorCount++;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setErrors(errorCount);
    }, [userInput, exerciseText]);

    const handleReset = () => {
        setUserInput('');
        setIsComplete(false);
        setErrors(0);
        setStartTime(null);
        setWpm(0);
    };

    const renderText = () => {
        return exerciseText.split('').map((char, index) => {
            let className = "text-slate-400";
            if (index < userInput.length) {
                className = userInput[index] === char ? "text-green-600 font-medium" : "text-red-500 bg-red-100 font-medium";
            } else if (index === userInput.length) {
                className = "bg-indigo-200 text-slate-800 animate-pulse";
            }
            return <span key={index} className={className}>{char === ' ' ? '\u00A0' : char}</span>;
        });
    };

    const accuracy = userInput.length > 0 ? Math.max(0, Math.round(((userInput.length - errors) / userInput.length) * 100)) : 100;
    const lessonProgress = Math.min(100, Math.round((userInput.length / exerciseText.length) * 100));
    const nextChar = userInput.length < exerciseText.length ? exerciseText[userInput.length] : null;

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        if (newValue.length > userInput.length) playClickSound();
        setUserInput(newValue);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Practice Exercise</h3>
                <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                    {isMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-indigo-600" />}
                </button>
            </div>

            {/* Show completion OR active practice - not both */}
            {isComplete ? (
                /* COMPLETION VIEW */
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-8 text-center shadow-lg">
                    <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold text-green-900 mb-2">🎉 Perfect!</h3>
                    <p className="text-green-700 mb-6 text-lg">Exercise completed successfully!</p>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500">Speed</div>
                            <div className="text-2xl font-bold text-slate-900">{wpm} <span className="text-sm text-slate-400">WPM</span></div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500">Accuracy</div>
                            <div className="text-2xl font-bold text-slate-900">{accuracy}%</div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button onClick={handleReset} className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition">
                            <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                        <button onClick={() => onComplete({ wpm, accuracy })} className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg transition">
                            Complete <CheckCircle2 className="w-5 h-5" />
                        </button>
                        {onNext && !isLastLesson && (
                            <button onClick={onNext} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg transition">
                                Next <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                /* ACTIVE PRACTICE VIEW */
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
                            <div className="text-xs text-indigo-600 font-semibold mb-1">PROGRESS</div>
                            <div className="text-2xl font-bold text-indigo-700">{lessonProgress}%</div>
                            <div className="mt-2 w-full bg-indigo-200 rounded-full h-1.5">
                                <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${lessonProgress}%` }} />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                            <div className="text-xs text-blue-600 font-semibold mb-1">TYPED</div>
                            <div className="text-2xl font-bold text-blue-700">{userInput.length}<span className="text-sm text-blue-400">/{exerciseText.length}</span></div>
                        </div>
                        <div className={`rounded-lg p-3 border ${accuracy >= 90 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'}`}>
                            <div className={`text-xs font-semibold mb-1 ${accuracy >= 90 ? 'text-green-600' : 'text-orange-600'}`}>ACCURACY</div>
                            <div className={`text-2xl font-bold ${accuracy >= 90 ? 'text-green-700' : 'text-orange-700'}`}>{accuracy}%</div>
                        </div>
                    </div>

                    {/* Keyboard */}
                    <KeyboardVisualization currentChar={nextChar} />

                    {/* Typing Area */}
                    <div className="relative bg-white border-2 border-slate-300 rounded-xl p-6 shadow-sm">
                        <div className="text-2xl leading-loose font-mono tracking-wide whitespace-pre-wrap break-words">{renderText()}</div>
                        <textarea value={userInput} onChange={handleInputChange} className="absolute inset-0 opacity-0 resize-none" autoFocus />
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between bg-white border-2 border-slate-200 rounded-xl p-3 shadow-sm">
                        <button onClick={onPrevious} disabled={isFirstLesson} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isFirstLesson ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow'}`}>
                            <ArrowRight className="w-4 h-4 rotate-180" /> Previous
                        </button>
                        <div className="text-center">
                            <div className="text-xs text-slate-500">Progress</div>
                            <div className="text-xl font-bold text-indigo-600">{lessonProgress}%</div>
                            {lessonProgress >= 30 ? <div className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle2 className="w-3 h-3" /> Ready</div> : <div className="text-xs text-orange-500">{30 - lessonProgress}% more</div>}
                        </div>
                        <button onClick={onNext} disabled={isLastLesson || lessonProgress < 30} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isLastLesson ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : lessonProgress < 30 ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow'}`}>
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Tip */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                        <p className="text-xs text-blue-800">💡 <strong>Tip:</strong> Watch colored keys for finger positions. Click sounds help with rhythm!</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default LessonPractice;
