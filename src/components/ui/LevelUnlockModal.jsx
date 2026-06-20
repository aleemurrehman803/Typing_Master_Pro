import { useEffect, useRef } from 'react';
import { getLevelBadge, LEVEL_REQUIREMENTS, LEVELS } from '../../utils/levelSystem';
import useAuthStore from '../../store/useAuthStore';

/**
 * LevelUnlockModal
 * 
 * Celebrates the user's graduation to a new level.
 * Triggered by `levelJustUnlocked` in the auth store.
 * Dismisses via `clearLevelUnlock()`.
 */
const LevelUnlockModal = () => {
    const { levelJustUnlocked, clearLevelUnlock } = useAuthStore();
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);

    // ─── Confetti Engine ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!levelJustUnlocked) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            w: Math.random() * 12 + 4,
            h: Math.random() * 6 + 3,
            color: ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'][
                Math.floor(Math.random() * 6)
            ],
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 4 + 2,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 6,
            opacity: 1
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotSpeed;
                if (p.y > canvas.height * 0.75) p.opacity -= 0.02;
                if (p.opacity <= 0) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    p.opacity = 1;
                }
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            animFrameRef.current = requestAnimationFrame(draw);
        };
        draw();

        // Auto-dismiss confetti after 6 seconds
        const confettiTimer = setTimeout(() => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        }, 6000);

        return () => {
            clearTimeout(confettiTimer);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [levelJustUnlocked]);

    if (!levelJustUnlocked) return null;

    const badge = getLevelBadge(levelJustUnlocked);
    const levelName = LEVEL_REQUIREMENTS[levelJustUnlocked]?.name || 'Next Level';
    const levelDesc = LEVEL_REQUIREMENTS[levelJustUnlocked]?.description || '';
    const levelFeatures = LEVEL_REQUIREMENTS[levelJustUnlocked]?.features || {};

    // Human-readable feature labels
    const FEATURE_LABELS = {
        speedChallenges: { icon: '⚡', label: 'Speed Challenge Mode' },
        multiplayer: { icon: '⚔️', label: 'Battle Arena Multiplayer' },
        leaderboards: { icon: '🏆', label: 'Competitive Leaderboards' },
        certificationExams: { icon: '🎓', label: 'Certification Exams' },
        aiTutor: { icon: '🤖', label: 'AI Typing Coach' },
        customLayouts: { icon: '⌨️', label: 'Custom Keyboard Layouts' },
        apiAccess: { icon: '🔌', label: 'Developer API Access' },
        mentorship: { icon: '🌟', label: 'Expert Mentorship' },
    };

    const unlockedFeaturesList = Object.entries(FEATURE_LABELS).filter(
        ([key]) => levelFeatures[key] === true
    );

    return (
        <div
            className="lum-overlay"
            onClick={clearLevelUnlock}
            role="dialog"
            aria-modal="true"
            aria-label={`Level ${levelJustUnlocked} unlocked`}
        >
            {/* Confetti canvas */}
            <canvas ref={canvasRef} className="lum-canvas" aria-hidden="true" />

            {/* Modal card */}
            <div className="lum-card" onClick={e => e.stopPropagation()}>
                {/* Badge glow ring */}
                <div className={`lum-badge-ring lum-ring-${levelJustUnlocked}`}>
                    <span className="lum-badge-emoji">{badge.emoji}</span>
                </div>

                <div className="lum-header">
                    <p className="lum-sup">🎉 Level Up!</p>
                    <h2 className="lum-title">
                        You've reached <span className={`lum-level-name lum-color-${levelJustUnlocked}`}>{levelName}</span>
                    </h2>
                    <p className="lum-desc">{levelDesc}</p>
                </div>

                {unlockedFeaturesList.length > 0 && (
                    <div className="lum-features">
                        <p className="lum-features-title">🔓 Newly Unlocked</p>
                        <ul className="lum-feature-list">
                            {unlockedFeaturesList.map(([key, { icon, label }]) => (
                                <li key={key} className="lum-feature-item">
                                    <span className="lum-feature-icon">{icon}</span>
                                    <span className="lum-feature-label">{label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    id="level-unlock-proceed-btn"
                    className="lum-btn"
                    onClick={clearLevelUnlock}
                    autoFocus
                >
                    Let's Go! 🚀
                </button>

                <p className="lum-dismiss">Click anywhere to dismiss</p>
            </div>

            <style>{`
                .lum-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.75);
                    backdrop-filter: blur(6px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: lum-fade-in 0.3s ease;
                }
                .lum-canvas {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                .lum-card {
                    position: relative;
                    background: linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%);
                    border: 1px solid rgba(99,102,241,0.4);
                    border-radius: 24px;
                    padding: 40px 36px 32px;
                    width: min(440px, 92vw);
                    text-align: center;
                    box-shadow: 0 0 60px rgba(99,102,241,0.35), 0 25px 50px rgba(0,0,0,0.5);
                    animation: lum-slide-up 0.45s cubic-bezier(0.34,1.56,0.64,1);
                }
                .lum-badge-ring {
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    animation: lum-pulse 2s infinite;
                }
                .lum-ring-2 { background: radial-gradient(circle, #3b82f6, #6366f1); box-shadow: 0 0 30px #6366f180; }
                .lum-ring-3 { background: radial-gradient(circle, #f97316, #ef4444); box-shadow: 0 0 30px #f9731680; }
                .lum-ring-4 { background: radial-gradient(circle, #a855f7, #ec4899); box-shadow: 0 0 30px #a855f780; }
                .lum-badge-emoji { font-size: 40px; }
                .lum-header { margin-bottom: 24px; }
                .lum-sup { color: #a5b4fc; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
                .lum-title { color: #f1f5f9; font-size: 26px; font-weight: 700; line-height: 1.3; margin-bottom: 8px; }
                .lum-level-name { display: block; }
                .lum-color-2 { color: #818cf8; }
                .lum-color-3 { color: #fb923c; }
                .lum-color-4 { color: #c084fc; }
                .lum-desc { color: #94a3b8; font-size: 14px; }
                .lum-features {
                    background: rgba(99,102,241,0.08);
                    border: 1px solid rgba(99,102,241,0.2);
                    border-radius: 12px;
                    padding: 16px 20px;
                    margin-bottom: 24px;
                    text-align: left;
                }
                .lum-features-title { color: #c7d2fe; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
                .lum-feature-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
                .lum-feature-item { display: flex; align-items: center; gap: 10px; }
                .lum-feature-icon { font-size: 18px; }
                .lum-feature-label { color: #e2e8f0; font-size: 14px; }
                .lum-btn {
                    display: block;
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: transform 0.15s, box-shadow 0.15s;
                    box-shadow: 0 4px 20px rgba(99,102,241,0.5);
                }
                .lum-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(99,102,241,0.65); }
                .lum-btn:active { transform: translateY(0); }
                .lum-dismiss { color: #475569; font-size: 12px; margin-top: 12px; }
                @keyframes lum-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes lum-slide-up { from { opacity: 0; transform: translateY(40px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes lum-pulse { 0%,100% { box-shadow: 0 0 30px currentColor; } 50% { box-shadow: 0 0 50px currentColor, 0 0 80px currentColor; } }
            `}</style>
        </div>
    );
};

export default LevelUnlockModal;
