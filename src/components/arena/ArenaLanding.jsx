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
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <Swords className="w-12 h-12 text-indigo-400" />
                            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                                Battle Arena
                            </h1>
                        </div>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Transform your typing skills into competitive victories. Enter the arena, prove your speed, and earn rewards.
                        </p>
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
                                            {/* Recommended Badge */}
                                            {isRecommended && (
                                                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                    RECOMMENDED
                                                </div>
                                            )}

                                            {/* Locked Badge */}
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
