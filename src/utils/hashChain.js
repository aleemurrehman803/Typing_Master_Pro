/**
 * Phase 5: Security Layer 2 - Cryptographic Integrity (Hash Chain)
 * 
 * Implements a simplified Hash Chain to verify the sequence of keystrokes.
 * In a full production environment, the initial nonce would come from the server.
 * This ensures that "Client only proves consistency, not truth" as per roadmap.
 * 
 * Usage:
 * 1. Initialize chain with a nonce.
 * 2. For every keystroke, hash(prevHash + keystrokeData).
 * 3. Final hash proves the exact sequence of events.
 */

/**
 * @typedef {import('../types/global').Keystroke} Keystroke
 */

export class HashChain {
    constructor() {
        this.currentHash = '';
        this.nonce = '';
        /* 
           Using a simpler history for now to avoid memory explosion in long tests.
           In production, we might just keep the chain head.
        */
        this.chainLength = 0;
    }

    /**
     * Initializes the hash chain with a random nonce (simulating server-issued).
     * @returns {Promise<string>} The initial nonce.
     */
    async initialize() {
        // Generate a random 16-byte nonce
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        this.nonce = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
        this.currentHash = this.nonce;
        this.chainLength = 0;
        return this.nonce;
    }

    /**
     * Adds a keystroke to the hash chain.
     * Uses SHA-256 via Web Crypto API (SubtleCrypto).
     * 
     * @param {string} char - The character typed.
     * @param {number} timestamp - The timestamp.
     * @returns {Promise<string>} The new current hash.
     */
    async addKeystroke(char, timestamp) {
        if (!this.nonce) throw new Error("HashChain not initialized");

        // Format: PREV_HASH|CHAR|TIMESTAMP
        const data = `${this.currentHash}|${char}|${timestamp.toFixed(2)}`;
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        this.currentHash = hashHex;
        this.chainLength++;

        return hashHex;
    }

    /**
     * Returns the final proof package.
     */
    getProof() {
        return {
            nonce: this.nonce,
            finalHash: this.currentHash,
            chainLength: this.chainLength
        };
    }

    /**
     * Verifies a chain offline (useful for replay verification).
     * 
     * @param {string} nonce 
     * @param {Array<{char: string, timestamp: number}>} keystrokes 
     * @param {string} expectedHash 
     */
    static async verify(nonce, keystrokes, expectedHash) {
        let currentHash = nonce;
        const encoder = new TextEncoder();

        for (const k of keystrokes) {
            const data = `${currentHash}|${k.char}|${k.timestamp.toFixed(2)}`;
            const dataBuffer = encoder.encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        return currentHash === expectedHash;
    }
}
