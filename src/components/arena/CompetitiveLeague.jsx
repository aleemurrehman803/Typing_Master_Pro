import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Swords, Trophy, ArrowLeft, Coins, AlertTriangle, Users, Play, Crown } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

/**
 * Competitive League - Ranked Matches
 * Requires 50+ WPM to enter.
 * Features coin betting and ELO system.
 */
const CompetitiveLeague = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [selectedBet, setSelectedBet] = useState(10);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTime, setSearchTime] = useState(0);
    const [matchFound, setMatchFound] = useState(false);
    const [opponentInfo, setOpponentInfo] = useState(null);

    // Stats Bridge
    const stats = JSON.parse(localStorage.getItem('arena_practice_stats') || '{"wins": 0, "losses": 0, "bestWpm": 0}');
    const userCoins = parseInt(localStorage.getItem('arena_coins') || '0');

    // Check WPM Requirement
    const userBestWpm = user?.stats?.bestWpm || stats.bestWpm || 0;
    const isEligible = userBestWpm >= 50;

    const bettingOptions = [
        { amount: 10, label: 'Standard Stakes', multiplier: '2x' },
        { amount: 20, label: 'High Stakes', multiplier: '2.5x' },
        { amount: 50, label: 'All In', multiplier: '3x' }
    ];

    // Simulate Matchmaking
    useEffect(() => {
        let timer;
        if (isSearching && !matchFound) {
            timer = setInterval(() => {
                setSearchTime(prev => prev + 1);
                // Randomly find match between 2-5 seconds
                if (Math.random() > 0.7 && searchTime > 2) {
                    setMatchFound(true);
                    setOpponentInfo({
                        name: "SpeedDemon_" + Math.floor(Math.random() * 999),
                        wpm: 50 + Math.floor(Math.random() * 30),
                        rank: "Gold II"
                    });

                    // Navigate to battle after short delay to show match found
                    setTimeout(() => {
                        // Calculate reward based on bet
                        let reward = selectedBet; // Default 1x profit (2x total)
                        if (selectedBet === 20) reward = 30; // 1.5x profit (2.5x total)
                        if (selectedBet === 50) reward = 100; // 2x profit (3x total)

                        // Store battle config
                        localStorage.setItem('arena_opponent', JSON.stringify({
                            wpm: 50 + Math.floor(Math.random() * 30), // Dynamic difficulty
                            name: "SpeedDemon_" + Math.floor(Math.random() * 999),
                            mode: 'competitive',
                            bet: selectedBet,
                            reward: reward
                        }));
                        navigate('/arena/battle');
                    }, 2000);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isSearching, matchFound, searchTime, navigate, selectedBet]);

    if (!isEligible) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1),transparent)]"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Access Denied</h2>
                        <p className="text-slate-400 mb-6">
                            The Competitive League requires a proven typing speed of <span className="text-white font-bold">50 WPM</span>.
                        </p>
                        <div className="bg-slate-800 rounded-xl p-4 mb-8">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Best WPM</p>
                            <div className="text-3xl font-black text-red-400">{userBestWpm}</div>
                        </div>
                        <button
                            onClick={() => navigate('/arena/dojo')}
                            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors"
                        >
                            Return to Novice Dojo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
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
                            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white">Competitive League</h1>
                                <p className="text-sm text-indigo-400 font-medium">Ranked Matches • Coin Betting</p>
                            </div>
                        </div>
                    </div>

                    {/* User Balance */}
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
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
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 relative overflow-hidden">
                        {isSearching && (
                            <div className="absolute inset-0 bg-slate-900/90 z-20 flex flex-col items-center justify-center p-6 text-center">
                                {!matchFound ? (
                                    <>
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 animate-[spin_3s_linear_infinite]"></div>
                                            <div className="absolute inset-0 w-24 h-24 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
                                            <Users className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mt-8 mb-2">Finding Opponent...</h3>
                                        <p className="text-slate-400">Searching for similar skill level ({userBestWpm} ±10 WPM)</p>
                                        <p className="text-indigo-400 font-mono mt-4">{searchTime}s</p>
                                        <button
                                            onClick={() => setIsSearching(false)}
                                            className="mt-8 px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-sm font-bold"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-6 scale-up-center">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto shadow-xl shadow-red-500/20">
                                                <Swords className="w-10 h-10 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-2">MATCH FOUND!</h3>
                                        <div className="bg-slate-800 rounded-xl p-4 w-full max-w-sm border border-slate-700">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-slate-400 text-sm">Opponent</span>
                                                <span className="text-white font-bold">{opponentInfo.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400 text-sm">Rank</span>
                                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                                    <Crown className="w-3 h-3" /> {opponentInfo.rank}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-indigo-400 font-bold mt-6 animate-pulse">Entering Arena...</p>
                                    </>
                                )}
                            </div>
                        )}

                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-amber-400" />
                            Place Your Wager
                        </h2>

                        <div className="space-y-4 mb-8">
                            {bettingOptions.map((option) => {
                                const canAfford = userCoins >= option.amount;
                                return (
                                    <div
                                        key={option.amount}
                                        onClick={() => canAfford && setSelectedBet(option.amount)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 relative ${!canAfford ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900' :
                                            selectedBet === option.amount
                                                ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 scale-[1.02]'
                                                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedBet === option.amount ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                                                    }`}>
                                                    <span className="font-bold">{option.amount}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{option.label}</h3>
                                                    <p className="text-xs text-slate-400">Potential Win: <span className="text-emerald-400 font-bold">{Math.floor(option.amount * parseFloat(option.multiplier))} Coins</span></p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
                                                {option.multiplier} Reward
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setIsSearching(true)}
                            disabled={userCoins < selectedBet}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${userCoins < selectedBet
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.01]'
                                }`}
                        >
                            {userCoins < selectedBet ? (
                                <>Insufficient Funds</>
                            ) : (
                                <>
                                    <Swords className="w-5 h-5" />
                                    Find Match ({selectedBet} Coins)
                                </>
                            )}
                        </button>

                        {userCoins < 10 && (
                            <p className="text-xs text-red-400 mt-4 text-center">
                                * Go to Novice Dojo to earn free coins first
                            </p>
                        )}
                    </div>

                    {/* Leaderboard Preview (Mock) */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-400" />
                                    Top Contenders
                                </h2>
                                <span className="text-xs font-bold text-indigo-400 uppercase">Season 1</span>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { rank: 1, name: "KeyboardKing", wpm: 142, streak: 12 },
                                    { rank: 2, name: "TypingNinja", wpm: 138, streak: 8 },
                                    { rank: 3, name: "SpeedMaster", wpm: 135, streak: 5 },
                                    { rank: 4, name: "ClickClack", wpm: 129, streak: 3 },
                                    { rank: 5, name: "FastFingers", wpm: 125, streak: 2 }
                                ].map((player) => (
                                    <div key={player.rank} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${player.rank === 1 ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' :
                                                player.rank === 2 ? 'bg-slate-300 text-black' :
                                                    player.rank === 3 ? 'bg-amber-700 text-white' :
                                                        'bg-slate-800 text-slate-500'
                                                }`}>
                                                {player.rank}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{player.name}</h4>
                                                <p className="text-xs text-slate-400">WPM: {player.wpm}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-emerald-400">Won {player.streak}</span>
                                            <span className="text-[10px] text-slate-500 uppercase">Streak</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Recent Battles</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                    <span><span className="text-white font-semibold">User123</span> won 50 coins</span>
                                    <span className="text-slate-600 ml-auto">2m ago</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                    <span><span className="text-white font-semibold">SpeedyBoi</span> lost to AI</span>
                                    <span className="text-slate-600 ml-auto">5m ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitiveLeague;
