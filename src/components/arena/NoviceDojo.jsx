import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Swords, Trophy, ArrowLeft, Play } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

/**
 * Novice Dojo - Practice Arena
 * Free practice mode with AI opponents
 */
const NoviceDojo = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
    const [isReady, setIsReady] = useState(false);
    const [suddenDeath, setSuddenDeath] = useState(false);
    const [aiPersonality, setAiPersonality] = useState('standard');

    const difficulties = [
        { id: 'easy', name: 'Beginner Bot', wpm: '20-30 WPM', color: 'green' },
        { id: 'medium', name: 'Intermediate AI', wpm: '40-50 WPM', color: 'yellow' },
        { id: 'hard', name: 'Advanced Opponent', wpm: '60-70 WPM', color: 'orange' },
        { id: 'expert', name: 'Expert Challenge', wpm: '80-90 WPM', color: 'red' }
    ];

    const personalities = [
        { id: 'standard', name: 'Standard AI', desc: 'Default pacing' },
        { id: 'rusher', name: 'The Rusher', desc: 'Starts fast, chokes later' },
        { id: 'sniper', name: 'The Sniper', desc: 'Slow, steady, 100% accurate' },
        { id: 'choke', name: 'The Choke', desc: 'Fast, freezes near completion' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/arena')}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">Novice Dojo</h1>
                            <p className="text-sm text-slate-400">Practice Arena - No Stakes</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Difficulty Selection */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Swords className="w-5 h-5 text-indigo-400" />
                                Select Opponent
                            </h2>

                            <div className="space-y-3">
                                {difficulties.map((diff) => (
                                    <div
                                        key={diff.id}
                                        onClick={() => setSelectedDifficulty(diff.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedDifficulty === diff.id
                                            ? `border-${diff.color}-500 bg-${diff.color}-500/10`
                                            : 'border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-white">{diff.name}</h3>
                                                <p className="text-sm text-slate-400">{diff.wpm}</p>
                                            </div>
                                            {selectedDifficulty === diff.id && (
                                                <div className={`w-3 h-3 rounded-full bg-${diff.color}-500 animate-pulse`}></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* AI Personality Selector */}
                            <div className="mt-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">AI Personality</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {personalities.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => setAiPersonality(p.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                                aiPersonality === p.id 
                                                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/5' 
                                                    : 'border-slate-700 text-slate-400 hover:border-slate-650'
                                            }`}
                                        >
                                            <div className="font-bold">{p.name}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{p.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sudden Death Mode Toggle */}
                            <div className="mt-6 flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-slate-700/50">
                                <div>
                                    <h3 className="font-bold text-white text-sm">Sudden Death Mode</h3>
                                    <p className="text-xs text-rose-400 mt-0.5 font-semibold">One mistake = Instant Game Over!</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={suddenDeath}
                                        onChange={(e) => setSuddenDeath(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const selectedDiff = difficulties.find(d => d.id === selectedDifficulty);
                                const wpmRange = selectedDiff.wpm.split('-')[0];
                                localStorage.setItem('arena_opponent', JSON.stringify({ 
                                    wpm: parseInt(wpmRange),
                                    name: selectedDiff.name,
                                    personality: aiPersonality,
                                    suddenDeath: suddenDeath,
                                    mode: 'practice'
                                }));
                                navigate('/arena/battle');
                            }}
                            className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            Start Practice Match
                        </button>
                    </div>

                    {/* Right: Stats & Info */}
                    <div className="space-y-6">
                        {/* Practice Stats */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                Your Practice Stats
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {(() => {
                                    const stats = JSON.parse(localStorage.getItem('arena_practice_stats') || '{"wins": 0, "losses": 0, "bestWpm": 0}');
                                    const coins = parseInt(localStorage.getItem('arena_coins') || '0');
                                    return (
                                        <>
                                            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                                                <div className="text-2xl font-black text-green-400">{stats.wins}</div>
                                                <div className="text-xs text-slate-400 uppercase tracking-wider">Wins</div>
                                            </div>
                                            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                                                <div className="text-2xl font-black text-red-400">{stats.losses}</div>
                                                <div className="text-xs text-slate-400 uppercase tracking-wider">Losses</div>
                                            </div>
                                            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                                                <div className="text-2xl font-black text-indigo-400">{stats.bestWpm}</div>
                                                <div className="text-xs text-slate-400 uppercase tracking-wider">Best WPM</div>
                                            </div>
                                            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                                                <div className="text-2xl font-black text-purple-400">{coins}</div>
                                                <div className="text-xs text-slate-400 uppercase tracking-wider">Coins Earned</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-indigo-700/50 p-6">
                            <h3 className="font-bold text-white mb-3">💡 Practice Tips</h3>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5"></div>
                                    <span>Practice matches are completely free with no stakes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5"></div>
                                    <span>Win matches to earn free coins for the Competitive League</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5"></div>
                                    <span>Improve your WPM to unlock higher tiers</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoviceDojo;
