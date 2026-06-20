import { useState, useMemo, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Clock, Star, Target, Zap, Crown, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { secureStorage } from '../utils/auth';
import { DbService } from '../services/db.service';

/**
 * Leaderboard Page
 *
 * Displays competitive rankings sourced from the local leaderboard array
 * stored in secureStorage (populated by updateStats() on every test).
 *
 * Tabs: All-Time | This Week | Today
 * Each score entry: { id, userId, name, email, wpm, accuracy, date, duration }
 */

// ─── Tier Config ─────────────────────────────────────────────────────────────
const TIERS = [
    { id: 'champion', label: 'Champion', minPct: 99, icon: '👑', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { id: 'master',   label: 'Master',   minPct: 95, icon: '🔥', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
    { id: 'expert',   label: 'Expert',   minPct: 90, icon: '⚡', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
    { id: 'advanced', label: 'Advanced', minPct: 75, icon: '🌟', color: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
    { id: 'rising',   label: 'Rising',   minPct: 0,  icon: '🌱', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
];

function getTier(rank, total) {
    if (!total) return TIERS[4];
    const pct = ((total - rank) / total) * 100;
    return TIERS.find(t => pct >= t.minPct) || TIERS[4];
}

// ─── Helper: Date Filters ─────────────────────────────────────────────────────
function isToday(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.toDateString() === now.toDateString();
}
function isThisWeek(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
}

// ─── Build ranked entries from raw score log ──────────────────────────────────
function buildRankings(scores) {
    // Aggregate best score per user
    const byUser = {};
    scores.forEach(entry => {
        const key = entry.email || entry.userId || entry.name;
        if (!byUser[key] || entry.wpm > byUser[key].wpm) {
            byUser[key] = entry;
        }
    });

    return Object.values(byUser)
        .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
        .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

// ─── Rank Change Indicator ─────────────────────────────────────────────────────
const RankChange = ({ value }) => {
    if (!value || value === 0) return <Minus className="rc-icon rc-neutral" size={14} />;
    return value > 0
        ? <><ChevronUp className="rc-icon rc-up" size={14} /><span className="rc-up">{value}</span></>
        : <><ChevronDown className="rc-icon rc-down" size={14} /><span className="rc-down">{Math.abs(value)}</span></>;
};

// ─── Podium (Top 3) ───────────────────────────────────────────────────────────
const Podium = ({ top3, currentEmail }) => {
    if (!top3.length) return null;
    const [second, first, third] = [top3[1], top3[0], top3[2]];
    const podiumOrder = [second, first, third].filter(Boolean);
    const heights = [first?.rank === 2 ? '120px' : '120px', '140px', '100px'];

    return (
        <div className="lb-podium">
            {podiumOrder.map((entry, i) => {
                if (!entry) return null;
                const isCurrent = entry.email === currentEmail;
                const medals = ['🥈', '🥇', '🥉'];
                const ht = heights[i];
                return (
                    <div key={entry.id || i} className={`lb-podium-slot ${isCurrent ? 'lb-podium-you' : ''}`}>
                        <div className="lb-podium-avatar">
                            {entry.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="lb-podium-name">{isCurrent ? 'You 👈' : entry.name}</div>
                        <div className="lb-podium-wpm">{entry.wpm} <span>WPM</span></div>
                        <div className="lb-podium-block" style={{ height: ht }}>
                            <span className="lb-podium-medal">{medals[i]}</span>
                            <span className="lb-podium-rank">#{entry.rank}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Leaderboard = () => {
    const { user } = useAuthStore();
    const [tab, setTab] = useState('alltime');
    const [hoveredRow, setHoveredRow] = useState(null);

    const [allScores, setAllScores] = useState([]);
    const [loadingScores, setLoadingScores] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                setLoadingScores(true);
                const result = await DbService.getLeaderboard();
                if (result.success) {
                    setAllScores(result.scores);
                }
            } catch (e) {
                console.error('Failed to fetch leaderboard:', e);
            } finally {
                setLoadingScores(false);
            }
        };
        fetchScores();
    }, []);

    const filteredScores = useMemo(() => {
        if (tab === 'today')   return allScores.filter(s => isToday(s.date));
        if (tab === 'week')    return allScores.filter(s => isThisWeek(s.date));
        return allScores;
    }, [allScores, tab]);

    const ranked = useMemo(() => buildRankings(filteredScores), [filteredScores]);

    const currentEmail = user?.email?.toLowerCase();
    const currentRanked = ranked.find(e => e.email?.toLowerCase() === currentEmail);
    const top3 = ranked.slice(0, 3);

    // Add demo data if board is empty (first run)
    const displayData = useMemo(() => {
        if (ranked.length > 0) return ranked;
        return [
            { rank: 1, name: 'Speed Master',    email: 'demo1@typemasterpro.com', wpm: 120, accuracy: 98, date: new Date().toISOString() },
            { rank: 2, name: 'Type Pro',         email: 'demo2@typemasterpro.com', wpm: 115, accuracy: 97, date: new Date().toISOString() },
            { rank: 3, name: 'Keyboard Wizard',  email: 'demo3@typemasterpro.com', wpm: 110, accuracy: 99, date: new Date().toISOString() },
            { rank: 4, name: 'Fast Fingers',     email: 'demo4@typemasterpro.com', wpm: 105, accuracy: 96, date: new Date().toISOString() },
            { rank: 5, name: 'Quick Keys',       email: 'demo5@typemasterpro.com', wpm: 100, accuracy: 95, date: new Date().toISOString() },
        ];
    }, [ranked]);

    const TABS = [
        { id: 'alltime', label: 'All Time',  icon: <Crown size={14}/> },
        { id: 'week',    label: 'This Week', icon: <TrendingUp size={14}/> },
        { id: 'today',   label: 'Today',     icon: <Clock size={14}/> },
    ];

    return (
        <div className="lb-root">

            {/* ── Hero Header ─────────────────────────────────────────────── */}
            <div className="lb-hero">
                <div className="lb-hero-glow" />
                <Trophy className="lb-hero-icon" />
                <h1 className="lb-hero-title">Global Leaderboard</h1>
                <p className="lb-hero-sub">Compete. Improve. Dominate.</p>

                {/* Current user rank pill */}
                {currentRanked && (
                    <div className="lb-your-rank">
                        <Star size={14} /> Your Rank: <strong>#{currentRanked.rank}</strong>
                        &nbsp;&middot;&nbsp;<strong>{currentRanked.wpm} WPM</strong>
                    </div>
                )}
            </div>

            {/* ── Tabs ─────────────────────────────────────────────────────── */}
            <div className="lb-tabs" role="tablist">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        id={`lb-tab-${t.id}`}
                        role="tab"
                        aria-selected={tab === t.id}
                        className={`lb-tab ${tab === t.id ? 'lb-tab-active' : ''}`}
                        onClick={() => setTab(t.id)}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── Podium ───────────────────────────────────────────────────── */}
            <Podium top3={displayData.slice(0,3)} currentEmail={currentEmail} />

            {/* ── Stats Summary Row ─────────────────────────────────────────── */}
            <div className="lb-stats-row">
                <div className="lb-stat">
                    <Target size={18} className="lb-stat-icon" />
                    <div>
                        <div className="lb-stat-val">{displayData.length}</div>
                        <div className="lb-stat-label">Competitors</div>
                    </div>
                </div>
                <div className="lb-stat">
                    <Zap size={18} className="lb-stat-icon" />
                    <div>
                        <div className="lb-stat-val">{displayData[0]?.wpm || '—'}</div>
                        <div className="lb-stat-label">Top WPM</div>
                    </div>
                </div>
                <div className="lb-stat">
                    <Trophy size={18} className="lb-stat-icon" />
                    <div>
                        <div className="lb-stat-val">
                            {displayData.length > 0
                                ? Math.round(displayData.reduce((s,e) => s + e.wpm, 0) / displayData.length)
                                : '—'}
                        </div>
                        <div className="lb-stat-label">Avg WPM</div>
                    </div>
                </div>
            </div>

            {/* ── Full Rankings Table ───────────────────────────────────────── */}
            <div className="lb-table-wrap">
                <table className="lb-table" aria-label="Leaderboard Rankings">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>User</th>
                            <th>Tier</th>
                            <th>WPM</th>
                            <th>Accuracy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((entry, idx) => {
                            const tier = getTier(entry.rank, displayData.length);
                            const isYou = entry.email?.toLowerCase() === currentEmail;
                            const isHovered = hoveredRow === idx;

                            return (
                                <tr
                                    key={entry.id || idx}
                                    className={`lb-row ${isYou ? 'lb-row-you' : ''} ${isHovered ? 'lb-row-hover' : ''}`}
                                    onMouseEnter={() => setHoveredRow(idx)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="lb-td-rank">
                                        {entry.rank === 1 && <span className="lb-medal">🥇</span>}
                                        {entry.rank === 2 && <span className="lb-medal">🥈</span>}
                                        {entry.rank === 3 && <span className="lb-medal">🥉</span>}
                                        {entry.rank > 3 && <span className="lb-rank-num">#{entry.rank}</span>}
                                    </td>
                                    <td className="lb-td-user">
                                        <div className="lb-avatar" style={{ background: isYou ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : undefined }}>
                                            {(entry.name?.[0] || '?').toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="lb-user-name">
                                                {entry.name || 'Anonymous'}
                                                {isYou && <span className="lb-you-badge">You</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="lb-tier" style={{ color: tier.color, background: tier.bg }}>
                                            {tier.icon} {tier.label}
                                        </span>
                                    </td>
                                    <td className="lb-td-wpm">{entry.wpm}</td>
                                    <td className="lb-td-acc">{entry.accuracy}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {displayData.length === 0 && (
                    <div className="lb-empty">
                        <p>No scores recorded for this period yet.</p>
                        <p>Complete a typing test to appear on the leaderboard!</p>
                    </div>
                )}
            </div>

            {/* ── Tier Legend ───────────────────────────────────────────────── */}
            <div className="lb-legend">
                <p className="lb-legend-title">Tier System</p>
                <div className="lb-legend-items">
                    {TIERS.map(t => (
                        <div key={t.id} className="lb-legend-item">
                            <span>{t.icon}</span>
                            <span style={{ color: t.color }}>{t.label}</span>
                            <span className="lb-legend-pct">Top {t.minPct > 0 ? `${100 - t.minPct}%` : '50%+'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .lb-root { max-width: 860px; margin: 0 auto; padding-bottom: 48px; }

                /* Hero */
                .lb-hero {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%);
                    border-radius: 20px;
                    padding: 48px 24px 40px;
                    text-align: center;
                    margin-bottom: 24px;
                    box-shadow: 0 20px 60px rgba(99,102,241,0.25);
                }
                .lb-hero-glow {
                    position: absolute;
                    top: -60px; left: 50%; transform: translateX(-50%);
                    width: 300px; height: 200px;
                    background: radial-gradient(ellipse, rgba(99,102,241,0.4), transparent 70%);
                    pointer-events: none;
                }
                .lb-hero-icon { width: 52px; height: 52px; color: #fbbf24; margin-bottom: 12px; filter: drop-shadow(0 0 12px #fbbf24); }
                .lb-hero-title { font-size: 32px; font-weight: 800; color: #f1f5f9; margin: 0 0 8px; letter-spacing: -0.5px; }
                .lb-hero-sub { font-size: 15px; color: #94a3b8; margin: 0 0 20px; }
                .lb-your-rank {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4);
                    color: #c7d2fe; padding: 7px 18px; border-radius: 999px; font-size: 14px;
                }

                /* Tabs */
                .lb-tabs {
                    display: flex; gap: 8px; margin-bottom: 24px;
                    background: #0f172a; border: 1px solid #1e293b;
                    border-radius: 12px; padding: 4px;
                }
                .lb-tab {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
                    padding: 10px; border-radius: 8px; border: none; background: transparent;
                    color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer;
                    transition: all 0.2s;
                }
                .lb-tab:hover { color: #94a3b8; }
                .lb-tab-active {
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.35);
                }

                /* Podium */
                .lb-podium {
                    display: flex; align-items: flex-end; justify-content: center; gap: 12px;
                    margin-bottom: 28px;
                }
                .lb-podium-slot { display: flex; flex-direction: column; align-items: center; gap: 6px; }
                .lb-podium-avatar {
                    width: 44px; height: 44px; border-radius: 50%;
                    background: linear-gradient(135deg, #334155, #1e293b);
                    color: #e2e8f0; font-weight: 700; font-size: 18px;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid #334155;
                }
                .lb-podium-you .lb-podium-avatar { border-color: #6366f1; background: linear-gradient(135deg, #4f46e5, #7c3aed); }
                .lb-podium-name { font-size: 12px; font-weight: 600; color: #94a3b8; max-width: 80px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .lb-podium-you .lb-podium-name { color: #818cf8; }
                .lb-podium-wpm { font-size: 14px; font-weight: 700; color: #f1f5f9; }
                .lb-podium-wpm span { font-size: 11px; font-weight: 400; color: #64748b; }
                .lb-podium-block {
                    width: 80px; border-radius: 8px 8px 0 0;
                    background: linear-gradient(180deg, #1e293b, #0f172a);
                    border: 1px solid #334155; border-bottom: none;
                    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
                }
                .lb-podium-medal { font-size: 24px; }
                .lb-podium-rank { font-size: 11px; color: #64748b; font-weight: 600; }

                /* Stats row */
                .lb-stats-row {
                    display: grid; grid-template-columns: repeat(3,1fr); gap: 12px;
                    margin-bottom: 24px;
                }
                .lb-stat {
                    background: #0f172a; border: 1px solid #1e293b;
                    border-radius: 12px; padding: 16px 20px;
                    display: flex; align-items: center; gap: 12px;
                }
                .lb-stat-icon { color: #6366f1; flex-shrink: 0; }
                .lb-stat-val { font-size: 22px; font-weight: 800; color: #f1f5f9; }
                .lb-stat-label { font-size: 12px; color: #64748b; margin-top: 2px; }

                /* Table */
                .lb-table-wrap {
                    background: #0f172a; border: 1px solid #1e293b;
                    border-radius: 16px; overflow: hidden; margin-bottom: 20px;
                }
                .lb-table { width: 100%; border-collapse: collapse; }
                .lb-table thead th {
                    padding: 14px 20px; text-align: left;
                    font-size: 12px; font-weight: 600; text-transform: uppercase;
                    letter-spacing: 0.06em; color: #475569;
                    background: #0a0f1e; border-bottom: 1px solid #1e293b;
                }
                .lb-row { transition: background 0.15s; border-bottom: 1px solid #1e293b; }
                .lb-row:last-child { border-bottom: none; }
                .lb-row-hover { background: #1e293b; }
                .lb-row-you { background: rgba(99,102,241,0.06); }
                .lb-row-you.lb-row-hover { background: rgba(99,102,241,0.12); }
                .lb-table td { padding: 14px 20px; vertical-align: middle; }

                .lb-td-rank { width: 80px; }
                .lb-medal { font-size: 22px; }
                .lb-rank-num { font-size: 14px; font-weight: 700; color: #64748b; }

                .lb-td-user { display: flex; align-items: center; gap: 12px; }
                .lb-avatar {
                    width: 38px; height: 38px; border-radius: 50%;
                    background: linear-gradient(135deg, #1e293b, #334155);
                    color: #94a3b8; font-weight: 700; font-size: 15px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .lb-user-name { font-size: 14px; font-weight: 600; color: #f1f5f9; display: flex; align-items: center; gap: 8px; }
                .lb-you-badge {
                    font-size: 10px; font-weight: 700; background: rgba(99,102,241,0.2);
                    color: #818cf8; border: 1px solid rgba(99,102,241,0.35);
                    padding: 2px 7px; border-radius: 20px;
                }

                .lb-tier {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;
                }
                .lb-td-wpm { font-size: 16px; font-weight: 800; color: #818cf8; }
                .lb-td-acc { font-size: 14px; font-weight: 600; color: #34d399; }

                .lb-empty { padding: 40px; text-align: center; color: #64748b; line-height: 1.8; }

                /* Legend */
                .lb-legend {
                    background: #0f172a; border: 1px solid #1e293b;
                    border-radius: 12px; padding: 16px 20px;
                }
                .lb-legend-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; margin-bottom: 12px; }
                .lb-legend-items { display: flex; flex-wrap: wrap; gap: 12px; }
                .lb-legend-item { display: flex; align-items: center; gap: 6px; font-size: 13px; }
                .lb-legend-pct { color: #475569; font-size: 11px; }

                /* Rank change */
                .rc-icon { display: inline-block; }
                .rc-up { color: #34d399; }
                .rc-down { color: #f87171; }
                .rc-neutral { color: #475569; }
            `}</style>
        </div>
    );
};

export default Leaderboard;
