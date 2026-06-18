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

    const difficulties = [
        { id: 'easy', name: 'Beginner Bot', wpm: '20-30 WPM', color: 'green' },
        { id: 'medium', name: 'Intermediate AI', wpm: '40-50 WPM', color: 'yellow' },
        { id: 'hard', name: 'Advanced Opponent', wpm: '60-70 WPM', color: 'orange' },
        { id: 'expert', name: 'Expert Challenge', wpm: '80-90 WPM', color: 'red' }
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
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
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

                        <button
                            onClick={() => {
                                // Store selected difficulty for battle
                                const selectedDiff = difficulties.find(d => d.id === selectedDifficulty);
                                const wpmRange = selectedDiff.wpm.split('-')[0];
                                localStorage.setItem('arena_opponent', JSON.stringify({ wpm: parseInt(wpmRange) }));
                                navigate('/arena/battle');
                            }}
                            className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
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
