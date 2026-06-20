import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, Target, Zap, Shield, Crown, Flame, Users, TrendingUp, History, Coins, Star, Award, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { getRank, getNextRank } from '../../utils/ArenaProgression';

/**
 * Battle Arena Landing Page - "The Lobby"
 * Entry point for the competitive typing ecosystem
 */
const ArenaLanding = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [streamerMode, setStreamerMode] = useState(false);

    // --- Team Competitions States ---
    const [activeLobbyTab, setActiveLobbyTab] = useState('tiers'); // 'tiers' | 'teams'
    const [myTeam, setMyTeam] = useState(() => {
        const stored = localStorage.getItem('user_typing_team');
        return stored ? JSON.parse(stored) : null;
    });

    const [createTeamName, setCreateTeamName] = useState('');
    const [createTeamTag, setCreateTeamTag] = useState('');
    const [createTeamEmoji, setCreateTeamEmoji] = useState('🚀');
    const [joinTeamCode, setJoinTeamCode] = useState('');

    const [isTeamSearching, setIsTeamSearching] = useState(false);
    const [teamSearchTime, setTeamSearchTime] = useState(0);
    const [teamBattleResult, setTeamBattleResult] = useState(null);

    const [teamLeaderboard, setTeamLeaderboard] = useState([
        { name: 'Alpha Typists', tag: 'ALP', emoji: '👑', elo: 1850, members: 3, wpm: 88 },
        { name: 'Finger Speedsters', tag: 'FSP', emoji: '⚡', elo: 1720, members: 4, wpm: 76 },
        { name: 'Qwerty Gods', tag: 'QWG', emoji: '🔥', elo: 1690, members: 3, wpm: 74 },
        { name: 'Keyboard Warriors', tag: 'KBW', emoji: '⚔️', elo: 1540, members: 2, wpm: 65 }
    ]);

    const handleCreateTeam = (e) => {
        e.preventDefault();
        if (!createTeamName || !createTeamTag) return;
        const newTeam = {
            name: createTeamName,
            tag: createTeamTag.toUpperCase().substring(0, 4),
            emoji: createTeamEmoji,
            inviteCode: 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            elo: 1200,
            members: [
                { name: user?.name || 'You', elo: 1200, role: 'Leader', wpm: user?.stats?.bestWpm || 45 }
            ],
            averageWpm: user?.stats?.bestWpm || 45,
            matchesPlayed: 0,
            wins: 0
        };
        localStorage.setItem('user_typing_team', JSON.stringify(newTeam));
        setMyTeam(newTeam);
        setCreateTeamName('');
        setCreateTeamTag('');
    };

    const handleJoinTeam = (e) => {
        e.preventDefault();
        if (!joinTeamCode) return;
        
        const matchedOnLeaderboard = teamLeaderboard.find(t => t.tag === joinTeamCode.toUpperCase() || joinTeamCode.length > 3);
        const teamName = matchedOnLeaderboard ? matchedOnLeaderboard.name : 'Qwerty Gods';
        const teamTag = matchedOnLeaderboard ? matchedOnLeaderboard.tag : 'QWG';
        const teamEmoji = matchedOnLeaderboard ? matchedOnLeaderboard.emoji : '🔥';
        const teamElo = matchedOnLeaderboard ? matchedOnLeaderboard.elo : 1400;

        const joinedTeam = {
            name: teamName,
            tag: teamTag,
            emoji: teamEmoji,
            inviteCode: joinTeamCode.toUpperCase(),
            elo: teamElo,
            members: [
                { name: 'Alex_Speed', elo: teamElo + 100, role: 'Leader', wpm: 75 },
                { name: 'TypingPro_1', elo: teamElo - 50, role: 'Member', wpm: 60 },
                { name: user?.name || 'You', elo: 1000, role: 'Member', wpm: user?.stats?.bestWpm || 45 }
            ],
            averageWpm: Math.round((75 + 60 + (user?.stats?.bestWpm || 45)) / 3),
            matchesPlayed: 10,
            wins: 7
        };
        localStorage.setItem('user_typing_team', JSON.stringify(joinedTeam));
        setMyTeam(joinedTeam);
        setJoinTeamCode('');
    };

    const handleLeaveTeam = () => {
        localStorage.removeItem('user_typing_team');
        setMyTeam(null);
        setTeamBattleResult(null);
    };

    useEffect(() => {
        let timer;
        if (isTeamSearching) {
            timer = setInterval(() => {
                setTeamSearchTime(prev => {
                    if (prev >= 4) {
                        clearInterval(timer);
                        setIsTeamSearching(false);
                        executeTeamBattle();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTeamSearching]);

    const executeTeamBattle = () => {
        if (!myTeam) return;

        const opponentIndex = Math.floor(Math.random() * teamLeaderboard.length);
        const opponentTeam = teamLeaderboard[opponentIndex];

        const userWpm = user?.stats?.bestWpm || 45;
        const member1Wpm = 50 + Math.floor(Math.random() * 30);
        const member2Wpm = 45 + Math.floor(Math.random() * 25);
        const playerTeamAvg = Math.round((userWpm + member1Wpm + member2Wpm) / 3);

        const opponentTeamAvg = Math.round(opponentTeam.wpm + (Math.random() * 10 - 5));

        const passed = playerTeamAvg >= opponentTeamAvg;
        const eloChange = passed ? 25 : -15;
        const coinsChange = passed ? 50 : 10;

        const updatedTeam = {
            ...myTeam,
            elo: Math.max(100, myTeam.elo + eloChange),
            matchesPlayed: myTeam.matchesPlayed + 1,
            wins: passed ? myTeam.wins + 1 : myTeam.wins
        };
        localStorage.setItem('user_typing_team', JSON.stringify(updatedTeam));
        setMyTeam(updatedTeam);

        const coins = parseInt(localStorage.getItem('arena_coins') || '0');
        localStorage.setItem('arena_coins', (coins + coinsChange).toString());
        window.dispatchEvent(new Event('arena-coins-updated'));

        setTeamBattleResult({
            passed,
            opponentName: `${opponentTeam.emoji} ${opponentTeam.name} [${opponentTeam.tag}]`,
            playerTeamAvg,
            opponentTeamAvg,
            eloChange,
            coinsChange
        });
    };

    // Load Real Stats
    const savedStats = JSON.parse(localStorage.getItem('arena_stats') || '{"xp": 0, "battles": 0, "wins": 0, "coins": 0}');
    const currentRank = getRank(savedStats.xp);
    const nextRank = getNextRank(savedStats.xp);
    const progressToNext = nextRank
        ? ((savedStats.xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100
        : 100;

    // Dedicated Arena Stats
    const arenaStats = {
        rank: currentRank.name,
        tier: currentRank.id.toUpperCase(), // Using ID as placeholder for "Tier"
        wins: savedStats.wins,
        losses: savedStats.battles - savedStats.wins,
        totalBattles: savedStats.battles,
        winRate: savedStats.battles > 0 ? Math.round((savedStats.wins / savedStats.battles) * 100) + '%' : '0%',
        coinsEarned: savedStats.coins,
        currentStreak: 0 // Streak logic requires more complex history tracking, keeping 0 for now
    };

    // Mock Battle History
    const battleHistory = [
        { id: 1, type: 'Competitive', opponent: 'SpeedDemon_99', result: 'Victory', change: '+20 Coins', date: '2 mins ago', wpm: 65 },
        { id: 2, type: 'Competitive', opponent: 'TypoKing', result: 'Victory', change: '+20 Coins', date: '15 mins ago', wpm: 62 },
        { id: 3, type: 'Pro Circuit', opponent: 'Grandmaster_X', result: 'Defeat', change: '-100 Coins', date: '1 hour ago', wpm: 78 },
        { id: 4, type: 'Novice Dojo', opponent: 'Training Bot', result: 'Victory', change: '+5 Coins', date: '2 hours ago', wpm: 58 },
    ];

    // Determine suggested tier based on WPM
    const getSuggestedTier = (wpm) => {
        if (wpm >= 80) return 'pro';
        if (wpm >= 50) return 'competitive';
        return 'novice';
    };

    const suggestedTier = getSuggestedTier(user?.stats?.bestWpm || 0);

    // Tier configurations
    const tiers = [
        {
            id: 'novice',
            name: 'Novice Dojo',
            icon: Shield,
            requirement: 'Open to all',
            description: 'Free practice arena with AI opponents and skill-building drills',
            features: ['Practice Matches', 'AI Opponents', 'No Stakes', 'Earn Free Coins'],
            gradient: 'from-slate-600 to-slate-800',
            glowColor: 'slate',
            route: '/arena/dojo'
        },
        {
            id: 'competitive',
            name: 'Competitive League',
            icon: Target,
            requirement: '50+ WPM Average',
            description: 'Ranked battles with real opponents and tournament entry',
            features: ['Ranked 1v1', 'Daily Tournaments', 'Coin Betting (10-100)', 'ELO Ranking'],
            gradient: 'from-indigo-600 to-purple-600',
            glowColor: 'indigo',
            route: '/arena/competitive',
            locked: (user?.stats?.bestWpm || 0) < 50
        },
        {
            id: 'pro',
            name: 'Pro Circuit',
            icon: Crown,
            requirement: 'Diamond Rank + Verification',
            description: 'Elite tournaments with high stakes and sponsorship opportunities',
            features: ['High-Stakes Battles', 'Team Leagues', 'Sponsored Events', 'Pro Certification'],
            gradient: 'from-amber-500 to-orange-600',
            glowColor: 'amber',
            route: '/arena/pro',
            locked: (user?.stats?.bestWpm || 0) < 80
        }
    ];

    // Game modes
    const gameModes = [
        {
            name: '1v1 Duel',
            icon: Swords,
            description: 'Head-to-head typing battle',
            players: '2 Players',
            color: 'red'
        },
        {
            name: 'Survival Gauntlet',
            icon: Flame,
            description: 'Last typist standing wins all',
            players: '3-8 Players',
            color: 'orange'
        },
        {
            name: 'Team Battle',
            icon: Users,
            description: 'Coordinate with teammates',
            players: '2v2 or 3v3',
            color: 'blue'
        },
        {
            name: 'Speed Challenge',
            icon: Zap,
            description: 'Race against the clock',
            players: 'Solo',
            color: 'yellow'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-grid-white/[0.02]"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-slate-800/40 pb-8">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-3 mb-4 justify-center md:justify-start">
                                <Swords className="w-12 h-12 text-indigo-400 animate-pulse" />
                                <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                                    Battle Arena
                                </h1>
                            </div>
                            <p className="text-lg text-slate-400 max-w-2xl">
                                Transform your typing skills into competitive victories. Enter the arena, prove your speed, and earn rewards.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/arena/shop')}
                            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:via-orange-600 hover:to-rose-700 text-white font-black rounded-2xl shadow-xl shadow-amber-500/10 hover:shadow-amber-500/25 hover:scale-105 transition-all text-sm uppercase tracking-wider border border-amber-400/20"
                        >
                            <ShoppingBag className="w-5 h-5 animate-bounce" />
                            Enter The Armory
                        </button>
                    </div>

                    {/* Feature 50: Global Tournament Pulse HUD */}
                    <TournamentPulse />

                    {/* Arena Dashboard Section */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-12">
                        {/* Main Stats Card */}
                        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Award className="w-6 h-6 text-amber-500" />
                                    Arena Career
                                </h3>
                                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                                    {arenaStats.tier}
                                </div>
                            </div>

                            {/* XP Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between text-sm mb-2 font-bold text-slate-400">
                                    <span className="flex items-center gap-2">
                                        <span className="text-2xl">{currentRank.icon}</span>
                                        {streamerMode ? '******' : arenaStats.rank}
                                    </span>
                                    <span>{streamerMode ? '****' : `${savedStats.xp} / ${nextRank ? nextRank.minXP : 'MAX'} XP`}</span>
                                </div>
                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 relative">
                                    <div
                                        className={`absolute top-0 left-0 h-full ${currentRank.color.replace('text-', 'bg-')} bg-opacity-80 transition-all duration-1000 ease-out`}
                                        style={{ width: `${progressToNext}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-right text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">
                                    {nextRank ? `Next Rank: ${nextRank.name}` : 'Max Rank Achieved'}
                                </p>
                            </div>

                            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300 ${streamerMode ? 'blur-sm select-none' : ''}`}>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="text-slate-400 text-xs font-medium uppercase mb-1">Rank</div>
                                    <div className="text-2xl font-black text-white">{arenaStats.rank}</div>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="text-slate-400 text-xs font-medium uppercase mb-1">Win/Loss</div>
                                    <div className="text-2xl font-black text-white">
                                        <span className="text-green-400">{arenaStats.wins}</span>
                                        <span className="text-slate-600 mx-1">/</span>
                                        <span className="text-red-400">{arenaStats.losses}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="text-slate-400 text-xs font-medium uppercase mb-1">Win Rate</div>
                                    <div className="text-2xl font-black text-indigo-400">{arenaStats.winRate}</div>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Earnings</div>
                                    <div className="text-2xl font-black text-yellow-400 flex items-center gap-1">
                                        <Coins className="w-5 h-5" />
                                        {arenaStats.coinsEarned}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <History className="w-5 h-5 text-slate-400" />
                                    Recent Activity
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 max-h-[160px]">
                                {battleHistory.map((battle) => (
                                    <div key={battle.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${battle.result === 'Victory' ? 'text-green-400' : 'text-red-400'}`}>
                                                {battle.result}
                                            </span>
                                            <span className="text-xs text-slate-500">vs {battle.opponent}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-xs font-bold ${battle.change.startsWith('+') ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                {battle.change}
                                            </span>
                                            <span className="text-[10px] text-slate-600">{battle.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lobby Tab Selector */}
                    <div className="flex justify-center mb-10">
                        <div className="bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl flex gap-2">
                            <button
                                onClick={() => setActiveLobbyTab('tiers')}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeLobbyTab === 'tiers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <Swords className="w-4 h-4" />
                                Arena Tiers
                            </button>
                            <button
                                onClick={() => setActiveLobbyTab('teams')}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeLobbyTab === 'teams' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <Users className="w-4 h-4" />
                                Team Leagues
                            </button>
                        </div>
                    </div>

                    {/* Team Search Overlay */}
                    {isTeamSearching && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
                            <div className="text-center space-y-6 max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse border border-indigo-500/30">
                                    <Users className="w-10 h-10 text-indigo-400 animate-bounce" />
                                </div>
                                <h3 className="text-2xl font-black text-white">Matching Teams...</h3>
                                <p className="text-slate-400 text-sm">Searching for ELO-compatible opponents. Creating 3v3 typing track.</p>
                                <div className="text-amber-500 font-mono text-lg font-bold">Elapsed: {teamSearchTime}s</div>
                            </div>
                        </div>
                    )}

                    {/* Team Battle Results Modal */}
                    {teamBattleResult && (
                        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
                            <div className={`max-w-md w-full bg-slate-900 border ${teamBattleResult.passed ? 'border-emerald-500/30' : 'border-rose-500/30'} rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl`}>
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
                                <h3 className={`text-3xl font-black mb-2 tracking-wide uppercase ${teamBattleResult.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {teamBattleResult.passed ? '🏆 VICTORY!' : '💀 DEFEAT'}
                                </h3>
                                <p className="text-slate-400 text-sm mb-6">3v3 Team Battle vs {teamBattleResult.opponentName}</p>

                                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl mb-6 border border-slate-800">
                                    <div>
                                        <span className="block text-[10px] uppercase tracking-wider text-slate-500">Your Team WPM</span>
                                        <span className="text-2xl font-black text-indigo-400">{teamBattleResult.playerTeamAvg}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] uppercase tracking-wider text-slate-500">Opponent Avg</span>
                                        <span className="text-2xl font-black text-rose-400">{teamBattleResult.opponentTeamAvg}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8 text-sm font-bold">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Team ELO Rating:</span>
                                        <span className={teamBattleResult.eloChange > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                            {teamBattleResult.eloChange > 0 ? `+${teamBattleResult.eloChange}` : teamBattleResult.eloChange} ELO
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Stakes Coins Earned:</span>
                                        <span className="text-yellow-400">+{teamBattleResult.coinsChange} Coins 🪙</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setTeamBattleResult(null)}
                                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg hover:scale-105"
                                >
                                    Dismiss Results
                                </button>
                            </div>
                        </div>
                    )}

                    {activeLobbyTab === 'tiers' ? (
                        <>
                            {/* Tiers Section */}
                            <div className="mb-16">
                                <h2 className="text-3xl font-black text-white mb-8 text-center">Choose Your Arena</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {tiers.map((tier) => {
                                        const Icon = tier.icon;
                                        const isRecommended = tier.id === suggestedTier;

                                        return (
                                            <div
                                                key={tier.id}
                                                className={`relative group ${tier.locked ? 'opacity-60' : 'cursor-pointer'}`}
                                                onClick={() => !tier.locked && navigate(tier.route)}
                                            >
                                                {/* Glow Effect */}
                                                <div className={`absolute -inset-0.5 bg-gradient-to-r ${tier.gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`}></div>

                                                {/* Card */}
                                                <div className="relative bg-slate-900 rounded-2xl border border-slate-700 p-6 h-full transition-transform duration-300 group-hover:scale-105">
                                                    {isRecommended && (
                                                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                            RECOMMENDED
                                                        </div>
                                                    )}

                                                    {tier.locked && (
                                                        <div className="absolute -top-3 -right-3 bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                                                            LOCKED
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${tier.gradient}`}>
                                                            <Icon className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-white">{tier.name}</h3>
                                                            <p className="text-xs text-slate-400">{tier.requirement}</p>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-slate-300 mb-4">{tier.description}</p>

                                                    <ul className="space-y-2">
                                                        {tier.features.map((feature, idx) => (
                                                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                                                                <div className={`w-1.5 h-1.5 rounded-full bg-${tier.glowColor}-400`}></div>
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    {!tier.locked && (
                                                        <button className={`mt-6 w-full py-3 rounded-xl bg-gradient-to-r ${tier.gradient} text-white font-bold hover:shadow-xl transition-all duration-300`}>
                                                            Enter Arena
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Game Modes */}
                            <div>
                                <h2 className="text-3xl font-black text-white mb-8 text-center">Game Modes</h2>
                                <div className="grid md:grid-cols-4 gap-4">
                                    {gameModes.map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <div
                                                key={mode.name}
                                                className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group"
                                            >
                                                <Icon className={`w-8 h-8 text-${mode.color}-400 mb-3 group-hover:scale-110 transition-transform`} />
                                                <h4 className="font-bold text-white mb-1">{mode.name}</h4>
                                                <p className="text-xs text-slate-400 mb-2">{mode.description}</p>
                                                <div className="text-xs text-slate-500">{mode.players}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Team Leagues Content */
                        <div className="space-y-12 animate-in fade-in">
                            {!myTeam ? (
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Create Team */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-xl">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-2xl font-black text-white">Create a Team</h3>
                                            </div>
                                            <p className="text-slate-400 text-sm">Form your own typing guild. Custom tag, ELO metrics, and exclusive cosmetic unlocks.</p>
                                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                                <div>
                                                    <label className="block text-xs uppercase font-extrabold text-slate-400 mb-1">Team Name</label>
                                                    <input
                                                        type="text"
                                                        value={createTeamName}
                                                        onChange={(e) => setCreateTeamName(e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm font-semibold"
                                                        placeholder="e.g. Speed Demons"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs uppercase font-extrabold text-slate-400 mb-1">Tag (Max 4 Char)</label>
                                                        <input
                                                            type="text"
                                                            value={createTeamTag}
                                                            onChange={(e) => setCreateTeamTag(e.target.value)}
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm font-semibold text-center uppercase"
                                                            placeholder="WPM"
                                                            maxLength={4}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs uppercase font-extrabold text-slate-400 mb-1">Icon/Emoji</label>
                                                        <select
                                                            value={createTeamEmoji}
                                                            onChange={(e) => setCreateTeamEmoji(e.target.value)}
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm font-semibold text-center"
                                                        >
                                                            <option value="🚀">🚀 Rockets</option>
                                                            <option value="👑">👑 Kings</option>
                                                            <option value="⚡">⚡ Lightning</option>
                                                            <option value="🔥">🔥 Fire</option>
                                                            <option value="⚔️">⚔️ Swords</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <button type="submit" className="w-full mt-4 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                                                    Create Typing Guild
                                                </button>
                                            </form>
                                        </div>
                                    </div>

                                    {/* Join Team */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-xl">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-slate-800 rounded-xl text-white">
                                                    <Trophy className="w-6 h-6 text-indigo-400" />
                                                </div>
                                                <h3 className="text-2xl font-black text-white">Join a Team</h3>
                                            </div>
                                            <p className="text-slate-400 text-sm">Enter an invite code or a team tag to merge with an active guild and climb the ELO ranks.</p>
                                            <form onSubmit={handleJoinTeam} className="space-y-4">
                                                <div>
                                                    <label className="block text-xs uppercase font-extrabold text-slate-400 mb-1">Invite Code or Tag</label>
                                                    <input
                                                        type="text"
                                                        value={joinTeamCode}
                                                        onChange={(e) => setJoinTeamCode(e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm font-semibold text-center uppercase"
                                                        placeholder="e.g. ALP or TEAM-XYZ"
                                                    />
                                                </div>
                                                <button type="submit" className="w-full mt-4 py-3.5 bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold rounded-xl hover:bg-slate-700 transition-all">
                                                    Join Existing Guild
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Joined Team View */
                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Left: Team Info & Members */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
                                            
                                            {/* Team Title Card */}
                                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-5xl">{myTeam.emoji}</span>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white flex items-center gap-2">
                                                            {myTeam.name}
                                                            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
                                                                [{myTeam.tag}]
                                                            </span>
                                                        </h3>
                                                        <p className="text-xs text-slate-500">Invite Code: <span className="font-mono text-slate-300 font-bold">{myTeam.inviteCode}</span></p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleLeaveTeam}
                                                    className="px-4 py-2 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold rounded-xl transition-all"
                                                >
                                                    Leave Team
                                                </button>
                                            </div>

                                            {/* Team Stats */}
                                            <div className="grid grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl mb-8 border border-slate-800/80">
                                                <div className="text-center">
                                                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest">ELO Rating</span>
                                                    <span className="text-xl font-black text-indigo-400">{myTeam.elo}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Matches</span>
                                                    <span className="text-xl font-black text-slate-300">{myTeam.matchesPlayed}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Wins</span>
                                                    <span className="text-xl font-black text-emerald-400">{myTeam.wins}</span>
                                                </div>
                                            </div>

                                            {/* Roster list */}
                                            <div className="space-y-4">
                                                <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Guild Roster</h4>
                                                <div className="divide-y divide-slate-800">
                                                    {myTeam.members.map((member, idx) => (
                                                        <div key={idx} className="flex justify-between items-center py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                <span className="font-bold text-slate-200">{member.name}</span>
                                                                <span className="text-[10px] bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">{member.role}</span>
                                                            </div>
                                                            <div className="flex gap-4 text-xs font-semibold text-slate-500">
                                                                <span>{member.wpm} WPM</span>
                                                                <span>{member.elo} ELO</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Start 3v3 Match */}
                                            <div className="mt-8 pt-6 border-t border-slate-800">
                                                <button
                                                    onClick={() => setIsTeamSearching(true)}
                                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black rounded-xl shadow-lg transition-transform hover:scale-[1.01]"
                                                >
                                                    <Swords className="w-5 h-5" />
                                                    Queue 3v3 Team Battle
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Team Leaderboard */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm h-fit">
                                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-amber-500" />
                                            Team ELO Leaderboard
                                        </h3>
                                        <div className="space-y-4">
                                            {/* Insert user team if not already in mock list */}
                                            {[...teamLeaderboard, { name: myTeam.name, tag: myTeam.tag, emoji: myTeam.emoji, elo: myTeam.elo, members: myTeam.members.length, wpm: myTeam.averageWpm }]
                                                .sort((a, b) => b.elo - a.elo)
                                                .map((team, rankIdx) => {
                                                    const isUserTeam = team.tag === myTeam.tag;
                                                    return (
                                                        <div
                                                            key={rankIdx}
                                                            className={`flex items-center justify-between p-3 rounded-2xl border ${isUserTeam ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-slate-950/20 border-slate-800'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-mono text-sm text-slate-500 font-black">{rankIdx + 1}</span>
                                                                <span className="text-xl">{team.emoji}</span>
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-slate-200">{team.name}</h4>
                                                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{team.members} members</span>
                                                                </div>
                                                            </div>
                                                            <span className="font-mono font-bold text-sm text-indigo-400">{team.elo}</span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * TournamentPulse HUD
 * Live monitor for global arena activity
 */
const TournamentPulse = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [events, setEvents] = useState([
        { id: 1, user: 'NovaType', action: 'won a 1v1 Duel', value: '+50 XP', time: 'Just now' },
        { id: 2, user: 'CyberScribe', action: 'reached Rank Master', value: 'Level 42', time: '1 min ago' },
        { id: 3, user: 'GhostFingers', action: 'started a Pro Match', value: 'Live', time: '2 mins ago' }
    ]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        // Simulating live event updates
        const eventTimer = setInterval(() => {
            const users = ['Nitro', 'Apex', 'Viper', 'Echo', 'Stealth'];
            const actions = ['won a Duel', 'set a Personal Best', 'joined Tournament', 'earned 100 Coins'];
            const newUser = users[Math.floor(Math.random() * users.length)];
            const newAction = actions[Math.floor(Math.random() * actions.length)];
            
            setEvents(prev => [
                { id: Date.now(), user: newUser, action: newAction, value: 'New', time: 'Just now' },
                ...prev.slice(0, 4)
            ]);
        }, 5000);

        // Canvas Visualization
        const canvas = document.getElementById('pulse-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let animationFrameId;

            const resize = () => {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            };
            window.addEventListener('resize', resize);
            resize();

            const particles = [];
            for (let i = 0; i < 30; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 1,
                    speed: Math.random() * 0.5 + 0.2,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#6366f1';
                
                particles.forEach(p => {
                    p.x += p.speed;
                    if (p.x > canvas.width) p.x = 0;
                    
                    ctx.globalAlpha = p.opacity;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw connections
                    particles.forEach(p2 => {
                        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                        if (dist < 80) {
                            ctx.strokeStyle = '#6366f1';
                            ctx.globalAlpha = (1 - dist / 80) * 0.2;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    });
                });
                
                animationFrameId = requestAnimationFrame(animate);
            };
            animate();

            return () => {
                clearInterval(timer);
                clearInterval(eventTimer);
                window.removeEventListener('resize', resize);
                cancelAnimationFrame(animationFrameId);
            };
        }

        return () => {
            clearInterval(timer);
            clearInterval(eventTimer);
        };
    }, []);

    return (
        <div className="grid lg:grid-cols-4 gap-6 mb-12">
            {/* Live Network Stream Visualization */}
            <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-indigo-500/20 p-6 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <TrendingUp className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white uppercase tracking-tighter">Global Pulse</h3>
                            <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Real-time Network Activity</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Connected</span>
                    </div>
                </div>

                {/* Animated Data Stream Simulation */}
                <div className="h-48 relative mb-4">
                    <canvas 
                        id="pulse-canvas" 
                        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                    ></canvas>
                    <div className="absolute inset-0 flex flex-col justify-end gap-2 p-4">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
                            <span>Region</span>
                            <span>Latency</span>
                            <span>Load</span>
                        </div>
                        {[
                            { r: 'North America', l: '24ms', load: '65%' },
                            { r: 'Europe Central', l: '42ms', load: '82%' },
                            { r: 'Asia Pacific', l: '118ms', load: '41%' }
                        ].map((node, i) => (
                            <div key={i} className="flex items-center justify-between py-1 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <span className="text-xs text-slate-300 font-medium">{node.r}</span>
                                <div className="flex-1 mx-4 h-px bg-gradient-to-r from-indigo-500/20 via-indigo-500/50 to-transparent"></div>
                                <span className="text-[10px] text-indigo-400 font-mono">{node.l}</span>
                                <span className="text-[10px] text-slate-400 ml-4">{node.load}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Live Ticker */}
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800 p-6 flex flex-col group hover:border-indigo-500/40 transition-colors">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Live Activity
                </h3>
                <div className="flex-1 space-y-4 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80 pointer-events-none z-10"></div>
                    {events.map((ev, i) => (
                        <div key={ev.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{ev.user}</p>
                                <p className="text-[10px] text-slate-400 leading-none mt-0.5">{ev.action}</p>
                                <p className="text-[9px] text-indigo-400 font-black uppercase mt-1">{ev.value}</p>
                            </div>
                            <span className="ml-auto text-[8px] text-slate-600 font-bold whitespace-nowrap">{ev.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tournament Countdown */}
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors duration-500"></div>
                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Major Event
                </h3>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center mb-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Grand Masters Cup</p>
                        <h4 className="text-2xl font-black text-white">$10,000 POOL</h4>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 w-full">
                        {[
                            { v: '04', l: 'Hrs' },
                            { v: '28', l: 'Min' },
                            { v: '15', l: 'Sec' }
                        ].map((unit, i) => (
                            <div key={i} className="bg-slate-950/50 rounded-xl p-2 border border-slate-800 text-center">
                                <div className="text-xl font-black text-amber-400 tracking-tighter">{unit.v}</div>
                                <div className="text-[8px] text-slate-600 uppercase font-black">{unit.l}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="mt-4 w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/20">
                    Register Now
                </button>
            </div>
        </div>
    );
};

export default ArenaLanding;
