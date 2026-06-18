export const ARENA_RANKS = [
    { id: 'rookie', name: 'Rookie', minXP: 0, icon: '🛡️', color: 'text-slate-400' },
    { id: 'apprentice', name: 'Apprentice', minXP: 500, icon: '⚔️', color: 'text-emerald-400' },
    { id: 'gladiator', name: 'Gladiator', minXP: 1500, icon: '🌪️', color: 'text-indigo-400' },
    { id: 'warlord', name: 'Warlord', minXP: 3500, icon: '🔥', color: 'text-red-500' },
    { id: 'legend', name: 'Legend', minXP: 7500, icon: '👑', color: 'text-amber-400' }
];

export const getRank = (xp) => {
    return ARENA_RANKS.slice().reverse().find(r => xp >= r.minXP) || ARENA_RANKS[0];
};

export const getNextRank = (currentXP) => {
    return ARENA_RANKS.find(r => r.minXP > currentXP);
};

export const calculateBattleRewards = (wpm, accuracy, isVictory, battleMode) => {
    let baseXP = isVictory ? 100 : 25;

    // Performance Bonuses
    if (wpm > 60) baseXP += 20;
    if (wpm > 80) baseXP += 30;
    if (accuracy === 100) baseXP += 50;

    // Mode Multipliers
    if (battleMode === 'competitive') baseXP *= 1.5;
    if (battleMode === 'pro') baseXP *= 2; // High risk high reward

    return Math.floor(baseXP);
};

export const saveArenaProgress = (xpGained, coinsGained) => {
    const currentStats = JSON.parse(localStorage.getItem('arena_stats') || JSON.stringify({
        xp: 0,
        battles: 0,
        wins: 0,
        coins: 0
    }));

    const oldRank = getRank(currentStats.xp);

    currentStats.xp += xpGained;
    currentStats.coins += coinsGained;
    currentStats.battles += 1;
    if (xpGained > 50) currentStats.wins += 1; // Assuming high XP implies win for now, or pass isVictory

    const newRank = getRank(currentStats.xp);
    const leveledUp = newRank.id !== oldRank.id;

    localStorage.setItem('arena_stats', JSON.stringify(currentStats));
    localStorage.setItem('arena_coins', currentStats.coins.toString()); // Sync with simple key

    return { leveledUp, newRank, currentStats };
};
