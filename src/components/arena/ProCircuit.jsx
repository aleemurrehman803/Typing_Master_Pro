import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Swords, Trophy, ArrowLeft, Coins, Lock, Users, Zap, ShieldAlert } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

/**
 * Pro Circuit - Elite Battles
 * Requires 80+ WPM to enter.
 * High stakes betting and exclusive rewards.
 */
const ProCircuit = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [selectedBet, setSelectedBet] = useState(100);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTime, setSearchTime] = useState(0);
    const [matchFound, setMatchFound] = useState(false);
    const [opponentInfo, setOpponentInfo] = useState(null);

    // Stats Bridge
    const stats = JSON.parse(localStorage.getItem('arena_practice_stats') || '{"wins": 0, "losses": 0, "bestWpm": 0}');
    const userCoins = parseInt(localStorage.getItem('arena_coins') || '0');

    // Check WPM Requirement
    const userBestWpm = user?.stats?.bestWpm || stats.bestWpm || 0;
    const isEligible = userBestWpm >= 80;

    const bettingOptions = [
        { amount: 100, label: 'Entry Stakes', multiplier: '2x' },
        { amount: 500, label: 'High Roller', multiplier: '3x' },
        { amount: 1000, label: 'Legendary', multiplier: '5x' }
    ];

    // Simulate Matchmaking
    useEffect(() => {
        let timer;
        if (isSearching && !matchFound) {
            timer = setInterval(() => {
                setSearchTime(prev => prev + 1);
                // Longer search time for "Elite" opponents
                if (Math.random() > 0.8 && searchTime > 4) {
                    setMatchFound(true);
                    setOpponentInfo({
                        name: "Grandmaster_" + Math.floor(Math.random() * 99),
                        wpm: 90 + Math.floor(Math.random() * 40),
                        rank: "Diamond I"
                    });

                    setTimeout(() => {
                        // Calculate reward based on bet
                        let reward = selectedBet;
                        if (selectedBet === 500) reward = 1000; // 2x profit
                        if (selectedBet === 1000) reward = 4000; // 4x profit (5x total)

                        // Store battle config
                        localStorage.setItem('arena_opponent', JSON.stringify({
                            wpm: 90 + Math.floor(Math.random() * 40),
                            name: "Grandmaster_" + Math.floor(Math.random() * 99),
                            mode: 'pro',
                            bet: selectedBet,
                            reward: reward
                        }));
                        navigate('/arena/battle');
                    }, 2500);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isSearching, matchFound, searchTime, navigate, selectedBet]);

    if (!isEligible) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-amber-900/50 rounded-2xl p-8 text-center relative overflow-hidden shadow-2xl shadow-amber-900/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1),transparent)]"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
                            <Lock className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">Pro Circuit Locked</h2>
                        <p className="text-slate-400 mb-6">
                            This arena is reserved for the elite. Only those with a proven speed of <span className="text-amber-400 font-bold">80 WPM</span> may enter.
                        </p>
                        <div className="bg-slate-800 rounded-xl p-4 mb-8">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Best WPM</p>
                            <div className={`text-3xl font-black ${userBestWpm >= 80 ? 'text-green-400' : 'text-amber-600'}`}>{userBestWpm}</div>
                        </div>
                        <button
                            onClick={() => navigate('/arena/competitive')}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold transition-all hover:shadow-lg"
                        >
                            Train in Competitive League
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/arena')}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Pro Circuit</h1>
                                <p className="text-sm text-amber-400 font-bold uppercase tracking-widest">High Stakes • Elite Only</p>
                            </div>
                        </div>
                    </div>

                    {/* User Balance */}
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-900/50 rounded-xl border border-amber-900/30">
                        <div className="bg-amber-500/10 p-2 rounded-lg">
                            <Coins className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Balance</p>
                            <p className="text-xl font-black text-white">{userCoins}</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Betting Panel */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-amber-700/30 p-6 relative overflow-hidden">
                        {isSearching && (
                            <div className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center p-6 text-center">
                                {!matchFound ? (
                                    <>
                                        <div className="relative">
                                            <div className="w-32 h-32 rounded-full border-4 border-amber-500/30 animate-[spin_4s_linear_infinite]"></div>
                                            <div className="absolute inset-0 w-32 h-32 rounded-full border-t-4 border-amber-500 animate-spin"></div>
                                            <Crown className="w-10 h-10 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mt-8 mb-2">Summoning Elite <span className="text-amber-400">Opponent</span>...</h3>
                                        <p className="text-slate-400">Filtering for Grandmaster rank...</p>
                                        <p className="text-amber-400 font-mono mt-4 text-xl">{searchTime}s</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-6 scale-up-center">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                                                <Swords className="w-12 h-12 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200 mb-2 italic">CHALLENGER FOUND</h3>
                                        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-amber-500/50 shadow-2xl">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-slate-400 text-sm uppercase tracking-widest">Global Elite</span>
                                                <span className="text-white font-black text-xl">{opponentInfo.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400 text-sm uppercase tracking-widest">Rank</span>
                                                <span className="text-amber-400 font-bold flex items-center gap-2">
                                                    <Crown className="w-4 h-4" /> {opponentInfo.rank}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-amber-400" />
                            High Stakes Wager
                        </h2>

                        <div className="space-y-4 mb-8">
                            {bettingOptions.map((option) => {
                                const canAfford = userCoins >= option.amount;
                                return (
                                    <div
                                        key={option.amount}
                                        onClick={() => canAfford && setSelectedBet(option.amount)}
                                        className={`p-6 rounded-xl border-2 transition-all duration-300 relative ${!canAfford ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900' :
                                            selectedBet === option.amount
                                                ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.02]'
                                                : 'border-slate-700 bg-slate-800/50 hover:border-amber-500/50 cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${selectedBet === option.amount ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' : 'bg-slate-700 text-slate-400'
                                                    }`}>
                                                    {option.multiplier}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-lg">{option.label}</h3>
                                                    <p className="text-sm text-slate-400">Bet <span className="text-white font-bold">{option.amount}</span> → Win <span className="text-emerald-400 font-bold">{Math.floor(option.amount * parseFloat(option.multiplier))}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setIsSearching(true)}
                            disabled={userCoins < selectedBet}
                            className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${userCoins < selectedBet
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.01]'
                                }`}
                        >
                            {userCoins < selectedBet ? (
                                <>Insufficient Funds</>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 fill-current" />
                                    Enter The Circuit
                                </>
                            )}
                        </button>
                    </div>

                    {/* Pro Leaderboard */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-400" />
                                    Global Elite
                                </h2>
                                <span className="text-xs font-bold text-amber-500 uppercase px-2 py-1 bg-amber-500/10 rounded">Season 5</span>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { rank: 1, name: "Velocity_X", wpm: 210, streak: 45 },
                                    { rank: 2, name: "QuantumType", wpm: 198, streak: 32 },
                                    { rank: 3, name: "FingerGod", wpm: 185, streak: 12 },
                                    { rank: 4, name: "NeuralLink", wpm: 175, streak: 8 },
                                    { rank: 5, name: "Cyborg_01", wpm: 172, streak: 5 }
                                ].map((player) => (
                                    <div key={player.rank} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg skew-x-[-10deg] flex items-center justify-center font-black text-lg ${player.rank === 1 ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' :
                                                player.rank === 2 ? 'bg-slate-300 text-black' :
                                                    player.rank === 3 ? 'bg-amber-700 text-white' :
                                                        'bg-slate-800 text-slate-500'
                                                }`}>
                                                <div className="skew-x-[10deg]">{player.rank}</div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors">{player.name}</h4>
                                                <p className="text-xs text-slate-400">Max WPM: {player.wpm}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-emerald-400">{player.streak} Win Streak</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Invincible</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProCircuit;
