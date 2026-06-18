/**
 * Advanced Web Audio API Keystroke Synthesizer
 * Provides zero-latency, high-performance sound profiles.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.profile = 'mechanical'; // 'mechanical', 'soft', 'retro', 'silent'
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    setProfile(profile) {
        this.profile = profile;
    }

    playClick(isSpace = false) {
        if (!this.ctx || this.profile === 'silent') return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        if (this.profile === 'mechanical') {
            // High-pitched short burst for that "clicky" feel
            osc.type = 'square';
            osc.frequency.setValueAtTime(isSpace ? 400 : 800, now);
            osc.frequency.exponentialRampToValueAtTime(isSpace ? 100 : 200, now + 0.05);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            
            osc.start(now);
            osc.stop(now + 0.05);
        } 
        else if (this.profile === 'soft') {
            // Low-pass filtered noise/thud
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            
            osc.start(now);
            osc.stop(now + 0.1);
        }
        else if (this.profile === 'retro') {
            // Classic arcade blip
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(isSpace ? 600 : 1200, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.15);
            
            osc.start(now);
            osc.stop(now + 0.15);
        }
    }

    /**
     * Synthesize a celebratory notification sound (Happy Fanfare)
     */
    playSuccess() {
        if (!this.ctx || this.profile === 'silent') return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        
        // Simple 3-note ascending chime (e.g., C5, E5, G5)
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.4);
        });
    }
}

export const soundEngine = new SoundEngine();
