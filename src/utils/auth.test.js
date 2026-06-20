import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: async () => ({ data: { session: null } }),
            updateUser: async () => ({ error: null })
        }
    },
    checkBackendConnection: async () => false,
    isSupabaseConfigured: false
}));

// Mock DbService
vi.mock('../services/db.service', () => ({
    DbService: {
        saveTestResult: vi.fn(async () => ({ success: true })),
        saveCertificate: vi.fn(async () => ({ success: true })),
        updateProfile: vi.fn(async () => ({ success: true })),
        getUserStats: vi.fn(async () => ({ testsTaken: 0, avgWpm: 0, bestWpm: 0, accuracy: 0, history: [] }))
    }
}));

import useAuthStore from '../store/useAuthStore';
import { secureStorage } from './secureStorage';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { hashPassword } from './crypto';

describe('Auth Store & Guest Progress Migration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        secureStorage.clear();
        
        const testUser = {
            id: 'user_123',
            email: 'user@example.com',
            name: 'Test User',
            badges: [],
            arena_coins: 0,
            xp: 0
        };
        
        secureStorage.setItem('user', testUser);
        
        // Mock a registered user entry in local users registry for duplicate checks
        const users = {
            'user@example.com': testUser
        };
        secureStorage.setItem('users', users);

        useAuthStore.setState({
            user: testUser,
            isAuthenticated: true,
            currentLevel: 1
        });
    });

    it('should migrate guest progress successfully', async () => {
        // 1. Setup guest data in localStorage
        const guestTests = [
            { id: 'test_1', wpm: 50, accuracy: 95, duration: 60, mistakes: 3, userId: 'guest' },
            { id: 'test_2', wpm: 60, accuracy: 98, duration: 60, mistakes: 1, userId: 'guest' }
        ];
        const guestCerts = [
            { certificateId: 'cert_1', code: 'cert_1', userId: 'guest', wpm: 60 }
        ];
        
        localStorage.setItem('recent_tests', JSON.stringify(guestTests));
        localStorage.setItem('issued_certificates', JSON.stringify(guestCerts));
        localStorage.setItem('arena_coins', '250');
        localStorage.setItem('arena_stats', JSON.stringify({ xp: 450 }));

        // 2. Run guest migration
        const store = useAuthStore.getState();
        await store.migrateGuestProgress('user_123');

        // 3. Verify DbService calls
        expect(DbService.saveTestResult).toHaveBeenCalledTimes(2);
        expect(DbService.saveCertificate).toHaveBeenCalledTimes(1);
        expect(DbService.updateProfile).toHaveBeenCalledWith('user_123', expect.objectContaining({
            arena_coins: 250
        }));
        expect(DbService.updateProfile).toHaveBeenCalledWith('user_123', expect.objectContaining({
            xp: 450
        }));

        // 4. Verify guest data was cleaned up
        expect(localStorage.getItem('arena_coins')).toBeNull();
        expect(localStorage.getItem('arena_stats')).toBeNull();
    });

    it('should link OAuth provider successfully', async () => {
        // Mock prompt to return simulation email
        vi.spyOn(window, 'prompt').mockReturnValue('mock_google_user@gmail.com');

        const store = useAuthStore.getState();
        const res = await store.linkOAuth('google');

        expect(res.success).toBe(true);
        expect(useAuthStore.getState().user.linkedProviders.google).toBeDefined();
        expect(useAuthStore.getState().user.linkedProviders.google.email).toBe('mock_google_user@gmail.com');
    });

    it('should link phone number successfully and reject duplicates', async () => {
        const store = useAuthStore.getState();
        
        // Link phone
        const res = await store.linkPhone('+15550199');
        expect(res.success).toBe(true);
        expect(useAuthStore.getState().user.phone).toBe('+15550199');

        // Try linking duplicate phone
        // Mock another user in users list having the same phone
        const users = secureStorage.getItem('users') || {};
        users['other@example.com'] = {
            id: 'other_user',
            email: 'other@example.com',
            phone: '+15550199'
        };
        secureStorage.setItem('users', users);

        const dupRes = await store.linkPhone('+15550199');
        expect(dupRes.success).toBe(false);
        expect(dupRes.error).toContain('already linked');
    });

    it('should run initAuth successfully and load session', async () => {
        useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            loading: true
        });

        vi.spyOn(AuthService, 'getSession').mockResolvedValue({
            user: { id: 'user_123', email: 'user@example.com' },
            token: 'mock_token_123',
            isAuthenticated: true
        });

        const store = useAuthStore.getState();
        await store.initAuth();

        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().user.id).toBe('user_123');
        expect(useAuthStore.getState().loading).toBe(false);
    });

    it('should register a new user successfully', async () => {
        useAuthStore.setState({
            user: null,
            isAuthenticated: false
        });

        secureStorage.setItem('users', {});

        const registerSpy = vi.spyOn(AuthService, 'register').mockResolvedValue({
            success: true,
            user: { id: 'user_new', email: 'new@example.com', name: 'New User' },
            token: 'mock_register_token',
            source: 'local'
        });

        const store = useAuthStore.getState();
        const res = await store.register('New User', 'new@example.com', 'StrongP@ss123');

        expect(res.success).toBe(true);
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().user.name).toBe('New User');
        expect(useAuthStore.getState().user.email).toBe('new@example.com');

        registerSpy.mockRestore();
    });

    it('should login an existing user successfully', async () => {
        useAuthStore.setState({
            user: null,
            isAuthenticated: false
        });

        const users = {};
        const testPassword = 'StrongP@ss123';
        const { hash, salt } = hashPassword(testPassword);
        users['registered@example.com'] = {
            id: 'reg_456',
            name: 'Registered User',
            email: 'registered@example.com',
            passwordHash: hash,
            salt: salt,
            status: 'active'
        };
        secureStorage.setItem('users', users);

        const store = useAuthStore.getState();
        const res = await store.login('registered@example.com', testPassword);

        expect(res.success).toBe(true);
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().user.id).toBe('reg_456');
    });

    it('should logout successfully and clean up state', async () => {
        useAuthStore.setState({
            user: { id: 'user_123' },
            isAuthenticated: true,
            token: 'mock_token'
        });
        secureStorage.setItem('token', 'mock_token');
        secureStorage.setItem('user', { id: 'user_123' });

        const store = useAuthStore.getState();
        await store.logout();

        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().token).toBeNull();
        expect(secureStorage.getItem('token')).toBeNull();
        expect(secureStorage.getItem('user')).toBeNull();
    });
});
