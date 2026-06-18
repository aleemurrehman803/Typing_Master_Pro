import { simulateSocialLogin } from './socialAuth.jsx';

/**
 * Social Login Helper
 * Wrapper around auth functions to handle social logins
 * This avoids modifying the complex AuthContext file
 */

/**
 * Handle social login
 * @param {string} providerId - Provider ID (google, facebook, github)
 * @param {function} registerCallback - Register function from AuthContext
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const handleSocialAuth = async (providerId, registerCallback) => {
    try {
        // Simulate OAuth and get user data
        const socialData = await simulateSocialLogin(providerId);

        // Use register function with temp password (social users don't need passwords)
        const tempPassword = `${providerId}_${Date.now()}_${Math.random().toString(36)}`;

        // Register or login the user
        const result = await registerCallback(
            socialData.name,
            socialData.email,
            tempPassword
        );

        if (result.success) {
            // Mark as social login in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[socialData.email.toLowerCase()]) {
                users[socialData.email.toLowerCase()].socialProvider = providerId;
                users[socialData.email.toLowerCase()].socialProviderI = socialData.providerId;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }

        return result;
    } catch (error) {
        console.error('Social auth error:', error);
        return { success: false, error: error.message };
    }
};
