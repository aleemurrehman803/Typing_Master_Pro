import { useRef, useCallback, useEffect } from 'react';
import useSettingsStore from '../store/useSettingsStore';

export const useSoundEngine = () => {
    const { soundProfile } = useSettingsStore(); // 'silent', 'mechanical', 'typewriter', 'soft'
    const audioCtxRef = useRef(null);

    useEffect(() => {
        // Initialize AudioContext only on first interaction to comply with browser autoplay policies
        const initAudio = () => {
            if (!audioCtxRef.current && soundProfile !== 'silent') {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
        };

        window.addEventListener('keydown', initAudio, { once: true });
        window.addEventListener('click', initAudio, { once: true });
        return () => {
            window.removeEventListener('keydown', initAudio);
            window.removeEventListener('click', initAudio);
        };
    }, [soundProfile]);

    const playKeystroke = useCallback((isError = false) => {
        if (soundProfile === 'silent' || !audioCtxRef.current) return;

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        if (isError) {
            // Error sound (low buzzer / clunky thud)
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            return;
        }

        if (soundProfile === 'mechanical') {
            // Crisp, high-pitched mechanical click
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            
            // Add a little noise for the "clack"
            const bufferSize = ctx.sampleRate * 0.03; // 30ms
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 2000;
            noise.connect(noiseFilter);
            noiseFilter.connect(gainNode);
            noise.start(now);
            noise.stop(now + 0.03);

            osc.start(now);
            osc.stop(now + 0.05);
        } else if (soundProfile === 'typewriter') {
            // Metallic, sharp snap
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
        } else if (soundProfile === 'soft') {
            // Muted thud
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        }
    }, [soundProfile]);

    return { playKeystroke };
};
