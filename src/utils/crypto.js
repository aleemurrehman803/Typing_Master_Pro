import CryptoJS from 'crypto-js';
import { isSupabaseConfigured } from '../lib/supabase';
import { getDeviceKey } from './deviceKey';

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
const getJwtSecret = () => {
    const envKey = import.meta.env.VITE_JWT_SECRET;
    
    // In production/live backend mode, strictly enforce JWT secret
    if (isSupabaseConfigured) {
        if (!envKey || envKey.length < 32 || envKey.includes('change-in-production') || envKey === 'your_jwt_secret_here' || envKey === 'placeholder') {
            throw new Error('CRITICAL SECURITY ERROR: VITE_JWT_SECRET is not properly configured for production database access. The secret must be at least 32 characters long and cannot be a default or placeholder.');
        }
        return envKey;
    }

    if (envKey && envKey !== 'your_jwt_secret_here' && envKey !== 'placeholder') {
        return envKey;
    }

    return getDeviceKey();
};

const LEGACY_JWT_SECRET = 'typemaster-secret-key-change-in-production';

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

    const secret = getJwtSecret();

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

        // VITAL: Verify Signature using dynamic key first
        const secret = getJwtSecret();
        let expectedSignature = CryptoJS.HmacSHA256(
            `${header}.${payload}`,
            secret
        ).toString();

        let isSignatureValid = signature === expectedSignature;

        // Fallback check using legacy key if dynamic check fails
        if (!isSignatureValid && secret !== LEGACY_JWT_SECRET) {
            const legacyExpectedSignature = CryptoJS.HmacSHA256(
                `${header}.${payload}`,
                LEGACY_JWT_SECRET
            ).toString();
            if (signature === legacyExpectedSignature) {
                isSignatureValid = true;
            }
        }

        if (!isSignatureValid) {
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

const getEncryptionKey = (providedKey) => {
    const keyToUse = providedKey || import.meta.env.VITE_ENCRYPTION_KEY;
    
    if (isSupabaseConfigured) {
        if (!keyToUse || keyToUse.length < 32 || keyToUse === 'default-encryption-key' || keyToUse.includes('change-in-production') || keyToUse.includes('your-') || keyToUse === 'placeholder') {
            throw new Error('CRITICAL: VITE_ENCRYPTION_KEY must be a secure, random string of at least 32 characters when connected to a live backend database.');
        }
        return keyToUse;
    }
    
    return keyToUse || 'default-encryption-key';
};

/**
 * Encrypt data for secure storage
 * @param {any} data - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted string
 */
export const encryptData = (data, key) => {
    const activeKey = getEncryptionKey(key);
    const serialized = JSON.stringify(data);
    return CryptoJS.AES.encrypt(serialized, activeKey).toString();
};

/**
 * Decrypt data from secure storage
 * @param {string} encryptedData - Encrypted string
 * @param {string} key - Decryption key
 * @returns {any} Decrypted data
 */
export const decryptData = (encryptedData, key) => {
    try {
        const activeKey = getEncryptionKey(key);
        const decrypted = CryptoJS.AES.decrypt(encryptedData, activeKey);
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
