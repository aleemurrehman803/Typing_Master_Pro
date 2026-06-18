import React, { useRef, useEffect } from 'react';
import { isFeatureEnabled } from '../../utils/featureFlags';
import useSettingsStore from '../../store/useSettingsStore';
import { useSoundEngine } from '../../hooks/useSoundEngine';

/**
 * TypingArea Component
 * Renders the text to be typed and handles user input.
 * Supports RTL (Right-to-Left) for languages like Urdu.
 * 
 * @param {string} text - The reference text to type.
 * @param {string} typedText - The text currently typed by the user.
 * @param {function} onInput - Callback when input changes.
 * @param {boolean} disabled - Whether input is disabled (e.g., test finished).
 * @param {boolean} isRTL - Enable Right-to-Left layout.
 */
const TypingArea = ({ text, typedText, onInput, disabled, isRTL = false, ghostIndex = -1, invisibleIndex = -1 }) => {
    const inputRef = useRef(null);
    const { caretStyle } = useSettingsStore();
    const { playKeystroke } = useSoundEngine();

    // Auto-focus the hidden input when enabled
    useEffect(() => {
        if (!disabled) {
            inputRef.current?.focus();
        }
    }, [disabled]);

    // Keep focus on the input when clicking anywhere in the area
    const handleAreaClick = () => {
        if (!disabled) {
            inputRef.current?.focus();
        }
    };

    // Block illegal test interactions (Audit Section 4)
    const handleKeyDown = (e) => {
        // 1. Block Backspace/Delete if strictly required (current logic)
        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
        }

        // 2. Block Ctrl+A (Select All) to prevent mass deletion/manipulation
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
        }

        // 3. Block Ctrl+C / Ctrl+V (Copy/Paste)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
            e.preventDefault();
            return;
        }

        // Feature 12: Mechanical Sound Packs
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !disabled) {
            const expectedChar = text[typedText.length];
            const isError = e.key !== expectedChar;
            playKeystroke(isError);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        console.warn('SECURITY: Paste attempt blocked during test.');
    };

    /**
     * Renders the text with highlighting for correct/incorrect characters.
     */
    const renderText = () => {
        return text.split('').map((char, index) => {
            let className = "text-slate-400 dark:text-slate-600 transition-colors duration-200";

            if (index < typedText.length) {
                if (typedText[index] === char) {
                    className = "text-emerald-600 dark:text-emerald-400 font-medium"; // Correct character
                } else {
                    const softError = isFeatureEnabled('ENABLE_SOFT_ERRORS');
                    className = softError
                        ? "text-orange-500 bg-orange-100/50 dark:bg-orange-900/30 dark:text-orange-300 font-bold decoration-orange-400 underline decoration-2 underline-offset-2" // Soft Error (Beginner)
                        : "text-red-600 bg-red-200/50 dark:bg-red-900/50 dark:text-red-400 font-bold decoration-red-500 underline decoration-2 underline-offset-2"; // Hard Error (Default)
                }
            } else if (index === typedText.length) {
                // Apply Custom Caret Style (Feature 3)
                if (caretStyle === 'block') {
                    className = "bg-indigo-500 text-white animate-pulse rounded-sm px-0.5 shadow-[0_0_10px_rgba(99,102,241,0.5)]";
                } else if (caretStyle === 'underline') {
                    className = "border-b-[3px] border-indigo-500 animate-[pulse_1s_ease-in-out_infinite] text-slate-800 dark:text-white pb-[2px]";
                } else if (caretStyle === 'smooth') {
                    className = "bg-indigo-500/40 text-slate-900 dark:text-white animate-[pulse_1.5s_ease-in-out_infinite] rounded-sm px-0.5";
                } else {
                    // Beam
                    className = "relative after:absolute after:top-1/2 after:-left-0.5 after:-translate-y-1/2 after:w-[3px] after:h-[80%] after:bg-indigo-500 after:animate-[pulse_1s_ease-in-out_infinite] after:rounded-full text-slate-800 dark:text-white";
                }
            }

            // Feature 2: Ghost Typing Mode Cursor
            const gIndex = Math.floor(ghostIndex);
            if (index === gIndex && index !== typedText.length) {
                // Ghost cursor styling (A purple underline or outline)
                className = `${className} relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[3px] after:bg-purple-500/70 after:rounded-full after:shadow-[0_0_8px_rgba(168,85,247,0.6)]`;
            }

            // Feature 28: Survival Mode / Boss Fight (Disappearing text)
            if (index < Math.floor(invisibleIndex)) {
                className = `${className} opacity-0 transition-opacity duration-1000 blur-sm scale-95 pointer-events-none`;
            }

            return (
                <span key={index} className={className}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div
            className="relative w-full max-w-5xl mx-auto group"
            onClick={handleAreaClick}
        >
            {/* Visual Text Display */}
            <div
                className={`
                    relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 
                    p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 
                    min-h-[250px] text-2xl leading-loose font-mono cursor-text whitespace-pre-wrap
                    transition-all duration-300 ease-in-out
                    ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'group-hover:border-indigo-400 dark:group-hover:border-indigo-500 group-hover:shadow-indigo-500/10 group-hover:scale-[1.01]'}
                    ${isRTL ? 'text-right' : 'text-left'}
                    ${isFeatureEnabled('ENABLE_SLOW_MODE') ? 'tracking-widest' : ''} 
                    ${isFeatureEnabled('ENABLE_VISUAL_GUIDES') ? 'leading-[3.5rem]' : ''} 
                `}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {renderText()}
            </div>

            {/* Hidden Input Field for capturing keystrokes */}
            <input
                ref={inputRef}
                type="text"
                className="absolute opacity-0 top-0 left-0 h-full w-full cursor-default"
                value={typedText}
                onChange={(e) => onInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                disabled={disabled}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />
        </div>
    );
};

export default TypingArea;
