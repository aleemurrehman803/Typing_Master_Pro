import React from 'react';

/**
 * KeyboardVisualization Component
 * Shows visual keyboard with finger position hints and current key highlight.
 */
const KeyboardVisualization = ({ currentChar, heatMapData = null }) => {
    // Finger color mapping
    const fingerColors = {
        'left-pinky': 'bg-rose-400 dark:bg-rose-600',
        'left-ring': 'bg-orange-400 dark:bg-orange-600',
        'left-middle': 'bg-amber-400 dark:bg-amber-600',
        'left-index': 'bg-emerald-400 dark:bg-emerald-600',
        'right-index': 'bg-blue-400 dark:bg-blue-600',
        'right-middle': 'bg-indigo-400 dark:bg-indigo-600',
        'right-ring': 'bg-violet-400 dark:bg-violet-600',
        'right-pinky': 'bg-fuchsia-400 dark:bg-fuchsia-600',
        'thumbs': 'bg-slate-400 dark:bg-slate-600'
    };

    // Key to finger mapping
    const keyFingerMap = {
        // Numbers
        '1': 'left-pinky', '2': 'left-ring', '3': 'left-middle', '4': 'left-index', '5': 'left-index',
        '6': 'right-index', '7': 'right-index', '8': 'right-middle', '9': 'right-ring', '0': 'right-pinky',
        // Top row
        'q': 'left-pinky', 'w': 'left-ring', 'e': 'left-middle', 'r': 'left-index', 't': 'left-index',
        'y': 'right-index', 'u': 'right-index', 'i': 'right-middle', 'o': 'right-ring', 'p': 'right-pinky',
        // Home row
        'a': 'left-pinky', 's': 'left-ring', 'd': 'left-middle', 'f': 'left-index',
        'j': 'right-index', 'k': 'right-middle', 'l': 'right-ring', ';': 'right-pinky',
        // Bottom row
        'z': 'left-pinky', 'x': 'left-ring', 'c': 'left-middle', 'v': 'left-index', 'b': 'left-index',
        'n': 'right-index', 'm': 'right-index', ',': 'right-middle', '.': 'right-ring', '/': 'right-pinky',
        // Space
        ' ': 'thumbs'
    };

    const getCurrentFinger = () => {
        if (!currentChar) return null;
        return keyFingerMap[currentChar.toLowerCase()];
    };

    const currentFinger = getCurrentFinger();

    const renderKey = (char, finger) => {
        const isActive = currentChar && currentChar.toLowerCase() === char.toLowerCase();
        let baseColor = fingerColors[finger] || 'bg-slate-300 dark:bg-slate-700';
        let textColor = 'text-slate-800 dark:text-white';

        if (heatMapData) {
            // Step 15: Heatmap Logic
            const stats = heatMapData[char.toLowerCase()];
            if (stats !== undefined) {
                if (stats > 0.05) { // Any error > 5% is a strict error in heatmap
                    baseColor = `bg-red-500 dark:bg-red-600 ring-2 ring-red-300 dark:ring-red-900 shadow-[0_0_15px_rgba(239,68,68,0.5)] z-10`;
                    textColor = 'text-white';
                } else {
                    baseColor = 'bg-emerald-500 dark:bg-emerald-600 shadow-md';
                    textColor = 'text-emerald-50';
                }
            } else {
                baseColor = 'bg-slate-100 dark:bg-slate-800 opacity-60'; // Unused keys
                textColor = 'text-slate-400 dark:text-slate-600';
            }
        }

        return (
            <div
                key={char}
                className={`
          ${baseColor} ${textColor} ${isActive ? 'ring-4 ring-indigo-500 dark:ring-indigo-400 scale-110 shadow-xl animate-pulse z-20' : 'ring-1 ring-slate-400/30 dark:ring-slate-700'}
          rounded px-3 py-2 text-sm font-bold text-center min-w-[2.5rem] transition-all duration-300 relative
        `}
            >
                {char.toUpperCase()}
                {heatMapData && heatMapData[char.toLowerCase()] > 0.05 && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 border text-[8px] font-black text-white flex items-center justify-center shadow-lg border-white dark:border-slate-900 animate-pulse">
                        !
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 mb-6 text-center tracking-widest uppercase">
                {heatMapData ? 'Performance Finger Heatmap' : 'Device Layout Guide'}
            </h3>

            {/* Number Row */}
            <div className="flex gap-1 mb-1 justify-center">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(char =>
                    renderKey(char, keyFingerMap[char])
                )}
            </div>

            {/* Top Row */}
            <div className="flex gap-1 mb-1 justify-center">
                {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map(char =>
                    renderKey(char, keyFingerMap[char])
                )}
            </div>

            {/* Home Row */}
            <div className="flex gap-1 mb-1 justify-center">
                <div className="w-6"></div>
                {['a', 's', 'd', 'f', 'j', 'k', 'l', ';'].map(char =>
                    renderKey(char, keyFingerMap[char])
                )}
            </div>

            {/* Bottom Row */}
            <div className="flex gap-1 mb-1 justify-center">
                <div className="w-12"></div>
                {['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'].map(char =>
                    renderKey(char, keyFingerMap[char])
                )}
            </div>

            {/* Space Bar */}
            <div className="flex gap-1 justify-center mt-2 relative z-10">
                <div
                    className={`
            ${heatMapData && heatMapData[' '] !== undefined ? (heatMapData[' '] > 0.05 ? 'bg-red-500 dark:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 dark:bg-emerald-600 text-emerald-50 shadow-md') : fingerColors['thumbs']}
            ${currentChar === ' ' ? 'ring-4 ring-indigo-500 dark:ring-indigo-400 scale-105 shadow-xl animate-pulse z-20' : 'ring-1 ring-slate-400/30 dark:ring-slate-700'}
            rounded px-6 py-2 text-sm font-bold ${!heatMapData ? 'text-slate-800 dark:text-white' : ''} text-center min-w-[16rem] transition-all duration-300
          `}
                >
                    SPACE
                </div>
            </div>

            {/* Finger Legend */}
            {!heatMapData && (
                <div className="mt-8 grid grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${fingerColors['left-pinky']}`}></div>
                    <span className="text-slate-600">L Pinky</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${fingerColors['left-ring']}`}></div>
                    <span className="text-slate-600">L Ring</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${fingerColors['left-middle']}`}></div>
                    <span className="text-slate-600">L Middle</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${fingerColors['left-index']}`}></div>
                    <span className="text-slate-600">L Index</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${fingerColors['right-index']}`}></div>
                    <span className="text-slate-600">R Index</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${fingerColors['right-middle']}`}></div>
                    <span className="text-slate-600">R Middle</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${fingerColors['right-ring']}`}></div>
                    <span className="text-slate-600 dark:text-slate-400">R Ring</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${fingerColors['right-pinky']}`}></div>
                    <span className="text-slate-600 dark:text-slate-400">R Pinky</span>
                </div>
            </div>
            )}
        </div>
    );
};

export default KeyboardVisualization;
