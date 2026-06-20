import { vi, describe, it, expect } from 'vitest';

// Mock Supabase to ensure isSupabaseConfigured is false, isolating the fallback logic
vi.mock('../lib/supabase', () => ({
    supabase: {},
    checkBackendConnection: async () => false,
    isSupabaseConfigured: false
}));

import { getDeviceKey } from './deviceKey';
import { generateToken, verifyToken } from './crypto';
import { secureStorage } from './secureStorage';
import CryptoJS from 'crypto-js';

describe('Security and Encryption Fallbacks', () => {
    it('getDeviceKey should generate a persistent and valid key', () => {
        const key1 = getDeviceKey();
        const key2 = getDeviceKey();
        expect(key1).toBe(key2);
        expect(key1).toHaveLength(64); // 32 bytes in hex
        expect(/^[0-9a-fA-F]+$/.test(key1)).toBe(true);
    });

    it('verifyToken should verify legacy signatures using legacy fallback key', () => {
        const legacySecret = 'typemaster-secret-key-change-in-production';
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = { userId: 'legacy-user-123', iat: Date.now(), exp: Date.now() + 10000 };
        
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        const signature = CryptoJS.HmacSHA256(
            `${encodedHeader}.${encodedPayload}`,
            legacySecret
        ).toString();
        const legacyToken = `${encodedHeader}.${encodedPayload}.${signature}`;

        const verification = verifyToken(legacyToken);
        expect(verification.valid).toBe(true);
        expect(verification.userId).toBe('legacy-user-123');
    });

    it('verifyToken should verify new signatures using dynamic device key', () => {
        const token = generateToken('user-456');
        const verification = verifyToken(token);
        expect(verification.valid).toBe(true);
        expect(verification.userId).toBe('user-456');
    });

    it('secureStorage should decrypt legacy encrypted data', () => {
        const legacyKey = 'typemaster-storage-key';
        const testData = { coins: 1500, level: 5 };
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(testData), legacyKey).toString();
        
        localStorage.setItem('tm_test_legacy_key', encrypted);
        const retrieved = secureStorage.getItem('test_legacy_key');
        expect(retrieved).toEqual(testData);
    });
});
