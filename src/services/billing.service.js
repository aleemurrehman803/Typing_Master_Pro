/**
 * TypeMaster Pro - SaaS Billing & Subscription Service
 * Manages checkout session generation, subscription caching, and plan updates.
 */

import useAuthStore from '../store/useAuthStore';

export const SUBSCRIPTION_PLANS = {
    free: {
        id: 'free',
        name: 'Standard Guest',
        price: '$0',
        billing: 'forever',
        description: 'Standard typing practice, basic leaderboards, and guest certificates.',
        features: ['10+ Custom Typing Paragraphs', 'Basic Speed Analytics', 'Standard PDF Certificates']
    },
    pro: {
        id: 'pro',
        name: 'Pro Typist',
        price: '$9.99',
        billing: 'per month',
        description: 'Advanced keystroke analysis, exclusive themes, and high-performance badges.',
        features: ['AI Weakness Drills (Jenny AI)', 'All Shop Skins & Audio Packs Unlocked', 'Advanced Double-Entry Betting Arenas', 'Priority Lead Validation', 'No Advertisements']
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise Teams',
        price: '$49.00',
        billing: 'per month',
        description: 'Classroom and team management portals with SAML single sign-on access.',
        features: ['Okta & Azure AD SAML SSO Integration', 'School Classroom & Corporate Teams Panels', 'Detailed Student Progress Analytics', 'Dedicated 24/7 Account Support', 'Custom Licensing API Keys']
    }
};

class BillingService {
    /**
     * Simulate Stripe Checkout Session processing
     * @param {string} userId - User UUID
     * @param {string} planId - Plan Tier identifier ('pro' | 'enterprise')
     * @param {object} paymentDetails - Simulated card inputs
     * @returns {Promise<{success: boolean, transactionId?: string, error?: string}>}
     */
    async simulateStripeCheckout(userId, planId, paymentDetails = {}) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    // Simple card validation rules
                    if (!paymentDetails.cardNumber || paymentDetails.cardNumber.replace(/\s/g, '').length < 16) {
                        return resolve({ success: false, error: 'Invalid card number length.' });
                    }
                    if (!paymentDetails.expiry || !paymentDetails.expiry.includes('/')) {
                        return resolve({ success: false, error: 'Invalid expiry date format (MM/YY).' });
                    }
                    if (!paymentDetails.cvc || paymentDetails.cvc.length < 3) {
                        return resolve({ success: false, error: 'Invalid security code (CVC).' });
                    }

                    // Success - trigger profile subscription update
                    const success = await this.updateSubscription(userId, planId);
                    if (success) {
                        resolve({
                            success: true,
                            transactionId: `ch_stripe_${Math.random().toString(36).substr(2, 12).toUpperCase()}`
                        });
                    } else {
                        resolve({ success: false, error: 'Failed to update user profile subscription.' });
                    }
                } catch (e) {
                    resolve({ success: false, error: e.message });
                }
            }, 1800); // Network processing latency simulation
        });
    }

    /**
     * Update user membership properties
     * @param {string} userId - User UUID
     * @param {string} planId - Target tier
     */
    async updateSubscription(userId, planId) {
        try {
            const authStore = useAuthStore.getState();
            const user = authStore.user;

            if (!user) return false;

            const updatedUser = {
                ...user,
                membership: {
                    tier: planId,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days expiry
                }
            };

            // 1. Update in useAuthStore memory
            useAuthStore.setState({ user: updatedUser });

            // 2. Persist to local storage (or database updates if auth token is active)
            localStorage.setItem(`user_${userId}`, JSON.stringify(updatedUser));
            
            // Sync current active token user details
            const sessionData = JSON.parse(localStorage.getItem('secure_session_user') || 'null');
            if (sessionData && sessionData.id === userId) {
                localStorage.setItem('secure_session_user', JSON.stringify(updatedUser));
            }

            return true;
        } catch (err) {
            console.error('[BillingService] Subscription update error:', err);
            return false;
        }
    }
}

export const billingService = new BillingService();
