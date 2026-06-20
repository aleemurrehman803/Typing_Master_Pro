import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { secureStorage } from '../utils/auth';

/**
 * Hybrid Database Service
 * 
 * Provides database queries for TypeMaster Pro.
 * Seamlessly switches between:
 * 1. LocalStorage/SecureStorage (Dev/Demo/Static Mode)
 * 2. Supabase Cloud Database (Production Mode)
 */
export const DbService = {
    /**
     * Get user profile details
     * @param {string} userId - User UUID
     */
    async getProfile(userId) {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (error) throw error;
                return { success: true, profile: data };
            } catch (err) {
                console.error('[DB] Fetch profile failed:', err);
                return { success: false, error: err.message };
            }
        }

        // Fallback local storage
        const user = secureStorage.getItem('user');
        if (user && user.id === userId) {
            return { success: true, profile: user };
        }
        return { success: false, error: 'Local profile not found' };
    },

    /**
     * Reconstruct user stats from test results in the database
     * @param {string} userId - User UUID
     */
    async getUserStats(userId) {
        if (!isSupabaseConfigured) {
            const user = secureStorage.getItem('user');
            if (user && user.id === userId) {
                return user.stats || { testsTaken: 0, avgWpm: 0, bestWpm: 0, accuracy: 0, history: [] };
            }
            return { testsTaken: 0, avgWpm: 0, bestWpm: 0, accuracy: 0, history: [] };
        }

        try {
            const { data: results, error } = await supabase
                .from('test_results')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (!results || results.length === 0) {
                return { testsTaken: 0, avgWpm: 0, bestWpm: 0, accuracy: 0, history: [] };
            }

            const testsTaken = results.length;
            const avgWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / testsTaken);
            const accuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / testsTaken);
            const bestWpm = Math.max(...results.map(r => r.wpm));
            
            const history = results.map(r => ({
                wpm: r.wpm,
                accuracy: r.accuracy,
                date: r.created_at,
                duration: r.duration
            }));

            return {
                testsTaken,
                avgWpm,
                bestWpm,
                accuracy,
                history
            };
        } catch (e) {
            console.error('[DB] Reconstructing stats failed:', e);
            return { testsTaken: 0, avgWpm: 0, bestWpm: 0, accuracy: 0, history: [] };
        }
    },

    /**
     * Update user profile details
     * @param {string} userId - User UUID
     * @param {object} profileUpdates - Fields to update
     */
    async updateProfile(userId, profileUpdates) {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .update(profileUpdates)
                    .eq('id', userId)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, profile: data };
            } catch (err) {
                console.error('[DB] Update profile failed:', err);
                return { success: false, error: err.message };
            }
        }

        // Fallback local storage
        const user = secureStorage.getItem('user');
        if (user && user.id === userId) {
            const updatedUser = { ...user, ...profileUpdates };
            secureStorage.setItem('user', updatedUser);
            
            // Sync with registered users list
            const users = secureStorage.getItem('users') || {};
            const normalizedEmail = user.email.toLowerCase().trim();
            if (users[normalizedEmail]) {
                users[normalizedEmail] = updatedUser;
                secureStorage.setItem('users', users);
            }
            return { success: true, profile: updatedUser };
        }
        return { success: false, error: 'Local profile update failed' };
    },

    /**
     * Save a completed typing test result
     * @param {string} userId - User UUID
     * @param {object} testResult - Test score data
     */
    async saveTestResult(userId, testResult) {
        const { wpm, accuracy, duration, mistakes, test_mode, language, integrity_score, client_hash } = testResult;
        
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('test_results')
                    .insert({
                        user_id: userId,
                        wpm,
                        raw_wpm: wpm,
                        accuracy,
                        duration,
                        mistakes,
                        test_mode,
                        language,
                        integrity_score,
                        client_hash
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, result: data };
            } catch (err) {
                console.error('[DB] Save test result failed:', err);
                return { success: false, error: err.message };
            }
        }

        // Fallback local storage
        try {
            const localResults = JSON.parse(localStorage.getItem('recent_tests') || '[]');
            const newEntry = {
                id: `test_${Date.now()}`,
                userId,
                wpm,
                accuracy,
                duration,
                mistakes,
                test_mode,
                language,
                date: new Date().toISOString()
            };
            localResults.push(newEntry);
            localStorage.setItem('recent_tests', JSON.stringify(localResults.slice(-100)));
            return { success: true, result: newEntry };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    /**
     * Fetch user typing test history
     * @param {string} userId - User UUID
     * @param {number} limit - Max number of entries
     */
    async getTestHistory(userId, limit = 50) {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('test_results')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(limit);
                
                if (error) throw error;
                
                return { 
                    success: true, 
                    history: data.map(item => ({
                        ...item,
                        date: item.created_at
                    })) 
                };
            } catch (err) {
                console.error('[DB] Fetch history failed:', err);
                return { success: false, error: err.message };
            }
        }

        // Fallback local storage
        try {
            const localResults = JSON.parse(localStorage.getItem('recent_tests') || '[]');
            const history = localResults.filter(test => test.userId === userId).slice(-limit).reverse();
            return { success: true, history };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    /**
     * Get global leaderboard rankings
     * @param {number} limit - Max rows
     */
    async getLeaderboard(limit = 100) {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('test_results')
                    .select('*, profiles(full_name, email, username)')
                    .order('wpm', { ascending: false })
                    .limit(limit);
                
                if (error) throw error;
                
                const scores = data.map(item => ({
                    id: item.id,
                    userId: item.user_id,
                    name: item.profiles?.full_name || item.profiles?.username || 'Anonymous',
                    email: item.profiles?.email,
                    wpm: item.wpm,
                    accuracy: item.accuracy,
                    date: item.created_at,
                    duration: item.duration
                }));
                return { success: true, scores };
            } catch (err) {
                console.error('[DB] Fetch leaderboard failed:', err);
                return { success: false, error: err.message };
            }
        }

        // Fallback local storage
        try {
            const leaderboard = secureStorage.getItem('leaderboard') || [];
            return { success: true, scores: leaderboard };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    /**
     * Save a generated certificate
     * @param {string} userId - User UUID
     * @param {object} certificate - Certificate details
     */
    async saveCertificate(userId, certificate) {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('certificates')
                    .insert({
                        user_id: userId,
                        test_id: certificate.testId,
                        certificate_code: certificate.code
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, certificate: data };
            } catch (err) {
                console.error('[DB] Save certificate failed:', err);
                return { success: false, error: err.message };
            }
        }

        // Fallback local storage
        try {
            const localCerts = JSON.parse(localStorage.getItem('issued_certificates') || '[]');
            localCerts.push(certificate);
            localStorage.setItem('issued_certificates', JSON.stringify(localCerts));
            return { success: true, certificate };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    /**
     * Fetch user's certificates
     * @param {string} userId - User UUID
     */
    async getCertificates(userId) {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('certificates')
                    .select('*, test_results(*)')
                    .eq('user_id', userId);
                
                if (error) throw error;
                
                return { 
                    success: true, 
                    certificates: data.map(item => ({
                        code: item.certificate_code,
                        date: item.issued_at,
                        wpm: item.test_results?.wpm,
                        accuracy: item.test_results?.accuracy,
                        testId: item.test_id
                    })) 
                };
            } catch (err) {
                console.error('[DB] Fetch certificates failed:', err);
                return { success: false, error: err.message };
            }
        }

        // Fallback local storage
        try {
            const localCerts = JSON.parse(localStorage.getItem('issued_certificates') || '[]');
            const certificates = localCerts.filter(cert => cert.userId === userId);
            return { success: true, certificates };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
};
