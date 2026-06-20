import { describe, it, expect, beforeEach } from 'vitest';
import { HashChain } from './hashChain';

describe('HashChain Cryptographic Verification', () => {
    let chain;

    beforeEach(() => {
        chain = new HashChain();
    });

    it('should initialize with a unique 32-character hex nonce', async () => {
        const nonce = await chain.initialize();
        expect(nonce).toBeDefined();
        expect(nonce).toHaveLength(32); // 16 bytes in hex representation
        expect(/^[0-9a-fA-F]+$/.test(nonce)).toBe(true);
        expect(chain.currentHash).toBe(nonce);
        expect(chain.chainLength).toBe(0);
    });

    it('should throw an error if adding a keystroke before initializing', async () => {
        await expect(chain.addKeystroke('a', 1.25)).rejects.toThrow('HashChain not initialized');
    });

    it('should append keystroke and update hash chain', async () => {
        const nonce = await chain.initialize();
        const hash1 = await chain.addKeystroke('a', 100.5);
        expect(hash1).toBeDefined();
        expect(hash1).not.toBe(nonce);
        expect(chain.chainLength).toBe(1);

        const hash2 = await chain.addKeystroke('b', 200.2);
        expect(hash2).toBeDefined();
        expect(hash2).not.toBe(hash1);
        expect(chain.chainLength).toBe(2);

        const proof = chain.getProof();
        expect(proof.nonce).toBe(nonce);
        expect(proof.finalHash).toBe(hash2);
        expect(proof.chainLength).toBe(2);
    });

    it('should verify a valid sequence of keystrokes offline', async () => {
        const nonce = await chain.initialize();
        const keystrokes = [
            { char: 'h', timestamp: 10.0 },
            { char: 'e', timestamp: 20.0 },
            { char: 'l', timestamp: 30.0 },
            { char: 'l', timestamp: 40.0 },
            { char: 'o', timestamp: 50.0 }
        ];

        for (const k of keystrokes) {
            await chain.addKeystroke(k.char, k.timestamp);
        }

        const proof = chain.getProof();
        const isValid = await HashChain.verify(nonce, keystrokes, proof.finalHash);
        expect(isValid).toBe(true);
    });

    it('should reject verified chain if keystroke character is altered', async () => {
        const nonce = await chain.initialize();
        const keystrokes = [
            { char: 'a', timestamp: 10.0 },
            { char: 'b', timestamp: 20.0 }
        ];

        for (const k of keystrokes) {
            await chain.addKeystroke(k.char, k.timestamp);
        }

        const proof = chain.getProof();

        // Alter char in validation sequence
        const alteredKeystrokes = [
            { char: 'a', timestamp: 10.0 },
            { char: 'z', timestamp: 20.0 } // altered 'b' to 'z'
        ];

        const isValid = await HashChain.verify(nonce, alteredKeystrokes, proof.finalHash);
        expect(isValid).toBe(false);
    });

    it('should reject verified chain if keystroke timestamp is altered', async () => {
        const nonce = await chain.initialize();
        const keystrokes = [
            { char: 'a', timestamp: 10.0 },
            { char: 'b', timestamp: 20.0 }
        ];

        for (const k of keystrokes) {
            await chain.addKeystroke(k.char, k.timestamp);
        }

        const proof = chain.getProof();

        // Alter timestamp in validation sequence
        const alteredKeystrokes = [
            { char: 'a', timestamp: 10.0 },
            { char: 'b', timestamp: 20.01 } // altered 20.0 to 20.01
        ];

        const isValid = await HashChain.verify(nonce, alteredKeystrokes, proof.finalHash);
        expect(isValid).toBe(false);
    });
});
