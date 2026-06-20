import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { secureStorage, hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { simulateSocialLogin } from './socialAuth.jsx';

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
     * Link an identity provider (social login) to the current account
     * @param {string} providerId - 'google', 'facebook', etc.
     */
    async linkOAuthProvider(providerId) {
        const socialData = await simulateSocialLogin(providerId);

        if (isSupabaseConfigured) {
            try {
                const session = await supabase.auth.getSession();
                if (!session.data.session) throw new Error('No active session found');
                const user = session.data.session.user;

                const updatedMetadata = {
                    ...user.user_metadata,
                    [`linked_${providerId}`]: socialData.providerId,
                    [`linked_${providerId}_email`]: socialData.email
                };

                const { error } = await supabase.auth.updateUser({
                    data: updatedMetadata
                });

                if (error) throw error;
                return { success: true, socialData };
            } catch (err) {
                console.error(`[Auth] Link OAuth provider failed:`, err);
                throw err;
            }
        }

        // Local Storage Mode
        const currentUser = secureStorage.getItem('user');
        if (!currentUser) throw new Error('Not authenticated');

        const users = secureStorage.getItem('users') || {};
        const isAlreadyLinked = Object.values(users).some(u => 
            u.id !== currentUser.id && 
            (u.email === socialData.email || 
             u.socialProviderId === socialData.providerId || 
             u.linkedProviders?.[providerId]?.id === socialData.providerId)
        );
        if (isAlreadyLinked) {
            throw new Error(`This ${providerId} account is already linked to another user.`);
        }

        currentUser.linkedProviders = {
            ...(currentUser.linkedProviders || {}),
            [providerId]: {
                id: socialData.providerId,
                email: socialData.email,
                name: socialData.name,
                linkedAt: new Date().toISOString()
            }
        };

        secureStorage.setItem('user', currentUser);
        const normalizedEmail = currentUser.email.toLowerCase().trim();
        if (users[normalizedEmail]) {
            users[normalizedEmail] = currentUser;
            secureStorage.setItem('users', users);
        }

        return { success: true, user: currentUser };
    },

    /**
     * Link a phone number to the current account
     * @param {string} phone 
     */
    async linkPhone(phone) {
        if (isSupabaseConfigured) {
            const { error } = await supabase.auth.updateUser({ phone });
            if (error) throw error;

            const session = await supabase.auth.getSession();
            if (session.data.session) {
                await supabase.from('profiles').update({ mobile_number: phone }).eq('id', session.data.session.user.id);
            }
            return { success: true };
        }

        const currentUser = secureStorage.getItem('user');
        if (!currentUser) throw new Error('Not authenticated');

        const users = secureStorage.getItem('users') || {};
        const isAlreadyLinked = Object.values(users).some(u => 
            u.id !== currentUser.id && 
            (u.phone === phone || u.profile?.mobileNumber === phone)
        );
        if (isAlreadyLinked) {
            throw new Error(`This phone number is already linked to another user.`);
        }

        currentUser.phone = phone;
        if (!currentUser.profile) currentUser.profile = {};
        currentUser.profile.mobileNumber = phone;

        secureStorage.setItem('user', currentUser);
        const normalizedEmail = currentUser.email.toLowerCase().trim();
        if (users[normalizedEmail]) {
            users[normalizedEmail] = currentUser;
            secureStorage.setItem('users', users);
        }

        return { success: true, user: currentUser };
    },

    /**
     * Link an email and password to the current account
     * @param {string} email 
     * @param {string} password 
     */
    async linkEmailPassword(email, password) {
        if (isSupabaseConfigured) {
            const { error } = await supabase.auth.updateUser({ email, password });
            if (error) throw error;
            return { success: true };
        }

        const currentUser = secureStorage.getItem('user');
        if (!currentUser) throw new Error('Not authenticated');

        const users = secureStorage.getItem('users') || {};
        const normalizedEmail = email.toLowerCase().trim();

        if (normalizedEmail !== currentUser.email && users[normalizedEmail]) {
            throw new Error(`Email ${email} is already registered by another user.`);
        }

        const { hash, salt } = hashPassword(password);

        if (normalizedEmail !== currentUser.email) {
            delete users[currentUser.email.toLowerCase().trim()];
        }

        currentUser.email = normalizedEmail;
        currentUser.passwordHash = hash;
        currentUser.salt = salt;

        users[normalizedEmail] = currentUser;

        secureStorage.setItem('user', currentUser);
        secureStorage.setItem('users', users);

        return { success: true, user: currentUser };
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
