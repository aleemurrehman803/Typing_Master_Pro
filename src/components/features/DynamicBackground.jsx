import React, { useEffect, useRef } from 'react';

const DynamicBackground = ({ theme = 'default', wpm = 0, isActive = false }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (theme === 'default') return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // 🟢 Matrix Theme Logic
        const columns = Math.floor(canvas.width / 20);
        const drops = new Array(columns).fill(1);
        const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()*&^%";

        // 🌌 Starfield Theme Logic
        const stars = Array.from({ length: 400 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.1
        }));

        const render = () => {
            // Adjust speed based on WPM (Min 1, reacts as WPM ramps up)
            const wpmBoost = Math.max(1, wpm / 20);

            if (theme === 'matrix') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0F0'; // Neon Matrix Green
                ctx.font = '15px monospace';

                for (let i = 0; i < drops.length; i++) {
                    const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                    ctx.fillText(text, i * 20, drops[i] * 20);

                    if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i] += (isActive ? wpmBoost : 1);
                }
            } 
            else if (theme === 'stars') {
                ctx.fillStyle = '#020617'; // Deep Slate Black
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                stars.forEach(star => {
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                    ctx.fill();

                    // Stars move faster as you type faster!
                    star.y += star.speed * (isActive ? wpmBoost : 1);

                    if (star.y > canvas.height) {
                        star.y = 0;
                        star.x = Math.random() * canvas.width;
                    }
                });
            }

            animationFrameId = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
        };
    }, [theme, isActive, wpm]);

    if (theme === 'default') return null;

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 pointer-events-none z-[-1] opacity-30 dark:opacity-20 transition-opacity duration-1000"
        />
    );
};

export default DynamicBackground;
