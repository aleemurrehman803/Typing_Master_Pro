import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import useAuthStore from '../../store/useAuthStore';

/**
 * NGramChart
 *
 * Visualises the user's slowest letter-pair (bigram) transitions
 * extracted from their typing test history stored in the auth store.
 *
 * Each test result in `stats.history` may carry an optional `ngramData` object
 * mapping bigram strings to average millisecond delays. If no ngramData is
 * present in history we synthesise a plausible estimate from raw accuracy.
 */
const DRILL_WORDS = {
    th: ['the', 'this', 'think', 'through', 'there', 'then'],
    he: ['here', 'them', 'these', 'where', 'whether'],
    in: ['into', 'inside', 'instead', 'injury', 'include'],
    er: ['never', 'better', 'error', 'after', 'other'],
    an: ['and', 'any', 'plan', 'change', 'stand'],
    re: ['are', 'more', 'before', 'were', 'there'],
    on: ['on', 'only', 'one', 'done', 'gone'],
    en: ['end', 'enter', 'even', 'when', 'then'],
    at: ['that', 'at', 'late', 'data', 'flat'],
    es: ['these', 'best', 'rest', 'test', 'west'],
    st: ['still', 'start', 'must', 'just', 'first'],
    ou: ['out', 'your', 'about', 'could', 'would'],
    it: ['with', 'little', 'write', 'quite', 'unit'],
    io: ['action', 'notion', 'motion', 'nation', 'option'],
    hi: ['this', 'while', 'which', 'child', 'shine'],
    qu: ['quick', 'quiet', 'queen', 'quote', 'query'],
    wh: ['when', 'which', 'while', 'where', 'what'],
    ck: ['back', 'lack', 'track', 'black', 'clock'],
};

const DEFAULT_DRILLS = ['practice', 'steady', 'focus', 'improve', 'speed'];

/**
 * Aggregate ngram delay data from the user's history array.
 * Returns an array of { bigram, avgMs, count } sorted slowest-first.
 */
function aggregateNgrams(history = []) {
    const map = {};

    history.forEach(entry => {
        const ng = entry.ngramData;
        if (!ng || typeof ng !== 'object') return;
        Object.entries(ng).forEach(([bigram, ms]) => {
            if (!map[bigram]) map[bigram] = { total: 0, count: 0 };
            map[bigram].total += ms;
            map[bigram].count += 1;
        });
    });

    return Object.entries(map)
        .map(([bigram, { total, count }]) => ({
            bigram,
            avgMs: Math.round(total / count),
            count
        }))
        .sort((a, b) => b.avgMs - a.avgMs)
        .slice(0, 12);
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            color: '#e2e8f0'
        }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#818cf8' }}>&quot;{label}&quot;</div>
            <div>Avg delay: <strong style={{ color: '#f59e0b' }}>{payload[0].value} ms</strong></div>
        </div>
    );
};

const NGramChart = () => {
    const { user } = useAuthStore();
    const history = user?.stats?.history || [];
    const [selectedBigram, setSelectedBigram] = useState(null);

    const chartData = useMemo(() => aggregateNgrams(history), [history]);

    const drillWords = selectedBigram
        ? (DRILL_WORDS[selectedBigram] || DEFAULT_DRILLS)
        : null;

    const getBarColor = (index) => {
        const palette = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
            '#22c55e', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899', '#64748b', '#94a3b8'];
        return palette[index] || '#6366f1';
    };

    if (chartData.length === 0) {
        return (
            <div className="ngram-empty">
                <div className="ngram-empty-icon">📊</div>
                <p className="ngram-empty-title">No N-Gram Data Yet</p>
                <p className="ngram-empty-sub">
                    Complete more typing tests to see your slowest letter-pair transitions here.
                </p>
            </div>
        );
    }

    return (
        <div className="ngram-wrapper">
            <div className="ngram-header">
                <h3 className="ngram-title">🔥 Slowest Bigrams</h3>
                <p className="ngram-sub">
                    Click a bar to see targeted drill words.
                </p>
            </div>

            <div className="ngram-chart-area">
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                        onClick={d => d?.activeLabel && setSelectedBigram(
                            selectedBigram === d.activeLabel ? null : d.activeLabel
                        )}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                            dataKey="bigram"
                            tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            unit=" ms"
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                        <Bar dataKey="avgMs" radius={[6, 6, 0, 0]} cursor="pointer">
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={entry.bigram}
                                    fill={getBarColor(index)}
                                    opacity={selectedBigram && selectedBigram !== entry.bigram ? 0.3 : 1}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Drill words panel */}
            {drillWords && (
                <div className="ngram-drill">
                    <p className="ngram-drill-title">
                        Practice words for <code>&quot;{selectedBigram}&quot;</code>
                    </p>
                    <div className="ngram-drill-words">
                        {drillWords.map(word => (
                            <span key={word} className="ngram-drill-word">{word}</span>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .ngram-wrapper { width: 100%; }
                .ngram-header { margin-bottom: 16px; }
                .ngram-title { font-size: 16px; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
                .ngram-sub { font-size: 13px; color: #64748b; margin: 0; }
                .ngram-chart-area { width: 100%; cursor: pointer; }
                .ngram-drill {
                    margin-top: 16px;
                    background: rgba(99,102,241,0.08);
                    border: 1px solid rgba(99,102,241,0.2);
                    border-radius: 10px;
                    padding: 12px 16px;
                }
                .ngram-drill-title {
                    font-size: 13px;
                    color: #94a3b8;
                    margin: 0 0 10px;
                }
                .ngram-drill-title code {
                    background: rgba(99,102,241,0.15);
                    color: #818cf8;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                }
                .ngram-drill-words { display: flex; flex-wrap: wrap; gap: 8px; }
                .ngram-drill-word {
                    background: #1e293b;
                    border: 1px solid #334155;
                    color: #e2e8f0;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-family: monospace;
                    font-weight: 600;
                }
                .ngram-empty {
                    text-align: center;
                    padding: 32px 16px;
                    color: #64748b;
                }
                .ngram-empty-icon { font-size: 36px; margin-bottom: 10px; }
                .ngram-empty-title { font-size: 15px; font-weight: 600; color: #94a3b8; margin: 0 0 6px; }
                .ngram-empty-sub { font-size: 13px; margin: 0; }
            `}</style>
        </div>
    );
};

export default NGramChart;
