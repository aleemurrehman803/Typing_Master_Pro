import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { secureStorage } from '../utils/auth';
import { rateLimiter } from '../utils/rateLimiter';


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
        if (!rateLimiter.isAllowed(`save_test_${userId}`, 10, 60000)) {
            return { success: false, error: 'Too many test submissions. Please wait a moment.' };
        }

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
        if (!rateLimiter.isAllowed('get_leaderboard', 30, 60000)) {
            return { success: false, error: 'Leaderboard rate limit exceeded. Please wait.' };
        }

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
        if (!rateLimiter.isAllowed(`save_cert_${userId}`, 5, 60000)) {
            return { success: false, error: 'Too many certificate requests. Please wait.' };
        }

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
    },

    /**
     * Create a P2P betting match
     */
    async createBettingMatch(creatorId, wagerAmount, targetText) {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.rpc('create_betting_match', {
                    p_creator_id: creatorId,
                    p_wager_amount: parseFloat(wagerAmount),
                    p_target_text: targetText
                });
                if (error) throw error;
                return data; // Returns { success: true, message: ..., match_id: ... }
            } catch (err) {
                console.error('[DB] createBettingMatch error:', err);
                return { success: false, error: err.message };
            }
        }
        
        // Mock fallback
        const currentCoins = parseInt(localStorage.getItem('arena_coins') || '0');
        if (currentCoins < wagerAmount) {
            return { success: false, error: 'Insufficient funds in wallet.' };
        }
        const newTotal = currentCoins - wagerAmount;
        localStorage.setItem('arena_coins', newTotal.toString());
        window.dispatchEvent(new CustomEvent('arena-coins-updated'));
        
        const matchId = `match_${Math.random().toString(36).substr(2, 9)}`;
        const localMatches = JSON.parse(localStorage.getItem('tm_p2p_matches') || '[]');
        const newMatch = {
            id: matchId,
            creator_id: creatorId,
            challenger_id: null,
            target_text: targetText,
            wager_amount: wagerAmount,
            status: 'waiting',
            created_at: new Date().toISOString()
        };
        localMatches.push(newMatch);
        localStorage.setItem('tm_p2p_matches', JSON.stringify(localMatches));
        
        return { success: true, message: 'Match created successfully', match_id: matchId };
    },

    /**
     * Join a P2P betting match
     */
    async joinBettingMatch(challengerId, matchId) {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.rpc('join_betting_match', {
                    p_challenger_id: challengerId,
                    p_match_id: matchId
                });
                if (error) throw error;
                return data;
            } catch (err) {
                console.error('[DB] joinBettingMatch error:', err);
                return { success: false, error: err.message };
            }
        }
        
        // Mock fallback
        const localMatches = JSON.parse(localStorage.getItem('tm_p2p_matches') || '[]');
        const matchIndex = localMatches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) {
            return { success: false, error: 'Match is not available to join.' };
        }
        const match = localMatches[matchIndex];
        if (match.status !== 'waiting') {
            return { success: false, error: 'Match is not available to join.' };
        }
        if (match.creator_id === challengerId) {
            return { success: false, error: 'You cannot join your own match.' };
        }
        
        const currentCoins = parseInt(localStorage.getItem('arena_coins') || '0');
        if (currentCoins < match.wager_amount) {
            return { success: false, error: 'Insufficient funds in wallet.' };
        }
        
        const newTotal = currentCoins - match.wager_amount;
        localStorage.setItem('arena_coins', newTotal.toString());
        window.dispatchEvent(new CustomEvent('arena-coins-updated'));
        
        match.challenger_id = challengerId;
        match.status = 'active';
        localMatches[matchIndex] = match;
        localStorage.setItem('tm_p2p_matches', JSON.stringify(localMatches));
        
        return { success: true, message: 'Joined match successfully' };
    },

    /**
     * Resolve a P2P betting match
     */
    async resolveBettingMatch(matchId, winnerId) {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.rpc('resolve_betting_match', {
                    p_match_id: matchId,
                    p_winner_id: winnerId
                });
                if (error) throw error;
                return data;
            } catch (err) {
                console.error('[DB] resolveBettingMatch error:', err);
                return { success: false, error: err.message };
            }
        }
        
        // Mock fallback
        const localMatches = JSON.parse(localStorage.getItem('tm_p2p_matches') || '[]');
        const matchIndex = localMatches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) {
            return { success: false, error: 'Match not found.' };
        }
        const match = localMatches[matchIndex];
        if (match.status !== 'active') {
            return { success: false, error: 'Match is not active.' };
        }
        
        const totalPool = match.wager_amount * 2;
        const rake = totalPool * 0.05;
        const payout = totalPool - rake;
        
        match.status = 'completed';
        match.winner_id = winnerId;
        localMatches[matchIndex] = match;
        localStorage.setItem('tm_p2p_matches', JSON.stringify(localMatches));
        
        // Award payout to winner if it is the user
        const user = secureStorage.getItem('user');
        if (user && user.id === winnerId) {
            const currentCoins = parseInt(localStorage.getItem('arena_coins') || '0');
            const newTotal = currentCoins + payout;
            localStorage.setItem('arena_coins', newTotal.toString());
            window.dispatchEvent(new CustomEvent('arena-coins-updated'));
        }
        
        return { success: true, winner_id: winnerId, payout, rake };
    },

    /**
     * Fetch waiting matches for the lobby
     */
    async fetchWaitingMatches() {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('betting_matches')
                    .select('*, profiles:creator_id(username, full_name)')
                    .eq('status', 'waiting')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                return { success: true, matches: data };
            } catch (err) {
                console.error('[DB] fetchWaitingMatches error:', err);
                return { success: false, error: err.message, matches: [] };
            }
        }
        
        // Mock fallback waiting matches
        const localMatches = JSON.parse(localStorage.getItem('tm_p2p_matches') || '[]');
        const waiting = localMatches.filter(m => m.status === 'waiting');
        
        // Inject a few automatic mock matches if list is empty to keep lobby active
        if (waiting.length === 0) {
            const mockOpponents = [
                { name: 'Speed Demon', wpm: 92, id: 'mock_user_1' },
                { name: 'Keyboard Cat', wpm: 55, id: 'mock_user_2' },
                { name: 'Neon Racer', wpm: 78, id: 'mock_user_3' }
            ];
            const sampleTexts = [
                "The quick brown fox jumps over the lazy dog near the river bank.",
                "Programming is the art of telling another human what one wants the computer to do.",
                "Success is not final, failure is not fatal: it is the courage to continue."
            ];
            const now = new Date();
            const defaults = mockOpponents.map((opp, idx) => ({
                id: `mock_match_${idx}`,
                creator_id: opp.id,
                creator_name: opp.name,
                creator_wpm: opp.wpm,
                target_text: sampleTexts[idx],
                wager_amount: (idx + 1) * 20,
                status: 'waiting',
                created_at: new Date(now.getTime() - idx * 60000).toISOString()
            }));
            return { success: true, matches: defaults };
        }
        
        return { success: true, matches: waiting };
    },

    /**
     * Update user KYC status
     */
    async updateKycStatus(userId, status, biometricHash = null) {
        if (isSupabaseConfigured) {
            try {
                const updates = { 
                    kyc_status: status, 
                    kyc_verified_at: status === 'verified' ? new Date().toISOString() : null 
                };
                if (biometricHash) updates.kyc_biometric_hash = biometricHash;
                
                const { data, error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', userId)
                    .select()
                    .single();
                if (error) throw error;
                return { success: true, profile: data };
            } catch (err) {
                console.error('[DB] updateKycStatus error:', err);
                return { success: false, error: err.message };
            }
        }
        
        // Mock fallback
        const user = secureStorage.getItem('user');
        if (user && user.id === userId) {
            user.kyc_status = status;
            user.kyc_verified_at = status === 'verified' ? new Date().toISOString() : null;
            if (biometricHash) user.kyc_biometric_hash = biometricHash;
            secureStorage.setItem('user', user);
            
            // Sync with profiles
            const users = secureStorage.getItem('users') || {};
            const normalizedEmail = user.email.toLowerCase().trim();
            if (users[normalizedEmail]) {
                users[normalizedEmail] = user;
                secureStorage.setItem('users', users);
            }
            return { success: true, profile: user };
        }
        return { success: false, error: 'Local user not found' };
    }
};
