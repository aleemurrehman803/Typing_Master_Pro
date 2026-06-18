import CryptoJS from 'crypto-js';

/**
 * Professional Cryptography Utilities
 * Industry-standard password hashing and token generation
 */

// PBKDF2 iterations (industry standard: 10,000+)
const HASH_ITERATIONS = 10000;
const SALT_SIZE = 128 / 8; // 128 bits
const KEY_SIZE = 256 / 32; // 256 bits

/**
 * Hash a password with PBKDF2
 * @param {string} password - Plain text password
 * @param {string} salt - Optional salt (generated if not provided)
 * @returns {{hash: string, salt: string}}
 */
export const hashPassword = (password, salt = generateSalt()) => {
    const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: KEY_SIZE,
        iterations: HASH_ITERATIONS
    }).toString();

    return { hash, salt };
};

/**
 * Verify password against hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Stored hash
 * @param {string} salt - Stored salt
 * @returns {boolean}
 */
export const verifyPassword = (password, hash, salt) => {
    const computed = hashPassword(password, salt);
    return computed.hash === hash;
};

/**
 * Generate cryptographically secure random salt
 * @returns {string}
 */
export const generateSalt = () => {
    return CryptoJS.lib.WordArray.random(SALT_SIZE).toString();
};

/**
 * Generate JWT-like token for session management
 * @param {string} userId - User identifier
 * @param {number} expiresIn - Token lifetime in milliseconds (default: 24h)
 * @returns {string} Token
 */
export const generateToken = (userId, expiresIn = 24 * 60 * 60 * 1000) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        userId,
        iat: Date.now(),
        exp: Date.now() + expiresIn
    };

    // In production, use environment variable
    const secret = import.meta.env.VITE_JWT_SECRET || 'typemaster-secret-key-change-in-production';

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = CryptoJS.HmacSHA256(
        `${encodedHeader}.${encodedPayload}`,
        secret
    ).toString();

    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Verify and decode JWT-like token
 * @param {string} token - Token to verify
 * @returns {{valid: boolean, userId?: string, error?: string}}
 */
export const verifyToken = (token) => {
    try {
        if (!token || typeof token !== 'string') {
            return { valid: false, error: 'Invalid token format' };
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false, error: 'Invalid token structure' };
        }

        const [header, payload, signature] = parts;

        // VITAL: Verify Signature
        const secret = import.meta.env.VITE_JWT_SECRET || 'typemaster-secret-key-change-in-production';
        const expectedSignature = CryptoJS.HmacSHA256(
            `${header}.${payload}`,
            secret
        ).toString();

        if (signature !== expectedSignature) {
            console.error('CRITICAL: Token signature mismatch. Possible tampering detected.');
            return { valid: false, error: 'Invalid token signature' };
        }

        const decoded = JSON.parse(atob(payload));

        // Check expiration
        if (decoded.exp < Date.now()) {
            return { valid: false, error: 'Token expired' };
        }

        return { valid: true, userId: decoded.userId, payload: decoded };
    } catch (error) {
        console.error('Token verification error:', error);
        return { valid: false, error: 'Token verification failed' };
    }
};

/**
 * Encrypt data for secure storage
 * @param {any} data - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted string
 */
export const encryptData = (data, key = import.meta.env.VITE_ENCRYPTION_KEY || 'default-encryption-key') => {
    const serialized = JSON.stringify(data);
    return CryptoJS.AES.encrypt(serialized, key).toString();
};

/**
 * Decrypt data from secure storage
 * @param {string} encryptedData - Encrypted string
 * @param {string} key - Decryption key
 * @returns {any} Decrypted data
 */
export const decryptData = (encryptedData, key = import.meta.env.VITE_ENCRYPTION_KEY || 'default-encryption-key') => {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
        const serialized = decrypted.toString(CryptoJS.enc.Utf8);
        return JSON.parse(serialized);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};

/**
 * Generate secure random ID
 * @returns {string}
 */
export const generateSecureId = () => {
    return CryptoJS.lib.WordArray.random(16).toString() + Date.now();
};
