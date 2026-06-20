import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

/**
 * Reusable CAPTCHA Component
 * Generates a random alphanumeric string and requires user input.
 * Provides a 'validate()' method via ref to parent components.
 */
const Captcha = forwardRef(({ onVerify }, ref) => {
    const [captchaCode, setCaptchaCode] = useState('');
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState(false);
    const [rotations, setRotations] = useState([]);

    // Generate random 6-character code
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, 1, O, 0 to avoid confusion
        let result = '';
        const newRotations = [];
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
            newRotations.push(Math.random() * 20 - 10);
        }
        setCaptchaCode(result);
        setRotations(newRotations);
        setUserInput('');
        setError(false);
        if (onVerify) onVerify(false);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    // Expose validate method to parent
    useImperativeHandle(ref, () => ({
        validate: () => {
            if (userInput.toUpperCase() === captchaCode) {
                return true;
            } else {
                setError(true);
                generateCaptcha(); // Regenerate on failure to prevent brute force
                return false;
            }
        },
        reset: () => {
            generateCaptcha();
        }
    }));

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
                <label htmlFor="captcha-input" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Security Check
                </label>
                <button
                    type="button"
                    onClick={generateCaptcha}
                    className="text-slate-400 hover:text-indigo-500 transition-colors"
                    title="Refresh Code"
                    aria-label="Refresh security check code"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="flex gap-3">
                {/* Visual CAPTCHA Display */}
                <div
                    className="flex-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center select-none relative overflow-hidden h-12"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '10px 10px'
                    }}
                >
                    <div className="text-2xl font-black font-mono tracking-widest text-slate-800 dark:text-slate-200" style={{ letterSpacing: '0.2em' }}>
                        {captchaCode.split('').map((char, index) => (
                            <span key={index} style={{ transform: `rotate(${rotations[index] || 0}deg)`, display: 'inline-block' }}>
                                {char}
                            </span>
                        ))}
                    </div>
                    {/* Noise Lines */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        <svg className="w-full h-full">
                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="2" />
                            <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                </div>

                {/* Input Field */}
                <input
                    id="captcha-input"
                    type="text"
                    value={userInput}
                    onChange={(e) => {
                        setUserInput(e.target.value);
                        setError(false);
                    }}
                    placeholder="Enter Code"
                    className={`nav-search w-32 text-center uppercase font-bold tracking-widest h-12 rounded-lg border-2 outline-none transition-all ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'}`}
                    maxLength={6}
                    aria-label="Enter security check code"
                />
            </div>
            {error && <p className="text-xs text-red-500 font-bold mt-2 animate-pulse">Incorrect code. Please try again.</p>}
        </div>
    );
});

export default Captcha;
