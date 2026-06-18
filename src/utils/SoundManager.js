/**
 * SoundManager - Procedural Audio Generation for Typing
 * Uses Web Audio API to synthesize mechanical keyboard sounds without external assets.
 */
class SoundManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = 0.3; // Default volume
        this.enabled = true;
        this.type = 'mechanical'; // mechanical, membrane, typewriter
    }

    setVolume(value) {
        this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }

    setType(type) {
        this.type = type;
    }

    toggle(enabled) {
        this.enabled = enabled;
        if (enabled && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    playClick() {
        if (!this.enabled) return;
        if (this.context.state === 'suspended') this.context.resume();

        const t = this.context.currentTime;

        if (this.type === 'mechanical') {
            // High pitched 'click'
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + 0.05);

            // Low pitched 'thock' body
            const osc2 = this.context.createOscillator();
            const gain2 = this.context.createGain();

            osc2.type = 'square';
            osc2.frequency.setValueAtTime(150, t);
            osc2.frequency.exponentialRampToValueAtTime(50, t + 0.1);

            gain2.gain.setValueAtTime(0.2, t);
            gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

            osc2.connect(gain2);
            gain2.connect(this.masterGain);

            osc2.start(t);
            osc2.stop(t + 0.1);
        } else if (this.type === 'typewriter') {
            // Sharp distinct click
            const noiseBuffer = this.context.createBuffer(1, 44100 * 0.1, 44100);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < 44100 * 0.1; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = this.context.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseGain = this.context.createGain();
            noiseGain.gain.setValueAtTime(0.8, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
            noise.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            noise.start(t);
        }
    }

    playError() {
        if (!this.enabled) return;
        const t = this.context.currentTime;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.1);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.2);
    }

    playWin() {
        if (!this.enabled) return;
        const t = this.context.currentTime;

        // Major Chord Arpeggio
        [440, 554, 659, 880].forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.1);
            gain.gain.setValueAtTime(0.2, t + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 1);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 1);
        });
    }
}

export const soundManager = new SoundManager();
