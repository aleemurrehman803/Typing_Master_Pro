import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { secureStorage, hashPassword, verifyPassword, generateToken } from '../utils/auth';

/**
 * Hybrid Auth Service
 * 
 * seamless switching between:
 * 1. LocalStorage (Dev/Demo mode)
 * 2. Supabase (Production mode)
 */
export const AuthService = {

    /**
     * Login User
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        // STRATEGY 1: Try Supabase (if configured)
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (!error && data.user) {
                    // Fetch extended profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    return {
                        success: true,
                        user: { ...data.user, ...profile },
                        token: data.session.access_token,
                        source: 'supabase'
                    };
                }
                // If invalid credentials, don't fall back to local (security risk)
                if (error && error.message === 'Invalid login credentials') {
                    throw new Error(error.message);
                }
            } catch (err) {
                console.warn('[Auth] Supabase login failed, using local fallback if allowed', err);
            }
        }

        // STRATEGY 2: LocalStorage Fallback
        const normalizedEmail = email.toLowerCase().trim();
        const users = secureStorage.getItem('users') || {};
        const userData = users[normalizedEmail];

        if (!userData) throw new Error('Invalid email or password');

        const isValid = verifyPassword(password, userData.passwordHash, userData.salt);
        if (!isValid) throw new Error('Invalid email or password');

        // Success (Local)
        const token = generateToken(userData.id);
        const { passwordHash, salt, ...safeUser } = userData;

        return {
            success: true,
            user: safeUser,
            token,
            source: 'local'
        };
    },

    /**
     * Register User
     * @param {object} payload 
     */
    async register(payload) {
        const { email, password, name } = payload;

        // STRATEGY 1: Try Supabase
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: name, avatar_url: '' }
                    }
                });

                if (error) throw error;

                if (data.user) {
                    return { success: true, user: data.user, source: 'supabase' };
                }
            } catch (err) {
                console.error('[Auth] Supabase registration failed:', err);
                // If it's a duplicate email, throw immediately
                if (err.message.includes('already registered')) throw err;
            }
        }

        // STRATEGY 2: LocalStorage
        const normalizedEmail = email.toLowerCase().trim();
        const users = secureStorage.getItem('users') || {};

        if (users[normalizedEmail]) throw new Error('Email already registered');

        const { hash, salt } = hashPassword(password);
        const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: normalizedEmail,
            name,
            passwordHash: hash,
            salt,
            role: 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            profile: {},
            stats: { testsTaken: 0, avgWpm: 0 }
        };

        users[normalizedEmail] = newUser;
        secureStorage.setItem('users', users);

        return { success: true, user: newUser, source: 'local' };
    },

    /**
     * Logout
     */
    async logout() {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        secureStorage.removeItem('token');
        secureStorage.removeItem('user');
    },

    /**
     * Get Current Session
     */
    async getSession() {
        // Check Supabase session
        if (isSupabaseConfigured) {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.session.user.id)
                    .single();

                return {
                    user: { ...data.session.user, ...profile },
                    token: data.session.access_token,
                    isAuthenticated: true
                };
            }
        }

        // Check Local Storage
        const token = secureStorage.getItem('token');
        const user = secureStorage.getItem('user');

        if (token && user) {
            return { user, token, isAuthenticated: true };
        }

        return { user: null, token: null, isAuthenticated: false };
    }
};
